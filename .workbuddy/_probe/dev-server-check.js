// 验证开发服务：禁缓存 + 自动刷新（SSE）
const http = require('http');
const net = require('net');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const CHROME = 'C:\\Users\\Administrator\\.agent-browser\\browsers\\chrome-155.0.8059.39\\chrome.exe';
const URL_ = 'http://127.0.0.1:5180/index.html';

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

let fails = 0;
const check = (n, got, want) => { const ok = got === want; if (!ok) fails++; console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}: got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); };

(async () => {
  const userDir = path.join(require('os').tmpdir(), 'wb-devcheck-' + Date.now());
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9228', '--user-data-dir=' + userDir, 'about:blank'], { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 40; i++) { try { ver = await getJSON('http://127.0.0.1:9228/json/version'); break; } catch (e) { await sleep(300); } }
  if (!ver) { console.log('FAIL: devtools'); chrome.kill(); process.exit(1); }
  const targets = await getJSON('http://127.0.0.1:9228/json/list');
  const cdp = await wsConnect(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await cdp.send('Runtime.enable'); await cdp.send('Page.enable');

  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (r.result && r.result.exceptionDetails) return 'ERR: ' + ((r.result.exceptionDetails.exception || {}).description || '');
    return r.result && r.result.result ? r.result.result.value : undefined;
  };

  // 记录页面 load 次数（用 sessionStorage 累计，reload 后仍保留），用于判断是否发生自动刷新
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `(function(){ try{
      var n = parseInt(sessionStorage.getItem('__dev_loads')||'0',10) + 1;
      sessionStorage.setItem('__dev_loads', String(n));
      window.__loads = n;
    }catch(e){ window.__loads = 1; } })();`
  });

  console.log('=== 1) 首次加载 ===');
  await cdp.send('Page.navigate', { url: URL_ });
  await sleep(2500);
  check('页面加载次数', await ev(`window.__loads`), 1);
  check('自动刷新脚本已注入', await ev(`document.documentElement.outerHTML.indexOf('__dev_version') > -1`), true);
  check('页面标题正常', await ev(`document.title`), '打工人小账本');

  console.log('\n=== 2) 改 www/index.html → 应自动刷新 ===');
  const page = path.join(ROOT, 'www', 'index.html');
  const backup = fs.readFileSync(page);
  try {
    // 在 <title> 里加个标记，触发文件变化。
    // 注意：<title> 标签带 data-page-node-id 等属性，不能用精确串替换 —— 会静默匹配不到。
    // 用正则只替换「文本内容」那一小段。
    let s = backup.toString('utf8');
    const before = s;
    s = s.replace(/(<title[^>]*>)打工人小账本(<\/title>)/, '$1打工人小账本-DEVRELOADTEST$2');
    if (s === before) throw new Error('测试准备失败：没能改动 index.html 的标题（正则没匹配上）');
    fs.writeFileSync(page, s, 'utf8');
    console.log('  已修改文件，等待自动刷新…');
    await sleep(4000);
    check('页面被自动刷新', await ev(`(sessionStorage.getItem('__dev_loads')||'0')`), '2');
    check('刷新后页面是新内容', await ev(`document.title`), '打工人小账本-DEVRELOADTEST');
  } finally {
    fs.writeFileSync(page, backup);   // 还原
    await sleep(3500);
  }

  console.log('\n=== 3) 还原后再次自动刷新 ===');
  check('还原后继续自动刷新', await ev(`parseInt(sessionStorage.getItem('__dev_loads')||'0',10) >= 3`), true);
  check('标题已还原', await ev(`document.title`), '打工人小账本');

  console.log('\n=== 4) 禁用缓存验证（导航时不应 304 / from cache）===');
  const resp = await ev(`(async function(){
    var r = await fetch('/index.html', {cache:'no-store'});
    return {status:r.status, cc:r.headers.get('cache-control')};
  })()`);
  console.log('  fetch 结果:', JSON.stringify(resp));

  console.log('\n' + (fails === 0 ? '全部通过 ✅' : '失败 ' + fails + ' 项 ❌'));
  cdp.close(); chrome.kill();
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('PROBE ERROR:', e); process.exit(1); });
