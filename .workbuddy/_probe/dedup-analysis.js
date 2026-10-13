// 去重逻辑推演：模拟 importFlowRows 的 exist/fp 判定，找出「重复导入仍会新增」的场景。
// 不依赖浏览器 —— 直接把页面里的判定公式抄过来跑，便于定位差异。

const pad2 = n => String(n).padStart(2, '0');
const norm = (v, kind) => { const k = String(v == null ? '' : v).trim(); return k === kind ? kind : '支出'; };
const round2 = v => Math.round(Number(v) * 100) / 100;

// 页面里的 keyOf（备份导入）：date|kind|amt|cat|note
const keyOf = (date, kind, amt, cat, note) =>
  [date, kind, round2(amt).toFixed(2), cat, note].join('|');

console.log('=== 场景 A：同一条流水重复导入（无外部单号）===');
{
  const rec = { date: '2026-10-12', kind: '支出', amt: 25.5, cat: '餐饮', note: '午饭' };
  const k = keyOf(rec.date, rec.kind, rec.amt, rec.cat, rec.note);
  const exist = {};
  exist[k] = 1;                               // 第一次导入已写入
  const again = keyOf(rec.date, rec.kind, rec.amt, rec.cat, rec.note);
  console.log('第一次 key:', k);
  console.log('第二次 key:', again);
  console.log('判定为重复?', !!exist[again], '→', exist[again] ? '跳过 ✅' : '会重复新增 ❌');
}

console.log('\n=== 场景 B：同一条流水，但日期精度不同（备份导出带时分 vs 手抄只到日）===');
{
  const exist = {};
  exist[keyOf('2026-10-12', '支出', 25.5, '餐饮', '午饭')] = 1;   // 库里存的是「2026-10-12」
  const again = keyOf('2026-10-12 12:30', '支出', 25.5, '餐饮', '午饭'); // 备份里带时分
  console.log('库内 key: 2026-10-12|...');
  console.log('导入 key:', again);
  console.log('判定为重复?', !!exist[again], '→', exist[again] ? '跳过 ✅' : '会重复新增 ❌ （日期截断口径不一致）');
}

console.log('\n=== 场景 C：备注含不可见差异（前后空格 / 全角半角 / 行尾 \\r）===');
{
  const exist = {};
  exist[keyOf('2026-10-12', '支出', 25.5, '餐饮', '午饭')] = 1;
  const variants = ['午饭 ', ' 午饭', '午饭\r', '午饭\r\n', '午饭\u00A0'];
  variants.forEach(v => {
    const k = keyOf('2026-10-12', '支出', 25.5, '餐饮', v);
    console.log(`  备注 ${JSON.stringify(v).padEnd(14)} → 重复? ${!!exist[k]}`);
  });
}

console.log('\n=== 场景 D：有外部单号时，单号相同但其它字段不同 ===');
{
  // 页面逻辑：有 no 时先查 byNo，命中即跳过；但备份导入的 exist 表**不含 no**
  // 所以「备份导入」路径下，同 no 但备注被改过的记录会重复进来
  const exist = {};   // 只按 keyOf 建（不含 u、不含外部单号）
  exist[keyOf('2026-10-12', '支出', 25.5, '餐饮', '午饭')] = 1;
  const rec2 = { date: '2026-10-12', kind: '支出', amt: 25.5, cat: '餐饮', note: '午饭（改）', no: 'WX20261012001' };
  const k2 = keyOf(rec2.date, rec2.kind, rec2.amt, rec2.cat, rec2.note);
  console.log('原记录   no=WX20261012001, 备注=午饭');
  console.log('新记录   no=WX20261012001, 备注=午饭（改）');
  console.log('备份导入判定为重复?', !!exist[k2], '→', exist[k2] ? '跳过 ✅' : '会重复新增 ❌ （未按外部单号去重）');
  console.log('账单导入判定为重复?', true, '→ 跳过 ✅ （它用 byNo，逻辑不同）');
}

console.log('\n=== 场景 E：金额浮点写法差异（25.50 / 25.5 / "25.5"）===');
{
  const exist = {};
  exist[keyOf('2026-10-12', '支出', 25.5, '餐饮', '午饭')] = 1;
  [25.5, 25.50, '25.5', '25.50'].forEach(a => {
    const k = keyOf('2026-10-12', '支出', a, '餐饮', '午饭');
    console.log(`  金额 ${String(a).padEnd(6)} → 重复? ${!!exist[k]}`);
  });
}

console.log('\n=== 场景 F：同一条流水属于不同成员（u 不同）===');
{
  const exist = {};
  // 库里该成员有自己的记录；另一成员导入相同内容的记录 —— 这是**合法的**，不应被跳过
  exist[keyOf('2026-10-12', '支出', 25.5, '餐饮', '午饭')] = 1;
  const k = keyOf('2026-10-12', '支出', 25.5, '餐饮', '午饭');
  console.log('跨成员同内容判定为重复?', !!exist[k], '（备份导入路径不含 u，会误跳过——需确认是否期望）');
}
