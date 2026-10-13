#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
开发预览服务（www/ 静态托管）—— 专治「改完页面要手动刷新 / 重启才生效」。

相比 `python -m http.server` 多了两件事：
  1. **强制禁缓存**：所有响应带 no-store，浏览器不会拿旧的 index.html。
  2. **自动刷新**：注入一小段 SSE 脚本，监听文件变化，保存后浏览器自动 reload。
     （只注入到 .html，且仅在开发服务下；打包进 APK 的页面不经过这里。）

用法：
  python serve.py            # 默认 5180 端口
  python serve.py 8080       # 指定端口
"""
import hashlib
import os
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
WWW = HERE / 'www'
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5180

# 需要盯着变化、变更后触发浏览器刷新的文件
WATCH = [WWW / 'index.html', HERE / '打工人小账本.html']


def _snapshot():
    """返回所有被监视文件的 (路径, mtime, 大小, 内容哈希) 指纹。"""
    out = []
    for p in WATCH:
        try:
            st = p.stat()
            h = hashlib.md5(p.read_bytes()).hexdigest()
            out.append((str(p), st.st_mtime, st.st_size, h))
        except OSError:
            out.append((str(p), 0, 0, ''))
    return out


def _print_hint():
    """后台线程：只在控制台提示「检测到变化」（刷新由前端轮询触发）。"""
    last = _snapshot()
    while True:
        time.sleep(0.8)
        cur = _snapshot()
        if cur != last:
            last = cur
            print('  [变化] 页面已更新，浏览器将自动刷新…', flush=True)


# 注入到 HTML 末尾的自动刷新脚本（只在开发服务里生效）。
# 用**轮询版本号**而不是 SSE：SSE 在 http.server + 各种浏览器/代理组合下
# 容易因为响应无 Content-Length、HTTP/1.0 等原因挂起（实测 Chrome 收不到事件），
# 轮询简单可靠，0.8 秒一次开销可以忽略。
# 注意：bytes 字面量只能是 ASCII，所以先用 str 写、再 encode。
RELOAD_SNIPPET = ("""
<script>
/* 开发预览专用：轮询服务端版本号，页面文件一改就自动刷新（不进 APK） */
(function(){
  var known = null;
  function tick(){
    fetch('/__dev_version?t=' + Date.now(), {cache:'no-store'})
      .then(function(r){ return r.text(); })
      .then(function(v){
        if(known === null){ known = v; return; }   // 首次只记录基线，不刷新
        if(v !== known){ location.reload(); }
      })
      .catch(function(){ /* 服务重启中，下次再试 */ });
  }
  tick();
  setInterval(tick, 800);
})();
</script>
""").encode('utf-8')


class DevHandler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(WWW), **kw)

    def end_headers(self):
        # 开发环境一律禁缓存：否则浏览器会拿旧的 index.html，
        # 表现为「代码改了但界面没变，得手动刷新/重启才生效」。
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        # 版本号端点：前端轮询它判断文件是否变了。
        # 用「所有被监视文件的内容哈希拼接」当版本 —— 内容变了值就变，
        # 比 mtime 更可靠（有些编辑器保存时不一定改变 mtime 精度）。
        if self.path.split('?')[0] == '/__dev_version':
            ver = '|'.join(x[3] for x in _snapshot()).encode('utf-8')
            token = hashlib.md5(ver).hexdigest()[:12]
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Content-Length', str(len(token)))
            self.end_headers()
            self.wfile.write(token.encode('ascii'))
            return

        path = self.translate_path(self.path)
        is_html = path.endswith('.html') or path.endswith('.htm')
        if not is_html or not os.path.isfile(path):
            return super().do_GET()

        # HTML：读出来，末尾注入自动刷新脚本（不落盘，改动只在内存里）
        try:
            data = Path(path).read_bytes()
        except OSError:
            return super().do_GET()
        if b'__dev_version' not in data:
            idx = data.rfind(b'</body>')
            data = (data[:idx] + RELOAD_SNIPPET + data[idx:]) if idx >= 0 else (data + RELOAD_SNIPPET)

        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        try:
            self.wfile.write(data)
        except BrokenPipeError:
            pass

    def log_message(self, fmt, *args):
        # 静音静态资源刷屏，只留错误
        if args and str(args[1]).startswith(('4', '5')):
            super().log_message(fmt, *args)


def main():
    if not WWW.is_dir():
        raise SystemExit('找不到 www 目录：%s' % WWW)
    threading.Thread(target=_print_hint, daemon=True).start()
    srv = ThreadingHTTPServer(('127.0.0.1', PORT), DevHandler)
    print('开发预览服务已启动')
    print('  地址      : http://127.0.0.1:%d/index.html' % PORT)
    print('  禁缓存    : 已开启（改完直接刷新即最新）')
    print('  自动刷新  : 已开启（保存 www/index.html 后浏览器自动 reload）')
    print('  按 Ctrl+C 停止')
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\n已停止')
        srv.shutdown()


if __name__ == '__main__':
    main()
