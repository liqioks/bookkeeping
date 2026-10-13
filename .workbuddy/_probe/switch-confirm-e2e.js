// 端到端验证「切换用户确认弹窗 + 清空数据」：
//  1) 点驾驶舱按钮 → 弹窗出现，有「取消」「确定切换并清空数据」两个按钮
//  2) 点取消 → 弹窗关闭，数据仍在
//  3) 写入测试数据 → 再点确定 → IndexedDB records 表清空 → 回到登录门
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
function check(name, got, want) {
  const ok = got === want;
  if (!ok) fails++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}: got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
}

(async () => {
  const { srv, port } = await serve();
  const userDir = path.join(__dirname, 'chrome-profile4');
  fs.rmSync(userDir, { recursive: true, force: true });
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9225', '--user-data-dir=' + userDir, 'about:blank'], { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 40; i++) { try { ver = await getJSON('http://127.0.0.1:9225/json/version'); break; } catch (e) { await sleep(300); } }
  if (!ver) { console.log('FAIL: devtools unreachable'); chrome.kill(); srv.close(); process.exit(1); }
  const targets = await getJSON('http://127.0.0.1:9225/json/list');
  const cdp = await wsConnect(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  const exs = [], cerrs = [];
  cdp.onEvent = m => {
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails || {}; exs.push((d.exception && (d.exception.description || d.exception.value)) || d.text); }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') cerrs.push((m.params.args || []).map(a => a.value || a.description || '').join(' '));
  };
  await cdp.send('Runtime.enable'); await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html` });
  await sleep(2600);

  const ev = async (expr, awaitP) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: !!awaitP });
    if (r.result && r.result.exceptionDetails) return 'ERR: ' + ((r.result.exceptionDetails.exception || {}).description || '');
    return r.result && r.result.result ? r.result.result.value : undefined;
  };

  console.log('=== 1) 页面加载与按钮绑定 ===');
  check('按钮存在', await ev(`!!document.getElementById('d-switch-user')`), true);
  check('绑定的是 openSwitchConfirm', await ev(`(function(){var b=document.getElementById('d-switch-user'); return String(b.onclick).indexOf('openSwitchConfirm')>-1;})()`), true);

  console.log('\n=== 2) 先造点测试数据（直接写 LocalDB）===');
  const seed = await ev(`(async function(){
    var D=window.__ledgerDebug;
    // 通过页面真实路径写入：切换一个成员，往 LocalDB 塞几条
    var dbh = null;
    // LocalDB 不在全局，但 __ledgerDebug.isLocal 为 true 时页面正在用 LocalDB
    if(!D.isLocal) return 'not-local-env';
    // 通过 indexedDB 直接写入测试数据（与 LocalDB 同一库名/表名）
    function open(){ return new Promise(function(res,rej){
      var rq=indexedDB.open('wb_ledger_local', 1);
      rq.onupgradeneeded=function(e){
        var d=e.target.result;
        if(!d.objectStoreNames.contains('records')){
          var st=d.createObjectStore('records',{keyPath:'id'});
          st.createIndex('bucket','bucket',{unique:false});
        }
      };
      rq.onsuccess=function(e){ res(e.target.result); };
      rq.onerror=function(){ rej(rq.error); };
    }); }
    var d=await open();
    await new Promise(function(res,rej){
      var tx=d.transaction('records','readwrite');
      var st=tx.objectStore('records');
      for(var i=0;i<5;i++){
        st.put({id:'T'+i, bucket:'flow', data:{'日期':'2026-10-12 08:0'+i,'金额':10+i,'收支类型':'支出','分类':'餐饮','备注':'测试'+i,'u':'u-t'}});
        st.put({id:'U'+i, bucket:'user', data:{'姓名':'成员'+i,'u':'u-'+i}});
      }
      tx.oncomplete=res; tx.onerror=function(){rej(tx.error);};
    });
    // 读回计数
    var cnt=await new Promise(function(res,rej){
      var tx=d.transaction('records','readonly');
      var rq=tx.objectStore('records').count();
      rq.onsuccess=function(){res(rq.result);}; rq.onerror=function(){rej(rq.error);};
    });
    d.close();
    return cnt;
  })()`, true);
  check('测试数据已写入（10 条）', seed, 10);

  console.log('\n=== 3) 点按钮 → 弹窗出现 → 点取消 → 数据仍在 ===');
  await ev(`document.getElementById('d-switch-user').click()`);
  await sleep(200);
  check('弹窗可见', await ev(`(function(){var s=document.querySelector('.sheet'); return s? !s.hidden : null;})()`), true);
  check('弹窗有取消按钮', await ev(`(function(){var b=[].slice.call(document.querySelectorAll('.sheet .btn')); return b.some(function(x){return x.textContent==='取消';});})()`), true);
  check('弹窗有确定按钮', await ev(`(function(){var b=[].slice.call(document.querySelectorAll('.sheet .btn')); return b.some(function(x){return x.textContent.indexOf('确定切换并清空数据')>-1;});})()`), true);
  check('弹窗文案含清空警告', await ev(`(function(){var b=document.querySelector('.sheet .sheet-box'); return b? b.textContent.indexOf('清空本机的全部数据')>-1 : false;})()`), true);

  await ev(`(function(){var b=[].slice.call(document.querySelectorAll('.sheet .btn')).find(function(x){return x.textContent==='取消';}); b.click();})()`);
  await sleep(150);
  check('点取消后弹窗关闭', await ev(`document.querySelector('.sheet').hidden`), true);
  const cntAfterCancel = await ev(`(async function(){
    function open(){ return new Promise(function(res){ var rq=indexedDB.open('wb_ledger_local',1); rq.onsuccess=function(e){res(e.target.result);}; }); }
    var d=await open();
    var c=await new Promise(function(res){ var tx=d.transaction('records','readonly'); var q=tx.objectStore('records').count(); q.onsuccess=function(){res(q.result);}; });
    d.close(); return c;
  })()`, true);
  check('取消后数据仍在（10 条）', cntAfterCancel, 10);

  console.log('\n=== 4) 再点按钮 → 点确定 → 数据清空 + 回登录门 ===');
  await ev(`document.getElementById('d-switch-user').click()`);
  await sleep(150);
  await ev(`(function(){var b=[].slice.call(document.querySelectorAll('.sheet .btn')).find(function(x){return x.textContent.indexOf('确定切换并清空数据')>-1;}); b.click();})()`);
  await sleep(1200);
  const cntAfterOk = await ev(`(async function(){
    function open(){ return new Promise(function(res){ var rq=indexedDB.open('wb_ledger_local',1); rq.onsuccess=function(e){res(e.target.result);}; }); }
    var d=await open();
    var c=await new Promise(function(res){ var tx=d.transaction('records','readonly'); var q=tx.objectStore('records').count(); q.onsuccess=function(){res(q.result);}; });
    d.close(); return c;
  })()`, true);
  check('确定后数据全部清空（0 条）', cntAfterOk, 0);
  check('已回到登录门', await ev(`!document.getElementById('gate').hidden`), true);
  check('身份已清空', await ev(`window.__ledgerDebug.state.u`), '');

  console.log('\n=== 5) 运行时健康 ===');
  check('0 未捕获异常', exs.length, 0);
  check('0 console.error', cerrs.length, 0);
  if (exs.length) console.log('  exceptions:', JSON.stringify(exs).slice(0, 500));
  if (cerrs.length) console.log('  console errors:', JSON.stringify(cerrs).slice(0, 500));

  console.log('\n' + (fails === 0 ? '全部通过 ✅' : '失败 ' + fails + ' 项 ❌'));
  cdp.close(); chrome.kill(); srv.close();
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('PROBE ERROR:', e); process.exit(1); });
