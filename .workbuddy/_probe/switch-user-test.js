// 验证 switchUserOut() 的状态清理语义：注入一个假的「已登录 + 有数据」状态，
// 调 switchUserOut()，确认每一项按成员隔离的缓存都被清空、gate 被打开。
const http = require('http');
const net = require('net');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const WWW = path.join(ROOT, 'www');
const CHROME = 'C:\\Users\\Administrator\\.agent-browser\\browsers\\chrome-155.0.8059.39\\chrome.exe';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const f = path.join(WWW, p);
      if (!f.startsWith(WWW) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

function wsConnect(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const key = crypto.randomBytes(16).toString('base64');
    const sock = net.connect({ host: u.hostname, port: Number(u.port || 80) }, () => {
      sock.write(`GET ${u.pathname}${u.search} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`);
    });
    let buf = Buffer.alloc(0), handshaken = false, msgId = 0;
    const handlers = new Map();
    const api = { send(m, p) { const id = ++msgId; sock.write(encodeFrame(JSON.stringify({ id, method: m, params: p || {} }))); return new Promise(r => handlers.set(id, r)); }, onEvent: null, close() { try { sock.destroy(); } catch (e) {} } };
    sock.on('data', chunk => {
      buf = Buffer.concat([buf, chunk]);
      if (!handshaken) { const i = buf.indexOf('\r\n\r\n'); if (i < 0) return; buf = buf.slice(i + 4); handshaken = true; resolve(api); }
      for (;;) {
        if (buf.length < 2) break;
        const b1 = buf[1]; let len = b1 & 0x7f, off = 2;
        if (len === 126) { if (buf.length < 4) break; len = buf.readUInt16BE(2); off = 4; }
        else if (len === 127) { if (buf.length < 10) break; len = Number(buf.readBigUInt64BE(2)); off = 10; }
        if (buf.length < off + len) break;
        const payload = buf.slice(off, off + len).toString('utf8'); buf = buf.slice(off + len);
        let msg; try { msg = JSON.parse(payload); } catch (e) { continue; }
        if (msg.id && handlers.has(msg.id)) { handlers.get(msg.id)(msg); handlers.delete(msg.id); }
        else if (msg.method && api.onEvent) api.onEvent(msg);
      }
    });
    sock.on('error', reject);
  });
}
function encodeFrame(str) {
  const data = Buffer.from(str, 'utf8'), mask = crypto.randomBytes(4), len = data.length;
  let header;
  if (len < 126) header = Buffer.from([0x81, 0x80 | len]);
  else if (len < 65536) { header = Buffer.alloc(4); header[0] = 0x81; header[1] = 0xFE; header.writeUInt16BE(len, 2); }
  else { header = Buffer.alloc(10); header[0] = 0x81; header[1] = 0xFF; header.writeBigUInt64BE(BigInt(len), 2); }
  const masked = Buffer.alloc(len);
  for (let i = 0; i < len; i++) masked[i] = data[i] ^ mask[i % 4];
  return Buffer.concat([header, mask, masked]);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = url => new Promise((res, rej) => http.get(url, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); }).on('error', rej));

(async () => {
  const { srv, port } = await serve();
  const userDir = path.join(__dirname, 'chrome-profile2');
  fs.rmSync(userDir, { recursive: true, force: true });
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9223', '--user-data-dir=' + userDir, 'about:blank'], { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 40; i++) { try { ver = await getJSON('http://127.0.0.1:9223/json/version'); break; } catch (e) { await sleep(300); } }
  if (!ver) { console.log('FAIL: no devtools'); chrome.kill(); srv.close(); process.exit(1); }
  const targets = await getJSON('http://127.0.0.1:9223/json/list');
  const cdp = await wsConnect(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  const exceptions = [];
  cdp.onEvent = m => { if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails || {}; exceptions.push((d.exception && (d.exception.description || d.exception.value)) || d.text); } };
  await cdp.send('Runtime.enable'); await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html` });
  await sleep(2500);

  const ev = async expr => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: false });
    if (r.result && r.result.exceptionDetails) return 'ERR: ' + ((r.result.exceptionDetails.exception || {}).description || '');
    return r.result && r.result.result ? r.result.result.value : undefined;
  };

  // 构造「已登录且有数据」的假状态（只动内存，不碰数据库）
  const setup = await ev(`(function(){
    var D=window.__ledgerDebug, state=D.state;
    state.u='u-test-001'; writeU ? writeU('u-test-001') : 0;
    state.settings={a:1}; state.settingsId='s-1';
    state.flow=[{_id:'f1'},{_id:'f2'}];
    state.extraFlow=[{_id:'x1'}];
    state.agg={month:'2026-10'};
    state.pendingAcct=[{_id:'p1'}];
    state.range={mode:'range', cm:'', from:'2026-01-01', to:'2026-01-31'};
    D.closeGate();
    return {
      u: state.u,
      settingsId: state.settingsId,
      flowLen: state.flow.length,
      extraLen: state.extraFlow.length,
      agg: state.agg,
      pending: state.pendingAcct.length,
      rangeMode: state.range.mode,
      gateHidden: document.getElementById('gate').hidden
    };
  })()`);
  console.log('--- BEFORE switchUserOut ---');
  console.log(JSON.stringify(setup, null, 2));

  const after = await ev(`(function(){
    var D=window.__ledgerDebug, state=D.state;
    D.switchUserOut();
    return {
      u: state.u,
      settingsId: state.settingsId,
      settings: state.settings,
      flowLen: state.flow.length,
      extraLen: state.extraFlow.length,
      agg: state.agg,
      pending: state.pendingAcct,
      rangeMode: state.range.mode,
      gateHidden: document.getElementById('gate').hidden
    };
  })()`);
  console.log('--- AFTER switchUserOut ---');
  console.log(JSON.stringify(after, null, 2));
  console.log('--- exceptions ---');
  console.log(JSON.stringify(exceptions, null, 2));

  // 断言
  const ok = after.u === '' && after.settingsId === null && after.settings === null &&
    after.flowLen === 0 && after.extraLen === 0 && after.agg === null &&
    after.pending === null && after.rangeMode === 'month' &&
    after.gateHidden === false && exceptions.length === 0;
  console.log('\nASSERTIONS:', ok ? 'PASS ✅' : 'FAIL ❌');

  cdp.close(); chrome.kill(); srv.close();
  fs.rmSync(userDir, { recursive: true, force: true });
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('PROBE ERROR:', e); process.exit(1); });
