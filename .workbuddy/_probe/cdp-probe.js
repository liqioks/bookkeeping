// 最小 CDP 客户端：只用 Node 内置模块（http / net / crypto / child_process）。
// 目标：把 www/index.html 跑起来，验证「切换用户」按钮存在 / 已绑定 / 点击后真的回到登录门，
// 并确认全程 0 未捕获异常、0 console error。
const http = require('http');
const net = require('net');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const WWW = path.join(ROOT, 'www');
const CHROME = 'C:\\Users\\Administrator\\.agent-browser\\browsers\\chrome-155.0.8059.39\\chrome.exe';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
};

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const f = path.join(WWW, p);
      if (!f.startsWith(WWW) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('404'); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

// ---------- 极简 WebSocket 客户端 ----------
function wsConnect(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const key = crypto.randomBytes(16).toString('base64');
    const sock = net.connect({ host: u.hostname, port: Number(u.port || 80) }, () => {
      sock.write(
        `GET ${u.pathname}${u.search} HTTP/1.1\r\n` +
        `Host: ${u.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n` +
        `Sec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`
      );
    });
    let buf = Buffer.alloc(0), handshaken = false;
    const handlers = new Map();
    let msgId = 0;

    const api = {
      send(method, params) {
        const id = ++msgId;
        const payload = JSON.stringify({ id, method, params: params || {} });
        sock.write(encodeFrame(payload));
        return new Promise(res => handlers.set(id, res));
      },
      onEvent: null,
      close() { try { sock.destroy(); } catch (e) {} },
    };

    sock.on('data', chunk => {
      buf = Buffer.concat([buf, chunk]);
      if (!handshaken) {
        const i = buf.indexOf('\r\n\r\n');
        if (i < 0) return;
        const head = buf.slice(0, i).toString();
        if (!/101/.test(head)) { reject(new Error('handshake failed: ' + head.split('\r\n')[0])); return; }
        buf = buf.slice(i + 4);
        handshaken = true;
        resolve(api);
      }
      // 解帧
      for (;;) {
        if (buf.length < 2) break;
        const b1 = buf[1];
        let len = b1 & 0x7f, off = 2;
        if (len === 126) { if (buf.length < 4) break; len = buf.readUInt16BE(2); off = 4; }
        else if (len === 127) { if (buf.length < 10) break; len = Number(buf.readBigUInt64BE(2)); off = 10; }
        if (buf.length < off + len) break;
        const payload = buf.slice(off, off + len).toString('utf8');
        buf = buf.slice(off + len);
        let msg; try { msg = JSON.parse(payload); } catch (e) { continue; }
        if (msg.id && handlers.has(msg.id)) { handlers.get(msg.id)(msg); handlers.delete(msg.id); }
        else if (msg.method && api.onEvent) api.onEvent(msg);
      }
    });
    sock.on('error', reject);
  });
}

function encodeFrame(str) {
  const data = Buffer.from(str, 'utf8');
  const mask = crypto.randomBytes(4);
  const len = data.length;
  let header;
  if (len < 126) header = Buffer.from([0x81, 0x80 | len]);
  else if (len < 65536) { header = Buffer.alloc(4); header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(len, 2); }
  else { header = Buffer.alloc(10); header[0] = 0x81; header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(len), 2); }
  const masked = Buffer.alloc(len);
  for (let i = 0; i < len; i++) masked[i] = data[i] ^ mask[i % 4];
  return Buffer.concat([header, mask, masked]);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

(async () => {
  const { srv, port } = await serve();
  const pageUrl = `http://127.0.0.1:${port}/index.html`;
  console.log('serving:', pageUrl);

  const userDir = path.join(__dirname, 'chrome-profile');
  fs.rmSync(userDir, { recursive: true, force: true });
  const args = [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=9222', '--user-data-dir=' + userDir,
    '--window-size=430,932', 'about:blank',
  ];
  const chrome = spawn(CHROME, args, { stdio: 'ignore' });

  let ver = null;
  for (let i = 0; i < 40; i++) {
    try { ver = await getJSON('http://127.0.0.1:9222/json/version'); break; } catch (e) { await sleep(300); }
  }
  if (!ver) { console.log('FAIL: chrome devtools not reachable'); chrome.kill(); srv.close(); process.exit(1); }
  console.log('chrome:', ver.Browser);

  const targets = await getJSON('http://127.0.0.1:9222/json/list');
  const target = targets.find(t => t.type === 'page');
  const cdp = await wsConnect(target.webSocketDebuggerUrl);

  const exceptions = [];
  const consoleErrs = [];
  cdp.onEvent = msg => {
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails || {};
      exceptions.push((d.exception && (d.exception.description || d.exception.value)) || d.text || 'unknown');
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrs.push((msg.params.args || []).map(a => a.value || a.description || '').join(' '));
    }
  };

  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: pageUrl });
  await sleep(2500);

  const evaluate = async (expr, awaitPromise) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: !!awaitPromise });
    if (r.result && r.result.exceptionDetails) return { err: (r.result.exceptionDetails.exception || {}).description };
    return r.result && r.result.result ? r.result.result.value : undefined;
  };

  const report = {};

  report.btnExists = await evaluate(`!!document.getElementById('d-switch-user')`);
  report.btnLabel = await evaluate(`(document.getElementById('d-switch-user')||{}).textContent`);
  report.btnBound = await evaluate(`(function(){var b=document.getElementById('d-switch-user'); return !!(b && typeof b.onclick==='function');})()`);
  report.sidebarBound = await evaluate(`(function(){var b=document.getElementById('navSwitchUser'); return !!(b && typeof b.onclick==='function');})()`);
  report.fnDefined = await evaluate(`typeof switchUserOut==='function'`);

  // 在导入按钮旁边？
  report.domOrder = await evaluate(`(function(){
    var row=document.getElementById('d-import').parentNode;
    return Array.from(row.querySelectorAll('button')).map(function(b){return b.id;});
  })()`);

  // 打开登录门 -> 选一个成员（若有）-> 进入驾驶舱 -> 点切换用户 -> 检查是否回门
  report.gateHiddenBefore = await evaluate(`(function(){var g=document.getElementById('gate'); return g? g.hidden : null;})()`);

  const clickInfo = await evaluate(`(function(){
    var b=document.getElementById('d-switch-user');
    if(!b) return {ok:false, why:'no button'};
    // 先确保在驾驶舱页面，按钮可见
    try{ b.click(); }catch(e){ return {ok:false, why:String(e)}; }
    return {ok:true};
  })()`);
  report.click = clickInfo;
  await sleep(700);

  report.gateHiddenAfter = await evaluate(`(function(){var g=document.getElementById('gate'); return g? g.hidden : null;})()`);
  report.uAfter = await evaluate(`(typeof state!=='undefined') ? state.u : 'no-state'`);
  report.whoamiTxt = await evaluate(`(function(){var e=document.getElementById('whoami'); return e? e.textContent.trim():'';})()`);
  report.toastAfter = await evaluate(`(function(){var t=document.getElementById('toast'); return t? t.textContent.trim():'';})()`);
  report.userListCount = await evaluate(`document.querySelectorAll('#gate .u, #userList .u').length`);

  report.exceptions = exceptions;
  report.consoleErrors = consoleErrs;

  console.log('\n===== RESULT =====');
  console.log(JSON.stringify(report, null, 2));

  cdp.close(); chrome.kill(); srv.close();
  fs.rmSync(userDir, { recursive: true, force: true });
  process.exit(0);
})().catch(e => { console.error('PROBE ERROR:', e); process.exit(1); });
