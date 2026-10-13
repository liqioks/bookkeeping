// 逐层排查自动刷新链路：脚本是否执行 → fetch 是否轮询到版本变化 → location.reload 是否生效
const http = require('http');
const net = require('net');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const CHROME = 'C:\\Users\\Administrator\\.agent-browser\\browsers\\chrome-155.0.8059.39\\chrome.exe';

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
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9230', '--user-data-dir=C:\\Users\\Administrator\\.workbuddy\\_pollchk2', 'about:blank'], { stdio: 'ignore' });
  let v = null;
  for (let i = 0; i < 40; i++) { try { v = await getJSON('http://127.0.0.1:9230/json/version'); break; } catch (e) { await sleep(300); } }
  const t = (await getJSON('http://127.0.0.1:9230/json/list')).find(x => x.type === 'page');
  const cdp = await wsConnect(t.webSocketDebuggerUrl);
  await cdp.send('Runtime.enable'); await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:5180/index.html' });
  await sleep(2500);

  const ev = async (e, awaitP) => {
    const r = await cdp.send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: !!awaitP });
    if (r.result && r.result.exceptionDetails) return 'ERR:' + ((r.result.exceptionDetails.exception || {}).description || '');
    return r.result && r.result.result ? r.result.result.value : undefined;
  };

  console.log('1) 轮询脚本的变量是否存在于作用域？');
  // 我们注入的 IIFE 是匿名的，外部看不到 known。改测：注入一个可观测的版本。
  console.log('   document 里 fetch 可用:', await ev(`typeof fetch`));

  console.log('\n2) 手动模拟轮询 2 次，看版本号是否稳定/变化');
  const v1 = await ev(`(async function(){var r=await fetch('/__dev_version?t='+Date.now(),{cache:'no-store'});return await r.text();})()`, true);
  console.log('   版本1:', v1);
  // 改文件
  const p = path.join(ROOT, 'www', 'index.html');
  const bak = fs.readFileSync(p, 'utf8');
  fs.writeFileSync(p, bak.replace('<title>打工人小账本</title>', '<title>POLLTEST</title>'), 'utf8');
  await sleep(1500);
  const v2 = await ev(`(async function(){var r=await fetch('/__dev_version?t='+Date.now(),{cache:'no-store'});return await r.text();})()`, true);
  console.log('   版本2:', v2);
  console.log('   版本变化?', v1 !== v2);
  fs.writeFileSync(p, bak, 'utf8');

  console.log('\n3) 测试 location.reload() 在 CDP 下是否真的重新导航');
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__nav=(window.__nav||0)+1; window.__navMark='NAV'+window.__nav;` });
  const before = await ev(`typeof window.__navMark`);
  console.log('   reload 前 __navMark:', before);
  await ev(`location.reload()`);
  await sleep(1800);
  const after = await ev(`typeof window.__navMark === 'undefined' ? 'LOST(说明真的重载了)' : window.__navMark`);
  console.log('   reload 后 __navMark:', after);

  console.log('\n4) setInterval 在页面里是否被节流/停掉（headless 后台标签）');
  const tick = await ev(`(async function(){
    var n=0;
    var id=setInterval(function(){ n++; }, 200);
    await new Promise(function(r){ setTimeout(r, 1200); });
    clearInterval(id);
    return n;
  })()`, true);
  console.log('   1.2 秒内 setInterval(200ms) 触发次数:', tick, '(期望 ~6)');

  cdp.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
