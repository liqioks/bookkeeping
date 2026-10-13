// 验证修好后的去重逻辑：把页面里的 dedupText/dedupDate/flowFingerprint/dedupNo 抄过来跑，
// 复现之前会「重复新增」的场景，确认现在都能正确判重。
const KIND_INCOME = '收入', KIND_EXPENSE = '支出';
const pad2 = n => String(n).padStart(2, '0');
const round2 = v => Math.round(Number(v) * 100) / 100;

function normalizeStamp(v) {
  let s = String(v == null ? '' : v).trim();
  s = s.replace(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2}))?/, (_, y, mo, d, h, mi) => {
    let r = y + '-' + pad2(+mo) + '-' + pad2(+d);
    if (h != null) r += ' ' + pad2(+h) + ':' + pad2(+mi);
    return r;
  });
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s + ' 00:00';
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) return s.slice(0, 16);
  return s;
}
function dedupText(v) {
  return String(v == null ? '' : v).replace(/[\r\n\t\u00A0]/g, ' ').replace(/\s+/g, ' ').trim();
}
function dedupDate(v) {
  const s = normalizeStamp(v);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  return m ? (m[1] + '-' + m[2] + '-' + m[3]) : dedupText(s);
}
function flowFingerprint(date, kind, amt, cat, note) {
  return [dedupDate(date), kind, round2(amt).toFixed(2), dedupText(cat), dedupText(note)].join('|');
}
function dedupNo(v) { return dedupText(v).toUpperCase(); }

// 模拟 importFlowRows 的判定
function simulate(existingRows, importedRows) {
  const exist = {}, existNo = {};
  existingRows.forEach(r => {
    exist[flowFingerprint(r.date, r.kind, r.amt, r.cat, r.note)] = 1;
    const no = dedupNo(r.no);
    if (no) existNo[no] = 1;
  });
  const toAdd = []; let dup = 0;
  importedRows.forEach(r => {
    const no = dedupNo(r.no);
    const k = flowFingerprint(r.date, r.kind, r.amt, r.cat, r.note);
    if ((no && existNo[no]) || exist[k]) { dup++; return; }
    if (no) existNo[no] = 1;
    exist[k] = 1;
    toAdd.push(r);
  });
  return { inserted: toAdd.length, dup, added: toAdd };
}

const R = (date, kind, amt, cat, note, no) => ({ date, kind, amt, cat, note, no: no || '' });
let fails = 0;
function check(name, got, want) {
  const ok = got === want;
  if (!ok) fails++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}: 新增=${got} 期望=${want}`);
}

console.log('=== 场景 A：完全相同的记录重复导入 ===');
{
  const lib = [R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '午饭')];
  check('同一条重复导入', simulate(lib, lib).inserted, 0);
}

console.log('\n=== 场景 B：日期精度不同（库内 2026-10-12 vs 导入 2026-10-12 12:30）===');
{
  const lib = [R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '午饭')];
  const imp = [R('2026-10-12 12:30', KIND_EXPENSE, 25.5, '餐饮', '午饭')];
  check('日期到天归一化后判重', simulate(lib, imp).inserted, 0);
}

console.log('\n=== 场景 C：备注含不可见差异 ===');
{
  const lib = [R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '午饭')];
  ['午饭 ', ' 午饭', '午饭\r', '午饭\r\n', '午饭\u00A0'].forEach(v => {
    const r = simulate(lib, [R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', v)]);
    check(`备注 ${JSON.stringify(v)}`, r.inserted, 0);
  });
}

console.log('\n=== 场景 D：同外部单号但备注被改过 ===');
{
  const lib = [R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '午饭', 'WX20261012001')];
  const imp = [R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '午饭（改）', 'WX20261012001')];
  check('单号命中即跳过', simulate(lib, imp).inserted, 0);
}

console.log('\n=== 场景 D2：单号大小写不同 ===');
{
  const lib = [R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '午饭', 'wx20261012001')];
  const imp = [R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '午饭', 'WX20261012001')];
  check('单号大小写归一化', simulate(lib, imp).inserted, 0);
}

console.log('\n=== 场景 E：金额浮点写法差异 ===');
{
  const lib = [R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '午饭')];
  [25.5, 25.50, '25.5', '25.50'].forEach(a => {
    const r = simulate(lib, [R('2026-10-12', KIND_EXPENSE, a, '餐饮', '午饭')]);
    check(`金额 ${String(a)}`, r.inserted, 0);
  });
}

console.log('\n=== 场景 G（关键回归）：真实的「不重复」必须仍然新增 ===');
{
  const lib = [R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '午饭')];
  // 不同日期 / 不同金额 / 不同分类 / 不同备注 → 都该新增
  check('不同日期', simulate(lib, [R('2026-10-13', KIND_EXPENSE, 25.5, '餐饮', '午饭')]).inserted, 1);
  check('不同金额', simulate(lib, [R('2026-10-12', KIND_EXPENSE, 26.0, '餐饮', '午饭')]).inserted, 1);
  check('不同分类', simulate(lib, [R('2026-10-12', KIND_EXPENSE, 25.5, '交通', '午饭')]).inserted, 1);
  check('不同备注', simulate(lib, [R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '晚饭')]).inserted, 1);
  check('收支方向不同', simulate(lib, [R('2026-10-12', KIND_INCOME, 25.5, '餐饮', '午饭')]).inserted, 1);
  // 「午饭」和「午饭 」在备注里若语义相近，归一化后会被合并 —— 这是刻意的取舍
}

console.log('\n=== 场景 H：同一天两笔真正不同的消费（不能误合并）===');
{
  const lib = [];
  const imp = [
    R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '午饭'),
    R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '午饭'),   // 真·重复
    R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '晚饭'),   // 不同备注
  ];
  const r = simulate(lib, imp);
  check('两条同名 + 一条不同', r.inserted, 2);
  check('重复计数', r.dup, 1);
}

console.log('\n=== 场景 I：先导账单（无单号）再导备份（有单号）===');
{
  const lib = [R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '午饭', '')];   // 账单导入的，无单号
  const imp = [R('2026-10-12', KIND_EXPENSE, 25.5, '餐饮', '午饭', 'WX001')]; // 备份里的，带单号
  check('指纹兜住跨来源重复', simulate(lib, imp).inserted, 0);
}

console.log('\n合计失败:', fails, fails === 0 ? '→ 全部通过 ✅' : '→ 存在失败 ❌');
process.exit(fails === 0 ? 0 : 1);
