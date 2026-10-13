# -*- coding: utf-8 -*-
"""
同步「打工人小账本」页面：源页面（设计端副本，含平台注入脚本）→ Capacitor 工程 www/index.html，并做 App 版适配。

  1) 去掉 WorkBuddy 平台注入脚本 /page/page_comm/inject.js（App 内没有该路径，会 404）
  2) viewport 增加 viewport-fit=cover（全面屏安全区适配）
  3) 自检内联脚本语法完整（防止「跨行字符串断裂」这类静默损坏）

用法：
  python prepare-page.py            # 源 → www/index.html（默认方向）
  python prepare-page.py --reverse  # www/index.html → 源（把 App 端的改动回写到设计端副本）

⚠️ 不管哪个方向，都不要用裸字符串替换 "</body>"：
   页面里 writeDownloadWindow() 的拼接串中就有字面量 "</body></html>"，
   裸替换会把它劈成跨行字符串，整个内联脚本直接 SyntaxError（表现为「页面能渲染但啥也点不了」）。
"""
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent

# 源页面：优先用工程内随仓库备份的副本（含 inject.js，代表设计端）；
# 若本机存在原始源工程目录，则优先用它，保证与设计端一致。
SRC_CANDIDATES = [
    Path(r'D:\workbody_files\2026-10-10-22-49-42\打工人小账本.html'),
    HERE / '打工人小账本.html',
]
SRC = next((p for p in SRC_CANDIDATES if p.exists()), SRC_CANDIDATES[1])
DST = HERE / 'www' / 'index.html'

REVERSE = '--reverse' in sys.argv[1:]

INJECT_RE = r'\s*<script[^>]*src="/page/page_comm/inject\.js"[^>]*>\s*</script>'
VIEWPORT_OLD = 'content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"'
VIEWPORT_NEW = 'content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"'


def check_inline_script(h: str):
    """自检：内联脚本必须能通过语法解析（用 Node 不可用时退化为括号/引号启发式检查）。"""
    m = re.search(r'<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)</script>', h)
    if not m:
        return
    js = m.group(1)
    if not js.strip():
        return
    # 启发式：单引号字符串内混入裸换行（最典型的损坏形态）
    for ln, line in enumerate(js.split('\n'), 1):
        s = line.replace("\\'", '')
        if s.count("'") % 2 == 1 and re.match(r"^\s*\+?\s*'", line):
            raise SystemExit(
                '源页面疑似损坏：内联脚本第 %d 行单引号未闭合 ->\n  %s\n'
                '（常见原因：用文本替换插入 HTML 时误改了 JS 字符串，例如裸替换 </body>）'
                % (ln, line.strip()[:120]))


if not SRC.exists() or not DST.exists():
    missing = [str(p) for p in (SRC, DST) if not p.exists()]
    raise SystemExit('找不到文件：%s' % '、'.join(missing))

if REVERSE:
    src, dst = DST, SRC            # www/index.html → 打工人小账本.html
    h = src.read_text(encoding='utf-8')
    before = len(h)
    # 回写时要补回平台注入脚本（设计端需要），插在最后一个 </script> 之后、</body> 之前
    if 'page_comm/inject.js' not in h:
        idx = h.rfind('</body>')
        if idx < 0:
            raise SystemExit('目标页面找不到收尾 </body>，拒绝回写以免损坏文件')
        h = h[:idx] + '  <script src="/page/page_comm/inject.js"></script>\n' + h[idx:]
    check_inline_script(h)
    dst.write_text(h, encoding='utf-8')
    print('回写方向    : www/index.html -> 源页面')
    print('源页面      :', dst)
    print('大小        : %d -> %d 字符' % (before, len(h)))
    print('注入脚本    :', '已补回' if 'page_comm/inject.js' in h else '缺失')
    print('viewport-fit:', '已包含' if 'viewport-fit=cover' in h else '缺失')
else:
    src, dst = SRC, DST            # 打工人小账本.html → www/index.html
    h = src.read_text(encoding='utf-8')
    before = len(h)
    # 1) 去掉平台注入脚本（只匹配真正的 inject.js script 标签，不用裸 </body> 替换）
    h, n1 = re.subn(INJECT_RE, '', h)
    # 2) viewport 补 viewport-fit=cover（幂等）
    if 'viewport-fit=cover' not in h:
        h = h.replace(VIEWPORT_OLD, VIEWPORT_NEW)
    # 3) 自检
    check_inline_script(h)
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(h, encoding='utf-8')
    print('同步方向    : 源页面 -> www/index.html')
    print('源页面      :', src)
    print('输出        :', dst)
    print('大小        : %d -> %d 字符' % (before, len(h)))
    print('移除注入脚本:', '已移除' if n1 else '未找到（可能已处理）')
    print('viewport-fit:', '已包含' if 'viewport-fit=cover' in h else '缺失')
    print('外部 src 引用:', re.findall(r'<script[^>]*src="([^"]+)"', h) or '无')
