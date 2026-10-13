// 启动自检：访问本地预览服务，确认页面正常渲染、关键按钮齐全、无运行时异常。
const http = require('http');
const net = require('net');
const crypto = require('crypto');
const { spawn } = require('child_process');

const CHROME = 'C:\\Users\\Administrator\\.agent-browser\\browsers\\chrome-155.0.8059.39\\chrome.exe';
const URL_ = process.argv[2] || 'http://127.0.0.1:5180/index.html';

function wsConnect(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const key = crypto.randomBytes(16).toString('base64');
    const sock = net.connect({ host: u.hostname, port: Number(u.port || 80) }, () => {
      sock.write(`GET ${u.pathname}${u.search} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`);
    });
    let buf = Buffer.alloc(0), hs = false, id = 0;
    const handlers = new Map();
    const api = { send(m, p) { const i = ++id; sock.write(enc(JSON.stringify({ id: i, method: m, params: p || {} }))); return new Promise(r => handlers.set(i, r)); }, onEvent: null, close() { try { sock.destroy(); } catch (e) {} } };
    sock.on('data', c => {
      buf = Buffer.concat([buf, c]);
      if (!hs) { const i = buf.indexOf('\r\n\r\n'); if (i < 0) return; buf = buf.slice(i + 4); hs = true; resolve(api); }
      for (;;) {
        if (buf.length < 2) break;
        let len = buf[1] & 0x7f, off = 2;
        if (len === 126) { if (buf.length < 4) break; len = buf.readUInt16BE(2); off = 4; }
        else if (len === 127) { if (buf.length < 10) break; len = Number(buf.readBigUInt64BE(2)); off = 10; }
        if (buf.length < off + len) break;
        const pl = buf.slice(off, off + len).toString('utf8'); buf = buf.slice(off + len);
        let msg; try { msg = JSON.parse(pl); } catch (e) { continue; }
        if (msg.id && handlers.has(msg.id)) { handlers.get(msg.id)(msg); handlers.delete(msg.id); }
        else if (msg.method && api.onEvent) api.onEvent(msg);
      }
    });
    sock.on('error', reject);
  });
}
function enc(str) {
  const d = Buffer.from(str, 'utf8'), m = crypto.randomBytes(4), L = d.length;
  let h;
  if (L < 126) h = Buffer.from([0x81, 0x80 | L]);
  else if (L < 65536) { h = Buffer.alloc(4); h[0] = 0x81; h[1] = 0xFE; h.writeUInt16BE(L, 2); }
  else { h = Buffer.alloc(10); h[0] = 0x81; h[1] = 0xFF; h.writeBigUInt64BE(BigInt(L), 2); }
  const mm = Buffer.alloc(L);
  for (let i = 0; i < L; i++) mm[i] = d[i] ^ m[i % 4];
  return Buffer.concat([h, m, mm]);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = url => new Promise((res, rej) => http.get(url, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); }).on('error', rej));

(async () => {
  const userDir = 'C:\\Users\\Administrator\\.workbuddy\\_startcheck_profile';
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9226', '--user-data-dir=' + userDir, 'about:blank'], { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 40; i++) { try { ver = await getJSON('http://127.0.0.1:9226/json/version'); break; } catch (e) { await sleep(300); } }
  if (!ver) { console.log('FAIL: devtools unreachable'); chrome.kill(); process.exit(1); }
  const targets = await getJSON('http://127.0.0.1:9226/json/list');
  const cdp = await wsConnect(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  const exs = [], cerrs = [];
  cdp.onEvent = m => {
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails || {}; exs.push((d.exception && (d.exception.description || d.exception.value)) || d.text); }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') cerrs.push((m.params.args || []).map(a => a.value || a.description || '').join(' '));
  };
  await cdp.send('Runtime.enable'); await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: URL_ });
  await sleep(2800);

  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (r.result && r.result.exceptionDetails) return 'ERR: ' + ((r.result.exceptionDetails.exception || {}).description || '');
    return r.result && r.result.result ? r.result.result.value : undefined;
  };

  const info = {};
  info.title = await ev(`document.title`);
  info.bodyLen = await ev(`document.body ? document.body.textContent.length : 0`);
  info.visibleText = await ev(`document.body ? document.body.textContent.replace(/\\s+/g,' ').slice(0,80) : ''`);
  info.buttons = await ev(`document.querySelectorAll('button').length`);
  info.boundButtons = await ev(`[].slice.call(document.querySelectorAll('button')).filter(function(b){return typeof b.onclick==='function';}).length`);
  info.hasSwitchUser = await ev(`!!document.getElementById('d-switch-user')`);
  info.hasImport = await ev(`!!document.getElementById('d-import')`);
  info.hasExport = await ev(`!!document.getElementById('d-export-all')`);
  info.hasAutoGrant = await ev(`!!document.getElementById('auto-grant')`);
  info.gateVisible = await ev(`(function(){var g=document.getElementById('gate'); return g? !g.hidden : null;})()`);
  info.debugHandle = await ev(`typeof window.__ledgerDebug`);
  info.dedupFn = await ev(`!!document.getElementById('d-data-card')`);

  console.log('=== 启动自检 ===');
  console.log(JSON.stringify(info, null, 2));
  console.log('exceptions:', exs.length, exs.slice(0, 2));
  console.log('console errors:', cerrs.length, cerrs.slice(0, 2));
  const ok = info.bodyLen > 500 && info.buttons >= 40 && info.boundButtons >= 40 &&
    info.hasSwitchUser && info.hasImport && info.hasExport &&
    info.gateVisible === true && exs.length === 0 && cerrs.length === 0;
  console.log('\n结果:', ok ? '启动正常 ✅' : '存在问题 ❌');

  cdp.close(); chrome.kill();
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('PROBE ERROR:', e); process.exit(1); });
