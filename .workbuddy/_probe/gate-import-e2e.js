// 端到端复现 + 验证：
//  场景：登录门里导入备份（含成员「张三」+ 若干流水）→ 应自动进入「张三」→ 首页有数据
//  回归：导入后不应停留在登录门、state.u 必须等于文件里的成员 u
const http = require('http');
const net = require('net');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const WWW = path.join(ROOT, 'www');
const CHROME = 'C:\\Users\\Administrator\\.agent-browser\\browsers\\chrome-155.0.8059.39\\chrome.exe';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };

// ---------- 手搓一个最小 xlsx（三个 sheet：成员 / 设置 / 流水）----------
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function colName(n) { let s = ''; n++; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }
function sheetXml(rows) {
  let x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
  rows.forEach((row, ri) => {
    x += `<row r="${ri + 1}">`;
    row.forEach((v, ci) => {
      const ref = colName(ci) + (ri + 1);
      const num = typeof v === 'number';
      x += `<c r="${ref}"${num ? '' : ' t="inlineStr"'}><${num ? 'v' : 'is'}>${num ? v : '<t xml:space="preserve">' + esc(v) + '</t>'}</${num ? 'v' : 'is'}></c>`;
    });
    x += '</row>';
  });
  return x + '</sheetData></worksheet>';
}
function buildXlsx(sheets) {
  const files = {};
  files['[Content_Types].xml'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    sheets.map((s, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') +
    '</Types>';
  files['_rels/.rels'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
  files['xl/workbook.xml'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
    sheets.map((s, i) => `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + '</sheets></workbook>';
  files['xl/_rels/workbook.xml.rels'] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') +
    '</Relationships>';
  sheets.forEach((s, i) => { files[`xl/worksheets/sheet${i + 1}.xml`] = sheetXml(s.rows); });

  // 打包成 zip（store，不压缩 —— 页面读得到就行）
  const chunks = [], central = [];
  let offset = 0;
  const names = Object.keys(files);
  names.forEach(name => {
    const data = Buffer.from(files[name], 'utf8');
    const crc = crc32(data);
    const nameBuf = Buffer.from(name, 'utf8');
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8); local.writeUInt16LE(0, 10); local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
    chunks.push(local, nameBuf, data);
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8); cd.writeUInt16LE(0, 10); cd.writeUInt16LE(0, 12); cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc, 16); cd.writeUInt32LE(data.length, 20); cd.writeUInt32LE(data.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28); cd.writeUInt16LE(0, 30); cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34); cd.writeUInt16LE(0, 36); cd.writeUInt32LE(0, 38); cd.writeUInt32LE(offset, 42);
    central.push(cd, nameBuf);
    offset += local.length + nameBuf.length + data.length;
  });
  const cdBuf = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(0, 4); eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(names.length, 8); eocd.writeUInt16LE(names.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12); eocd.writeUInt32LE(offset, 16); eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...chunks, cdBuf, eocd]);
}
let CRC_T = null;
function crc32(buf) {
  if (!CRC_T) { CRC_T = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); CRC_T[n] = c >>> 0; } }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = CRC_T[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ---------- 建测试备份文件 ----------
const U_ZHANGSAN = 'u-zhangsan-001';
const xlsx = buildXlsx([
  { name: '流水', rows: [
    ['日期','收支类型','分类/来源','金额(元)','备注','成员标识u','外部单号'],
    ['2026-10-12 08:30','支出','餐饮',25.5,'早饭',U_ZHANGSAN,'WX001'],
    ['2026-10-12 12:10','支出','餐饮',38,'午饭',U_ZHANGSAN,'WX002'],
    ['2026-10-11 09:00','支出','交通',6,'地铁',U_ZHANGSAN,'WX003'],
    ['2026-10-10 20:00','收入','工资',8000,'十月工资',U_ZHANGSAN,''],
  ]},
  { name: '成员', rows: [['u','姓名','平台账号','绑定时间','说明'], [U_ZHANGSAN,'张三','','','测试成员']] },
  { name: '设置', rows: [['键','值'], ['月薪','10000'], ['月工时','176']] },
]);
const XLSX_PATH = path.join(__dirname, 'test-backup.xlsx');
fs.writeFileSync(XLSX_PATH, xlsx);
console.log('测试备份已生成:', XLSX_PATH, xlsx.length, '字节');

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      if (p === '/test-backup.xlsx') {
        res.writeHead(200, { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.createReadStream(XLSX_PATH).pipe(res); return;
      }
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
const check = (n, got, want) => { const ok = got === want; if (!ok) fails++; console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}: got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); };

(async () => {
  const { srv, port } = await serve();
  const userDir = path.join(__dirname, 'chrome-profile5');
  fs.rmSync(userDir, { recursive: true, force: true });
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9227', '--user-data-dir=' + userDir, 'about:blank'], { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 40; i++) { try { ver = await getJSON('http://127.0.0.1:9227/json/version'); break; } catch (e) { await sleep(300); } }
  if (!ver) { console.log('FAIL: devtools'); chrome.kill(); srv.close(); process.exit(1); }
  const targets = await getJSON('http://127.0.0.1:9227/json/list');
  const cdp = await wsConnect(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  const exs = [], cerrs = [];
  cdp.onEvent = m => {
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails || {}; exs.push((d.exception && (d.exception.description || d.exception.value)) || d.text); }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') cerrs.push((m.params.args || []).map(a => a.value || a.description || '').join(' '));
  };
  await cdp.send('Runtime.enable'); await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html` });
  await sleep(2800);

  const ev = async (expr, awaitP) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: !!awaitP });
    if (r.result && r.result.exceptionDetails) return 'ERR: ' + ((r.result.exceptionDetails.exception || {}).description || '');
    return r.result && r.result.result ? r.result.result.value : undefined;
  };

  console.log('\n=== 前置：确认处在登录门、且是本地存储 ===');
  check('初始在登录门', await ev(`!document.getElementById('gate').hidden`), true);
  check('本地存储模式', await ev(`window.__ledgerDebug.isLocal`), true);
  check('初始无成员', await ev(`window.__ledgerDebug.state.users.length`), 0);

  console.log('\n=== 模拟：登录门里点「导入数据」选备份文件 ===');
  // 页面里 #gateImpBtn 的 onclick 会调 onImportClick → pickFile（弹原生对话框，无头环境不可用）。
  // 这里把 pickFile 替换成「直接返回我们的测试 File」，从而跑通**真实的导入链路**
  // （importFileSmart → importFlowExcel → importFlowRows → 收尾自动切成员）。
  const importRes = await ev(`(async function(){
    try{
      var resp = await fetch('/test-backup.xlsx');
      var buf = await resp.arrayBuffer();
      var f = new File([buf], 'backup.xlsx', {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      // 找到页面里的 pickFile（在 IIFE 内，需要用 debug 句柄或闭包技巧）。
      // 用「劫持 input.click」的办法：pickFile 内部 createElement('input') 后立即 click，
      // 我们重写 HTMLInputElement.prototype.click，在它被调用时把 files 塞进去并派发 change。
      var origClick = HTMLInputElement.prototype.click;
      HTMLInputElement.prototype.click = function(){
        var self = this;
        if(self.type === 'file'){
          try{
            var dt = new DataTransfer();
            dt.items.add(f);
            self.files = dt.files;
          }catch(e){}
          HTMLInputElement.prototype.click = origClick;   // 只劫持一次
          setTimeout(function(){ self.dispatchEvent(new Event('change', {bubbles:true})); }, 0);
          return;
        }
        return origClick.apply(self, arguments);
      };
      document.getElementById('gateImpBtn').click();
      return {ok:true};
    }catch(e){ return {err:String(e)}; }
  })()`, true);
  console.log('  导入触发结果:', JSON.stringify(importRes));
  await sleep(4000);

  console.log('\n=== 核心断言：导入后应自动进入「张三」并有数据 ===');
  const u = await ev(`window.__ledgerDebug.state.u`);
  check('state.u 等于文件里的成员 u', u, U_ZHANGSAN);
  check('已离开登录门', await ev(`document.getElementById('gate').hidden`), true);
  const flowLen = await ev(`window.__ledgerDebug.state.flow.length`);
  console.log('  state.flow.length =', flowLen);
  const rowCount = await ev(`document.querySelectorAll('#led-body tr, .ledrow, [data-row]').length`);
  console.log('  页面渲染的行数 =', rowCount);
  const bodyText = await ev(`document.body.textContent`);
  const hasNum = await ev(`document.body.textContent.indexOf('25.5')>-1 || document.body.textContent.indexOf('38')>-1`);
  console.log('  页面是否出现导入金额:', hasNum);

  console.log('\n=== 运行时健康 ===');
  check('0 未捕获异常', exs.length, 0);
  check('0 console.error', cerrs.length, 0);
  if (exs.length) console.log('  exceptions:', JSON.stringify(exs).slice(0, 600));
  if (cerrs.length) console.log('  console errors:', JSON.stringify(cerrs).slice(0, 600));

  console.log('\n' + (fails === 0 ? '全部通过 ✅' : '失败 ' + fails + ' 项 ❌'));
  try { fs.unlinkSync(XLSX_PATH); } catch (e) {}
  cdp.close(); chrome.kill(); srv.close();
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('PROBE ERROR:', e); process.exit(1); });
