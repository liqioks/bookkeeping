
(function(){
  "use strict";
  var CLOUD_DB = (window.__SMART_PAGE__ && window.__SMART_PAGE__.database) ? window.__SMART_PAGE__.database : null;
  var DB_SETTINGS = 'WsoAhfTSqHzHkZOIblFmZI', DB_MONTHLY = '8pkFfRoi32KfkyovFbtmhl', DB_USER = '7ksfKW1zKsCY7a8xOUNrE8';
  // 流水按年月分表：每年一个目录、每月一个 CSV 表。
  // MONTH_ROUTE 把 'YYYY-MM' 映射到该月表的 databaseId；不在表内（如超出 2026-2036）回退到最近可用月。
  var MONTH_ROUTE = {"2026-01":"h1kEnPxM1wB9wD4WQBWSjS","2026-02":"0hb9C5dKWpG4EQMTMcRW5U","2026-03":"ENAOOS6cgm9i3DBoloRgwW","2026-04":"Ny49xV0MQ8P6i69JDM2igj","2026-05":"FZaSOy6ZD86KXIXu5FOklT","2026-06":"gIq1NyPSJywJRfOUJmSbnn","2026-07":"hgUyFbNgdEFFnRy6lMt5Ch","2026-08":"HRacxEDnDPojuYzye98uqC","2026-09":"kz3Kdg26L3RxfPO1Hu8NTk","2026-10":"HRMHqEOxZ4tacuWofAHU6z","2026-11":"Mgf6UBfNXkx2hgwf6t7YBV","2026-12":"6ImqKZt2pa2SIritNGXJtL","2027-01":"ZQWX49ML2zCKmyDBc93Lip","2027-02":"R4VO5D5gpvOFtqY9DcOCST","2027-03":"csKqAVozSuZw15Yqz7ul1r","2027-04":"Ym3Dl9K6ho324rIqqwx9Um","2027-05":"R8Ko0sT9hysytJqzd6M6yF","2027-06":"AkNOx1UPM5L36h2w8q7S5i","2027-07":"1SdRDC5Hu8COIamYPVym1g","2027-08":"XRv0FDCO7asZ1WV7wT06gg","2027-09":"CrSFISWDrjKJQjP0yUptdU","2027-10":"KtE6jvDbx6dBCnpKATuw5k","2027-11":"KZ9kJ6m82oAgoIAsLCqLFZ","2027-12":"TWSHh9ipWP7G1ablAHAyHk","2028-01":"M0BOCxaAnmhB9cpgdKofgH","2028-02":"dWJtmUnoOJal5tNW9aVc0k","2028-03":"bDgDxTE0QitqCZF5oOOfb8","2028-04":"Kk9dDVuuf9HKsxHMDWUlbL","2028-05":"UusOaTz3la6theg9I0pm8a","2028-06":"RtCzcTwmeBu5WP0YMLmy4H","2028-07":"V7oahh685Qi19j9UjozORQ","2028-08":"hDQ3kKuvBh5o8L0GVbAeic","2028-09":"deKNLIA8qOXQCBVsuaZTMH","2028-10":"1eW9AGFxDiwKGdAC8sAIE0","2028-11":"C4TuKlNVK1SGasGITxp2rz","2028-12":"ZntN0Lqpqu20M1plkm7R9U","2029-01":"LuaaetJ7dheZsrluAnlbTB","2029-02":"sIbVIBpYqt0utKLbN7YBQa","2029-03":"WWuWNDffsEliPUH1dgCV4U","2029-04":"yvByHTgGzpUPj4xEosUkNG","2029-05":"ifSo2ZJQeulp73F8AOrioM","2029-06":"Ftd1LQjIeWIq2ErnFRVvGK","2029-07":"OjbVXdIqCmFflnSP5AGm6e","2029-08":"GqLTCSAHkmDLvlKTabbZsj","2029-09":"KTJb1tI2b8rwNFlmXxOIuN","2029-10":"UEaqTuALfzXeGPmil2QG9Z","2029-11":"yIYnIX10vvZ0VR0XyAmrzJ","2029-12":"uiOKplQsdN8tO7wWZQ116M","2030-01":"GGqr7C5M0Rj9KAaaMdUOvQ","2030-02":"RJKCHP28KsCNh5sWkhmo14","2030-03":"MoguThjhsVCsnlaL3dWhmk","2030-04":"XFw6RbZXPC95yBk3DS7JR2","2030-05":"YUqEXDOxmojoURX0shShkb","2030-06":"AytRYueO2qgCJMOICQCBlO","2030-07":"WXRSmSKJ08Mal2XJP3xRH0","2030-08":"6nMwUejoxe6B5MH4JXC3UK","2030-09":"IbLQaXEZr8SWg62WomrIVl","2030-10":"xHR2Az6UiB5Qgt92tcdhpH","2030-11":"3UvGMt5q3LFJYmAHE1l8t9","2030-12":"J8FE0JT1vLGfDE6kX7ezlj","2031-01":"fqe7paOC5Pdiy7dr4GMoub","2031-02":"84En0xCepZIyelUySil1DG","2031-03":"taXPtOvupfsbh7P5fLipLz","2031-04":"HWi6ZW5sufGZ0ISuSPwrbv","2031-05":"v5YnrPjG1kmGqVwifQKOsR","2031-06":"67r65w426pUSLx7UrwZLdD","2031-07":"dxdMCmSr2xmnoPUxmpj5dS","2031-08":"dZP2DDtmJrfKSaX8Ik0iqx","2031-09":"vXWhsKR75lHS42B1PigjDo","2031-10":"9Q4ZQzuHegnHneGLqMVbe8","2031-11":"CDSmJnqBga5Bw1v4WfyNae","2031-12":"gYA13tesD2czfm7sWxUp6X","2032-01":"5ojReG47N4m6Uxiyz0vPA2","2032-02":"8IS1vXj3gWxRaWrDyLnQz9","2032-03":"7K7aU7KwF2V1lBseGkATDP","2032-04":"FgQu8uOJVmubKZRSfwdZmX","2032-05":"TY5uu1iHwKG0VUNVLxP8r9","2032-06":"p43Te3LqQ22xfnNp9LV3aB","2032-07":"jxD1VBjEziPNVlOE2CisuQ","2032-08":"TrW7vC2Siz7ok6RXCRjiaC","2032-09":"MpAPhundcL9QMVzI3S9stN","2032-10":"avO8855wMKlq1kBFKA02XH","2032-11":"yIWXOZT4bwjjwRqvfeODMw","2032-12":"C8ymaVlbyvoEMbGeOPeoPJ","2033-01":"w0DwbQRlO1c7AAj0oOnzJf","2033-02":"xBeQbwDxVP0wJdjhTehsrC","2033-03":"4AXB0EPSQaAm2VVzUtI2KL","2033-04":"oU3uN15exkupZf03ovUluv","2033-05":"Hf8QmanM0b5qyyZHtJb71g","2033-06":"V9QHLG5SU5kAaninqMDyc4","2033-07":"aQ33bWMH0deYZdxPhyLszU","2033-08":"jWMWpPxFTlnTSAh1y92BKi","2033-09":"AzuQh2o9Db0P8cDBMgVAwy","2033-10":"sUPBwFpzrCT7YnMvsrcnak","2033-11":"1Whwb7eGeDWPFrpjK0p2TO","2033-12":"AEzmzuY4ZNLlxDFIERgh69","2034-01":"FlG1OuBdhzeGfO0pRfMsOu","2034-02":"CVStDWvvspDmaqLfEovN3n","2034-03":"f0U1csUymnmIWM3z6bTcJz","2034-04":"b6XGLJENPdxsAo3C8A2PGM","2034-05":"xIH10xwkO18WzLJkBAcBoI","2034-06":"DV0XRCfgeMIOL2eqH3vhoH","2034-07":"ApGjsNqSgj4T0BLldZ8zUy","2034-08":"nATiIhPEtgXNcFWECZtBtD","2034-09":"iFHYnFmbLCCFsLJnG51DBF","2034-10":"nrmGxdug2s9EI8MLS1k6Bc","2034-11":"98nf3yoWa2R0GocoXbBE1s","2034-12":"H2JO0maGb41VLsiWhwVf83","2035-01":"UwjPfmMkNzjwPo1zxVrWg9","2035-02":"lpFycXG7WVZkFbUbFDuNsd","2035-03":"pgiC5hdWsU4CsH5fycSuGy","2035-04":"ntA3EoOwrvoe3KYDF93S2L","2035-05":"En37u61LhIayIc0vSk0QJI","2035-06":"vkn47tQYSTfixaKi7tAttH","2035-07":"ds7RT2rvBPvB3e9uA6zzFF","2035-08":"QmD3RTIbEJZwdQ11Qx2lfu","2035-09":"fv0hqvypIbTheNg7wC5fj8","2035-10":"Pp1VD0EPI3dakiGZDMw6i8","2035-11":"8jr2HTu6KJxzkA3lcgyVYW","2035-12":"hAXuoMHGXz84fuIc2C56Cv","2036-01":"82Dfn46PrtI9mtQ6XnkKNs","2036-02":"gUFbQpCfcxU6hk7SAKWhTX","2036-03":"ylZmRS641GLBgerVNWYGSe","2036-04":"kicx84vdesc2RfLuYbMui3","2036-05":"e3hXsTNwkaen6TipWaTa3L","2036-06":"OoKzSzuHo6zLPGAQqKqw3z","2036-07":"PHVahOEoDt1bTYwmY46ea1","2036-08":"0EMSTw9ukjxN1EmkWrUGt7","2036-09":"vFT1dTtF2JMsn940EyvHSY","2036-10":"OQRomvpcZQrT62jN3Os732","2036-11":"dynb3SANkatadxFXpiIDIX","2036-12":"i7McGPK9ULDFGZXJjGge0Q"};
  var MONTH_KEYS = (function(){ var k=[]; for(var x in MONTH_ROUTE){ if(MONTH_ROUTE.hasOwnProperty(x)) k.push(x); } k.sort(); return k; })();
  // 取某年月的表ID；不在 2026-2036 范围内则夹到最近的可用月
  function flowDbOf(cm){
    if(!cm) return MONTH_ROUTE[MONTH_KEYS[MONTH_KEYS.length-1]];
    if(MONTH_ROUTE[cm]) return MONTH_ROUTE[cm];
    if(cm < MONTH_KEYS[0]) return MONTH_ROUTE[MONTH_KEYS[0]];
    if(cm > MONTH_KEYS[MONTH_KEYS.length-1]) return MONTH_ROUTE[MONTH_KEYS[MONTH_KEYS.length-1]];
    var best=MONTH_KEYS[0];
    for(var i=0;i<MONTH_KEYS.length;i++){ if(MONTH_KEYS[i] < cm) best=MONTH_KEYS[i]; else break; }
    return MONTH_ROUTE[best];
  }
  // 当前查询范围落在哪个月表（custom 区间取起始月；空范围取当前月）
  function rangeFlowDb(r){
    var cm = (r && r.mode==='custom') ? String(r.from||'').slice(0,7) : (r && r.cm) || curMonth();
    return flowDbOf(cm);
  }
  var DB_FLOW = flowDbOf(curMonth());
  // 判断一组 databaseId 里是否有任意一个月度流水表（平台数据变更订阅用）
  var FLOW_IDS = (function(){ var a=[]; for(var x in MONTH_ROUTE){ if(MONTH_ROUTE.hasOwnProperty(x)) a.push(MONTH_ROUTE[x]); } return a; })();
  function isFlowDbId(ids){
    if(!ids || !ids.length) return false;
    for(var i=0;i<ids.length;i++){ if(FLOW_IDS.indexOf(ids[i])>-1) return true; }
    return false;
  }   // 兼容旧的固定引用（bindText 的 data-sp-database-id）

  /* ---------- 本地存储适配层（App / 离线环境；接口与云端 SDK 对齐） ----------
     云端 SDK 不存在时页面自动改用本地存储（IndexedDB）。
     · 月流水表在本地无需分表 —— 所有 MONTH_ROUTE 的 databaseId 统一落到一个 flow 桶，
       查询靠 filter 里的日期范围区分；
     · 设置 / 成员各自独立成桶；
     · 方法签名与云端 db.* 完全一致 —— 页面业务代码零改动。
     阶段 3 换成 SQLite 时，只需替换本适配层内部实现，接口不变。 */
  var LOCAL_DB_NAME = 'wb_ledger_local';
  var LOCAL_OPEN = null;
  function localOpenDb(){
    if(LOCAL_OPEN) return LOCAL_OPEN;
    LOCAL_OPEN = new Promise(function(resolve, reject){
      if(typeof indexedDB === 'undefined'){ reject(new Error('当前环境不支持本地存储')); return; }
      var req = indexedDB.open(LOCAL_DB_NAME, 1);
      req.onupgradeneeded = function(){
        var d = req.result;
        if(!d.objectStoreNames.contains('records')){
          var st = d.createObjectStore('records', { keyPath:'id' });
          st.createIndex('bucket', 'bucket', { unique:false });
        }
      };
      req.onsuccess = function(){ resolve(req.result); };
      req.onerror = function(){ reject(req.error || new Error('本地数据库打开失败')); };
    });
    return LOCAL_OPEN;
  }
  // databaseId → 本地桶
  function localBucket(dbId){
    if(dbId === DB_USER) return 'user';
    if(dbId === DB_SETTINGS) return 'settings';
    if(dbId === DB_MONTHLY) return 'monthly';
    return 'flow';
  }
  function localAll(bucket){
    return localOpenDb().then(function(d){
      return new Promise(function(resolve, reject){
        var tx = d.transaction('records','readonly');
        var req = tx.objectStore('records').index('bucket').getAll(bucket);
        req.onsuccess = function(){ resolve(req.result || []); };
        req.onerror = function(){ reject(req.error); };
      });
    });
  }
  function localEnvWrite(mode, fn){
    return localOpenDb().then(function(d){
      return new Promise(function(resolve, reject){
        var tx = d.transaction('records', mode);
        var st = tx.objectStore('records');
        fn(st);
        tx.oncomplete = function(){ resolve(); };
        tx.onerror = function(){ reject(tx.error); };
        tx.onabort = function(){ reject(tx.error); };
      });
    });
  }
  function localNewId(){ return 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
  // 解包云端写入格式：{text:'a'} / {number:5} / {date:'2026-10-09'} → 原始值
  // （页面写入一律走 properties:{字段:{类型:值}}，云端读回时是解包后的值，本地必须一致）
  function localUnwrap(v){
    if(v && typeof v === 'object' && !(v instanceof Date)){
      if(v.text != null)   return String(v.text);
      if(v.number != null) return Number(v.number);
      if(v.date != null)   return normalizeStamp(v.date);
      if(v.select != null) return String(v.select);
      for(var k in v){ if(v.hasOwnProperty(k)){ var x = v[k]; return (typeof x === 'number') ? x : String(x); } }
    }
    return v;
  }
  function localPack(props){
    var data = {}, k;
    for(k in props){ if(props.hasOwnProperty(k)) data[k] = localUnwrap(props[k]); }
    return data;
  }
  // filter 求值：支持 and / or / property(text|date|number)，与云端 filter 树结构一致
  function localMatch(filter, rec){
    if(!filter) return true;
    var i;
    if(filter.and){ for(i=0;i<filter.and.length;i++){ if(!localMatch(filter.and[i], rec)) return false; } return true; }
    if(filter.or){ for(i=0;i<filter.or.length;i++){ if(localMatch(filter.or[i], rec)) return true; } return false; }
    var p = filter.property;
    if(!p) return true;
    var val = rec[p.property];
    if(p.text){
      var t = String(val==null?'':val);
      if(p.text.equals!=null) return t === String(p.text.equals);
      if(p.text.contains!=null) return t.indexOf(String(p.text.contains)) > -1;
      return true;
    }
    if(p.date){
      var ds = String(val==null?'':val).slice(0,10);
      if(!ds) return false;
      if(p.date.after!=null && !(ds > String(p.date.after).slice(0,10))) return false;
      if(p.date.before!=null && !(ds < String(p.date.before).slice(0,10))) return false;
      return true;
    }
    if(p.number){
      var n = num(val);
      if(p.number.equals!=null) return n === Number(p.number.equals);
      if(p.number.gt!=null && !(n > Number(p.number.gt))) return false;
      if(p.number.lt!=null && !(n < Number(p.number.lt))) return false;
      return true;
    }
    return true;
  }
  function localDateKey(o){ return String(o['日期'] || o['月份'] || ''); }
  var LOCAL_FILES = {}, LOCAL_FILE_SEQ = 0;
  function LocalDB(){}
  LocalDB.prototype.query = function(o){
    o = o || {};
    if(!o.databaseId) return Promise.reject(new Error('本地查询缺少 databaseId'));
    return localAll(localBucket(o.databaseId)).then(function(rows){
      var list = [];
      rows.forEach(function(r){
        var rec = {}, k;
        for(k in r.data){ if(r.data.hasOwnProperty(k)) rec[k] = r.data[k]; }
        rec._id = r.id;
        if(localMatch(o.filter, rec)) list.push(rec);
      });
      // 与云端 sorts:日期 descending 行为保持一致
      list.sort(function(a,b){ var x=localDateKey(a), y=localDateKey(b); return x<y ? 1 : (x>y ? -1 : 0); });
      // 游标分页必须真实实现：
      // 云端契约是「hasMore=true 时给 nextCursor，调用方拿它继续翻页」。
      // 旧实现恒返回 nextCursor:null，导致 queryOneMonth 的翻页循环永远进不去
      // —— 超过 pageSize（200 条）的流水被静默丢弃，表现为「导入成功但看不到数据」。
      var ps = o.pageSize || 200;
      var start = 0;
      if(o.startCursor != null && o.startCursor !== ''){
        start = parseInt(String(o.startCursor), 10);
        if(!(start >= 0)) start = 0;
      }
      var slice = list.slice(start, start + ps);
      var nextStart = start + slice.length;
      var hasMore = nextStart < list.length;
      return {
        results: slice,
        nextCursor: hasMore ? String(nextStart) : null,
        hasMore: hasMore
      };
    });
  };
  LocalDB.prototype.addRecord = function(o){
    o = o || {};
    var data = localPack(o.properties || o.record || {});
    var id = localNewId();
    return localEnvWrite('readwrite', function(st){ st.put({ id:id, bucket:localBucket(o.databaseId), data:data }); })
      .then(function(){ return { id:id, recordId:id }; });
  };
  LocalDB.prototype.updateRecord = function(o){
    o = o || {};
    var rid = o.recordId, bucket = localBucket(o.databaseId);
    var props = localPack(o.properties || {});
    return localAll(bucket).then(function(rows){
      var hit = null;
      rows.forEach(function(r){ if(r.id === rid) hit = r; });
      if(!hit) throw new Error('记录不存在：' + rid);
      var data = {}, k;
      for(k in hit.data){ if(hit.data.hasOwnProperty(k)) data[k] = hit.data[k]; }
      for(k in props){ if(props.hasOwnProperty(k)) data[k] = props[k]; }
      return localEnvWrite('readwrite', function(st){ st.put({ id:rid, bucket:bucket, data:data }); });
    }).then(function(){ return { id:rid }; });
  };
  LocalDB.prototype.deleteRecord = function(o){
    o = o || {};
    var ids = [];
    if(o.recordId) ids.push(o.recordId);
    if(o.recordIds && o.recordIds.length) ids = ids.concat(o.recordIds);
    if(!ids.length) return Promise.resolve({});
    // 只删本桶内的记录，避免误删其它桶里同 id 的数据（幂等：不存在也算成功）
    var bucket = localBucket(o.databaseId);
    return localAll(bucket).then(function(rows){
      var mine = {};
      rows.forEach(function(x){ mine[x.id] = 1; });
      var hit = ids.filter(function(x){ return mine[x]; });
      if(!hit.length) return {};
      return localEnvWrite('readwrite', function(st){ hit.forEach(function(x){ st.delete(x); }); }).then(function(){ return {}; });
    });
  };
  // 「切换用户」的清空数据用：一次性清掉整个 records 表（四桶全清）。
  // 只给确认弹窗的「确定」调用，不要挂在其它路径上。
  LocalDB.prototype.clearAll = function(){
    return localEnvWrite('readwrite', function(st){ st.clear(); }).then(function(){ return {}; });
  };
  LocalDB.prototype.getSchema = function(){
    // 本地无 select 选项 schema → 返回空，页面自动使用内置兜底分类
    return Promise.resolve({ properties: [] });
  };
  LocalDB.prototype.aggregate = function(o){
    o = o || {};
    return localAll(localBucket(o.databaseId)).then(function(rows){
      var list = rows.map(function(r){
        var rec = {}, k;
        for(k in r.data){ if(r.data.hasOwnProperty(k)) rec[k] = r.data[k]; }
        return rec;
      });
      var out = (o.aggregates || []).map(function(a){
        var sum = 0, cnt = 0;
        list.forEach(function(rec){
          if(!localMatch(a.filter, rec)) return;
          if(a.type === 'sum') sum += num(rec[a.property]);
          else if(a.type === 'count') cnt += 1;
        });
        return { name:a.name, value: (a.type === 'count' ? cnt : Math.round(sum*100)/100) };
      });
      return { results: out };
    });
  };
  // 本地导出：文件先存内存，取下载地址时转 ObjectURL（页面用 a.download 下载）
  LocalDB.prototype.uploadFile = function(o){
    LOCAL_FILE_SEQ += 1;
    var id = 'LF' + LOCAL_FILE_SEQ;
    LOCAL_FILES[id] = (o && o.file) || null;
    return Promise.resolve({ attachmentId:id });
  };
  LocalDB.prototype.getDownloadUrl = function(o){
    var f = LOCAL_FILES[o && o.attachmentId];
    if(!f || typeof URL === 'undefined' || !URL.createObjectURL) return Promise.reject(new Error('本地文件不可用'));
    return Promise.resolve({ downloadUrl: URL.createObjectURL(f) });
  };
  // 环境选择：云端可用走云端，否则走本地（App / 离线）
  var db = CLOUD_DB || new LocalDB();
  var DB_IS_LOCAL = !CLOUD_DB;

  var U_KEY = 'wb_ledger_u';   // 当前成员 u，存本机
  var CAT_FALLBACK = ['吃饭','交通','购物','娱乐','房租','借出','美团支出','微信支出','支付宝支出','其他'];
  // 收入来源兜底列表（线上 select 选项缺失时用）
  var INC_FALLBACK = ['工资','奖金','兼职','理财','红包','报销','其他收入'];
  var KIND_EXPENSE = '支出', KIND_INCOME = '收入';
  var NUM_SET = {'到手月薪':1,'发薪月数':1,'工作成本':1,'在场时间':1,'通勤':1,'加班':1,'自由目标':1,'已攒金额':1,'每月开销':1,'当日消费额度':1};
  var SCHEMA_OPTIONS = {};
  var DEFAULT_SETTINGS = {'到手月薪':13800,'发薪月数':13,'工作成本':850,'在场时间':9,'通勤':48,'加班':6,'自由目标':120000,'目标月份':'2028-03','已攒金额':36800,'每月开销':5600,'起始月':'2026-09','自由宣言':'攒出半年缓冲期，给下一次选择留出底气','当日消费额度':0,'超额提醒静音日期':''};
  var state = { flow:[], settings:null, settingsId:null, monthly:[], users:[], u:null,
                creating:false, usersLoaded:false, pendingAcct:null, loggedIn:false, platform:null,
                // 明细查询范围（明细只加载这个区间，不再全量拉库）
                range:{ mode:'month', cm:'', from:'', to:'' },
                // 服务端聚合结果缓存：{ months:[{cm,inc,exp,incN,expN}], cm }
                agg:null, aggLoading:false,
                // 仅为统计额外缓存的月份明细；绝不与state.flow（当前范围）混用
                extraFlow:[] };
  var saveTimer = null, ledgerEditId=null;
  // 范围查询并发闸门：只接受最后一次请求的结果，避免快速切月份时旧响应覆盖新范围
  var rangeSeq = 0;
  // 输入框 id → 设置表字段名（显式保存时用来把值吸回 state）
  var SET_FIELD_OF = {
    's-monthly':'到手月薪', 's-paymonths':'发薪月数', 's-cost':'工作成本',
    's-onsite':'在场时间', 's-commute':'通勤', 's-ot':'加班',
    'f-goal':'自由目标', 'f-target':'目标月份', 'f-saved':'已攒金额',
    'f-cost':'每月开销', 'f-start':'起始月', 'f-decl':'自由宣言',
    'dBudgetInput':'当日消费额度'
  };

  /* ---------- 工具 ---------- */
  function num(v){ var n = parseFloat(v); return isFinite(n) ? n : 0; }
  // 金额格式化：始终保留两位小数。
  // 原实现用 Math.round 取整，会把 0.10 显示成 ¥0、1.88 显示成 ¥2（记账必须精确到分）。
  function fmt(v){
    var raw = num(v);
    var neg = raw < 0;
    var abs = Math.abs(raw);
    var ip = Math.floor(abs);
    // 先用 toFixed(3) 抹掉 IEEE754 尾数误差（如 1.005 实际存为 1.00499…），再四舍五入到分
    var dp = Math.round(Number((abs - ip).toFixed(3)) * 100);
    if(dp >= 100){ ip += 1; dp = 0; }
    var si = String(ip).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return '¥' + (neg ? '-' : '') + si + '.' + (dp < 10 ? '0' : '') + dp;
  }
  // 图表坐标轴刻度用的紧凑金额（整数即可，避免轴标签过长）
  function fmtAxis(v){
    return String(Math.round(num(v))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  // 环形图中心用的极短金额：¥1.2万 / ¥8,530，保证任何数字都不溢出圆环
  function fmtShort(v){
    var n = num(v), neg = n<0, a = Math.abs(n), s;
    if(a >= 1e8) s = (a/1e8).toFixed(a>=1e9?0:1).replace(/\.0$/,'') + '亿';
    else if(a >= 1e4) s = (a/1e4).toFixed(a>=1e6?0:1).replace(/\.0$/,'') + '万';
    else s = String(Math.round(a)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return '¥' + (neg?'-':'') + s;
  }
  function pad2(n){ return (n<10?'0':'') + n; }
  function todayStr(){ var d=new Date(); return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }
  // 记账时间戳：精确到秒，'YYYY-MM-DD HH:mm:ss'。
  // 秒是「点击保存那一刻」的真实时间——同一分钟内连记两笔也能分清先后。
  // 显示层按需截断（列表显示到分，详情/明细显示到秒），存储一律带秒，避免信息丢失。
  function nowStamp(){
    var d=new Date();
    return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())+' '
         + pad2(d.getHours())+':'+pad2(d.getMinutes())+':'+pad2(d.getSeconds());
  }
  // 规整成 'YYYY-MM-DD HH:mm:ss'：
  // · 纯日期 → 补 00:00:00
  // · 只到分 → 补 :00（保持与旧数据兼容，语义是「该分钟的第 0 秒」）
  // · 兼容 ISO 'T' 分隔、斜杠日期(2026/10/12)、非补零时分秒、时区尾巴(Z / +08:00)
  // · 云端读回的 ISO UTC（2026-10-13T05:45:07Z）也在这里被还原成东八区本地时间
  function normalizeStamp(v){
    var s=String(v==null?'':v).trim();
    if(!s) return s;
    // ISO 8601 带 Z / 时区偏移：交给 Date 解析后按本机时区还原（云端 date 字段读回就是这个形态）
    if(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s) && /(Z|[+\-]\d{2}:?\d{2})$/.test(s)){
      var dt = new Date(s);
      if(!isNaN(dt.getTime())){
        return dt.getFullYear()+'-'+pad2(dt.getMonth()+1)+'-'+pad2(dt.getDate())+' '
             + pad2(dt.getHours())+':'+pad2(dt.getMinutes())+':'+pad2(dt.getSeconds());
      }
    }
    // 本地形态：2026-10-12 / 2026-10-12T08:09 / 2026/10/5 9:5:7 / 2026-10-12 08:09:10.123
    s=s.replace(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/,
      function(_, y, mo, d, h, mi, sec){
        var r = y+'-'+pad2(+mo)+'-'+pad2(+d);
        if(h!=null) r += ' '+pad2(+h)+':'+pad2(+mi)+':'+pad2(sec==null?0:+sec);
        return r;
      });
    if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s+' 00:00:00';
    if(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s)) return s+':00';
    if(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) return s.slice(0,19);
    return s;
  }
  // 显示用：把时间戳截到「分」（列表里秒太吵）；想做更细展示再传 sec=true
  function stampShort(v, withSec){
    var s = normalizeStamp(v);
    if(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) return withSec ? s : s.slice(0,16);
    return s;
  }
  // 记账页只让用户选「日期」：时间在点保存的那一刻自动补全为当前时分秒。
  // 选今天 → 用真实当前时刻（秒级）；选历史日期 → 补 00:00:00（仍可在明细里点「编辑」改）。
  function stampOfPickedDate(v, tm){
    var s=String(v==null?'':v).trim();
    if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) return nowStamp();
    var t=String(tm==null?'':tm).trim();
    if(!/^\d{2}:\d{2}$/.test(t) && !/^\d{2}:\d{2}:\d{2}$/.test(t)) t = (s===todayStr()) ? nowHms() : '00:00:00';
    if(/^\d{2}:\d{2}$/.test(t)) t += ':00';
    return s+' '+t;
  }
  function curMonth(){ var d=new Date(); return d.getFullYear()+'-'+pad2(d.getMonth()+1); }
  function $(id){ return document.getElementById(id); }
  function el(tag, cls, html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
  function bindText(node, text, dbId){
    node.textContent = text;
    node.setAttribute('data-sp-bindable','database');
    node.setAttribute('data-sp-database-id', dbId);
  }
  function showToast(msg, isErr){
    var t=$('toast'); t.textContent=msg; t.className='toast show'+(isErr?' err':'');
    setTimeout(function(){ t.className='toast'+(isErr?' err':''); }, 2400);
  }
  function setSync(status){
    var map={syncing:'同步中…',synced:'已同步',offline:'离线模式',error:'同步异常'};
    var dot=$('syncDot'), lab=$('syncLabel'), dot2=$('syncDot2'), lab2=$('syncLabel2');
    if(dot) dot.className='sync-dot '+status; if(lab) lab.textContent=map[status]||'';
    if(dot2) dot2.className='sync-dot '+status; if(lab2) lab2.textContent=map[status]||'';
  }
  function showError(msg, retry){
    var bar=$('errbar'); $('errMsg').textContent=msg; bar.classList.add('show');
    $('errRetry').onclick=function(){ bar.classList.remove('show'); if(retry) retry(); };
  }
  function hideError(){ $('errbar').classList.remove('show'); }

  /* ---------- 数据加载 ---------- */
  // 服务端要求 filter 为嵌套树结构：{property:{property:"字段名", text:{equals:"值"}}}
  // （扁平写法 {property:"字段名",...} 会被后端拒绝：cannot unmarshal string into PropertyFilter）
  function uFilter(){ return {property:{property:'u', text:{equals: state.u}}}; }
  function loadUsers(){
    if(!db) return Promise.resolve(state.users);
    return db.query({databaseId:'7ksfKW1zKsCY7a8xOUNrE8', pageSize:100}).then(function(r){
      // 必须落到 state.users，否则查重与成员列表都拿不到数据（曾导致重名重复创建）
      state.users = r.results||[];
      state.usersLoaded = true;
      return state.users;
    }).catch(function(e){
      console.error('[loadUsers]', e);
      setSync('error');
      showError('成员列表加载失败，请重试', function(){ loadUsers().then(renderUserList); });
      return state.users;
    });
  }
  function ensureSchema(){
    if(!db) return Promise.resolve();
    return db.getSchema({databaseId:flowDbOf(curMonth())}).then(function(schema){
      (schema.properties||[]).forEach(function(f){
        if((f.type==='select'||f.type==='multi_select') && f.config && f.config.options){
          SCHEMA_OPTIONS[f.name]=f.config.options;
        }
      });
    }).catch(function(){ /* 用兜底选项 */ });
  }
  /* ---------- 查询范围 ---------- */
  function monthStart(cm){ return cm+'-01'; }
  // 返回下一个月的 1 号（开区间上界，配合 date.before 使用）
  function nextMonthStart(cm){
    var y=parseInt(cm.slice(0,4),10), m=parseInt(cm.slice(5,7),10);
    if(m===12) return (y+1)+'-01-01';
    return y+'-'+pad2(m+1)+'-01';
  }
  // 返回当月最后一天（含端点）
  function monthEndInclusive(cm){
    var y=parseInt(cm.slice(0,4),10), m=parseInt(cm.slice(5,7),10);
    var last=new Date(y, m, 0).getDate();
    return y+'-'+pad2(m)+'-'+pad2(last);
  }
  // 最近 n 个月的 YYYY-MM，从早到晚
  function recentMonths(n){
    var out=[], d=new Date();
    d.setDate(1);
    for(var i=n-1;i>=0;i--){
      var t=new Date(d.getFullYear(), d.getMonth()-i, 1);
      out.push(t.getFullYear()+'-'+pad2(t.getMonth()+1));
    }
    return out;
  }
  // 规范化范围：mode=month 用 cm 推导起止；mode=custom 用 from/to
  function normRange(r){
    r = r || {};
    if(r.mode==='custom'){
      var f=String(r.from||''), t=String(r.to||'');
      if(!/^\d{4}-\d{2}-\d{2}$/.test(f) || !/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
      if(f>t) return null;
      return {mode:'custom', cm:null, from:f, to:t};
    }
    var cm = r.cm || curMonth();
    if(!/^\d{4}-\d{2}$/.test(cm)) return null;
    return {mode:'month', cm:cm, from:monthStart(cm), to:monthEndInclusive(cm)};
  }
  function rangeLabel(r){
    if(!r) return '';
    return (r.mode==='month') ? (r.cm+' 全月') : (r.from+' 至 '+r.to);
  }
  function isFlowInRange(rec, r){
    var d=String(rec['日期']||'').slice(0,10);
    if(d.length<10) return false;
    if(r.mode==='month') return d.slice(0,7)===r.cm;
    return (d>=r.from && d<=r.to);
  }
  // 只拉当前范围内的明细；仍然完整翻页（范围可能跨多月），但有明确上限防失控。
  // 表按年月分：custom 跨月区间需要把区间内涉及的每个月表都查一遍再合并。
  // date 边界语义未知 → 两端各留一天余量，保证端点当天不漏。
  function monthsInRange(r){
    var out=[], i, j, y, m;
    if(r.mode==='month'){ return [r.cm]; }
    var a=parseInt(String(r.from).slice(0,4),10), am=parseInt(String(r.from).slice(5,7),10);
    var b=parseInt(String(r.to).slice(0,4),10), bm=parseInt(String(r.to).slice(5,7),10);
    y=a; m=am;
    while((y<b)||(y===b&&m<=bm)){
      out.push(y+'-'+pad2(m));
      if(m===12){ y++; m=1; } else m++;
      if(out.length>=60) break;      // 防御：区间异常跨度过大，最多查 60 个月表
    }
    return out;
  }
  function queryOneMonth(cm, from, to, cursor, acc, guard){
    acc=acc||[]; guard=guard||0;
    if(!db) return Promise.resolve(acc);
    if(guard>50) return Promise.resolve(acc);
    var f = { and:[ uFilter(), rangeDateFilter(from, to) ] };
    return db.query({databaseId: flowDbOf(cm), filter:f,
      sorts:[{property:'日期',direction:'descending'}], pageSize:200, startCursor:cursor}).then(function(res){
      acc = acc.concat(res.results||[]);
      var next=res.nextCursor;
      if(res.hasMore && next && next!==cursor && (res.results||[]).length){ return queryOneMonth(cm, from, to, next, acc, guard+1); }
      return clampToRange(acc, from, to);
    });
  }
  function loadFlowRange(r, cursor, acc, guard){
    var mons = monthsInRange(r);
    if(!mons.length) return Promise.resolve([]);
    if(mons.length===1){
      return queryOneMonth(mons[0], r.from, r.to, null, [], 0);
    }
    // 跨月：每个月表用该月实际边界，避免把别的月的记录拉进来
    return Promise.all(mons.map(function(cm){
      var f = normRange({mode:'month', cm:cm});
      var from = (f && f.from > r.from) ? f.from : r.from;
      var to   = (f && f.to   < r.to)   ? f.to   : r.to;
      if(from>to) return Promise.resolve([]);
      return queryOneMonth(cm, from, to, null, [], 0);
    })).then(function(lists){
      var all=[], seen={};
      lists.forEach(function(l){
        l.forEach(function(rec){ if(rec && rec._id && !seen[rec._id]){ seen[rec._id]=1; all.push(rec); } });
      });
      all.sort(function(a,b){ return String(a['日期']||'') < String(b['日期']||'') ? 1 : -1; });
      return all;
    });
  }
  function prevDay(ds){
    var d=new Date(parseInt(ds.slice(0,4),10), parseInt(ds.slice(5,7),10)-1, parseInt(ds.slice(8,10),10));
    d.setDate(d.getDate()-1);
    return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
  }
  function nextDay(ds){
    var d=new Date(parseInt(ds.slice(0,4),10), parseInt(ds.slice(5,7),10)-1, parseInt(ds.slice(8,10),10));
    d.setDate(d.getDate()+1);
    return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
  }

  /* ---------- 服务端聚合 ---------- */
  // date 边界语义（实测）：after / before 都是**严格**比较，且只接受日期粒度（YYYY-MM-DD）。
  // 因此「只写日期」的边界无法精确表达含端点的区间，两种用法各有代价：
  //   · 明细查询：两端各留一天余量（after=前一天、before=次日）保证端点不漏，
  //     多带进来的边界外记录由 clampToRange() 在客户端精确剔除；
  //   · 聚合查询：绝不能用余量，否则相邻两个月会把同一条边界记录各算一次 → 用 rangeDateFilterTight()。
  // 记录精确到秒后（记账时间带 HH:mm:ss），这个区别才变得重要。
  function kindFilter(kind){
    return { property:{ property:'收支类型', text:{ equals:kind } } };
  }
  // 明细查询用：两端留一天余量，保证区间端点不被漏掉（结果需再经 clampToRange 收紧）
  function rangeDateFilter(from, to){
    return { property:{ property:'日期', date:{ after: prevDay(from), before: nextDay(to) } } };
  }
  // 聚合查询用：不留余量，避免相邻月份重复计算同一条边界记录
  // （代价：恰好落在「每月 1 号 00:00」的记录不计入 —— 实际记账不会停在整点零点）
  function rangeDateFilterTight(from, to){
    return { property:{ property:'日期', date:{ after: from, before: nextDay(to) } } };
  }
  // 服务端为了让区间不漏会各留一天余量；记录带秒后会把边界外那天的记录也带进来，这里按日期精确收紧
  function clampToRange(list, from, to){
    if(!from || !to) return list || [];
    return (list||[]).filter(function(rec){
      var d = String((rec && rec['日期']) || '').slice(0,10);
      return d >= from && d <= to;
    });
  }
  // 表按年月分：aggregate 只能针对单个 databaseId，所以每个月要各发一次请求。
  // 契约：aggregates 一次 1~10 项 → 单月一次就够（4 项）。
  // 12 个月 = 12 次并发请求；因为并发而非串行，且每次都与数据量无关，代价可接受。
  function runAggMonth(cm){
    var df = rangeDateFilterTight(cm+'-01', monthEndInclusive(cm));
    var aggregates = [
      { name:'inc',  type:'sum',  property:'金额', filter:{ and:[ uFilter(), df, kindFilter(KIND_INCOME) ] } },
      { name:'exp',  type:'sum',  property:'金额', filter:{ and:[ uFilter(), df, kindFilter(KIND_EXPENSE) ] } },
      { name:'incn', type:'count',              filter:{ and:[ uFilter(), df, kindFilter(KIND_INCOME) ] } },
      { name:'expn', type:'count',              filter:{ and:[ uFilter(), df, kindFilter(KIND_EXPENSE) ] } }
    ];
    if(typeof db.aggregate!=='function') return Promise.resolve({cm:cm, inc:0, exp:0, incN:0, expN:0});
      return Promise.resolve().then(function(){ return db.aggregate({databaseId: flowDbOf(cm), aggregates: aggregates}); }).then(function(r){
      var m={};
      (r.results||[]).forEach(function(it){ m[it.name]=it.value; });
      return {cm:cm, inc:pickVal(m,'inc'), exp:pickVal(m,'exp'),
              incN:pickVal(m,'incn'), expN:pickVal(m,'expn')};
    }).catch(function(e){
      console.error('[runAggMonth]', cm, e);
      return {cm:cm, inc:0, exp:0, incN:0, expN:0, failed:true};
    });
  }
  function runAgg(cms){
    return Promise.all(cms.map(runAggMonth));
  }
  // 本月客户端基准值：只统计落在当前范围内的明细
  function localMonthOf(cm){
    var inc=0, exp=0, incN=0, expN=0;
    allKnown().forEach(function(rec){
      if(String(rec['日期']||'').slice(0,7)!==cm) return;
      var v=num(rec['金额']);
      if(isIncome(rec)){ inc+=v; incN++; } else { exp+=v; expN++; }
    });
    return {inc:inc, exp:exp, incN:incN, expN:expN};
  }
  function pickVal(map, name){
    var v = map[name];
    return (typeof v==='number' && isFinite(v)) ? v : 0;
  }
  // 加载最近 N 个月的收支聚合（服务端算，与数据量无关）
  function loadAgg(nMonths){
    if(!db){ return Promise.resolve(null); }
    var cms = recentMonths(nMonths||12);
    var cur = cms[cms.length-1];
    state.aggLoading = true;
    if(typeof db.aggregate!=='function'){
      // 客户端聚合回退：逐月拉明细（幂等，已拉过的月跳过），再客户端聚合出按月数据
      return Promise.all(cms.map(function(cm){ return ensureMonthLoaded(cm); })).then(function(){
        var months = cms.map(function(cm){ return buildClientMonth(cm); });
        months.forEach(function(it){ it.net = it.inc - it.exp; });
        state.agg = { months:months, cm:cur };
        state.aggLoading = false;
        return state.agg;
      }).catch(function(e){
        state.aggLoading = false;
        console.error('[loadAgg]', e);
        return null;
      });
    }
    return runAgg(cms).then(function(arr){
      arr.forEach(function(it){ it.net = it.inc - it.exp; });
      state.agg = { months:arr, cm:cur };
      state.aggLoading = false;
      return state.agg;
    }).catch(function(e){
      state.aggLoading = false;
      console.error('[loadAgg]', e);
      showToast('月度汇总加载失败，已回退为按当前范围估算','err');
      return null;
    });
  }

  // 客户端聚合单月（inc/exp/incN/expN），用于 aggregate 不可用时的回退
  function buildClientMonth(cm){
    var inc=0, exp=0, incN=0, expN=0;
    allKnown().forEach(function(r){
      var d=String(r['日期']||'').slice(0,10);
      if(d.slice(0,7)!==cm) return;
      if(isIncome(r)){ inc+=num(r['金额']); incN++; } else { exp+=num(r['金额']); expN++; }
    });
    return {cm:cm, inc:inc, exp:exp, incN:incN, expN:expN};
  }
  // 按月结余数据源：优先服务端聚合，失败回退到当前范围明细
  function monthBuckets(){
    if(state.agg && state.agg.months && state.agg.months.length) return state.agg.months;
    var byM={};
    allKnown().forEach(function(rec){
      var d=String(rec['日期']||'').slice(0,10);
      if(d.length<7) return;
      var cm=d.slice(0,7);
      if(!byM[cm]) byM[cm]={cm:cm, inc:0, exp:0, incN:0, expN:0};
      var v=num(rec['金额']);
      if(isIncome(rec)){ byM[cm].inc+=v; byM[cm].incN++; } else { byM[cm].exp+=v; byM[cm].expN++; }
    });
    var arr=Object.keys(byM).map(function(k){ return byM[k]; });
    arr.sort(function(a,b){ return a.cm<b.cm ? -1 : (a.cm>b.cm ? 1 : 0); });
    arr.forEach(function(it){ it.net=it.inc-it.exp; });
    return arr;
  }

  function loadSettings(){
    if(!db) return Promise.resolve(null);
    return db.query({databaseId:'WsoAhfTSqHzHkZOIblFmZI', filter:uFilter(), pageSize:10}).then(function(r){
      var recs=r.results||[];
      if(recs.length){ state.settingsId=recs[0]._id; state.settings=recs[0]; return recs[0]; }
      state.settingsId=null; state.settings=null; return null;
    });
  }
  function loadAllData(){
    setSync('syncing');
    var r = normRange(state.range) || normRange({mode:'month', cm:curMonth()});
    state.range = r;
    Promise.all([ensureSchema(), loadSettings(), loadFlowRange(r), loadAgg(12)])
      .then(function(arrs){
        // state.settings / state.settingsId 已由 loadSettings 内部正确赋值；
        // 此处不可再用 arrs[1] 覆盖（旧代码 loadSettings 无返回值 → 恒为 undefined
        // → 会把刚拉到的设置强制置空，导致页面回落到默认值并可能覆写线上数据）
        state.flow = arrs[2] || [];
        populateCats();
        refreshAll();
        setSync('synced');
        hideError();
      })
      .catch(function(err){
        console.error('[load]', err);
        setSync('error');
        showError('数据加载失败，请检查网络后重试', loadAllData);
      });
  }

  /* ---------- 设置读写 ---------- */
  function toProps(obj){
    var p={};
    for(var k in obj){ if(!obj.hasOwnProperty(k)) continue;
      if(NUM_SET[k]) p[k]={ number: num(obj[k]) };
      else p[k]={ text: obj[k]==null?'':String(obj[k]) };
    }
    return p;
  }
  function withU(props){ var p=props||{}; if(state.u) p.u={ text: state.u }; return p; }
  // 创建成员时带上平台账号（已登录则直接写入，实现"注册即绑定"）
  function withUser(props){
    var p = withU(props);
    if(state.pendingAcct && !p['平台账号']){
      p['平台账号']={ text: state.pendingAcct };
      p['绑定时间']={ text: todayStr() };
    }
    return p;
  }

  /* ---------- 成员（user 表） ---------- */
  function readU(){ try{ return localStorage.getItem(U_KEY) || ''; }catch(e){ return ''; } }
  function writeU(u){ try{ localStorage.setItem(U_KEY, u||''); }catch(e){} }
  function userByU(u){
    for(var i=0;i<state.users.length;i++){ if(state.users[i].u===u) return state.users[i]; }
    return null;
  }
  function initialOf(name){ return (name||'?').trim().slice(0,1); }
  function renderWhoami(){
    var me = userByU(state.u);
    var nm = me ? (me['姓名']||me.u) : '我';
    var dot=$('whoamiDot'), nameEl=$('whoamiName');
    if(dot) dot.textContent=initialOf(nm);
    if(nameEl) nameEl.textContent=nm;
  }
  /* ---------- 登录 / 平台身份 ---------- */
  // 读取平台真实登录态。
  // 平台契约：未登录时 getUserInfo() 默认「跳转到登录页」而不是返回空对象 ——
  // 所以它绝不能无条件调用，否则每次打开页面都会被强制拉去登录（这就是「登录不进」的根因）。
  // 只有两种时候才允许调用：① 用户主动点了「登录」按钮；② 本机已记住成员、但需要确认平台身份是否匹配。
  var loginProbeMemo = null;          // 显式登录探测的结果缓存（避免重复触发跳转）
  function fetchPlatformUser(allowRedirect){
    if(!db || typeof db.getUserInfo!=='function') return Promise.reject(new Error('当前环境不支持登录'));
    if(loginProbeMemo) return Promise.resolve(loginProbeMemo);
    if(!allowRedirect){
      // 静默探测：只确认「能力存在」，不触发平台跳转。
      // 平台在无登录态时会直接重定向，我们无法在页面侧拦到结果，
      // 因此这里不发请求，交给「有本机成员就直接进」的降级路径处理。
      return Promise.reject(new Error('未发起登录（静默模式）'));
    }
    return db.getUserInfo().then(function(rsp){
      var info = rsp && rsp.userInfo;
      if(!info) throw new Error('未获取到登录身份');
      // id 可能为空（部分账号 type），用昵称/账号名兜底，避免误判「没有身份」
      if(!info.id && !info.nickName && !info.name) throw new Error('未获取到登录身份');
      loginProbeMemo = info;
      return info;
    });
  }
  function acctOf(info){ return (info && (info.account || info.name || info.nickName)) || ''; }
  function keyOf(info){ return (info && (info.id || info.account || info.nickName)) || ''; }
  function showLoginErr(msg){
    var box=$('gateLoginErr');
    if(!box) return;
    if(!msg){ box.style.display='none'; box.textContent=''; return; }
    box.style.display=''; box.textContent=msg;
  }
  // 已绑定该平台账号的成员
  function userByAccount(acct, key){
    for(var i=0;i<state.users.length;i++){
      var r=state.users[i];
      var ra=String(r['平台账号']||'').trim();
      if(ra && (ra===acct || (key && ra===key))) return r;
    }
    return null;
  }
  // 绑定平台账号到某个成员（不覆盖已有绑定，避免多人误绑同一账号）
  function bindAccount(u, info){
    var rec = userByU(u);
    if(!rec) return Promise.reject(new Error('成员不存在'));
    if(rec['平台账号']) return Promise.resolve(rec);
    return db.updateRecord({ databaseId:'7ksfKW1zKsCY7a8xOUNrE8', recordId:rec._id,
      properties:{ '平台账号':{text:keyOf(info)}, '绑定时间':{text:todayStr()} } })
      .then(function(){ return loadUsers(); })
      .then(function(){ return userByU(u); });
  }
  // 登录主流程：用户「主动点击」才调用平台 getUserInfo（允许触发登录跳转）
  //            → 找已绑定成员 → 直接进 / 退回让它选一个成员绑定
  function doLogin(){
    var btn=$('btnLogin');
    showLoginErr('');
    if(btn){ btn.disabled=true; btn.textContent='正在登录…'; }
    setSync('syncing');
    return fetchPlatformUser(true)          // true = 允许平台跳登录页
      .then(function(info){
        state.loggedIn=true; state.platform=info;
        return loadUsers().then(function(){
          var acct=acctOf(info), key=keyOf(info);
          // 1) 已绑定 → 直接进（实现「不过期就直接进入」）
          var bound=userByAccount(acct, key);
          if(bound){ return bound; }
          // 2) 本机上次用过的人，且尚未绑定任何平台账号 → 自动绑定
          var last=readU();
          var lastRec=last ? userByU(last) : null;
          if(lastRec && !lastRec['平台账号']){
            return bindAccount(lastRec.u, info).then(function(r){ return r || lastRec; });
          }
          // 3) 无法判定 → 让用户选一个成员绑定
          state.pendingAcct=key;
          return null;
        });
      })
      .then(function(rec){
        if(btn){ btn.disabled=false; btn.textContent='使用当前账号登录'; }
        setSync('synced');
        if(rec){ showPick(false); pickUser(rec.u); return; }
        showLoginErr('这个账号还没有绑定成员，请选择或新建一个身份：');
        showPick(true);
      })
      .catch(function(e){
        console.error('[login]', e);
        setSync('error');
        if(btn){ btn.disabled=false; btn.textContent='使用当前账号登录'; }
        var m=(e&&e.message)||'';
        showLoginErr(/登录|login|未登录|unauthorized/i.test(m)
          ? '登录状态已过期，请重新登录。'
          : ('登录失败：'+m));
      });
  }
  function showPick(withAcct){
    var l=$('gateLogin'), p=$('gatePick');
    if(l) l.style.display = withAcct ? 'none' : '';
    if(p) p.style.display = withAcct ? '' : 'none';
    var w=$('gateWho');
    if(w) w.textContent = '这次登录的账号还没有绑定身份。选择你的名字，之后登录状态有效时会直接进入你的账。';
    var a=$('uaddBtn'); if(a) a.style.display = withAcct?'':'none';
    renderUserList();
  }
  function renderUserList(){
    var box=$('ulist'); if(!box) return;
    box.innerHTML='';
    if(!state.users.length){
      box.appendChild(el('div','','<div class="hint" style="padding:8px 2px;">还没有成员，先在下面创建一个。</div>'));
      return;
    }
    state.users.forEach(function(us){
      var nm=us['姓名']||us.u;
      var bound=String(us['平台账号']||'').trim();
      var row=el('button','urow'+(bound?'':''));
      row.type='button';
      var av=el('span','av',initialOf(nm));
      var meta=el('span','nm');
      meta.innerHTML='<b></b><span></span>';
      meta.querySelector('b').textContent=nm;
      var sub=us['说明']||('账号 '+us.u);
      if(bound) sub='已绑定平台账号 · '+sub;
      else if(state.pendingAcct) sub='未绑定 · 点击绑定到当前登录账号';
      meta.querySelector('span').textContent = sub + (us.u===state.u?' · 当前':'');
      row.appendChild(av); row.appendChild(meta);
      row.onclick=function(){ onPickFromGate(us); };
      box.appendChild(row);
    });
  }
  // 遮罩层里选成员：若本次登录有平台身份且该成员未绑定，则先绑定再进入
  function onPickFromGate(us){
    if(!state.pendingAcct){
      pickUser(us.u);
      return;
    }
    if(us['平台账号']){
      showToast('「'+(us['姓名']||us.u)+'」已绑定到另一个平台账号，请用那个账号登录','err');
      return;
    }
    var btn=$('uaddBtn');
    setSync('syncing');
    if(btn) btn.disabled=true;
    db.updateRecord({ databaseId:'7ksfKW1zKsCY7a8xOUNrE8', recordId:us._id,
      properties:{ '平台账号':{text:state.pendingAcct}, '绑定时间':{text:todayStr()} } })
      .then(function(){ return loadUsers(); })
      .then(function(){
        state.pendingAcct=null;
        setSync('synced');
        showPick(false);
        pickUser(us.u);
      })
      .catch(function(e){
        console.error('[bind]', e);
        setSync('error');
        showToast('绑定失败，请重试','err');
      })
      .then(function(){ if(btn) btn.disabled=false; });
  }
  function openGate(){
    // 登录门只是「选身份」的地方，不是必须登录的关卡 —— 匿名也能进（数据按成员 u 隔离）
    var g=$('gate'); if(g) g.hidden=false;
    var w=$('unewWrap'); if(w) w.style.display='none';
    var p=$('gatePick'); if(p) p.style.display='';
    var l=$('gateLogin'); if(l) l.style.display='';
    renderUserList();
    var who=$('gateWho');
    if(who) who.textContent = state.pendingAcct
      ? '这个账号还没有绑定身份。选择你的名字，之后登录状态有效时会直接进入你的账。'
      : '有导出的 Excel 备份？可以先在下面导入，再选择成员进入；也可以直接新建一个成员 —— 每位成员的账目相互独立。';
    var add=$('uaddBtn'); if(add) add.style.display='';
    // 一个成员都没有时，直接展开「新建成员」输入框并聚焦
    if(!state.users.length){
      if(w) w.style.display='';
      var inp=$('unewName');
      if(inp) setTimeout(function(){ try{ inp.focus(); }catch(e){} }, 60);
    }
  }
  function closeGate(){ var g=$('gate'); if(g) g.hidden=true; }
  function pickUser(u){
    switchToUser(u);
    closeGate();
  }
  // 切换/进入某位成员：统一重置所有按成员隔离的缓存，再重新拉数据。
  // 单独抽出来是因为「切换用户」和「导入后自动切到数据所属成员」都要走同一套重置逻辑，
  // 漏掉任何一项（settings / extraFlow / 聚合缓存 / 查询范围）都会出现「切了人但数据还是旧的」。
  function switchToUser(u){
    state.u=u; writeU(u);
    state.settingsId=null; state.settings=null;
    state.flow=[];
    state.extraFlow=[];          // 统计缓存的其它月份明细属于上一位成员，必须清掉
    state.agg=null;              // 月度聚合缓存同理
    state.range={ mode:'month', cm:curMonth(), from:'', to:'' };   // 回到本月，避免继承上一位成员的范围
    renderWhoami();
    loadAllData();
    drainAutoQueue(billPlugin());   // 选好成员后，补记后台攒下的通知
  }
  // 退出当前身份：清空 state.u 与全部按成员隔离的内存缓存，回到登录门重新选成员。
  // 侧栏「切换用户」和驾驶舱数据卡里的「切换用户」共用（两处走不同入口，行为必须一致）。
  // 只清内存身份，不动数据库 —— 已导入的流水仍然留在库里，重新选中该成员即可看到。
  function switchUserOut(){
    state.u=''; writeU('');
    state.flow=[]; state.extraFlow=[]; state.agg=null;
    state.settings=null; state.settingsId=null;
    state.pendingAcct=null;      // 未归属的待记账也一并放下，避免把上一位成员的通知记到新成员名下
    state.range={ mode:'month', cm:curMonth(), from:'', to:'' };
    renderWhoami();
    // 注意：renderSkeleton 定义在 init() 内部，这里取不到 —— 直接调各自的渲染函数把界面清空
    renderDashboard(); renderHourly(); renderLedger(); renderMonthly();
    renderFreedom(); renderFindings(); renderDataStat();
    openGate();
    showToast('已退出当前身份，请选择或新建一位成员');
  }
  /* ---------- 切换用户：确认弹窗 + 清空全部数据 ---------- */
  // 清空本机全部业务数据（流水 / 成员 / 设置 / 月度汇总）。
  // 云端环境逐表翻页删除（每轮都从第 0 页取 —— 删掉一批后剩下的会顶上来）；
  // 本地环境直接清整个 IndexedDB records 表。返回删除条数。
  function wipeAllData(){
    var isLocal = (typeof DB_IS_LOCAL!=='undefined') && DB_IS_LOCAL;
    if(isLocal){
      if(db.clearAll) return db.clearAll().then(function(){ return -1; });  // -1 = 本地整表清，条数未知
      return Promise.resolve(0);
    }
    var ids=[DB_USER, DB_SETTINGS, DB_MONTHLY].concat(FLOW_IDS);
    var del=0, i=0;
    function oneDb(id){
      function round(){
        return db.query({databaseId:id, pageSize:200}).then(function(r){
          var rs=(r&&r.results)||[];
          if(!rs.length) return del;
          var chain=Promise.resolve();
          rs.forEach(function(rec){
            var rid=rec && (rec._id || rec.record_id);
            if(!rid) return;
            chain=chain.then(function(){
              return db.deleteRecord({databaseId:id, recordId:rid})
                .then(function(){ del++; }, function(){ /* 单条失败不阻断整体清空 */ });
            });
          });
          return chain.then(round);
        });
      }
      return round().catch(function(){ /* 某张表查不到就跳过 */ });
    }
    function run(){
      if(i>=ids.length) return Promise.resolve(del);
      return oneDb(ids[i++]).then(run);
    }
    return run();
  }
  // 确认弹窗：样式复用 .sheet 底部弹层（与自动记账详情同款）。
  // 「确定」才真正清数据并回登录门；「取消 / 点遮罩」只是关掉弹层，什么都不动。
  var swSheetEl=null;
  function openSwitchConfirm(){
    if(swSheetEl){ swSheetEl.hidden=false; return; }
    var mask=el('div','sheet'); mask.hidden=true;
    var box=el('div','sheet-box');
    box.innerHTML=
      '<h3 style="display:block">切换用户</h3>'+
      '<div style="font-size:13.5px; line-height:1.75; color:var(--ink-soft)">'+
      '确定要切换用户吗？<b style="color:#B53A2E">确定后将清空本机的全部数据</b>'+
      '（流水、成员、设置都会删除，且<b>不可恢复</b>），然后回到登录页重新导入。'+
      '如需保留，请先在「导出全部（Excel）」里做好备份。</div>';
    var acts=el('div','sheet-acts');
    var c=el('button','btn ghost'); c.textContent='取消';
    c.onclick=function(){ mask.hidden=true; };
    var ok=el('button','btn'); ok.textContent='确定切换并清空数据';
    ok.style.background='#B53A2E';
    ok.onclick=function(){
      mask.hidden=true;
      ok.disabled=true; c.disabled=true;
      showToast('正在清空数据…');
      wipeAllData().then(function(n){
        switchUserOut();
        var tail = (n>=0) ? '（共 '+n+' 条）' : '';
        showToast('已清空全部数据'+tail+'，请重新导入');
      }).catch(function(e){
        console.error('[wipeAllData]', e);
        switchUserOut();
        showToast('清空数据时出错：'+((e&&e.message)||'未知')+'，已退出登录','err');
      }).then(function(){
        ok.disabled=false; c.disabled=false;
      });
    };
    acts.appendChild(c); acts.appendChild(ok);
    box.appendChild(acts);
    mask.appendChild(box);
    mask.onclick=function(e){ if(e.target===mask) mask.hidden=true; };
    document.body.appendChild(mask);
    swSheetEl=mask;
    swSheetEl.hidden=false;
  }
  // 姓名归一化后查重：去首尾空白、压缩中间空白、英文转小写、全角转半角
  function normName(s){
    return String(s==null?'':s)
      .replace(/　/g,' ')
      .trim()
      .replace(/\s+/g,' ')
      .toLowerCase();
  }
  function findUserByName(name){
    var want=normName(name);
    if(!want) return null;
    for(var i=0;i<state.users.length;i++){
      if(normName(state.users[i]['姓名'])===want) return state.users[i];
    }
    return null;
  }
  // 随机 u 账号：加时间戳，避免同毫秒碰撞
  function genU(){
    return 'u' + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2,7);
  }
  function createUser(name){
    var nm=String(name==null?'':name).replace(/　/g,' ').replace(/\s+/g,' ').trim();
    var input=$('unewName');
    // 1) 非空 + 长度校验
    if(!nm){ if(input) input.focus(); showToast('请先输入名字','err'); return; }
    if(nm.length>12){ if(input) input.focus(); showToast('名字最多 12 个字','err'); return; }
    if(!db){ showToast('当前环境无法写入线上，请稍后再试','err'); return; }

    // 2) 查重：已有同名成员就不新建，直接切换过去
    var dup=findUserByName(nm);
    if(dup){
      if(input) input.value='';
      showToast('「'+nm+'」已经存在，已直接切换进去');
      pickUser(dup.u);
      return;
    }

    // 3) 防并发重复提交
    if(state.creating){ showToast('正在创建，请稍候','err'); return; }
    // 3.5) 成员表没加载成功时，禁止创建（否则查重形同虚设，会再造重复成员）
    if(!state.usersLoaded){ showToast('成员列表还没加载好，请稍后重试','err'); return; }
    state.creating=true;
    var btn=$('unewOk');
    if(btn){ btn.disabled=true; btn.textContent='创建中…'; }
    setSync('syncing');

    var u=genU();
    db.addRecord({databaseId:'7ksfKW1zKsCY7a8xOUNrE8', properties:withUser({ u:{text:u}, '姓名':{text:nm}, '说明':{text:''} })})
      .then(function(res){
        // 4) 二次校验：写完立刻拉一次，确认线上确实只有一条同名记录
        return loadUsers().then(function(){
          var again=findUserByName(nm);
          if(!again){
            throw new Error('创建后未能在成员表中找到「'+nm+'」');
          }
          if(input) input.value='';
          setSync('synced');
          // 若本次已登录平台账号，顺手绑定，下次免选
          if(state.pendingAcct){
            return db.updateRecord({ databaseId:'7ksfKW1zKsCY7a8xOUNrE8', recordId:again._id,
                    properties:{ '平台账号':{text:state.pendingAcct}, '绑定时间':{text:todayStr()} } })
              .then(function(){ state.pendingAcct=null; showPick(false); return loadUsers(); })
              .then(function(){ pickUser(again.u || u); });
          }
          pickUser(again.u || u);
        });
      })
      .catch(function(e){
        console.error('[createUser]', e);
        setSync('error');
        var msg = (e && e.message) ? String(e.message) : '';
        if(/network|fetch|timeout|网络/i.test(msg)){
          showToast('网络不稳定，创建失败，请重试','err');
        } else if(/权限|未挂载|permission/i.test(msg)){
          showToast('当前环境无写入权限，创建失败','err');
        } else {
          showToast('创建失败：'+(msg||'未知错误'),'err');
        }
      })
      .then(function(){
        state.creating=false;
        if(btn){ btn.disabled=false; btn.textContent='创建并进入'; }
      });
  }
  function onSettingChange(field, value){
    if(!state.settings) state.settings = Object.assign({}, DEFAULT_SETTINGS);
    state.settings[field]=value;
    markDirty();
    setSync('syncing');
    // 本地即时反馈：重算派生读数，但不回写输入框（避免光标跳动）
    renderHourlyLive();   // 时薪页结果 —— 之前漏调，导致改参数时右侧数字不动
    updateFreedomLive();  // 自由基金派生展示
    updateMonthlyAuto();
    if(saveTimer) clearTimeout(saveTimer);
    saveTimer=setTimeout(doSaveSettings, 600);
  }
  /* ---------- 参数保存状态 ---------- */
  var settingsDirty = false;
  function markDirty(){
    settingsDirty = true;
    setSaveState('有改动未保存，点击「保存并重算」写入线上。', 'dirty');
  }
  function setSaveState(txt, cls){
    ['h-savestate','f-savestate'].forEach(function(id){
      var e=$(id); if(!e) return;
      e.textContent = txt;
      e.className = 'savestate '+(cls||'');
    });
  }
  function setSaveBtnBusy(busy){
    ['h-save','f-save'].forEach(function(id){
      var b=$(id); if(!b) return;
      b.disabled = !!busy;
      b.textContent = busy ? '保存中…' : '保存并重算';
    });
  }
  // 只重算时薪结果，不回写 s-* 输入框（输入中回写会跳光标）
  function renderHourlyLive(){
    var s=state.settings||DEFAULT_SETTINGS;
    var h=computeHourly(s);
    var nEl=$('h-nominal'), rEl=$('h-real'), gEl=$('h-gap');
    if(nEl) nEl.textContent='¥'+h.nominal.toFixed(2)+'/时';
    if(rEl) rEl.textContent='¥'+h.real.toFixed(2)+'/时';
    if(gEl) gEl.textContent='真实少了 '+(h.gap*100).toFixed(1)+'%';
    var steps=$('h-steps'); if(!steps) return;
    steps.innerHTML='';
    function step(a,b){ var d=el('div','step'); d.innerHTML='<span>'+a+'</span><b>'+b+'</b>'; steps.appendChild(d); }
    step('名义时薪', num(s['到手月薪']).toLocaleString('en-US')+' ÷ 21.75 ÷ 8 = ¥'+h.nominal.toFixed(2));
    step('年到手收入', num(s['到手月薪']).toLocaleString('en-US')+' × '+num(s['发薪月数'])+' = ¥'+Math.round(h.yearIncome).toLocaleString('en-US'));
    step('年工作成本', num(s['工作成本']).toLocaleString('en-US')+' × 12 = ¥'+Math.round(h.yearCost).toLocaleString('en-US'));
    step('月在场时间', num(s['在场时间'])+' × 21.75 = '+h.monthOnsite.toFixed(2)+' 小时');
    step('月通勤时间', num(s['通勤'])+' × 2 × 21.75 ÷ 60 = '+h.monthCommute.toFixed(2)+' 小时');
    step('月加班时间', num(s['加班'])+' × 52 ÷ 12 = '+h.monthOT.toFixed(2)+' 小时');
    step('年总投入时间', '(三项月时间之和) × 12 = '+h.yearTime.toFixed(1)+' 小时');
    step('真实时薪', '(¥'+Math.round(h.yearIncome).toLocaleString('en-US')+' − ¥'+Math.round(h.yearCost).toLocaleString('en-US')+') ÷ '+h.yearTime.toFixed(1)+' = ¥'+h.real.toFixed(2));
  }
  // 显式保存入口（按钮）：先把输入框的值吸进 state，再落库
  function saveSettingsNow(){
    ['s-monthly','s-paymonths','s-cost','s-onsite','s-commute','s-ot',
     'f-goal','f-target','f-saved','f-cost','f-start','f-decl'].forEach(function(id){
      var e=$(id); if(!e) return;
      var m=SET_FIELD_OF[id];
      if(m && state.settings) state.settings[m]=e.value;
    });
    if(saveTimer){ clearTimeout(saveTimer); saveTimer=null; }
    setSaveState('正在保存…', 'busy');
    setSaveBtnBusy(true);
    doSaveSettings();
  }
  // 只更新自由基金的派生展示（环形/KPI/节奏/安全垫），不动输入框取值
  function updateFreedomLive(){
    var f=computeFreedom(state.settings);
    var ring=$('f-ring');
    if(ring){
      var C=326.7, pct=Math.max(0, Math.min(1, f.prog));
      ring.style.strokeDasharray=C.toFixed(1);
      ring.style.strokeDashoffset=(C*(1-pct)).toFixed(1);
    }
    $('f-prog').textContent=(f.prog*100).toFixed(1)+'%';
    $('f-remain').textContent='还差 '+fmt(f.remain);
    $('f-saved-v').textContent=fmt(f.saved);
    $('f-goal-v').textContent=fmt(f.goal);
    $('f-avg').textContent=fmt(f.avg);
    $('f-left').textContent= f.monthsLeft!=null ? f.monthsLeft+' 个月' : '—';
    var eta=parseMonth((state.settings||DEFAULT_SETTINGS)['目标月份']);
    $('f-eta').textContent = eta ? (eta.y+'年'+pad2(eta.m)+'月') : '—';
    $('f-req').textContent = f.monthsTotal>0 ? fmt(f.reqMonthly) : '—';
    $('f-reqnote').textContent = f.monthsTotal>0
      ? ('按当前期限（'+f.monthsTotal+' 个月）算，每月需要存 '+fmt(f.reqMonthly)+'：还差 '+fmt(f.remain)+' ÷ '+f.monthsTotal+' 个月。')
      : '填写「估算起始月」和「目标月份」后，这里会算出每月需要存多少。';
    $('f-buffer').textContent=f.buffer.toFixed(2);
    var cs=$('f-cushion'); cs.innerHTML='';
    [3,6,12].forEach(function(mo){
      cs.appendChild(el('div','c'+(f.buffer>=mo?' lit':''), (f.buffer>=mo?mo+' 个月 ✓':mo+' 个月')));
    });
    $('f-cushiontxt').textContent='已经守住 '+f.buffer.toFixed(2)+' 个月基本生活，做选择时更有底气。';
    renderCurve(state.settings, f);
  }
  function doSaveSettings(){
    if(!db){ setSync('offline'); setSaveBtnBusy(false); setSaveState('离线环境，无法写入线上。', 'dirty'); return Promise.resolve(false); }
    if(!state.settings) state.settings = Object.assign({}, DEFAULT_SETTINGS);
    //只提交 DEFAULT_SETTINGS 里定义过的字段。state.settings 是整条记录，
    // 带 _id 等系统键；原实现用 for-in 全量遍历，会把 _id 当字段写回去导致被后端拒。
    var clean = {};
    for(var k in DEFAULT_SETTINGS){
      if(!DEFAULT_SETTINGS.hasOwnProperty(k)) continue;
      clean[k] = state.settings[k];
    }
    var props=toProps(clean);
    var p;
    if(state.settingsId){
      p=db.updateRecord({databaseId:'WsoAhfTSqHzHkZOIblFmZI', recordId:state.settingsId, properties:withU(props)});
    } else {
      p=db.addRecord({databaseId:'WsoAhfTSqHzHkZOIblFmZI', properties:withU(props)}).then(function(res){
        if(res && res.id) state.settingsId=res.id;
        else return loadSettings();
      });
    }
    return p.then(function(){
           settingsDirty=false;
           setSync('synced'); setSaveBtnBusy(false);
           setSaveState('已保存到线上 · ' + new Date().toLocaleTimeString('zh-CN',{hour12:false}), 'saved');
           refreshAll();
           return true;
         })
     .catch(function(e){
           console.error('[saveSettings]', e);
           setSync('error'); setSaveBtnBusy(false);
           setSaveState('保存失败：' + ((e&&e.message)||'未知错误'), 'dirty');
           showToast('设置保存失败，请重试','err');
           return false;
         });
  }

  /* ---------- 计算 ---------- */
  function computeHourly(s){
    s = s || DEFAULT_SETTINGS;
    var m=num(s['到手月薪']), pay=num(s['发薪月数']), cost=num(s['工作成本']),
        onsite=num(s['在场时间']), commute=num(s['通勤']), ot=num(s['加班']);
    var nominal = (m>0)? m/(21.75*8) : 0;
    var yearIncome = m*pay;
    var yearCost = cost*12;
    var monthOnsite = onsite*21.75;
    var monthCommute = commute*2*21.75/60;
    var monthOT = ot*52/12;
    var yearTime = (monthOnsite+monthCommute+monthOT)*12;
    var real = (yearTime>0)? (yearIncome-yearCost)/yearTime : 0;
    var gap = (nominal>0)? (nominal-real)/nominal : 0;
    return {nominal:nominal, real:real, yearIncome:yearIncome, yearCost:yearCost,
            monthOnsite:monthOnsite, monthCommute:monthCommute, monthOT:monthOT,
            yearTime:yearTime, gap:gap};
  }
  function moneyToTime(amount, real){
    if(real<=0) return '0 小时 0 分钟';
    var h = amount/real; var hh=Math.floor(h); var mm=Math.round((h-hh)*60);
    if(mm===60){ hh++; mm=0; }
    return hh+' 小时' + (mm>0? ' '+mm+' 分钟':'');
  }
  // 注意：以下两个函数是驾驶舱「今日支出/本月支出」的来源，**必须排除收入**
  function monthTotal(){
    var cm=curMonth(), sum=0;
    allKnown().forEach(function(r){ if(isIncome(r)) return; var d=String(r['日期']||'').slice(0,10); if(d.slice(0,7)===cm) sum+=num(r['金额']); });
    return sum;
  }
  function todayTotal(){
    var t=todayStr(), sum=0;
    allKnown().forEach(function(r){ if(isIncome(r)) return; if(String(r['日期']||'').slice(0,10)===t) sum+=num(r['金额']); });
    return sum;
  }
  function monthIncome(){
    var cm=curMonth(), sum=0;
    allKnown().forEach(function(r){ if(!isIncome(r)) return; var d=String(r['日期']||'').slice(0,10); if(d.slice(0,7)===cm) sum+=num(r['金额']); });
    return sum;
  }
  function todayIncome(){
    var t=todayStr(), sum=0;
    allKnown().forEach(function(r){ if(!isIncome(r)) return; if(String(r['日期']||'').slice(0,10)===t) sum+=num(r['金额']); });
    return sum;
  }

  /* ---------- 今日消费额度（超额提醒） ---------- */
  // 存两个设置字段：
  //   · 当日消费额度    —— number，今天不许超过的额度；0 表示未设置（不启用提醒）
  //   · 超额提醒静音日期 —— text，用户点「今日不再提醒」时写入今天的日期；
  //                        渲染与弹窗时都拿它和「今天」比对，不等就视为未静音 ——
  //                        这样「每日刷新」不需要任何定时任务，靠日期字符串天然过期。
  function settingsObj(){ return state.settings || DEFAULT_SETTINGS; }
  function budgetLimit(){ return num(settingsObj()['当日消费额度']); }
  function budgetMuteDate(){ return String(settingsObj()['超额提醒静音日期'] || '').slice(0,10); }
  // 今天是否已被用户静音（点了「今日不再提醒」）
  function budgetMutedToday(){ return budgetMuteDate() === todayStr(); }
  function budgetOver(){ var l=budgetLimit(); return l>0 && todayTotal() > l; }

  // 弹窗提醒：每笔超额消费都弹（除非用户今天已点「不再提醒」）。
  // 用独立的遮罩层而不是复用 .sheet —— 弹出的时机是「刚记完一笔」，不能打断记账表单的状态。
  var budgetPopEl = null;
  function openBudgetPopup(){
    if(budgetMutedToday()) return;
    if(budgetPopEl){ budgetPopEl.hidden = false; return; }
    var mask = el('div','sheet'); mask.hidden = true;
    var box = el('div','sheet-box');
    var lim = budgetLimit(), spent = todayTotal(), over = spent - lim;
    box.innerHTML =
      '<h3 style="display:block">⚠️ 今日消费已超额</h3>' +
      '<div style="font-size:13.5px; line-height:1.8; color:var(--ink-soft)">' +
        '今天已花 <b style="color:#D6453C; font-size:16px">' + fmt(spent) + '</b>，' +
        '超出当日额度 <b style="color:#D6453C">' + fmt(over) + '</b>' +
        '（额度 ' + fmt(lim) + '）。' +
        '<br>要不要停下来想想，这笔是「需要」还是「想要」？' +
      '</div>';
    var acts = el('div','sheet-acts');
    var mute = el('button','btn ghost'); mute.textContent = '今日不再提醒';
    mute.onclick = function(){
      mask.hidden = true;
      // 写入今天的日期 → 今天的后续超额都不再弹；明天日期不匹配，自动恢复
      state.settings = state.settings || Object.assign({}, DEFAULT_SETTINGS);
      state.settings['超额提醒静音日期'] = todayStr();
      doSaveSettings();
      showToast('今天不再提示超额，明天会自动恢复');
      renderBudget();
    };
    var ok = el('button','btn'); ok.textContent = '我知道了';
    ok.style.background = '#D6453C';
    ok.onclick = function(){ mask.hidden = true; };
    acts.appendChild(mute); acts.appendChild(ok);
    box.appendChild(acts);
    mask.appendChild(box);
    mask.onclick = function(e){ if(e.target === mask) mask.hidden = true; };
    document.body.appendChild(mask);
    budgetPopEl = mask;
    budgetPopEl.hidden = false;
  }
  // 记账成功后调用：只在「超额」并且「今天没被静音」时弹
  function maybeWarnBudget(){
    if(budgetLimit() <= 0) return;         // 没设额度 → 不打扰
    if(!budgetOver()) return;
    if(budgetMutedToday()) return;
    openBudgetPopup();
  }

  // 渲染额度卡：数值颜色、进度条、状态标签、输入框回填、静音提示
  function renderBudget(){
    var card = $('d-budget-card'); if(!card) return;
    var lim = budgetLimit(), spent = todayTotal();
    var over = lim > 0 && spent > lim;
    var set = lim > 0;
    var numEl = $('dBudgetNum'), barEl = $('dBudgetBar'), stEl = $('dBudgetStatus'), sideEl = $('dBudgetSide');

    if(numEl){
      numEl.className = 'budget-num ' + (over ? 'over' : 'ok');
      numEl.innerHTML = (money2(spent)) + '<span class="unit">元</span>';
    }
    if(sideEl){
      sideEl.innerHTML = set
        ? ('额度 ' + money2(lim) + ' 元<br>剩余 ' +
           (over ? '<b style="color:#D6453C">已超 ' + money2(spent-lim) + '</b>' : money2(lim-spent)))
        : '未设额度<br><span style="opacity:.8">设一条线，超了会提醒你</span>';
    }
    if(barEl){
      // 进度按额度算；超额时封顶 100% 并整条变红
      var pct = set ? Math.min(100, (spent / lim) * 100) : 0;
      barEl.className = over ? 'over' : 'ok';
      barEl.style.width = pct.toFixed(1) + '%';
    }
    if(stEl){
      stEl.className = 'budget-status ' + (over ? 'over' : 'ok');
      stEl.textContent = !set ? '未设置额度'
        : (over ? '已超额 ' + money2(spent - lim) + ' 元' : '额度内，还剩 ' + money2(lim - spent) + ' 元');
    }
    // 输入框只在没聚焦时回填，避免打字跳到中间
    var inp = $('dBudgetInput');
    if(inp && document.activeElement !== inp){
      inp.value = set ? String(round2(lim)) : '';
    }
    var muteEl = $('dBudgetMute');
    if(muteEl){
      if(budgetMutedToday()){ muteEl.hidden = false; muteEl.textContent = '🔕 今天已关闭超额提醒（明天自动恢复）'; }
      else muteEl.hidden = true;
    }
  }
  // 金额：整数不带小数、有小数才显示两位（额度卡里更清爽）
  function money2(v){
    var n = round2(num(v));
    return (n % 1 === 0) ? String(n) : n.toFixed(2);
  }
  // 保存当日额度。空 / 0 / 负数都视为「关闭额度提醒」。
  function saveBudgetLimit(){
    var inp = $('dBudgetInput'); if(!inp) return;
    var raw = String(inp.value == null ? '' : inp.value).trim();
    var v = raw === '' ? 0 : num(raw);
    if(v < 0) v = 0;
    if(v > 0 && v < 1){ showToast('额度至少 1 元，输入 0 可关闭提醒','err'); return; }
    state.settings = state.settings || Object.assign({}, DEFAULT_SETTINGS);
    state.settings['当日消费额度'] = round2(v);
    // 改了额度（尤其是调高到已消费之上）→ 顺便清掉今天的静音，让提醒重新生效
    if(v > 0) state.settings['超额提醒静音日期'] = '';
    setSaveState('正在保存…', 'busy');
    setSaveBtnBusy(true);
    doSaveSettings().then(function(ok){
      if(ok === false) return;
      renderBudget();
      showToast(v > 0 ? ('当日额度已设为 ' + fmt(v) + '，超出会提醒你') : '已关闭当日额度提醒');
    });
  }
  function avgSavings(){
    var arr = monthBuckets();
    var cm = curMonth(), tot=0, n=0;
    arr.forEach(function(it){ if(it.cm===cm) return; tot += it.net; n++; });
    return n>0 ? tot/n : 0;
  }
  function parseMonth(str){
    var m=String(str||'').match(/(\d{4})[-/年](\d{1,2})/);
    if(!m) return null; return {y:+m[1], m:+m[2]};
  }
  function monthsBetween(a,b){ var pa=parseMonth(a), pb=parseMonth(b); if(!pa||!pb) return 0; return (pb.y-pa.y)*12 + (pb.m-pa.m); }
  function monthList(a,b){
    var pa=parseMonth(a), pb=parseMonth(b), res=[];
    if(!pa||!pb) return res;
    var y=pa.y, m=pa.m;
    while((y<pb.y)||(y===pb.y&&m<=pb.m)){ res.push(y+'-'+pad2(m)); if(m===12){y++;m=1;} else m++; }
    return res;
  }
  function computeFreedom(s){
    s=s||DEFAULT_SETTINGS;
    var goal=num(s['自由目标']), saved=num(s['已攒金额']), cost=num(s['每月开销']);
    var prog = goal>0 ? saved/goal : 0;
    var remain = Math.max(0, goal-saved);
    var avg = avgSavings();
    var monthsLeft = avg>0 ? Math.ceil(remain/avg) : null;
    var buffer = cost>0 ? saved/cost : 0;
    var monthsTotal = monthsBetween(s['起始月'], s['目标月份']);
    var reqMonthly = monthsTotal>0 ? remain/monthsTotal : 0;
    return {goal:goal, saved:saved, remain:remain, prog:prog, monthsLeft:monthsLeft,
            buffer:buffer, monthsTotal:monthsTotal, reqMonthly:reqMonthly, avg:avg};
  }

  /* ---------- 渲染（单向：各自读 state，互不调用） ---------- */
  // 服务端月度聚合里取本月；取不到（离线/聚合失败）回退客户端聚合
  function aggMonth(cm){
    if(state.agg && state.agg.months){
      var f=null;
      state.agg.months.forEach(function(it){ if(it.cm===cm) f=it; });
      if(f) return f;
    }
    return null;
  }
  function thisMonthExp(){
    var a=aggMonth(curMonth());
    return a ? a.exp : monthTotal();
  }
  function thisMonthInc(){
    var a=aggMonth(curMonth());
    return a ? a.inc : monthIncome();
  }
  function renderDashboard(){
    var h=computeHourly(state.settings), f=computeFreedom(state.settings);
    bindText($('d-real'), '¥'+h.real.toFixed(2)+'/时', DB_SETTINGS);
    $('d-gap').textContent='比名义少 '+(h.gap*100).toFixed(1)+'%';
    var mTotal=thisMonthExp(), mInc=thisMonthInc();
    bindText($('d-today'), (todayTotal()>0?'-':'')+fmt(todayTotal()), flowDbOf(curMonth()));
    bindText($('d-month'), (mTotal>0?'-':'')+fmt(mTotal), flowDbOf(curMonth()));
    // 本月收入 / 结余 / 月均结余（收入为 0 时不展示 0，避免"看起来像有收入"）
    var mi=mInc, me=mTotal;
    bindText($('d-income'), (mi>0?'+':'')+fmt(mi), flowDbOf(curMonth()));
    $('d-income').classList.toggle('inc-amt', mi>0);
    var net=mi-me;
    var ne=$('d-net');
    if(ne){
      ne.textContent=(mi>0||me>0) ? ((net>=0?'+':'−')+fmt(Math.abs(net))) : '—';
      ne.className='v '+(net>=0?'pos':'neg');
    }
    var avgN=avgSavings();
    var av=$('d-avg'); av.textContent=(avgN>0?'+':'')+fmt(avgN);
    av.className='v '+(avgN>=0?'pos':'neg');
    var pct=Math.min(100, f.prog*100);
    $('d-fundbar').style.width=pct.toFixed(1)+'%';
    $('d-fundtxt').textContent='已攒 '+fmt(f.saved)+'，还差 '+fmt(f.remain);
    $('d-decl').textContent=(state.settings && state.settings['自由宣言'])? state.settings['自由宣言'] : DEFAULT_SETTINGS['自由宣言'];
    // 最近4笔（当前查询范围内）
    var box=$('d-recent'); box.innerHTML='';
    var recs=state.flow.slice(0,5);
    if(!recs.length){ box.innerHTML='<div class="empty">当前范围内还没有记录。</div>'; }
    recs.forEach(function(r){ box.appendChild(recordRow(r, false)); });
    renderBudget();     // 今日消费额度卡：数值/颜色/进度随数据一起刷新
    fitNumbers();
  }
  function recordRow(r, withActions){
    var inc=isIncome(r);
    var row=el('div','record'+(inc?' rec-inc':''));
    var cat=catOf(r);
    var ic=el('div','ic');
    ic.innerHTML = inc
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="#5BBF8A" stroke-width="2"><path d="M12 19V5"/><path d="M6 11l6-6 6 6"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="#4A93D4" stroke-width="2"><path d="M4 5h13l3 3v11H4z"/><path d="M8 10h8"/></svg>';
    var body=el('div','body');
    body.appendChild(el('div','t', String(r['备注']||cat)));
    // 明细行显示到秒：同一分钟连记两笔时能看出先后，也方便和「自动记账」的通知原文对齐
    var d=stampShort(recStamp(r), true);
    body.appendChild(el('div','m', (inc?'收入 · ':'')+cat+' · '+d));
    var amt=el('div','amt'+(inc?' inc-amt':''), (inc?'+':'-')+fmt(r['金额']));
    row.appendChild(ic); row.appendChild(body); row.appendChild(amt);
    if(withActions){
      var acts=el('div','acts');
      var eBtn=el('button','btn ghost sm','编辑'); eBtn.onclick=function(){ editFlow(r); };
      var dBtn=el('button','btn ghost sm','删除'); dBtn.onclick=function(){ delFlow(r); };
      acts.appendChild(eBtn); acts.appendChild(dBtn); row.appendChild(acts);
    }
    return row;
  }
  function renderHourly(){
    var s=state.settings||DEFAULT_SETTINGS;
    setVal('s-monthly', s['到手月薪']); setVal('s-paymonths', s['发薪月数']); setVal('s-cost', s['工作成本']);
    setVal('s-onsite', s['在场时间']); setVal('s-commute', s['通勤']); setVal('s-ot', s['加班']);
    renderHourlyLive();   // 结果计算只有这一份实现，避免两处代码走偏
  }
  function renderLedger(){
    // 「本月支出 / 本月结余」始终是本月口径，与当前查询范围无关：
    // 若用户在看历史月份，state.flow 里没有本月数据，改用服务端聚合值兜底
    var cm=curMonth(), mAgg=null;
    if(state.agg && state.agg.months){
      state.agg.months.forEach(function(it){ if(it.cm===cm) mAgg=it; });
    }
    var mTotal = mAgg ? mAgg.exp : monthTotal();
    bindText($('l-month'), (mTotal>0?'-':'')+fmt(mTotal), flowDbOf(curMonth()));
    // 本月结余 = 本月收入 - 本月支出
    var mInc = mAgg ? mAgg.inc : monthIncome();
    var mNet = mInc - mTotal;
    var netEl = $('l-net');
    if(netEl){
      netEl.textContent = (mNet>=0?'+':'-')+fmt(Math.abs(mNet));
      netEl.className = 'v '+(mNet>=0?'pos':'neg');
    }
    var h=computeHourly(state.settings);
    var eqEl=$('l-equivhint');
    if(eqEl) eqEl.textContent = '本月等价工时：'+moneyToTime(mTotal, h.real);
    var list=$('l-list'); if(!list) return;
    list.innerHTML='';
    if(!state.flow.length){ list.innerHTML='<div class="empty">这个范围内还没有记录。换个月份，或在左侧记一笔。</div>'; }
    // 收入与支出混排时，靠 recordRow 的「收入」标记与暖色区分
    // 数据完整=已确认截断(仅前端分页展示，已在下方提示总条数并引导缩小范围；统计与导出均用全量 state.flow)
    state.flow.slice(0,200).forEach(function(r){ list.appendChild(recordRow(r, true)); });
    if(state.flow.length>200){
      var more=el('div','hint','仅显示最近 200 条（当前范围共 '+state.flow.length+' 条）。缩小日期范围可看到更早的记录。');
      list.appendChild(more);
    }
    syncRangeInputs();
  }
  function renderMonthly(){
    var list=$('m-list'); list.innerHTML='';
    var arr = monthBuckets();
    if(!arr.length){ list.innerHTML='<div class="empty">还没有收支记录，先去记一笔吧。</div>'; }
    arr.slice().reverse().forEach(function(it){
      var row=el('div','record');
      var ic=el('div','ic'); ic.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#4A93D4" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>';
      var body=el('div','body');
      body.appendChild(el('div','t', it.cm));
      body.appendChild(el('div','m','收入 '+fmt(it.inc)+' · 支出 '+fmt(it.exp)));
      var amt=el('div','amt'+(it.net>=0?' pos':''), fmt(it.net)); amt.setAttribute('data-sp-bindable','database'); amt.setAttribute('data-sp-database-id', DB_FLOW);
      row.appendChild(ic); row.appendChild(body); row.appendChild(amt);
      list.appendChild(row);
    });
    bindText($('m-avg'), fmt(avgSavings()), DB_FLOW);
    updateMonthlyAuto();
    renderMonthNet();
  }
  function updateMonthlyAuto(){
    var cur = curMonth(), m = null;
    monthBuckets().forEach(function(it){ if(it.cm===cur) m=it; });
    var inc = m ? m.inc : 0, exp = m ? m.exp : 0, bal = inc - exp;
    var incEl=$('m-auto-inc'), expEl=$('m-auto-exp');
    if(incEl){ incEl.textContent=(inc>0?'+':'')+fmt(inc); incEl.className='v pos'; }
    if(expEl){ expEl.textContent=(exp>0?'-':'')+fmt(exp); expEl.className='v neg'; }
    var me=$('m-auto');
    me.textContent=fmt(bal);
    me.className='v '+(bal>=0?'pos':'neg');
    $('m-formula').textContent=fmt(inc)+' − '+fmt(exp)+' = '+fmt(bal);
  }
  function renderFreedom(){
    var s=state.settings||DEFAULT_SETTINGS;
    setVal('f-goal', s['自由目标']); setVal('f-target', s['目标月份']); setVal('f-saved', s['已攒金额']);
    setVal('f-cost', s['每月开销']); setVal('f-start', s['起始月']); setVal('f-decl', s['自由宣言']);
    // 折叠头部的实时摘要：目标金额 + 期限，一眼看懂这张卡是干嘛的
    var sum=$('f-foldsum');
    if(sum){
      var g=num(s['自由目标']), tm=String(s['目标月份']||'');
      sum.textContent = (g>0 ? '当前目标 '+fmt(g) : '还未设定目标') + (tm ? ' · 目标 '+tm : '') + '（点开修改）';
    }
    updateFreedomLive();
  }
  function renderCurve(s, f){
    s = s || DEFAULT_SETTINGS;
    var months=monthList(s['起始月'], s['目标月份']);
    var box=$('f-curve'); box.innerHTML='';
    if(months.length<2){ box.innerHTML='<div class="empty">请填写「估算起始月」和「目标月份」以查看曲线。</div>'; return; }
    var avg=f.avg>0?f.avg:1;
    var cm=curMonth();
    var nowIdx=months.indexOf(cm); if(nowIdx<0) nowIdx=0;
    var base=num(s['已攒金额']) - nowIdx*avg; if(base<0) base=0;
    var pts=months.map(function(m,i){ return {m:m, v:base + i*avg}; });
    var W=640, H=240, padL=46, padR=14, padT=16, padB=28;
    var maxV=Math.max(f.goal, pts[pts.length-1].v, 1);
    var n=pts.length;
    function X(i){ return padL + (n===1?0:(W-padL-padR)*i/(n-1)); }
    function Y(v){ return padT + (H-padT-padB)*(1 - v/maxV); }
    var line='', area='M '+X(0)+' '+Y(pts[0].v);
    pts.forEach(function(p,i){ var x=X(i), y=Y(p.v); line+=(i?' L':'M')+' '+x.toFixed(1)+' '+y.toFixed(1); area+=' L '+x.toFixed(1)+' '+y.toFixed(1); });
    area+=' L '+X(n-1)+' '+(H-padB)+' L '+X(0)+' '+(H-padB)+' Z';
    var ty=Y(f.goal);
    var svg='<svg viewBox="0 0 '+W+' '+H+'" width="100%" preserveAspectRatio="xMidYMid meet" style="display:block">';
    svg+='<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="#FFFFFF"/>';
    // y 轴刻度
    [0,0.5,1].forEach(function(t){ var y=padT+(H-padT-padB)*t; svg+='<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(W-padR)+'" y2="'+y.toFixed(1)+'" stroke="#DCE8F4"/>'; svg+='<text x="'+(padL-6)+'" y="'+(y+4).toFixed(1)+'" text-anchor="end" font-size="10" fill="#7C8A99">'+fmtAxis(maxV*(1-t))+'</text>'; });
    // 目标线
    svg+='<line x1="'+padL+'" y1="'+ty.toFixed(1)+'" x2="'+(W-padR)+'" y2="'+ty.toFixed(1)+'" stroke="#4FB0C6" stroke-width="2" stroke-dasharray="6 4"/>';
    svg+='<text x="'+(W-padR)+'" y="'+(ty-4).toFixed(1)+'" text-anchor="end" font-size="10" fill="#4FB0C6">目标 '+fmtAxis(f.goal)+'</text>';
    // 区域 + 线
    svg+='<path d="'+area+'" fill="#7FB4E0" opacity="0.35"/>';
    svg+='<path d="'+line+'" fill="none" stroke="#4A93D4" stroke-width="3" stroke-linejoin="round"/>';
    // 末点
    svg+='<circle cx="'+X(n-1).toFixed(1)+'" cy="'+Y(pts[n-1].v).toFixed(1)+'" r="4" fill="#4A93D4"/>';
    // x 轴标签（起止）
    svg+='<text x="'+padL+'" y="'+(H-8)+'" font-size="10" fill="#7C8A99">'+months[0]+'</text>';
    svg+='<text x="'+(W-padR)+'" y="'+(H-8)+'" text-anchor="end" font-size="10" fill="#7C8A99">'+months[n-1]+'</text>';
    svg+='</svg>';
    box.innerHTML=svg;
  }
  function fmtH(h){ var hh=Math.floor(h), mm=Math.round((h-hh)*60); if(mm===60){hh++;mm=0;} return hh+' 小时 '+(mm>0?mm+' 分钟':''); }
  function renderFindings(){
    var s=state.settings||DEFAULT_SETTINGS;
    var h=computeHourly(s);
    var white=h.monthCommute+h.monthOT;
    $('fnd-white').textContent=fmtH(white);
    $('fnd-whitetxt').textContent='通勤 '+fmtH(h.monthCommute)+' + 额外加班 '+fmtH(h.monthOT)+'。';
    var mt=monthTotal();
    $('fnd-workday').textContent=(h.real>0? (mt/h.real/8).toFixed(2):'0')+' 个工作日';
    var rank=$('fnd-rank'); rank.innerHTML='';
    var arr=monthBuckets().map(function(it){ return {m:it.cm, bal:it.net}; })
                 .sort(function(a,b){ return b.bal-a.bal; }).slice(0,6);
    if(!arr.length){ rank.innerHTML='<div class="empty">还没有月度记录，无法排行。</div>'; return; }
    arr.forEach(function(it,i){
      var r=el('div','rank');
      r.appendChild(el('div','no'+(i===0?' s':''), String(i+1)));
      r.appendChild(el('div','nm', (i===0?'最佳月 · ':'')+it.m));
      r.appendChild(el('div','vv', fmt(it.bal)));
      rank.appendChild(r);
    });
  }

  /* ---------- 收支类型判定（历史数据无「收支类型」字段 → 兜底为支出） ---------- */
  // 注意：后端对「从未写入过的 select 字段」返回 null/缺失，而不是 '支出'。
  // 若不做兜底，历史 4 条记录会被误判或被统计漏掉。
  function kindOf(r){
    var k = String(r['收支类型']||'').trim();
    return (k===KIND_INCOME) ? KIND_INCOME : KIND_EXPENSE;
  }
  function isIncome(r){ return kindOf(r)===KIND_INCOME; }
  // 收入记录的分类取「收入来源」，支出仍取「分类」
  function catOf(r){
    if(isIncome(r)) return String(r['收入来源']||'') || '其他收入';
    return String(r['分类']||'') || '其他';
  }

  /* ---------- 支出统计（客户端聚合，天然按 u 隔离） ---------- */
  var CAT_COLORS = ['#E74C3C','#E67E22','#F1C40F','#27AE60','#2980B9','#8E44AD','#16A085','#D35400','#E84393','#2C3E50','#7F8C8D'];
  // 按类目「在类目列表中的位置」取色，保证同一类目全局配色稳定且互不相同。
  // 注意：不能用类目名去 CAT_COLORS 里 indexOf（那是颜色数组，必然全落到兜底色）。
  function catColor(cat){
    var list = catList();
    var i = list.indexOf(String(cat||''));
    if(i<0) i = list.length-1;
    return CAT_COLORS[i % CAT_COLORS.length];
  }
  // 稳定类目顺序：优先用线上 select 选项的文本顺序，缺失则用兜底列表
  function catList(){
    var opts = (SCHEMA_OPTIONS['分类'] && SCHEMA_OPTIONS['分类'].length) ? SCHEMA_OPTIONS['分类'] : null;
    var base = opts ? opts.map(function(o){ return o.text; }) : CAT_FALLBACK.slice();
    // 补上历史数据里出现过、但不在选项里的类目，避免漏项
    allKnown().forEach(function(r){
      if(isIncome(r)) return;
      var c = catOf(r);
      if(base.indexOf(c)<0) base.push(c);
    });
    if(!base.length) base = CAT_FALLBACK.slice();
    return base;
  }
  // 汇总一段时间内的支出，按类目聚合；只读 state.flow（已按 state.u 过滤）
  function aggByCat(match){
    var m = {}, total = 0, n = 0;
    allKnown().forEach(function(r){
      var d = String(r['日期']||'').slice(0,10);
      if(!match(d, r)) return;
      if(isIncome(r)) return;   // 支出统计不含收入
      var amt = num(r['金额']);
      var c = catOf(r) || '其他';
      if(!m[c]) m[c] = {cat:c, amt:0, n:0};
      m[c].amt += amt; m[c].n++; total += amt; n++;
    });
    var arr = Object.keys(m).map(function(k){ return m[k]; });
    arr.sort(function(a,b){ return b.amt - a.amt; });
    arr.forEach(function(it){ it.pct = total>0 ? it.amt/total : 0; it.color = catColor(it.cat); });
    return {items:arr, total:total, n:n};
  }
  // 收入按「收入来源」聚合（与支出 aggByCat 结构一致，便于复用渲染函数）
  function incomeAggByCat(match){
    var m = {}, total = 0, n = 0;
    allKnown().forEach(function(r){
      if(!isIncome(r)) return;
      var d = String(r['日期']||'').slice(0,10);
      if(!match(d, r)) return;
      var amt = num(r['金额']);
      var c = catOf(r);
      if(!m[c]) m[c] = {cat:c, amt:0, n:0};
      m[c].amt += amt; m[c].n++; total += amt; n++;
    });
    var arr = Object.keys(m).map(function(k){ return m[k]; });
    arr.sort(function(a,b){ return b.amt - a.amt; });
    // 收入统一用暖金色系，与支出的天蓝色系区分
    var IC = ['#5BBF8A','#2E9E6B','#3F9E7F','#27AE60','#6FCF97','#1E8449','#58D68D','#48C9B0'];
    arr.forEach(function(it,ix){ it.pct = total>0 ? it.amt/total : 0; it.color = IC[ix % IC.length]; });
    return {items:arr, total:total, n:n};
  }
  function monthIncomeAgg(){ var cm=curMonth(); return incomeAggByCat(function(d){ return d.slice(0,7)===cm; }); }
  function todayAgg(){ var t=todayStr(); return aggByCat(function(d){ return d===t; }); }
  function monthAgg(){ var cm=curMonth(); return aggByCat(function(d){ return d.slice(0,7)===cm; }); }
  // 本月类目分布：若 state.flow 不含本月（用户在看历史月份），回退把当月明细取回来再算。
  // 关键：结果只能进state.extraFlow，绝不能 push 进 state.flow
  //（state.flow 语义是「当前查询范围」，混入其他月份会让明细列表串数据）
  function ensureMonthLoaded(cm){
    if(!db) return Promise.resolve(false);
    if(hasMonth(cm)) return Promise.resolve(true);
    var df = rangeDateFilter(cm+'-01', monthEndInclusive(cm));
    return db.query({databaseId: flowDbOf(cm),
      filter:{ and:[ uFilter(), df ] },
      sorts:[{property:'日期',direction:'descending'}], pageSize:200}).then(function(res){
      clampToRange(res.results||[], cm+'-01', monthEndInclusive(cm)).forEach(function(r){ addExtra(r); });
      return true;
    }).catch(function(e){ console.error('[ensureMonthLoaded]', e); return false; });
  }
  function hasMonth(cm){
    return allKnown().some(function(r){ return String(r['日期']||'').slice(0,7)===cm; });
  }
  function addExtra(r){
    if(!state.extraFlow) state.extraFlow=[];
    if(!state.extraFlow.some(function(x){ return x._id===r._id; })) state.extraFlow.push(r);
  }
  // 统计口径的「已知全部记录」= 当前范围 + 为统计单独缓存的月份
  function allKnown(){
    var seen={}, out=[];
    (state.flow||[]).forEach(function(r){ if(r && r._id && !seen[r._id]){ seen[r._id]=1; out.push(r); } });
    (state.extraFlow||[]).forEach(function(r){ if(r && r._id && !seen[r._id]){ seen[r._id]=1; out.push(r); } });
    return out;
  }
  // 类目占比条（横向，金额 + 百分比 + 笔数）
  function catRowsHTML(agg, withCount, sign){
    if(!agg.items.length) return '<div class="empty">这个区间还没有支出记录。</div>';
    var sgn = (sign==='+') ? '+' : '-';
    return agg.items.map(function(it){
      var pctTxt = (it.pct*100).toFixed(1)+'%';
      return '<div class="catrow">'+
        '<span class="catdot" style="background:'+it.color+'"></span>'+
        '<span class="catnm">'+it.cat+'</span>'+
        '<span class="catbar"><i style="width:'+Math.max(2, it.pct*100).toFixed(1)+'%;background:'+it.color+'"></i></span>'+
        '<span class="catval">'+sgn+fmt(it.amt)+'<em>'+pctTxt+(withCount? ' · '+it.n+'笔':'')+'</em></span>'+
      '</div>';
    }).join('');
  }
  // 本月 1 号 → 今天的每日柱状图
  function renderTrend(){
    var box = $('st-trend-box'); if(!box) return;
    var cm = curMonth(), dayN = new Date().getDate();
    var byDay = {};
    allKnown().forEach(function(r){
      if(isIncome(r)) return;   // 趋势图只画支出
      var d = String(r['日期']||'').slice(0,10);
      if(d.slice(0,7)!==cm) return;
      var dd = parseInt(d.slice(8,10), 10);
      if(!(dd>=1 && dd<=dayN)) return;
      byDay[dd] = (byDay[dd]||0) + num(r['金额']);
    });
    var maxV = 0;
    for(var k in byDay){ if(byDay[k]>maxV) maxV=byDay[k]; }
    if(maxV<=0){
      box.innerHTML = '<div class="empty">本月还没有支出记录，先记一笔吧～</div>';
      $('st-trend-l').textContent = cm+'-01'; $('st-trend-r').textContent = cm+'-'+pad2(dayN);
      return;
    }
    var W=640, H=220, padL=48, padR=12, padT=16, padB=34;
    var innerW = W-padL-padR, innerH = H-padT-padB;
    var slot = innerW/dayN, bw = Math.max(3, Math.min(26, slot*0.62));
    function X(dd){ return padL + slot*(dd-0.5); }
    function Y(v){ return padT + innerH*(1 - v/maxV); }
    var svg = '<svg viewBox="0 0 '+W+' '+H+'" width="100%" preserveAspectRatio="xMidYMid meet" style="display:block">';
    svg += '<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="#FFFFFF"/>';
    [0,0.5,1].forEach(function(t){
      var y = padT + innerH*t;
      svg += '<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(W-padR)+'" y2="'+y.toFixed(1)+'" stroke="#DCE8F4"/>';
      svg += '<text x="'+(padL-6)+'" y="'+(y+4).toFixed(1)+'" text-anchor="end" font-size="10" fill="#7C8A99">'+Math.round(maxV*(1-t)).toLocaleString('en-US')+'</text>';
    });
    for(var dd=1; dd<=dayN; dd++){
      var v = byDay[dd]||0, x = X(dd), y = Y(v);
      if(v>0){
        var isToday = (dd===dayN);
        svg += '<rect x="'+(x-bw/2).toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(2,(padT+innerH-y).toFixed(1))+'" rx="4" fill="'+(isToday?'#E5564B':'#E8743B')+'"></rect>';
        svg += '<text x="'+x.toFixed(1)+'" y="'+(y-5).toFixed(1)+'" text-anchor="middle" font-size="9.5" fill="#E5564B">'+Math.round(v).toLocaleString('en-US')+'</text>';
      } else {
        svg += '<rect x="'+(x-bw/2).toFixed(1)+'" y="'+(padT+innerH-2)+'" width="'+bw.toFixed(1)+'" height="2" rx="1" fill="#DCE8F4"></rect>';
      }
      if(dayN<=16 || dd%2===0 || dd===1 || dd===dayN){
        svg += '<text x="'+x.toFixed(1)+'" y="'+(H-12)+'" text-anchor="middle" font-size="10" fill="#7C8A99">'+dd+'</text>';
      }
    }
    svg += '</svg>';
    box.innerHTML = svg;
    $('st-trend-l').textContent = cm+'-01';
    $('st-trend-r').textContent = cm+'-'+pad2(dayN)+'（今天）';
  }
  // 明细表
  function catTableHTML(agg){
    if(!agg.items.length) return '<div class="empty">还没有记录。</div>';
    var real = computeHourly(state.settings).real;
    var rows = agg.items.map(function(it){
      return '<tr><td><span class="catdot" style="background:'+it.color+';display:inline-block;margin-right:6px;vertical-align:middle;"></span>'+it.cat+'</td>'+
        '<td style="text-align:right;">'+it.n+'</td>'+
        '<td style="text-align:right;">-'+fmt(it.amt)+'</td>'+
        '<td style="text-align:right;">'+(it.pct*100).toFixed(1)+'%</td>'+
        '<td style="text-align:right;">'+moneyToTime(it.amt, real)+'</td></tr>';
    }).join('');
    return '<table style="width:100%;border-collapse:collapse;font-size:13px;">'+
      '<thead><tr style="color:var(--ink-soft);font-size:11.5px;">'+
      '<th style="text-align:left;padding:6px 4px;">类目</th>'+
      '<th style="text-align:right;padding:6px 4px;">笔数</th>'+
      '<th style="text-align:right;padding:6px 4px;">金额</th>'+
      '<th style="text-align:right;padding:6px 4px;">占比</th>'+
      '<th style="text-align:right;padding:6px 4px;">等价工时</th></tr></thead>'+
      '<tbody>'+rows+
      '<tr style="border-top:1px solid var(--line);font-weight:700;">'+
      '<td style="padding:8px 4px;">合计</td>'+
      '<td style="text-align:right;padding:8px 4px;">'+agg.n+'</td>'+
      '<td style="text-align:right;padding:8px 4px;">-'+fmt(agg.total)+'</td>'+
      '<td style="text-align:right;padding:8px 4px;">100%</td>'+
      '<td style="text-align:right;padding:8px 4px;">'+moneyToTime(agg.total, real)+'</td></tr>'+
      '</tbody></table>';
  }
  /* ---------- 按月收支结余（收入/支出/结余三合一） ---------- */
  // monthBuckets() 已在上方数据层定义（服务端聚合优先，回退当前范围明细），此处只做渲染
  function signed(v){ return (v>0?'+':(v<0?'-':''))+fmt(Math.abs(v)); }
  // 分组柱状图：每月 支出(蓝) + 结余(绿/橙)，支出与结余同轴便于直接对比
  function renderMonthBars(){
    var box = $('mbar-chart'); if(!box) return;
    var arr = monthBuckets();
    if(!arr.length){
      box.innerHTML = '<div class="empty">还没有任何记录。先去「记账」记一笔，或把工资记成「收入」。</div>';
      return;
    }
    var data = arr.slice(-12);          // 最多展示最近 12 个月
    var W=680, H=250, padL=52, padR=12, padT=14, padB=34;
    var innerW=W-padL-padR, innerH=H-padT-padB;
    var maxV=0, minV=0;
    data.forEach(function(it){
      maxV = Math.max(maxV, it.exp, it.net);
      minV = Math.min(minV, it.net);
    });
    if(maxV<=0) maxV=1;
    var span = maxV - minV;
    function Y(v){ return padT + innerH*(1 - (v-minV)/span); }
    var slot = innerW/data.length;
    var bw = Math.max(3, Math.min(16, slot*0.28));
    var cur = curMonth();
    var svg = '<svg viewBox="0 0 '+W+' '+H+'" width="100%" preserveAspectRatio="xMidYMid meet" style="display:block">';
    svg += '<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="#FFFFFF"/>';
    // 网格（4 条含 0 轴）
    for(var t=0; t<=4; t++){
      var v = minV + span*(t/4), y = Y(v);
      var isZero = Math.abs(v)<span*0.001;
      svg += '<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(W-padR)+'" y2="'+y.toFixed(1)+'" stroke="'+(isZero?'#B9C9D8':'#DCE8F4')+'" stroke-width="'+(isZero?1.5:1)+'"/>';
      svg += '<text x="'+(padL-6)+'" y="'+(y+4).toFixed(1)+'" text-anchor="end" font-size="10" fill="#7C8A99">'+Math.round(v).toLocaleString('en-US')+'</text>';
    }
    data.forEach(function(it, ix){
      var cx = padL + slot*(ix+0.5);
      // 支出柱（向上）
      var yE = Y(it.exp), hE = Y(0)-yE;
      svg += '<rect x="'+(cx-bw-1).toFixed(1)+'" y="'+yE.toFixed(1)+'" width="'+bw+'" height="'+Math.max(1.5,hE).toFixed(1)+'" rx="3" fill="#E5564B"/>';
      // 结余柱（正向上 / 负向下）
      var col = it.net>=0 ? '#5BBF8A' : '#E5564B';
      var y0 = Y(0), yN = Y(it.net);
      var top = Math.min(y0,yN), hN = Math.abs(yN-y0);
      svg += '<rect x="'+(cx+1).toFixed(1)+'" y="'+top.toFixed(1)+'" width="'+bw+'" height="'+Math.max(1.5,hN).toFixed(1)+'" rx="3" fill="'+col+'"/>';
      // 月份标签：本月标高亮
      var isNow = it.cm===cur;
      svg += '<text x="'+cx.toFixed(1)+'" y="'+(H-12)+'" text-anchor="middle" font-size="10" font-weight="'+(isNow?700:400)+'" fill="'+(isNow?'#4A93D4':'#7C8A99')+'">'+it.cm.slice(2)+'</text>';
      // 结余数值：负值画在柱下，正值画在柱上
      if(it.net>=0){
        svg += '<text x="'+(cx+1+bw/2).toFixed(1)+'" y="'+(top-5).toFixed(1)+'" text-anchor="middle" font-size="9" fill="'+col+'">'+Math.round(it.net).toLocaleString('en-US')+'</text>';
      } else {
        svg += '<text x="'+(cx+1+bw/2).toFixed(1)+'" y="'+(top+hN+11).toFixed(1)+'" text-anchor="middle" font-size="9" fill="'+col+'">'+Math.round(it.net).toLocaleString('en-US')+'</text>';
      }
    });
    svg += '</svg>';
    box.innerHTML = svg;
  }
  function monthTableHTML(){
    var arr = monthBuckets();
    if(!arr.length) return '';
    var cur = curMonth();
    // 默认只列最近 12 个月（倒序展示，最新在上）
    var rows = arr.slice(-12).reverse().map(function(it){
      var rate = it.inc>0 ? (it.net/it.inc*100) : null;
      return '<tr class="'+(it.cm===cur?'now':'')+'">'+
        '<td>'+it.cm+'</td>'+
        '<td class="c-inc">'+(it.inc>0?'+':'')+fmt(it.inc)+'</td>'+
        '<td class="c-exp">'+(it.exp>0?'-':'')+fmt(it.exp)+'</td>'+
        '<td class="c-net '+(it.net>=0?'pos':'neg')+'">'+signed(it.net)+'</td>'+
        '<td class="c-rate">'+(rate==null?'—':(rate>=0?'':'-')+Math.abs(rate).toFixed(0)+'%')+'</td>'+
      '</tr>';
    }).join('');
    return '<table class="mtable"><thead><tr>'+
      '<th>月份</th><th>收入</th><th>支出</th><th>结余</th><th>结余率</th>'+
      '</tr></thead><tbody>'+rows+'</tbody></table>';
  }
  function renderMonthNet(){
    var card = $('mfour-card'); if(!card) return;
    renderMonthDaily();
    var arr = monthBuckets();
    if(!arr.length){
      ['mb-t-inc','mb-t-exp','mb-t-net','mb-avg-net','mb-cur-net','mb12-inc','mb12-exp','mb12-net','mb12-avg'].forEach(function(id){
        var e=$(id); if(e){ e.textContent='—'; e.className='v'; }
      });
      $('mb-table-wrap').innerHTML = '';
      renderMonthBars();
      return;
    }
    var tI=0, tE=0;
    arr.forEach(function(it){ tI+=it.inc; tE+=it.exp; });
    var tN = tI - tE;
    var cur = curMonth(), curM = null;
    arr.forEach(function(it){ if(it.cm===cur) curM = it; });
    var setV = function(id, txt, cls){
      var e=$(id); if(!e) return;
      e.textContent = txt;
      e.className = 'v '+(cls||'');
    };
    setV('mb-t-inc', (tI>0?'+':'')+fmtShort(tI), 'inc');
    setV('mb-t-exp', (tE>0?'-':'')+fmtShort(tE), 'exp');
    setV('mb-t-net', (tN>=0?'+':'-')+fmtShort(Math.abs(tN)), tN>=0?'pos':'neg');
    setV('mb-avg-net', ((tN/arr.length)>=0?'+':'-')+fmtShort(Math.abs(tN/arr.length)), tN>=0?'pos':'neg');
    setV('mb-cur-net', curM ? ((curM.net>=0?'+':'-')+fmtShort(Math.abs(curM.net))) : '—', curM ? (curM.net>=0?'pos':'neg') : '');
    // 近 12 个月汇总（含本月；不足 12 个月按已有月数平均）
    var last12 = arr.slice(-12), sI=0, sE=0;
    last12.forEach(function(it){ sI+=it.inc; sE+=it.exp; });
    var sN = sI - sE;
    setV('mb12-inc', '+'+fmtShort(sI), 'inc');
    setV('mb12-exp', '-'+fmtShort(sE), 'exp');
    setV('mb12-net', (sN>=0?'+':'-')+fmtShort(Math.abs(sN)), sN>=0?'pos':'neg');
    setV('mb12-avg', ((sN/last12.length)>=0?'+':'-')+fmtShort(Math.abs(sN/last12.length)), sN>=0?'pos':'neg');
    $('mb-table-wrap').innerHTML = monthTableHTML();
    renderMonthBars();
  }
  // 本月 1 号 → 月末的每日收支（收入/支出双柱图 + 按天汇总表，只列有记录的天）
  function renderMonthDaily(){
    var chart = $('mday-chart'), wrap = $('mday-table-wrap');
    if(!chart && !wrap) return;
    var cm = curMonth();
    var y = parseInt(cm.slice(0,4),10), m = parseInt(cm.slice(5,7),10);
    var totalDays = new Date(y, m, 0).getDate();   // 本月总天数
    var today = new Date().getDate();              // 今天日期号（用于高亮）
    var byDay = {};   // dd -> {inc, exp}
    allKnown().forEach(function(r){
      var d = String(r['日期']||'').slice(0,10);
      if(d.slice(0,7)!==cm) return;
      var dd = parseInt(d.slice(8,10), 10);
      if(!(dd>=1 && dd<=totalDays)) return;
      if(!byDay[dd]) byDay[dd] = {inc:0, exp:0};
      if(isIncome(r)) byDay[dd].inc += num(r['金额']); else byDay[dd].exp += num(r['金额']);
    });
    if(chart){
      var maxV=0; for(var k in byDay){ maxV=Math.max(maxV, byDay[k].inc, byDay[k].exp); }
      if(maxV<=0){
        chart.innerHTML = '<div class="empty">本月还没有收支记录，先记一笔吧～</div>';
      } else {
        var W=640, H=230, padL=48, padR=12, padT=16, padB=34;
        var innerW=W-padL-padR, innerH=H-padT-padB;
        var slot=innerW/totalDays, bw=Math.max(2.5, Math.min(11, slot*0.30));
        function X(dd){ return padL + slot*(dd-0.5); }
        function Y(v){ return padT + innerH*(1 - v/maxV); }
        var svg='<svg viewBox="0 0 '+W+' '+H+'" width="100%" preserveAspectRatio="xMidYMid meet" style="display:block">';
        svg += '<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="#FFFFFF"/>';
        [0,0.5,1].forEach(function(t){
          var yy=padT+innerH*t;
          svg += '<line x1="'+padL+'" y1="'+yy.toFixed(1)+'" x2="'+(W-padR)+'" y2="'+yy.toFixed(1)+'" stroke="#DCE8F4"/>';
          svg += '<text x="'+(padL-6)+'" y="'+(yy+4).toFixed(1)+'" text-anchor="end" font-size="10" fill="#7C8A99">'+Math.round(maxV*(1-t)).toLocaleString('en-US')+'</text>';
        });
        for(var dd=1; dd<=totalDays; dd++){
          var b=byDay[dd]||{inc:0,exp:0}, x=X(dd);
          var incH=b.inc>0?Math.max(2,(padT+innerH-Y(b.inc))):0;
          var expH=b.exp>0?Math.max(2,(padT+innerH-Y(b.exp))):0;
          svg += '<rect x="'+(x-bw-0.5).toFixed(1)+'" y="'+(padT+innerH-incH).toFixed(1)+'" width="'+bw+'" height="'+incH.toFixed(1)+'" rx="2.5" fill="#5BBF8A"/>';
          svg += '<rect x="'+(x+0.5).toFixed(1)+'" y="'+(padT+innerH-expH).toFixed(1)+'" width="'+bw+'" height="'+expH.toFixed(1)+'" rx="2.5" fill="#E5564B"/>';
          if(b.inc===0 && b.exp===0){
            svg += '<rect x="'+(x-bw/2).toFixed(1)+'" y="'+(padT+innerH-2)+'" width="'+(bw*2+1).toFixed(1)+'" height="2" rx="1" fill="#DCE8F4"></rect>';
          }
          if(totalDays<=16 || dd%2===0 || dd===1 || dd===totalDays || dd===today){
            var isToday=dd===today;
            svg += '<text x="'+x.toFixed(1)+'" y="'+(H-12)+'" text-anchor="middle" font-size="10" font-weight="'+(isToday?700:400)+'" fill="'+(isToday?'#4A93D4':'#7C8A99')+'">'+dd+'</text>';
          }
        }
        svg += '</svg>';
        chart.innerHTML = svg;
      }
    }
    if(wrap){
      var days = [];
      for(var d2=1; d2<=totalDays; d2++){ if(byDay[d2]) days.push(d2); }
      if(!days.length){
        wrap.innerHTML='';
      } else {
        // 结余 = 当月（1号）到当日累计收入 − 当月到当日累计支出（逐日累计）
        var cum = {}, runInc = 0, runExp = 0;
        for(var d0=1; d0<=totalDays; d0++){
          var b0 = byDay[d0];
          if(b0){ runInc += b0.inc; runExp += b0.exp; cum[d0] = runInc - runExp; }
        }
        days.sort(function(a,b){ return b-a; });
        var rows='';
        days.forEach(function(d3){
          var bb=byDay[d3];
          var cn=cum[d3];
          rows += '<tr class="'+(d3===today?'now':'')+'">'+
            '<td>'+cm+'-'+pad2(d3)+'</td>'+
            '<td class="c-inc">'+(bb.inc>0?'+':'')+(bb.inc>0?fmt(bb.inc):'—')+'</td>'+
            '<td class="c-exp">'+(bb.exp>0?'-':'')+(bb.exp>0?fmt(bb.exp):'—')+'</td>'+
            '<td class="c-net '+(cn>=0?'pos':'neg')+'">'+signed(cn)+'</td>'+
          '</tr>';
        });
        wrap.innerHTML = '<table class="mtable"><thead><tr><th>日期</th><th>收入</th><th>支出</th><th>累计结余</th></tr></thead><tbody>'+rows+'</tbody></table>';
      }
    }
  }
  // 按月结余 / 本月每日 视图切换
  function setMbView(v){
    var monthV=$('mb-view-month'), dayV=$('mb-view-day');
    if(monthV) monthV.style.display = (v==='month') ? 'block' : 'none';
    if(dayV) dayV.style.display = (v==='day') ? 'block' : 'none';
    var tabs=$('mb-tabs');
    if(tabs) tabs.querySelectorAll('.mtb').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-v')===v);
    });
  }
  function renderStats(){
    if(!$('sec-stats')) return;
    var h = computeHourly(state.settings);
    var t = todayAgg(), m = monthAgg();

    bindText($('st-today'), (t.total>0?'-':'')+fmt(t.total), flowDbOf(curMonth()));
    bindText($('st-month'), (m.total>0?'-':'')+fmt(m.total), flowDbOf(curMonth()));
    $('st-today-n').textContent = t.n;
    $('st-month-n').textContent = m.n;
    $('st-today-time').textContent = h.real>0 ? moneyToTime(t.total, h.real) : '—';
    $('st-month-time').textContent = h.real>0 ? moneyToTime(m.total, h.real) : '—';
    $('st-today-top').textContent = t.items.length ? (t.items[0].cat+' -'+fmt(t.items[0].amt)) : '—';
    var dayN = new Date().getDate();
    $('st-month-avg').textContent = (m.total>0? '-':'')+fmt(m.total/dayN);

    $('st-today-list').innerHTML = catRowsHTML(t, true, '-');
    $('st-month-list').innerHTML = catRowsHTML(m, false, '-');    renderTrend();
    $('st-month-table').innerHTML = catTableHTML(m);

    // ---- 本月收入 ----
    var inc = monthIncomeAgg();
    bindText($('st-income'), (inc.total>0?'+':'')+fmt(inc.total), flowDbOf(curMonth()));
    $('st-income').classList.toggle('inc-amt', inc.total>0);
    $('st-income-n').textContent = inc.n;
    $('st-income-time').textContent = h.real>0 ? moneyToTime(inc.total, h.real) : '—';
    var netv = inc.total - m.total;
    $('st-net').textContent = (inc.total>0 || m.total>0) ? ((netv>=0?'':'−')+fmt(Math.abs(netv))) : '—';
    $('st-income-list').innerHTML = inc.items.length ? catRowsHTML(inc, true, '+') : '<div class="empty">本月还没有收入记录。在驾驶舱把类型切到「收入」记一笔。</div>';

    var tt = todayStr();
    var todayRecs = allKnown().filter(function(r){ return String(r['日期']||'').slice(0,10)===tt; });
    if(!todayRecs.length){
      $('st-today-table').innerHTML = '<div class="empty">今天还没有支出记录。在驾驶舱「现在记一笔」写下第一笔。</div>';
    } else {
      var box = $('st-today-table'); box.innerHTML='';
      todayRecs.forEach(function(r){ box.appendChild(recordRow(r, true)); });
    }
    // 驾驶舱迷你类目速览
    var mini = $('d-catlist');
    if(mini) mini.innerHTML = t.items.length ? catRowsHTML(t, false, '-') : '<div class="empty" style="padding:8px 0;">今天还没有支出记录。</div>';

    // 按月收支结余汇总卡已迁至「月度总结」页，由 renderMonthNet 独立渲染
  }

  function refreshAll(){
    renderDashboard(); renderHourly(); renderLedger(); renderMonthly();
    renderFreedom(); renderFindings(); renderDataStat();
    // 统计页的「今日/本月」指标固定是本月口径；若当前查询范围不含本月，
    // 先把本月明细补进 state.flow 再渲染，否则本月类目图/趋势图会静默算成 0
    ensureMonthLoaded(curMonth()).then(function(){
      renderStats();
    });
  }

  /* ---------- 表单交互 ---------- */
  // 重载当前范围明细 + 重算月度聚合（增删改后调用，保证明细与结余图同步）
  function reloadRange(){
    var r = state.range;
    return Promise.all([ loadFlowRange(r), loadAgg(12) ]).then(function(arrs){
      state.flow = arrs[0] || [];
      populateCats();
      refreshAll();
      return state.flow;
    });
  }
  // 切换查询范围：并发闸门保证只有最后一次生效
  function applyRange(next){
    var r = normRange(next);
    if(!r){ showToast('日期范围无效，请检查起止日期','err'); return Promise.resolve(false); }
    var seq = ++rangeSeq;
    state.range = r;
    syncRangeInputs();
    setSync('syncing');
    var list = $('l-list');
    if(list) list.innerHTML = '<div class="skeleton">加载中…</div>';
    return Promise.all([ loadFlowRange(r), loadAgg(12) ]).then(function(arrs){
      if(seq !== rangeSeq) return false;      // 已有更新的请求，丢弃本次结果
      state.flow = arrs[0] || [];
      populateCats();
      refreshAll();
      setSync('synced');
      return true;
    }).catch(function(e){
      if(seq !== rangeSeq) return false;
      console.error('[applyRange]', e);
      setSync('error');
      showToast('加载失败，请重试','err');
      return false;
    });
  }
  function syncRangeInputs(){
    var r = state.range; if(!r) return;
    var m=$('l-range-month'), f=$('l-range-from'), t=$('l-range-to');
    if(m && r.mode==='month') m.value = r.cm;
    if(f) f.value = r.from;
    if(t) t.value = r.to;
    var lab=$('l-range-label');
    if(lab) lab.textContent = '当前范围：'+rangeLabel(r)+'（共 '+state.flow.length+' 条）';
  }
  /* ---------- CSV 导出（按月一个文件，本地生成 blob 保存） ---------- */
  function csvCell(v){
    var s = (v==null) ? '' : String(v);
    if(/[",\r\n]/.test(s)) return '"'+s.replace(/"/g,'""')+'"';
    return s;
  }
  function buildFlowCSV(list){
    var head = ['日期','收支类型','分类','金额','备注','成员'];
    var lines = [ head.map(csvCell).join(',') ];
    list.forEach(function(r){
      lines.push([ recStamp(r), kindOf(r), catOf(r),
                   num(r['金额']), String(r['备注']||''), String(r['u']||'') ].map(csvCell).join(','));
    });
    return '\ufeff'+lines.join('\r\n');   // BOM头，Excel 打开中文不乱码
  }
  /* ---------- 文件保存 ----------
     分享页把本页装在没有 allow-downloads 的 iframe 里，页面内 a.click() 下载会被浏览器静默拦截
     （于是「提示导出成功」但文件没下来）。而沙箱放开了 allow-popups +
     allow-popups-to-escape-sandbox，所以：先开一个空白新窗口（不受沙箱限制），再把文件送进去下载。 */
  function isInIframe(){
    try{ return window.self !== window.top; }catch(e){ return true; }
  }
  function openDownloadWindow(){
    if(!isInIframe()) return null;          // 直接打开页面（非 iframe）无需新窗口
    try{
      var w = window.open('about:blank', '_blank');
      if(w){ try{ w.document.write('<p style="font-family:system-ui,sans-serif;padding:28px;color:#20303f">正在生成文件，请稍候…</p>'); }catch(e){} }
      return w;
    }catch(e){ return null; }
  }
  function writeDownloadWindow(win, url, filename){
    try{
      var S = '<' + 'script>';
      var E = '<' + '/script>';
      var html = '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>保存文件</title>'
        + '<style>body{font-family:system-ui,-apple-system,"PingFang SC",sans-serif;padding:40px;color:#20303f;background:#F7FAFD}'
        + 'a.b{display:inline-block;margin-top:16px;background:linear-gradient(135deg,#4A93D4,#2E7CC0);color:#fff;text-decoration:none;'
        + 'padding:12px 22px;border-radius:12px;font-weight:600;font-size:15px}'
        + '.t{font-size:13px;color:#7C8A99;margin-top:16px;line-height:1.7}</style></head><body>'
        + '<h2 style="margin:0 0 8px;font-size:19px">文件已生成</h2>'
        + '<div id="fn" style="font-size:14px;color:#20303f;word-break:break-all"></div>'
        + '<a class="b" id="dl" href="' + url + '" download="">保存到本机</a>'
        + '<div class="t">若未自动开始，请点上面的按钮。<br>保存完成后可直接关闭本页。</div>'
        + S + 'var n=' + JSON.stringify(filename) + ';'
        + 'document.getElementById("fn").textContent=n;'
        + 'var a=document.getElementById("dl");a.setAttribute("download",n);'
        + 'setTimeout(function(){try{a.click();}catch(e){}},260);' + E
        + '</body></html>';
      win.document.open(); win.document.write(html); win.document.close();
      return true;
    }catch(e){ console.warn('[writeDownloadWindow]', e); return false; }
  }
  function showSaveFallback(url, filename){
    var old = document.getElementById('dlFallback');
    if(old && old.parentNode) old.parentNode.removeChild(old);
    var d=document.createElement('div');
    d.id='dlFallback';
    d.style.cssText='position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:99999;background:#fff;'
      + 'border:1px solid #DCE8F4;border-radius:14px;box-shadow:0 12px 32px rgba(20,60,100,.2);padding:14px 16px;max-width:92vw;';
    var t=document.createElement('div');
    t.style.cssText='font-size:13px;font-weight:600;color:#20303f;margin-bottom:4px';
    t.textContent='文件已生成';
    var f=document.createElement('div');
    f.style.cssText='font-size:12px;color:#7C8A99;margin-bottom:10px;word-break:break-all';
    f.textContent=filename;
    var a=document.createElement('a');
    a.href=url; a.download=filename; a.target='_blank'; a.rel='noopener';
    a.textContent='保存到本机';
    a.style.cssText='display:inline-block;background:linear-gradient(135deg,#4A93D4,#2E7CC0);color:#fff;text-decoration:none;padding:9px 16px;border-radius:10px;font-size:13px;font-weight:600';
    var c=document.createElement('button');
    c.type='button'; c.textContent='关闭';
    c.style.cssText='margin-left:8px;background:#fff;border:1px solid #DCE8F4;color:#4A93D4;padding:9px 14px;border-radius:10px;font-size:13px;cursor:pointer';
    c.onclick=function(){ if(d.parentNode) d.parentNode.removeChild(d); };
    d.appendChild(t); d.appendChild(f); d.appendChild(a); d.appendChild(c);
    document.body.appendChild(d);
  }
  // App（Capacitor）环境判定
  function isNativeApp(){
    try{ return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); }
    catch(e){ return false; }
  }
  function blobToBase64(blob){
    return new Promise(function(resolve, reject){
      var fr = new FileReader();
      fr.onload = function(){
        var s = String(fr.result||'');
        var i = s.indexOf(',');
        resolve(i>=0 ? s.slice(i+1) : s);
      };
      fr.onerror = function(){ reject(new Error('读取文件失败')); };
      fr.readAsDataURL(blob);
    });
  }
  // Android WebView 不触发 blob 下载，改走 Filesystem 落盘 + Share 让用户保存/分享
  function saveBlobNative(blob, filename){
    var Cap = window.Capacitor;
    var FS = Cap && Cap.Plugins && Cap.Plugins.Filesystem;
    var SH = Cap && Cap.Plugins && Cap.Plugins.Share;
    if(!FS || !FS.writeFile) return Promise.resolve(false);
    return blobToBase64(blob).then(function(b64){
      return FS.writeFile({ path: filename, data: b64, directory: 'CACHE', recursive: true });
    }).then(function(res){
      var uri = res && res.uri;
      if(SH && SH.share && uri){
        return SH.share({ title: '导出文件', text: filename, url: uri, files: [uri], dialogTitle: '保存或分享文件' })
          .then(function(){ return true; })
          .catch(function(){ showToast('文件已生成：'+filename); return true; });
      }
      showToast('文件已生成：'+filename);
      return true;
    });
  }
  // 统一保存：优先新窗口（绕过分享页沙箱）→ 当前页直接下载 → 给手动保存链接
  function saveBlobSmart(blob, filename, preWin){
    // App 内：走原生文件系统 + 分享（WebView 不支持 blob 下载）
    if(isNativeApp()){
      if(preWin && !preWin.closed){ try{ preWin.close(); }catch(e){} }
      showToast('正在生成文件…');
      saveBlobNative(blob, filename).catch(function(e){
        console.error('[saveBlobNative]', e);
        showToast('保存失败：'+((e&&e.message)||'未知错误'),'err');
      });
      return;
    }
    var url;
    try{ url = URL.createObjectURL(blob); }
    catch(e){
      showToast('浏览器不支持生成文件','err');
      if(preWin && !preWin.closed){ try{ preWin.close(); }catch(e2){} }
      return;
    }
    if(preWin && !preWin.closed){
      if(writeDownloadWindow(preWin, url, filename)) return;
      try{ preWin.location.href = url; return; }catch(e){}
    }
    var a=document.createElement('a');
    a.href=url; a.download=filename; a.rel='noopener';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    if(isInIframe()) showSaveFallback(url, filename);
  }
  function exportMonthCSV(cm){
    if(!db){ showToast('离线环境，无法导出','err'); return; }
    if(!/^\d{4}-\d{2}$/.test(cm)){ showToast('月份格式不正确','err'); return; }
    var list = state.flow.filter(function(r){
      return String(r['日期']||'').slice(0,7)===cm;
    });
    if(!list.length){ showToast('该月没有可导出的记录','err'); return; }
    var btn=$('l-export'); if(btn){ btn.disabled=true; }
    var preWin = openDownloadWindow();
    var csv = buildFlowCSV(list);
    var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    saveBlobSmart(blob, 'ledger_'+cm+'.csv', preWin);
    showToast('已导出 '+cm+'（'+list.length+' 条）');
    if(btn){ btn.disabled=false; }
  }
  /* ---------- 导出全部数据（原生生成 xlsx，多 sheet，零外部依赖） ---------- */
  // CRC32（用于自建 ZIP）
  var CRC_TABLE = (function(){
    var t = new Array(256);
    for(var n=0;n<256;n++){
      var c=n;
      for(var k=0;k<8;k++){ c = (c&1) ? (0xEDB88320 ^ (c>>>1)) : (c>>>1); }
      t[n]=c>>>0;
    }
    return t;
  })();
  function crc32(bytes){
    var c=0xFFFFFFFF;
    for(var i=0;i<bytes.length;i++){ c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c>>>8); }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function utf8Bytes(str){
    str = String(str==null?'':str);
    if(typeof TextEncoder!=='undefined') return new TextEncoder().encode(str);
    var out=[],i,c;
    for(i=0;i<str.length;i++){
      c=str.charCodeAt(i);
      if(c<0x80) out.push(c);
      else if(c<0x800) out.push(0xC0|(c>>6), 0x80|(c&0x3F));
      else if(c>=0xD800 && c<0xDC00){
        var c2=str.charCodeAt(++i);
        var cp=0x10000+((c-0xD800)<<10)+(c2-0xDC00);
        out.push(0xF0|(cp>>18),0x80|((cp>>12)&0x3F),0x80|((cp>>6)&0x3F),0x80|(cp&0x3F));
      } else out.push(0xE0|(c>>12),0x80|((c>>6)&0x3F),0x80|(c&0x3F));
    }
    return new Uint8Array(out);
  }
  function xmlEsc(s){
    return String(s==null?'':s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  }
  // 最小 ZIP（STORE 无压缩模式）
  function buildZip(files){
    var chunks=[], central=[], offset=0, now=new Date();
    var dtTime = ((now.getHours()&0x1F)<<11)|((now.getMinutes()&0x3F)<<5)|((Math.floor(now.getSeconds()/2))&0x1F);
    var dtDate = (((now.getFullYear()-1980)&0x7F)<<9)|(((now.getMonth()+1)&0xF)<<5)|(now.getDate()&0x1F);
    function w16(a,v){ a.push(v&0xFF,(v>>>8)&0xFF); }
    function w32(a,v){ a.push(v&0xFF,(v>>>8)&0xFF,(v>>>16)&0xFF,(v>>>24)&0xFF); }
    files.forEach(function(f){
      var nameB = utf8Bytes(f.name), crc = crc32(f.data), len = f.data.length;
      var lh=[];
      w32(lh,0x04034b50); w16(lh,20); w16(lh,0x0800); w16(lh,0);
      w16(lh,dtTime); w16(lh,dtDate); w32(lh,crc); w32(lh,len); w32(lh,len);
      w16(lh,nameB.length); w16(lh,0);
      chunks.push(new Uint8Array(lh), nameB, f.data);
      var cd=[];
      w32(cd,0x02014b50); w16(cd,20); w16(cd,20); w16(cd,0x0800); w16(cd,0);
      w16(cd,dtTime); w16(cd,dtDate); w32(cd,crc); w32(cd,len); w32(cd,len);
      w16(cd,nameB.length); w16(cd,0); w16(cd,0); w16(cd,0); w16(cd,0); w32(cd,0); w32(cd,offset);
      central.push(new Uint8Array(cd), nameB);
      offset += lh.length + nameB.length + len;
    });
    var cenSize=0; central.forEach(function(c){ cenSize+=c.length; });
    var eo=[];
    w32(eo,0x06054b50); w16(eo,0); w16(eo,0);
    w16(eo,files.length); w16(eo,files.length);
    w32(eo,cenSize); w32(eo,offset); w16(eo,0);
    var all = chunks.concat(central, [new Uint8Array(eo)]);
    var total=0; all.forEach(function(c){ total+=c.length; });
    var out=new Uint8Array(total), p=0;
    all.forEach(function(c){ out.set(c,p); p+=c.length; });
    return out;
  }
  function xlsxColName(i){
    var s='', n=i+1;
    while(n>0){ var m=(n-1)%26; s=String.fromCharCode(65+m)+s; n=Math.floor((n-1)/26); }
    return s;
  }
  function xlsxSheetXml(rows){
    var xml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
    rows.forEach(function(row,ri){
      xml += '<row r="'+(ri+1)+'">';
      row.forEach(function(cell,ci){
        var ref = xlsxColName(ci)+(ri+1);
        if(typeof cell==='number' && isFinite(cell)){
          xml += '<c r="'+ref+'"><v>'+cell+'</v></c>';
        } else {
          xml += '<c r="'+ref+'" t="inlineStr"><is><t xml:space="preserve">'+xmlEsc(cell)+'</t></is></c>';
        }
      });
      xml += '</row>';
    });
    return xml + '</sheetData></worksheet>';
  }
  function buildXlsx(sheets){
    var files=[];
    function add(n,s){ files.push({name:n,data:utf8Bytes(s)}); }
    var ct='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'+
      '<Default Extension="xml" ContentType="application/xml"/>'+
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>';
    sheets.forEach(function(s,i){
      ct += '<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
    });
    add('[Content_Types].xml', ct+'</Types>');
    add('_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
    var wb='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>';
    sheets.forEach(function(s,i){ wb += '<sheet name="'+xmlEsc(s.name)+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>'; });
    add('xl/workbook.xml', wb+'</sheets></workbook>');
    var rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
    sheets.forEach(function(s,i){
      rels += '<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>';
    });
    add('xl/_rels/workbook.xml.rels', rels+'</Relationships>');
    sheets.forEach(function(s,i){ add('xl/worksheets/sheet'+(i+1)+'.xml', xlsxSheetXml(s.rows)); });
    return buildZip(files);
  }
  function round2(v){ return Math.round(num(v)*100)/100; }
  // 汇总全部月份流水 + 设置 + 成员，导出为一个多 sheet 的 xlsx
  function exportAllData(btn){
    if(!db){ showToast('离线环境，无法导出','err'); return; }
    btn = btn || $('l-export-all'); if(btn) btn.disabled=true;
    var preWin = openDownloadWindow();   // 必须在用户点击的同步调用栈里开窗，否则会被弹窗拦截
    setSync('syncing');
    showToast('正在汇总全部数据…');
    var dbs=[]; for(var cm in MONTH_ROUTE){ if(MONTH_ROUTE.hasOwnProperty(cm)) dbs.push({cm:cm,id:MONTH_ROUTE[cm]}); }
    // 本地存储（App）里所有月份同属一个表，按 132 张表遍历会重复取数 —— 只查一次
    var isLocal = (typeof DB_IS_LOCAL!=='undefined') && DB_IS_LOCAL;
    if(isLocal) dbs=[{cm:curMonth(), id:flowDbOf(curMonth())}];
    var all=[], seen={}, CONC=5;
    function pushAll(list){
      list.forEach(function(r){
        if(!r) return;
        var k = r._id || r.record_id || (String(r['日期']||'')+'|'+String(r['收支类型']||'')+'|'+String(r['金额']||'')+'|'+String(r['备注']||''));
        if(seen[k]) return; seen[k]=1; all.push(r);
      });
    }
    function runBatch(start){
      var slice=dbs.slice(start,start+CONC);
      if(!slice.length) return Promise.resolve();
      return Promise.all(slice.map(function(d){
        return db.query({databaseId:d.id, pageSize: isLocal?100000:200})
          .then(function(r){ return r.results||[]; })
          .catch(function(){ return []; });
      })).then(function(arrs){
        arrs.forEach(pushAll);
        return runBatch(start+CONC);
      });
    }
    var membersPromise = (state.users && state.users.length)
      ? Promise.resolve(state.users)
      : db.query({databaseId:DB_USER, pageSize:100}).then(function(r){ return r.results||[]; }).catch(function(){ return []; });

    Promise.all([ runBatch(0), membersPromise ]).then(function(res){
      var members = res[1] || [];
      all.sort(function(a,b){ var x=recStamp(a), y=recStamp(b); return x<y ? -1 : (x>y ? 1 : 0); });

      var sheets=[];
      // 1) 流水：日期写到秒（备份要能完整还原，含秒），另留一列原始「日期」便于和账单对账
      var flowRows=[['日期','收支类型','分类/来源','金额(元)','备注','成员标识u','外部单号']];
      all.forEach(function(r){
        flowRows.push([
          recStamp(r),
          kindOf(r),
          catOf(r),
          round2(num(r['金额'])),
          String(r['备注']||''),
          String(r['u']||''),
          String(r['外部单号']||'')
        ]);
      });
      sheets.push({name:'流水', rows:flowRows});
      // 2) 月度汇总
      var byM={};
      all.forEach(function(r){
        var d=String(r['日期']||'').slice(0,10); if(d.length<7) return;
        var k=d.slice(0,7); if(!byM[k]) byM[k]={inc:0,exp:0};
        if(isIncome(r)) byM[k].inc+=num(r['金额']); else byM[k].exp+=num(r['金额']);
      });
      var monRows=[['月份','收入(元)','支出(元)','结余(元)']];
      Object.keys(byM).sort().forEach(function(k){
        monRows.push([k, round2(byM[k].inc), round2(byM[k].exp), round2(byM[k].inc-byM[k].exp)]);
      });
      sheets.push({name:'月度汇总', rows:monRows});
      // 3) 设置
      var s=state.settings||DEFAULT_SETTINGS;
      var setRows=[['项目','值']];
      Object.keys(DEFAULT_SETTINGS).forEach(function(k){ setRows.push([k, s[k]==null?'':s[k]]); });
      sheets.push({name:'设置', rows:setRows});
      // 4) 成员
      var memRows=[['标识u','姓名','平台账号','绑定时间','说明']];
      members.forEach(function(m){
        memRows.push([String(m['u']||''), String(m['姓名']||''), String(m['平台账号']||''), String(m['绑定时间']||''), String(m['说明']||'')]);
      });
      sheets.push({name:'成员', rows:memRows});

      var bytes = buildXlsx(sheets);
      var MIME='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      var blob = new Blob([bytes], {type:MIME});
      var d0=new Date();
      var stamp = d0.getFullYear()+'-'+pad2(d0.getMonth()+1)+'-'+pad2(d0.getDate());
      var fname = '小账本-全部数据-'+stamp+'.xlsx';
      setSync('synced');
      showToast('已导出全部：'+all.length+' 条流水、'+Object.keys(byM).length+' 个月');
      saveBlobSmart(blob, fname, preWin);
      return Promise.resolve();
    }).catch(function(e){
      console.error('[exportAllData]', e);
      setSync('error');
      if(preWin && !preWin.closed){ try{ preWin.close(); }catch(e2){} }
      showToast('导出失败：'+((e&&e.message)||'未知错误'),'err');
    }).then(function(){ if(btn) btn.disabled=false; });
  }
  /* ---------- 导入 Excel（原生解析 xlsx，零外部依赖） ---------- */
  function utf8Decode(bytes){
    if(typeof TextDecoder!=='undefined') return new TextDecoder('utf-8').decode(bytes);
    var s='',i; for(i=0;i<bytes.length;i++){ s+=String.fromCharCode(bytes[i]); }
    try{ return decodeURIComponent(escape(s)); }catch(e){ return s; }
  }
  function bytesToText(bytes){ return utf8Decode(bytes); }
  function parseXmlDoc(text){
    var doc = new DOMParser().parseFromString(text, 'application/xml');
    var bad = doc.getElementsByTagNameNS('*','parsererror');
    if(bad && bad.length) throw new Error('XML 解析失败');
    if(doc.documentElement && doc.documentElement.nodeName==='parsererror') throw new Error('XML 解析失败');
    return doc;
  }
  function colIndexFromRef(ref){
    var m = /^([A-Z]+)/.exec(String(ref).toUpperCase());
    if(!m) return 0;
    var s=m[1], n=0;
    for(var i=0;i<s.length;i++){ n = n*26 + (s.charCodeAt(i)-64); }
    return n-1;
  }
  // 打开 ZIP（读中央目录）
  function zipOpen(buf){
    var bytes = (buf && buf.constructor && buf.constructor.name==='Uint8Array') ? buf : new Uint8Array(buf);
    var dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var eocd=-1, minStart=Math.max(0, bytes.length-65557);
    for(var i=bytes.length-22; i>=minStart; i--){
      if(dv.getUint32(i, true) === 0x06054b50){ eocd=i; break; }
    }
    if(eocd<0) throw new Error('不是有效的 Excel 文件（未找到 ZIP 结构）');
    var count = dv.getUint16(eocd+10, true), cdOff = dv.getUint32(eocd+16, true);
    var map={}, p=cdOff;
    for(var n=0;n<count;n++){
      if(dv.getUint32(p, true) !== 0x02014b50) break;
      var method   = dv.getUint16(p+10, true);
      var compSize = dv.getUint32(p+20, true);
      var nameLen  = dv.getUint16(p+28, true);
      var extraLen = dv.getUint16(p+30, true);
      var cmtLen   = dv.getUint16(p+32, true);
      var localOff = dv.getUint32(p+42, true);
      var name = utf8Decode(bytes.subarray(p+46, p+46+nameLen));
      map[name] = {method:method, compSize:compSize, localOff:localOff};
      p += 46 + nameLen + extraLen + cmtLen;
    }
    return {bytes:bytes, dv:dv, map:map};
  }
  function zipRead(zip, name){
    var e = zip.map[name]; if(!e) return Promise.resolve(null);
    var p=e.localOff, dv=zip.dv;
    var nameLen=dv.getUint16(p+26, true), extraLen=dv.getUint16(p+28, true);
    var start = p + 30 + nameLen + extraLen;
    var data = zip.bytes.subarray(start, start + e.compSize);
    if(e.method === 0) return Promise.resolve(data);
    if(e.method === 8){
      if(typeof DecompressionStream === 'undefined'){
        return Promise.reject(new Error('当前环境不支持解压该文件，请使用本页导出的 xlsx'));
      }
      try{
        var ds = new DecompressionStream('deflate-raw');
        var writer = ds.writable.getWriter();
        writer.write(data).catch(function(){});
        writer.close().catch(function(){});
        return new Response(ds.readable).arrayBuffer()
          .then(function(ab){ return new Uint8Array(ab); });
      }catch(err){
        return Promise.reject(new Error('解压失败：'+((err&&err.message)||'')));
      }
    }
    return Promise.reject(new Error('不支持的压缩方式：'+e.method));
  }
  function parseSharedStrings(text){
    if(!text) return [];
    var doc=parseXmlDoc(text), out=[];
    var siEls=doc.getElementsByTagNameNS('*','si');
    for(var i=0;i<siEls.length;i++){
      var ts=siEls[i].getElementsByTagNameNS('*','t'), s='';
      for(var j=0;j<ts.length;j++){ s += ts[j].textContent; }
      out.push(s);
    }
    return out;
  }
  function sheetRowsFromXml(text, shared){
    var doc=parseXmlDoc(text), rows=[];
    var rowEls=doc.getElementsByTagNameNS('*','row');
    for(var i=0;i<rowEls.length;i++){
      var rowEl=rowEls[i];
      var rIdx=parseInt(rowEl.getAttribute('r')||String(rows.length+1),10)-1;
      if(!(rIdx>=0)) rIdx=rows.length;
      var cells=[];
      var cEls=rowEl.getElementsByTagNameNS('*','c');
      for(var j=0;j<cEls.length;j++){
        var c=cEls[j];
        var ref=c.getAttribute('r')||'';
        var ci=ref ? colIndexFromRef(ref) : j;
        var t=c.getAttribute('t'), val='';
        if(t==='inlineStr'){
          var tEl=c.getElementsByTagNameNS('*','t')[0];
          val = tEl ? tEl.textContent : '';
        } else if(t==='s'){
          var v1=c.getElementsByTagNameNS('*','v')[0];
          var si=v1 ? parseInt(v1.textContent,10) : -1;
          val = (si>=0 && shared[si]!=null) ? shared[si] : '';
        } else if(t==='str'){
          var v2=c.getElementsByTagNameNS('*','v')[0];
          val = v2 ? v2.textContent : '';
        } else {
          var v3=c.getElementsByTagNameNS('*','v')[0];
          if(v3){
            var raw=v3.textContent;
            val = (raw!=='' && isFinite(Number(raw))) ? Number(raw) : raw;
          }
        }
        cells[ci]=val;
      }
      rows[rIdx]=cells;
    }
    for(var k=0;k<rows.length;k++){ if(!rows[k]) rows[k]=[]; }
    return rows;
  }
  // 读取 xlsx -> [{name, rows}]
  function readXlsx(buf){
    var zip = zipOpen(buf);
    return Promise.all([
      zipRead(zip,'xl/workbook.xml').then(function(b){ return b?bytesToText(b):''; }),
      zipRead(zip,'xl/sharedStrings.xml').then(function(b){ return b?bytesToText(b):''; })
    ]).then(function(res){
      var wbText=res[0], ssText=res[1];
      if(!wbText) throw new Error('文件里缺少 xl/workbook.xml，可能不是有效的 xlsx');
      var shared=parseSharedStrings(ssText);
      var wbDoc=parseXmlDoc(wbText);
      var sheetEls=wbDoc.getElementsByTagNameNS('*','sheet');
      var RELNS='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
      var list=[];
      for(var i=0;i<sheetEls.length;i++){
        list.push({
          name: sheetEls[i].getAttribute('name'),
          rid: sheetEls[i].getAttributeNS(RELNS,'id') || sheetEls[i].getAttribute('r:id')
        });
      }
      return zipRead(zip,'xl/_rels/workbook.xml.rels').then(function(b){
        var relMap={};
        if(b){
          var d=parseXmlDoc(bytesToText(b));
          var rels=d.getElementsByTagNameNS('*','Relationship');
          for(var i=0;i<rels.length;i++){ relMap[rels[i].getAttribute('Id')]=rels[i].getAttribute('Target'); }
        }
        return Promise.all(list.map(function(s){
          var t=relMap[s.rid]; if(!t) return {name:s.name, rows:[]};
          var path = t.charAt(0)==='/' ? t.slice(1) : t;
          if(path.indexOf('xl/')!==0) path = 'xl/'+path;
          return zipRead(zip, path).then(function(b2){
            return {name:s.name, rows: b2 ? sheetRowsFromXml(bytesToText(b2), shared) : []};
          });
        }));
      });
    });
  }
  function pickFile(accept){
    return new Promise(function(resolve){
      var input=document.createElement('input');
      input.type='file'; input.accept=accept||'.xlsx';
      input.onchange=function(){ resolve(input.files && input.files[0] ? input.files[0] : null); };
      input.click();
    });
  }
  function readFileBuffer(file){
    return new Promise(function(resolve, reject){
      var fr=new FileReader();
      fr.onload=function(){ resolve(fr.result); };
      fr.onerror=function(){ reject(new Error('文件读取失败')); };
      fr.readAsArrayBuffer(file);
    });
  }
  // 导入「流水」表：校验 -> 去重 -> 写入云端对应月表
  /* ---------- 微信 / 支付宝账单导入 ----------
     两家导出的都是 CSV（微信 UTF-8、支付宝 GBK），正文前有十几行说明。 */
  function parseCsvRows(text){
    var rows=[], row=[], cur='', inQ=false, i=0, n=text.length;
    while(i<n){
      var ch=text.charAt(i);
      if(inQ){
        if(ch==='"'){
          if(text.charAt(i+1)==='"'){ cur+='"'; i+=2; continue; }
          inQ=false; i++; continue;
        }
        cur+=ch; i++; continue;
      }
      if(ch==='"'){ inQ=true; i++; continue; }
      if(ch===','){ row.push(cur); cur=''; i++; continue; }
      if(ch==='\r'){ i++; continue; }
      if(ch==='\n'){ row.push(cur); rows.push(row); row=[]; cur=''; i++; continue; }
      cur+=ch; i++;
    }
    if(cur!=='' || row.length){ row.push(cur); rows.push(row); }
    return rows;
  }
  // 微信是 UTF-8；支付宝是 GBK/GB18030 —— 先按 UTF-8 解，出现替换字符再换 GB
  function decodeBillText(bytes){
    var utf8='';
    try{ utf8 = new TextDecoder('utf-8', {fatal:false}).decode(bytes); }catch(e){ utf8=''; }
    if(utf8 && utf8.indexOf('\uFFFD') < 0) return utf8;
    var labels=['gb18030','gbk','gb2312'];
    for(var i=0;i<labels.length;i++){
      try{
        var t=new TextDecoder(labels[i], {fatal:false}).decode(bytes);
        if(t && t.indexOf('\uFFFD') < 0) return t;
      }catch(e){}
    }
    return utf8 || '';
  }
  function tidyCell(c){ return String(c==null?'':c).replace(/\s/g,'').replace(/^"|"$/g,''); }
  // 跳过说明行：定位含「交易时间 / 收/支 / 金额」的表头行
  function findBillHeaderRow(rows){
    var lim = Math.min(rows.length, 80);
    for(var i=0;i<lim;i++){
      var joined = (rows[i]||[]).map(tidyCell).join('|');
      var hasDate = joined.indexOf('交易时间')>=0 || joined.indexOf('交易创建时间')>=0 || joined.indexOf('付款时间')>=0;
      var hasAmt  = joined.indexOf('金额')>=0;
      var hasKind = joined.indexOf('收/支')>=0 || joined.indexOf('收支')>=0;
      if(hasDate && hasAmt && hasKind) return i;
    }
    return -1;
  }
  // 关键词分类：先语义（吃饭/交通/…），渠道词兜底
  var BILL_CAT_RULES = [
    {cat:'吃饭', kw:['美团','饿了么','肯德基','麦当劳','星巴克','瑞幸','喜茶','蜜雪','餐饮','餐厅','咖啡','奶茶','火锅','烧烤','快餐','食堂','外卖','面包','蛋糕']},
    {cat:'交通', kw:['滴滴','高德','地铁','公交','出租','网约车','加油','中石化','中石油','停车','高速','etc','高铁','12306','火车','航空','机票','共享单车','哈啰','青桔','摩拜']},
    {cat:'购物', kw:['淘宝','天猫','京东','拼多多','唯品会','苏宁','优衣库','名创优品','商场','百货','便利店','超市']},
    {cat:'娱乐', kw:['电影','影院','游戏','腾讯视频','爱奇艺','优酷','哔哩','b站','网易云','ktv','健身','球馆','游泳','旅游','景区','门票','演出']},
    {cat:'房租', kw:['房租','租金','物业','水电','电费','水费','燃气','暖气','宽带','话费','流量']},
    {cat:'借出', kw:['借出','借给','垫付','代付','借款给','暂借','周转','垫资']},
    {cat:'微信支出', kw:['微信支付','财付通']},
    {cat:'支付宝支出', kw:['支付宝','蚂蚁']}
  ];
  function classifyBillText(text){
    var s=String(text==null?'':text).toLowerCase();
    if(!s) return '其他';
    for(var i=0;i<BILL_CAT_RULES.length;i++){
      var r=BILL_CAT_RULES[i];
      for(var j=0;j<r.kw.length;j++){
        if(s.indexOf(String(r.kw[j]).toLowerCase())>=0) return r.cat;
      }
    }
    return '其他';
  }
  function parseBillAmount(v){
    var s=String(v==null?'':v).replace(/[¥￥,，\s元圆"']/g,'');
    var n=parseFloat(s);
    return isFinite(n) ? Math.round(n*100)/100 : NaN;
  }
  // 退款 / 关闭 / 撤销的交易不入账（否则会和退款记录一起重复记账）
  function billStatusSkipped(status){
    return /已全额退款|已退款|退款成功|交易关闭|已关闭|已撤销|已取消/.test(String(status||''));
  }
  function importBillText(text, btn, opts){
    return importBillRows(parseCsvRows(text), btn, opts);
  }
  // 账单行 → 流水（去重优先用「外部单号」，没有单号时退回字段指纹）
  function importBillRows(rows, btn, opts){
    opts = opts || {};
    if(!db){ showToast('离线环境，无法导入','err'); return Promise.resolve(); }
    // 账单没有成员信息，必须已有身份才能归属。在登录门里导入会走到这里，
    // 提示要明确：先去上面选/建一个成员，再回来导。
    if(!state.u){
      showToast('请先在登录页选择或新建一位成员，再导入账单','err');
      return Promise.resolve();
    }
    btn = btn || $('l-import'); if(btn) btn.disabled=true;
    var hi = findBillHeaderRow(rows);
    if(hi < 0){
      setSync('error');
      showToast('没识别出账单表头：文件里要有含「交易时间 / 收\\u002F支 / 金额」的表头行','err');
      if(btn) btn.disabled=false;
      return Promise.resolve();
    }
    setSync('syncing');
    showToast('正在解析账单…');
    var head = (rows[hi]||[]).map(tidyCell);
    function col(){
      for(var a=0;a<arguments.length;a++){
        var want=arguments[a];
        for(var i=0;i<head.length;i++){ if(head[i].indexOf(want)===0) return i; }
      }
      return -1;
    }
    var cDate=col('交易时间','付款时间','交易创建时间');
    var cKind=col('收/支','收支');
    var cAmt=col('金额');
    var cParty=col('交易对方');
    var cItem=col('商品');
    var cStatus=col('当前状态','交易状态');
    var cNo=col('交易单号','交易号');
    var cType=col('交易类型','类型');
    if(cDate<0 || cAmt<0){
      setSync('error');
      showToast('账单缺少必要列（交易时间 / 金额）','err');
      if(btn) btn.disabled=false;
      return Promise.resolve();
    }
    var recs=[], bad=0, neutral=0, refund=0;
    for(var ri=hi+1; ri<rows.length; ri++){
      var row=rows[ri]; if(!row || !row.length) continue;
      var dateRaw=String(row[cDate]==null?'':row[cDate]).trim().replace('T',' ');
      var date=normalizeStamp(dateRaw);
      if(!/^\d{4}-\d{2}-\d{2}/.test(date)){ bad++; continue; }
      var kindRaw = cKind>=0 ? String(row[cKind]==null?'':row[cKind]).trim() : '';
      if(kindRaw && kindRaw!=='收入' && kindRaw!=='支出'){ neutral++; continue; }
      var amt = parseBillAmount(cAmt>=0 ? row[cAmt] : '');
      if(!isFinite(amt) || !(amt>0)){ bad++; continue; }
      var status = cStatus>=0 ? String(row[cStatus]==null?'':row[cStatus]) : '';
      if(billStatusSkipped(status)){ refund++; continue; }
      var party = cParty>=0 ? String(row[cParty]==null?'':row[cParty]).trim() : '';
      var item  = cItem>=0  ? String(row[cItem]==null?'':row[cItem]).trim()   : '';
      var typeName = cType>=0 ? String(row[cType]==null?'':row[cType]).trim() : '';
      var no = cNo>=0 ? String(row[cNo]==null?'':row[cNo]).trim() : '';
      var kind = (kindRaw==='收入') ? KIND_INCOME : KIND_EXPENSE;
      var cat = (kind===KIND_INCOME) ? (typeName || '其他') : classifyBillText(party+' '+item+' '+typeName);
      var note = [party, item].filter(function(x){ return !!x; }).join(' · ') || typeName || '';
      recs.push({date:date, kind:kind, cat:cat, amt:amt, note:note, no:no});
    }
    if(!recs.length){
      setSync('error');
      showToast('账单里没有可导入的记录（格式不符 '+bad+' 行、退款或关闭 '+refund+' 行、中性 '+neutral+' 行）','err');
      if(btn) btn.disabled=false;
      return Promise.resolve();
    }
    var dbs=[]; for(var cm in MONTH_ROUTE){ if(MONTH_ROUTE.hasOwnProperty(cm)) dbs.push({cm:cm,id:MONTH_ROUTE[cm]}); }
    var isLocal = (typeof DB_IS_LOCAL!=='undefined') && DB_IS_LOCAL;
    if(isLocal) dbs=[{cm:curMonth(), id:flowDbOf(curMonth())}];
    var all=[], seenId={}, CONC=5;
    function runBatch(s){
      var slice=dbs.slice(s, s+CONC);
      if(!slice.length) return Promise.resolve();
      return Promise.all(slice.map(function(d){
        return db.query({databaseId:d.id, pageSize: isLocal?100000:200}).then(function(x){ return x.results||[]; }).catch(function(){ return []; });
      })).then(function(arrs){
        arrs.forEach(function(L){ L.forEach(function(x){
          if(!x) return;
          var kk = x._id || x.record_id || '';
          if(kk){ if(seenId[kk]) return; seenId[kk]=1; }
          all.push(x);
        }); });
        return runBatch(s+CONC);
      });
    }
    return runBatch(0).then(function(){
      // 与备份导入用同一套归一化口径建索引，保证「先导账单、再导备份」也不会重复。
      var byNo={}, byFp={};
      all.forEach(function(x){
        var no=dedupNo(x['外部单号']);
        if(no) byNo[no]=1;
        byFp[flowFingerprint(x['日期'], kindOf(x), num(x['金额']), catOf(x), x['备注'])]=1;
      });
      var toAdd=[], dup=0;
      recs.forEach(function(rec){
        var no=dedupNo(rec.no);
        var fp=flowFingerprint(rec.date, rec.kind, rec.amt, rec.cat, rec.note);
        // 判重规则与 importFlowRows 保持一致：单号命中 或 指纹命中 → 跳过
        if((no && byNo[no]) || byFp[fp]){ dup++; return; }
        if(no) byNo[no]=1;
        byFp[fp]=1;
        toAdd.push(rec);
      });
      if(!toAdd.length){
        return {inserted:0, dup:dup, bad:bad, refund:refund, neutral:neutral, failed:0};
      }
      var inserted=0, failed=0, idx=0;
      function worker(){
        if(idx>=toAdd.length) return Promise.resolve();
        var rec=toAdd[idx++];
        var props=flowProps(rec.date, rec.amt, rec.cat, rec.note, rec.kind);
        if(rec.no) props['外部单号']={ text: rec.no };
        return addRecordSafe(flowDbOf(rec.date.slice(0,7)), props)
          .then(function(){ inserted++; })
          .catch(function(e){ console.error('[bill add]', e); failed++; })
          .then(function(){ return worker(); });
      }
      var ws=[];
      for(var w=0; w<Math.min(CONC, toAdd.length); w++){ ws.push(worker()); }
      return Promise.all(ws).then(function(){
        return {inserted:inserted, dup:dup, bad:bad, refund:refund, neutral:neutral, failed:failed};
      });
    }).then(function(st){
      setSync('synced');
      var msg='账单导入完成：新增 '+st.inserted+' 笔';
      if(st.dup) msg += '，重复跳过 '+st.dup+' 笔';
      if(st.refund) msg += '，退款/关闭跳过 '+st.refund+' 笔';
      if(st.neutral) msg += '，中性(转账等) '+st.neutral+' 笔';
      if(st.bad) msg += '，格式不符 '+st.bad+' 行';
      if(st.failed) msg += '，失败 '+st.failed+' 笔';
      // 全部都是重复时给一句明确结论
      if(!st.inserted && st.dup && !st.bad && !st.failed){
        msg = '这份账单之前已经导入过，已自动去重跳过 '+st.dup+' 笔，没有重复记录产生';
      }
      showToast(msg, st.failed ? 'err' : undefined);
      if(st.inserted) return reloadRange();
    }).catch(function(e){
      console.error('[importBillRows]', e);
      setSync('error');
      showToast('账单导入失败：'+((e&&e.message)||'未知错误'),'err');
    }).then(function(){ if(btn) btn.disabled=false; });
  }
  // 智能分发：xlsx 走本账本备份导入；文本/CVS 走账单导入。微信也有 xlsx 版账单，会在备份导入里被识别。
  function importFileSmart(file, btn, opts){
    btn = btn || $('l-import');
    return readFileBuffer(file).then(function(buf){
      var bytes=new Uint8Array(buf);
      var isZip = bytes.length>1 && bytes[0]===0x50 && bytes[1]===0x4B;
      if(isZip) return importFlowExcel(file, btn, opts);
      return importBillText(decodeBillText(bytes), btn, opts);
    }).catch(function(e){
      console.error('[importFileSmart]', e);
      setSync('error');
      showToast('导入失败：'+((e&&e.message)||'未知错误'),'err');
      if(btn) btn.disabled=false;
    });
  }
  // 云端 addRecord 的字段名各调用点写法不一（properties / record），两个都兜一下
  function addRecordSafe(dbId, props){
    return db.addRecord({databaseId:dbId, properties:props}).catch(function(){
      return db.addRecord({databaseId:dbId, record:props});
    });
  }
  // 导入「成员」sheet → 写成员表（按 u 去重，已存在的跳过）
  function importMembersSheet(sheet){
    var none={added:0, skip:0, firstU:'', names:[]};
    if(!sheet || !sheet.rows || sheet.rows.length<2) return Promise.resolve(none);
    var rows=[];
    for(var i=1;i<sheet.rows.length;i++){
      var r=sheet.rows[i]; if(!r || !r.length) continue;
      var u=String(r[0]==null?'':r[0]).trim();
      var nm=String(r[1]==null?'':r[1]).trim();
      if(!u && !nm) continue;
      if(!u) u=genU();
      rows.push({ u:u, name:nm||u,
                  acct:String(r[2]==null?'':r[2]).trim(),
                  bind:String(r[3]==null?'':r[3]).trim(),
                  desc:String(r[4]==null?'':r[4]).trim() });
    }
    if(!rows.length) return Promise.resolve(none);
    return db.query({databaseId:DB_USER, pageSize:200}).then(function(res){
      var existU={};
      (res.results||[]).forEach(function(m){ if(m && m.u) existU[String(m.u)]=1; });
      var toAdd=[];
      rows.forEach(function(m){ if(existU[m.u]) return; existU[m.u]=1; toAdd.push(m); });
      if(!toAdd.length) return {added:0, skip:rows.length, firstU:rows[0].u, names:[]};
      var added=0;
      return Promise.all(toAdd.map(function(m){
        var props={ 'u':{text:m.u}, '姓名':{text:m.name}, '说明':{text:m.desc} };
        if(m.acct) props['平台账号']={text:m.acct};
        if(m.bind) props['绑定时间']={text:m.bind};
        return addRecordSafe(DB_USER, props)
          .then(function(){ added++; })
          .catch(function(e){ console.error('[import member]', e); });
      })).then(function(){
        return { added:added, skip:rows.length-toAdd.length, firstU:toAdd[0].u,
                 names:toAdd.map(function(m){ return m.name; }) };
      });
    }).catch(function(e){
      console.error('[importMembersSheet]', e);
      return {added:0, skip:0, firstU:rows[0].u, names:[]};
    });
  }
  // 导入「设置」sheet → 写设置表（归到指定成员 u）
  function importSettingsSheet(sheet, u){
    if(!sheet || !sheet.rows || sheet.rows.length<2) return Promise.resolve({saved:false});
    var kv={};
    for(var i=1;i<sheet.rows.length;i++){
      var r=sheet.rows[i]; if(!r || !r.length) continue;
      var k=String(r[0]==null?'':r[0]).trim();
      if(!k || !DEFAULT_SETTINGS.hasOwnProperty(k)) continue;
      kv[k] = r[1]==null ? '' : r[1];
    }
    if(!Object.keys(kv).length) return Promise.resolve({saved:false});
    var props=toProps(kv);
    if(u) props.u={ text:u };
    return db.query({databaseId:DB_SETTINGS, pageSize:200}).then(function(res){
      var hit=null;
      (res.results||[]).forEach(function(rec){ if(String(rec.u||'')===String(u||'')) hit=rec; });
      if(hit && hit._id){
        return db.updateRecord({databaseId:DB_SETTINGS, recordId:hit._id, properties:props})
          .then(function(){ return {saved:true, updated:true}; });
      }
      return addRecordSafe(DB_SETTINGS, props).then(function(){ return {saved:true, updated:false}; });
    }).catch(function(e){
      console.error('[importSettingsSheet]', e);
      return {saved:false};
    });
  }
  // 导入「流水」sheet → 校验 → 去重 → 按月份写回
  function importFlowRows(flowSheet){
    if(!flowSheet || !flowSheet.rows || flowSheet.rows.length<2){
      return Promise.resolve({inserted:0, dup:0, bad:0, failed:0});
    }
    var rows=[], bad=0;
    for(var i=1;i<flowSheet.rows.length;i++){
      var row=flowSheet.rows[i]; if(!row || !row.length) continue;
      var dateRaw=String(row[0]==null?'':row[0]).trim().replace('T',' ');
      var date=normalizeStamp(dateRaw);
      var kind=String(row[1]==null?'':row[1]).trim();
      var cat=String(row[2]==null?'':row[2]).trim();
      var amt=Number(row[3]);
      var note=row[4]==null?'':String(row[4]);
      var u=row[5]==null?'':String(row[5]);
      var no=row[6]==null?'':String(row[6]);
      if(!/^\d{4}-\d{2}-\d{2}/.test(date)){ bad++; continue; }
      if(!isFinite(amt) || !(amt>0)){ bad++; continue; }
      if(kind!==KIND_INCOME && kind!==KIND_EXPENSE){ bad++; continue; }
      rows.push({date:date, kind:kind, cat:cat, amt:amt, note:note, u:u, no:no});
    }
    if(!rows.length) return Promise.resolve({inserted:0, dup:0, bad:bad, failed:0, flowU:''});
    var dbs=[]; for(var cm in MONTH_ROUTE){ if(MONTH_ROUTE.hasOwnProperty(cm)) dbs.push({cm:cm,id:MONTH_ROUTE[cm]}); }
    var isLocal = (typeof DB_IS_LOCAL!=='undefined') && DB_IS_LOCAL;
    if(isLocal) dbs=[{cm:curMonth(), id:flowDbOf(curMonth())}];
    var exist={}, existNo={}, all=[], seen={}, CONC=5;
    function runBatch(startI){
      var slice=dbs.slice(startI,startI+CONC);
      if(!slice.length) return Promise.resolve();
      return Promise.all(slice.map(function(d){
        return db.query({databaseId:d.id, pageSize: isLocal?100000:200}).then(function(r){ return r.results||[]; }).catch(function(){ return []; });
      })).then(function(arrs){
        arrs.forEach(function(L){ L.forEach(function(r){
          if(!r) return;
          var kk = r._id || r.record_id || '';
          if(kk){ if(seen[kk]) return; seen[kk]=1; }
          all.push(r);
        }); });
        return runBatch(startI+CONC);
      });
    }
    return runBatch(0).then(function(){
      // 建两份索引：字段指纹 + 外部单号。
      // 单号优先（账单类记录唯一性强），没有单号的退回字段指纹。
      all.forEach(function(r){
        exist[flowFingerprint(r['日期'], kindOf(r), num(r['金额']), catOf(r), r['备注'])]=1;
        var no=dedupNo(r['外部单号']);
        if(no) existNo[no]=1;
      });
      var toAdd=[], dup=0;
      rows.forEach(function(r){
        var no=dedupNo(r.no);
        var k=flowFingerprint(r.date, r.kind, r.amt, r.cat, r.note);
        // 判重规则（任一命中即为重复）：
        //   ① 有单号且单号已存在 → 重复。这是最强判据：同笔交易即使备注/分类被改过也不会重复入账。
        //   ② 字段指纹已存在（日期/收支/金额/分类/备注全同）→ 重复。
        //      同时覆盖「无单号」和「有单号但库里那条当初没记单号」两种情形，
        //      避免同一笔既被当账单导入过、又被当备份导入而重复记两笔。
        if((no && existNo[no]) || exist[k]){
          dup++; return;
        }
        if(no) existNo[no]=1;
        exist[k]=1;
        toAdd.push(r);
      });
      // flowU：本文件里流水实际归属的成员 u（取第一条有 u 的）。
      // 返回给上层用于「导入后自动切进对应成员」—— 否则用户看不到刚导入的数据。
      var flowU='';
      for(var fi=0; fi<rows.length; fi++){ if(rows[fi].u){ flowU=rows[fi].u; break; } }
      if(!toAdd.length) return {inserted:0, dup:dup, bad:bad, failed:0, flowU:flowU};
      var inserted=0, failed=0, idx=0;
      function worker(){
        if(idx>=toAdd.length) return Promise.resolve();
        var r=toAdd[idx++];
        var props=flowProps(r.date, r.amt, r.cat, r.note, r.kind);
        if(r.u) props.u={ text:r.u };
        if(r.no) props['外部单号']={ text:r.no };
        return addRecordSafe(flowDbOf(r.date.slice(0,7)), props)
          .then(function(){ inserted++; })
          .catch(function(e){ console.error('[import add]', e); failed++; })
          .then(function(){ return worker(); });
      }
      var ws=[];
      for(var w=0; w<Math.min(CONC, toAdd.length); w++){ ws.push(worker()); }
      return Promise.all(ws).then(function(){ return {inserted:inserted, dup:dup, bad:bad, failed:failed, flowU:flowU}; });
    });
  }
  // 导入备份（成员 + 设置 + 流水）。顺序很重要：成员先落地，否则流水按 u 归属后看不见。
  function importFlowExcel(file, btn, opts){
    opts = opts || {};
    if(!db){ showToast('离线环境，无法导入','err'); return Promise.resolve(); }
    btn = btn || $('l-import'); if(btn) btn.disabled=true;
    setSync('syncing');
    showToast('正在解析文件…');
    return readFileBuffer(file).then(readXlsx).then(function(sheets){
      var flowSheet=null, memSheet=null, setSheet=null;
      sheets.forEach(function(s){
        if(s.name==='流水') flowSheet=s;
        else if(s.name==='成员') memSheet=s;
        else if(s.name==='设置') setSheet=s;
      });
      if(!flowSheet && !memSheet && !setSheet){
        // 可能是微信 / 支付宝导出的 xlsx 账单：取第一个有内容的工作表按账单解析
        var first = null;
        sheets.forEach(function(s){ if(!first && s.rows && s.rows.length) first = s; });
        if(first && findBillHeaderRow(first.rows) >= 0){
          if(btn) btn.disabled=false;
          return importBillRows(first.rows, btn, opts);
        }
        throw new Error('文件里没有可导入的工作表（需要「流水」/「成员」/「设置」，或微信/支付宝账单）');
      }
      return importMembersSheet(memSheet).then(function(memSt){
        var targetU = memSt.firstU || state.u || '';
        return importSettingsSheet(setSheet, targetU).then(function(setSt){
          return importFlowRows(flowSheet).then(function(fSt){
            return { mem:memSt, set:setSt, flow:fSt };
          });
        });
      });
    }).then(function(st){
      setSync('synced');
      var msg='导入完成：新增 '+st.flow.inserted+' 条流水';
      if(st.mem.added) msg += '、'+st.mem.added+' 位成员';
      if(st.set.saved) msg += '、设置';
      if(st.flow.dup) msg += '，重复跳过 '+st.flow.dup+' 条';
      if(st.flow.bad) msg += '，格式不符 '+st.flow.bad+' 条';
      if(st.flow.failed) msg += '，失败 '+st.flow.failed+' 条';
      // 全部都是重复时给一句明确结论，避免用户以为「导入成功但没数据」
      if(!st.flow.inserted && st.flow.dup && !st.flow.bad && !st.flow.failed){
        msg = '这些数据之前已经导入过，已自动去重跳过 '+st.flow.dup+' 条，没有重复记录产生';
      }
      showToast(msg, st.flow.failed ? 'err' : undefined);
      // 刷新成员列表：在登录门里导入完，立刻就能选中导入进来的成员
      return loadUsers().then(function(){
        var g=$('gate');
        if(g && !g.hidden){
          renderUserList();
          // 关键：导入进来的流水归属「文件里那个成员」的 u，与当前身份（往往为空）不同。
          // 若只刷新列表让用户自己点，用户很可能直接去「创建」一个新成员 ——
          // 那他的 state.u 就是新成员的 u，永远看不到刚导入的数据（表现为「导入成功但首页空白」）。
          // 所以这里直接切进数据所属成员：数据立刻可见，用户也不会有机会建错人。
          var tu = st.mem.firstU || st.flowU || '';
          if(tu){
            var tip = (st.mem.firstU && st.mem.names && st.mem.names[0])
              ? '已导入成员「'+st.mem.names[0]+'」，正在进入…'
              : '数据已导入，正在进入对应成员…';
            setTimeout(function(){ showToast(tip); }, 1400);
            pickUser(tu);
            return;
          }
          // 文件里没有成员信息（纯流水导入）—— 只能提示用户选一个
          if(st.mem.added && st.mem.names && st.mem.names.length){
            setTimeout(function(){
              showToast('已导入成员「'+st.mem.names[0]+'」，选它进入即可看到数据');
            }, 1700);
          }
          return;
        }
        // 已进入账本时导入：数据在「导入成员」的 u 下，若与当前成员不是同一个，
        // 页面不会自动显示（查询按 state.u 过滤）—— 直接切过去，否则用户会以为「导入成功但没数据」
        if(st.mem.firstU && String(st.mem.firstU)!==String(state.u)){
          var nm=(st.mem.names && st.mem.names[0]) || '';
          var who=nm ? '「'+nm+'」' : '';
          setTimeout(function(){ showToast('数据属于成员'+who+'，已自动切换过去'); }, 1700);
          switchToUser(st.mem.firstU);
          return;
        }
        if(st.flow.inserted) return reloadRange();
      });
    }).catch(function(e){
      console.error('[importFlowExcel]', e);
      setSync('error');
      showToast('导入失败：'+((e&&e.message)||'未知错误'),'err');
    }).then(function(){ if(btn) btn.disabled=false; });
  }
  function onImportClick(btn, opts){
    pickFile('.xlsx,.xlsm,.csv,.txt').then(function(f){ if(f) importFileSmart(f, btn, opts); });
  }
  /* ---------- 自动记账：解析支付通知 ---------- */
  var PAY_APP_NAMES = {
    'com.tencent.mm':'微信',
    'com.tencent.mobileqq':'QQ',
    'com.eg.android.AlipayGphone':'支付宝',
    'com.sankuai.meituan':'美团',
    'com.sankuai.meituan.takeoutnew':'美团',
    'com.unionpay':'云闪付',
    'com.unionpay.tsmservice':'云闪付',
    'com.unionpay.mobile.android.phone':'云闪付',
    'cmb.pb':'招商银行',
    'com.icbc':'工商银行',
    'com.chinamworld.main':'建设银行',
    'com.android.bankabc':'农业银行',
    'com.chinamworld.bocmbci':'中国银行',
    'com.bankcomm.Bankcomm':'交通银行',
    'com.yitong.mbank.psbc':'邮储银行',
    'com.pingan.paces.ccms':'平安银行',
    'cmbc.com.cn':'民生银行',
    'cn.com.spdb.mobilebank.per':'浦发银行',
    'com.cgbchina.xpt':'广发银行',
    'com.android.cebbank':'光大银行',
    'com.bank.ecitic':'中信银行',
    'com.allinfinance.yillionb2c':'银联'
  };
  var AUTO_PAUSED_KEY = 'wb_ledger_auto_paused';
  var AUTO_PENDING_KEY = 'wb_ledger_auto_pending';
  var AUTO_SEEN_KEY = 'wb_ledger_auto_seen';
  var AUTO_CONF_AUTO = 80;   // 置信度 >= 80 自动入账
  var AUTO_CONF_SKIP = 45;   // 方向明确但低于此 → 视为噪声忽略
  var autoGranted = false, autoConnected = false, autoQueue = 0, autoSupported = false, autoLog = [], autoRecent = {};
  function billPlugin(){
    try{ return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.BillListener) || null; }
    catch(e){ return null; }
  }
  function autoIsPaused(){
    try{ return localStorage.getItem(AUTO_PAUSED_KEY) === '1'; }catch(e){ return false; }
  }
  function autoSetPaused(v){
    try{ localStorage.setItem(AUTO_PAUSED_KEY, v ? '1' : '0'); }catch(e){}
  }
  // §3.3 金额识别：提取所有候选 + 上下文评分，选最高可信金额（禁止只取第一个数字）。
  // 核心原则：紧跟「元/圆/块」或前面带「¥/￥/金额/实付/付款金额…」的才是金额；
  // 裸数字（如昵称「97论月」里的 97）一律极低分，避免把名字里的数字当金额。
  // §3.4 上下文关联（近似）：金额离交易关键词越近得分越高（无 AccessibilityService，只能用文本距离近似）。
  function pickAmountFromText(txt){
    var s = String(txt||'').replace(/\s+/g,' ');
    var RE = /([0-9][0-9,]*(?:\.[0-9]{1,2})?)(?![0-9月日年号时点分秒%折:/\-：])/g;
    var KW = ['实付','支付','付款','消费','扣款','收款','到账','入账','退款','转账','支出','收入'];
    var cands = [], m;
    while((m = RE.exec(s))){
      var n = Math.round(parseFloat(String(m[1]).replace(/,/g,''))*100)/100;
      if(!isFinite(n) || n<=0 || n>=100000000) continue;
      var prev = m.index>0 ? s.charAt(m.index-1) : '';
      if(/[0-9:/\-：.]/.test(prev)) continue;   // 前面是数字/冒号/斜杠/短横 → 日期时间的一部分，跳过
      var before = s.slice(Math.max(0, m.index-10), m.index);
      var after = s.slice(m.index + m[0].length, m.index + m[0].length + 6);
      var score = 0;
      var hasUnit = /(元|圆|块)/.test(after);                  // 紧跟货币单位
      var hasSymbol = /(人民币|RMB|CNY|¥|￥)/.test(before);    // 前面带币种
      var hasAmtKw = /(实付|付款金额|支付金额|交易金额|收款到账|到账金额|入账|金额)/.test(before);
      if(hasAmtKw) score += 100;
      else if(hasSymbol) score += 90;
      else if(hasUnit) score += 80;
      else score += 5;                                        // 裸数字 → 极低分
      // 有货币上下文时，离交易关键词越近越可信
      if(hasUnit || hasSymbol || hasAmtKw){
        var best = 999;
        for(var i=0;i<KW.length;i++){
          var idx = s.indexOf(KW[i]);
          if(idx >= 0 && Math.abs(idx - m.index) < best) best = Math.abs(idx - m.index);
        }
        if(best < 6) score += 25;
        else if(best < 15) score += 12;
        else if(best < 30) score += 5;
      }
      // 低可信金额词降分（优惠/红包/余额/累计等）
      if(/(优惠|红包|余额|累计|积分|返现|立减|补贴|原价|总价|商品金额|订单金额)/.test(before)) score -= 60;
      cands.push({amt:n, score:score, idx:m.index});
    }
    if(!cands.length) return 0;
    cands.sort(function(a,b){ return (b.score-a.score) || (a.idx-b.idx); });
    return cands[0].amt;
  }
  // §3.2 一级黑名单：直接忽略（不记账、不进待确认）
  function billHardSkip(txt){
    return /(充值|提现|身份验证|实名认证|支付失败|扣款失败|交易失败|转账失败|失败|验证码|登录|绑定)/.test(txt);
  }
  // §3.2 二级风险词：命中只降信，不直接丢弃
  function billRiskCount(txt){
    var risk = ['红包','优惠','活动','积分','奖励','返现','立减','补贴','额度','还款提醒','账单提醒','安全提醒','到期','中奖','领取'];
    var n = 0;
    for(var i=0;i<risk.length;i++){ if(txt.indexOf(risk[i]) >= 0) n++; }
    return n;
  }
  // §5 文本指纹（归一化后简单 hash），用于去重
  function billFingerprint(txt){
    var s = String(txt||'').replace(/\s+/g,'').replace(/[¥￥,，:：]/g,'');
    var h = 0;
    for(var i=0;i<s.length;i++){ h = ((h<<5)-h) + s.charCodeAt(i); h |= 0; }
    return (h>>>0).toString(36);
  }
  // 收支方向：先看无歧义的强信号，再看动词。返回 'in' / 'out' / 'unknown'
  // 关键点：「付款方」「收款方」是角色标签，不能当作收支动词（曾导致支付宝收款被记成支出）。
  // 方向不明时返回 'unknown'，交给用户确认，绝不默认记成支出（宁可确认，不可错记）。
  function pickDirection(txt){
    var hasInc = /(到账|入账|收入|退款|退回|退还|转入|收到|收款成功|收款到账|已收款|已收钱|收钱|已领取|领取成功|领取了|已收取|收取成功|已存入|存入零钱|向你(付款|转账|支付))/.test(txt);
    var hasExp = /(支付成功|已支付|付款成功|已付款|已扣款|扣款|消费|支出|转出|付款给|代扣|自动扣款|实付)/.test(txt);
    if(hasInc && !hasExp) return 'in';
    if(hasExp && !hasInc) return 'out';
    if(hasInc && hasExp) return /(到账|入账|退款|退回|退还|转入|收入)/.test(txt) ? 'in' : 'unknown';
    return 'unknown';
  }
  // 微信/支付宝转账·红包：只有「已收取」后才记录（未收取时红包金额随机、转账未到账，金额不可靠）
  function isPendingReceive(txt){
    // 已收款/已领取/已到账等「钱已到手」信号 → 不是待收取
    if(/(已收款|已收钱|收款成功|收钱成功|已领取|领取成功|领取了|已收取|收取成功|已确认收款|已存入|存入零钱|已到账|到账成功|已入账)/.test(txt)) return false;
    // 「未收取」信号
    return /(向你转账|向你付款|向你支付|转账给你|转给你|发来.*红包|发来红包|收到.*红包|待领取|待收款|待确认|确认收款|红包)/.test(txt);
  }
  // 置信度 0-100（对应优化文档 §6）：应用 20 / 场景词 20 / 方向 20 / 金额 20 / 上下文 15 / 去重 5（在调用处补）/ 二级风险词逐项 -5
  function scoreBill(app, txt, dir, merchant){
    var sc = 0;
    if(app) sc += 20;                                   // 应用匹配
    if(/(支付成功|付款成功|已支付|已付款|收款成功|收款到账|已到账|到账通知|已扣款|交易成功|已完成)/.test(txt)) sc += 20;
    else sc += 10;                                      // 能走到这里说明已命中交易词（解析关卡）
    if(dir==='in' || dir==='out') sc += 20;             // 方向明确
    if(/(实付|付款金额|支付金额|收款到账|到账金额|交易金额)/.test(txt)) sc += 20;
    else if(/(优惠|红包|余额|累计|积分|返现|立减|补贴)/.test(txt)) sc += 5;
    else sc += 10;
    if(merchant) sc += 15;                              // 上下文关联（有商户）
    sc -= billRiskCount(txt) * 5;                       // §3.2 二级风险词逐项降信
    if(sc < 0) sc = 0;
    return sc;
  }
  // 把一条通知文本解析成一笔账；识别不了返回 null
  function parsePayNotification(ev){
    var app = PAY_APP_NAMES[String(ev && ev.pkg || '')];
    if(!app) return null;
    var txt = String((ev && ev.full) || '').replace(/\s+/g,' ').trim();
    if(!txt) return null;
    // §3.1 交易场景：必须含交易动词（充值/提现也放进来，由一级黑名单兜住）
    if(!/(支付|付款|消费|扣款|支出|收入|到账|收款|收钱|退款|转入|转出|交易|转账|入账|充值|提现)/.test(txt)) return null;
    // §3.2 一级黑名单：充值/提现/失败/登录/验证码等直接忽略
    if(billHardSkip(txt)) return null;
    var amt = pickAmountFromText(txt);
    if(!amt) return null;
    // 商户 / 对手方（按可信度从高到低尝试）
    var merchant = '';
    var SELF = /^(你|您|我|本人|自己|对方)$/;
    // ①「张三 向你付款 / 转账」→ 对方是付款人
    var m5 = txt.match(/([^\s，,。.；;：:]{2,20}?)\s*(?:向你|向您|给你)(?:付款|转账|支付)/);
    if(m5 && !SELF.test(m5[1])) merchant = m5[1];
    // ②「来自 张三」「付款方：张三」「收款方：星巴克」
    if(!merchant){
      var m4 = txt.match(/(?:来自|付款方|收款方|对方)[：:\s]*([^\s，,。.；;：:]{2,20})/);
      if(m4 && !SELF.test(m4[1])) merchant = m4[1].replace(/[（(].*$/, '');
    }
    // ③「向/付给/转给 商户」
    if(!merchant){
      var mm = txt.match(/(?:向|付给|付款给|转给)\s*([^\s，,。.；;：:]{2,20})/);
      if(mm && !SELF.test(mm[1])) merchant = mm[1].replace(/[（(].*$/, '').replace(/(转账|付款|支付|消费|收款|汇款|转入|转出|红包)$/, '');
    }
    if(!merchant){
      var m2 = txt.match(/(?:在|于)\s*([^\s，,。.；;：:]{2,20}?)(?:消费|支付|付款)/);
      if(m2) merchant = m2[1];
    }
    if(!merchant){
      var m3 = txt.match(/([^\s，,。.；;：:]{2,16})(?:商户|店铺|平台)/);
      if(m3) merchant = m3[1];
    }
    var dir = pickDirection(txt);
    // 微信/支付宝「未收取」的转账/红包：等点击收取后再记（金额此刻不可靠）
    if(dir === 'in' && isPendingReceive(txt)){
      return { skip:'pending-receive', reason:'未收取', app:app, text:txt, merchant:merchant, amt:amt, dir:dir };
    }
    var kind = (dir==='in') ? KIND_INCOME : ((dir==='out') ? KIND_EXPENSE : null);
    var cat = (dir==='in') ? '其他' : classifyBillText(merchant + ' ' + txt);
    var conf = scoreBill(app, txt, dir, merchant);
    var p = { app:app, amt:amt, kind:kind, dir:dir, merchant:merchant, cat:cat, text:txt, conf:conf };
    platformAdjust(app, txt, p);
    return p;
  }
  // §4 平台专项：支付宝/云闪付 无明确「成功」态 → 压到待确认（禁止「支付+任意数字」当唯一条件）
  function platformAdjust(app, txt, p){
    if(!p) return p;
    if(app === '支付宝' || app === '云闪付'){
      if(p.dir === 'out' && !/(支付成功|付款成功|交易成功|成功|已完成)/.test(txt)){
        p.conf = Math.min(p.conf || 0, 70);
      }
    }
    return p;
  }
  // §5 去重：金额+方向+商户+应用+文本指纹，内存 5 分钟 + 持久化 10 分钟（跨重启）
  function autoIsDup(p){
    var now = Date.now();
    var key = [p.amt.toFixed(2), p.dir, p.merchant, p.app, billFingerprint(p.text)].join('|');
    if(autoRecent[key] && now - autoRecent[key] < 5*60*1000) return true;
    var seen = autoSeenLoad();
    var hit = !!(seen[key] && now - seen[key] < 10*60*1000);
    seen[key] = now;
    for(var k in seen){ if(seen[k] && now - seen[k] > 10*60*1000) delete seen[k]; }
    autoSeenSave(seen);
    autoRecent[key] = now;
    for(var k in autoRecent){ if(autoRecent[k] && now - autoRecent[k] > 10*60*1000) delete autoRecent[k]; }
    return hit;
  }
  function autoSeenLoad(){ try{ return JSON.parse(localStorage.getItem(AUTO_SEEN_KEY)||'{}'); }catch(e){ return {}; } }
  function autoSeenSave(o){ try{ localStorage.setItem(AUTO_SEEN_KEY, JSON.stringify(o)); }catch(e){} }
  function autoAddLog(item){
    autoLog.unshift(item);
    if(autoLog.length > 30) autoLog = autoLog.slice(0,30);
    renderAutoLog();
  }
  function renderAutoLog(){
    var box = $('auto-log'); if(!box) return;
    if(!autoLog.length){ box.innerHTML=''; return; }
    box.innerHTML = '';
    autoLog.slice(0,12).forEach(function(x, i){
      var row = document.createElement('div');
      row.className = 'it' + (x.skip ? ' skip' : '');
      row.title = '点击查看详情';
      var tm = document.createElement('span'); tm.className='tm'; tm.textContent = x.time || '';
      var tx = document.createElement('span'); tx.className='tx'; tx.textContent = x.label || '';
      var am = document.createElement('span');
      am.className = 'am ' + (x.skip ? '' : (x.kind===KIND_INCOME ? 'pos' : 'neg'));
      am.textContent = x.skip ? (x.reason || '已跳过') : ((x.kind===KIND_INCOME?'+':'-') + fmt(x.amt));
      var go = document.createElement('span'); go.className='go'; go.textContent='\u203a';
      row.appendChild(tm); row.appendChild(tx); row.appendChild(am); row.appendChild(go);
      row.onclick = function(){ openAutoDetail(autoLog[i]); };
      box.appendChild(row);
    });
  }

  /* ---------- 待确认清单：方向不明 / 置信不足的记账，持久化，用户确认 ---------- */
  function pendingLoad(){ try{ return JSON.parse(localStorage.getItem(AUTO_PENDING_KEY)||'[]'); }catch(e){ return []; } }
  function pendingSave(list){ try{ localStorage.setItem(AUTO_PENDING_KEY, JSON.stringify(list.slice(0,50))); }catch(e){} }
  function pendingCount(){ return pendingLoad().length; }
  function pendingAdd(item){
    var list = pendingLoad();
    list.unshift(item);
    pendingSave(list);
    renderPending();
  }
  function pendingRemove(id){
    var list = pendingLoad().filter(function(x){ return x.id !== id; });
    pendingSave(list);
    renderPending();
  }
  function renderPending(){
    var box = $('auto-pending'); if(!box) return;
    var list = pendingLoad();
    box.innerHTML = '';
    if(!list.length){ box.hidden = true; renderAutoCard(); return; }
    box.hidden = false;
    var h = document.createElement('div'); h.className = 'ap-h';
    h.textContent = '⚠ 待确认 · ' + list.length + ' 笔（点按钮决定记不记）';
    box.appendChild(h);
    list.forEach(function(it){
      var node = document.createElement('div'); node.className = 'ap-it';
      var l1 = document.createElement('div'); l1.className = 'ap-line1';
      var amt = document.createElement('b'); amt.className = 'ap-amt';
      amt.textContent = '¥' + (it.amt ? fmt(it.amt) : '0');
      var tag = document.createElement('span'); tag.className = 'ap-tag';
      tag.textContent = it.dirHint==='in' ? '疑似收入' : (it.dirHint==='out' ? '疑似支出' : '方向不明');
      var mer = document.createElement('span'); mer.className = 'ap-mer';
      mer.textContent = it.merchant || it.app || '';
      l1.appendChild(amt); l1.appendChild(tag); l1.appendChild(mer);
      var l2 = document.createElement('div'); l2.className = 'ap-line2';
      l2.textContent = String(it.text || '');
      var acts = document.createElement('div'); acts.className = 'ap-acts';
      var bExp = document.createElement('button'); bExp.className = 'btn sm'; bExp.textContent = '记支出';
      var bInc = document.createElement('button'); bInc.className = 'btn sm ghost'; bInc.textContent = '记收入';
      var bIgn = document.createElement('button'); bIgn.className = 'btn sm ghost'; bIgn.textContent = '忽略';
      bExp.onclick = function(){ pendingConfirm(it.id, KIND_EXPENSE); };
      bInc.onclick = function(){ pendingConfirm(it.id, KIND_INCOME); };
      bIgn.onclick = function(){ pendingIgnore(it.id); };
      acts.appendChild(bExp); acts.appendChild(bInc); acts.appendChild(bIgn);
      node.appendChild(l1); node.appendChild(l2); node.appendChild(acts);
      box.appendChild(node);
    });
    renderAutoCard();
  }
  function pendingFind(id){
    var list = pendingLoad();
    for(var i=0;i<list.length;i++){ if(list[i].id === id) return list[i]; }
    return null;
  }
  function pendingConfirm(id, kind){
    var it = pendingFind(id);
    if(!it) return;
    if(!state.u){ showToast('请先选择成员','err'); return; }
    var stamp = nowStamp();
    var cat = kind===KIND_INCOME ? '其他' : classifyBillText((it.merchant||'') + ' ' + (it.text||''));
    var note = it.merchant || it.app;
    setSync('syncing');
    addRecordSafe(flowDbOf(stamp.slice(0,7)), flowProps(stamp, it.amt, cat, note, kind))
      .then(function(res){
        var rid = (res && (res.recordId || res.id)) || '';
        pendingRemove(it.id);
        autoAddLog({ time:nowHm(), stamp:stamp, app:it.app, raw:it.text, merchant:it.merchant, cat:cat,
                     label:it.app+' · '+note+' · '+cat, amt:it.amt, kind:kind, rid:rid });
        showToast('已确认记账 '+(kind===KIND_INCOME?'+':'-')+fmt(it.amt));
        return reloadRange().then(function(){ refreshAll(); setSync('synced'); });
      })
      .catch(function(e){ console.error('[pendingConfirm]', e); setSync('error'); showToast('记账失败，请重试','err'); });
  }
  function pendingIgnore(id){
    var it = pendingFind(id);
    if(!it) return;
    pendingRemove(it.id);
    autoAddLog({ time:nowHm(), stamp:nowStamp(), app:it.app, raw:it.text,
                 label:(it.merchant||it.app)+' · 已忽略', skip:true, reason:'已忽略' });
    showToast('已忽略这条');
  }
  /* ---------- 自动记账：详情弹层 / 手动纠正 ---------- */
  var autoSheetEl = null;
  function autoSheet(){
    if(autoSheetEl) return autoSheetEl;
    var mask = document.createElement('div'); mask.className='sheet'; mask.hidden = true;
    var box = document.createElement('div'); box.className='sheet-box';
    mask.appendChild(box);
    mask.onclick = function(e){ if(e.target === mask) closeAutoDetail(); };
    document.body.appendChild(mask);
    autoSheetEl = { mask:mask, box:box };
    return autoSheetEl;
  }
  function closeAutoDetail(){ if(autoSheetEl) autoSheetEl.mask.hidden = true; }
  function sheetKV(box, k, v, mono){
    var row = document.createElement('div'); row.className='kv';
    var ks = document.createElement('span'); ks.className='k'; ks.textContent = k;
    var vs = document.createElement('span'); vs.className = 'v' + (mono ? ' mono' : '');
    vs.textContent = (v==null || v==='') ? '—' : String(v);
    row.appendChild(ks); row.appendChild(vs); box.appendChild(row);
  }
  // 刷新明细列表（补记 / 改方向 / 删除 之后）
  function autoLogRefresh(){
    setSync('syncing');
    return reloadRange().then(function(){ setSync('synced'); })
      .catch(function(){ refreshAll(); });
  }
  function openAutoDetail(x){
    if(!x) return;
    var s = autoSheet(), box = s.box;
    box.innerHTML = '';
    var hd = document.createElement('h3');
    var t1 = document.createElement('span'); t1.textContent = '自动记账详情';
    var cb = document.createElement('button'); cb.className='close'; cb.textContent='\u00d7'; cb.onclick = closeAutoDetail;
    hd.appendChild(t1); hd.appendChild(cb); box.appendChild(hd);
    // 自动记账详情也显示到秒：通知到达的那一刻以秒为准，便于和银行/支付 App 的记录对齐
    sheetKV(box, '时间', x.stamp ? stampShort(x.stamp, true) : (x.time || '—'));
    sheetKV(box, '来源', x.app || '—');
    if(x.skip){
      sheetKV(box, '结果', '未记账（' + (x.reason || '已跳过') + '）');
    } else {
      sheetKV(box, '结果', '已记账');
      sheetKV(box, '方向', x.kind === KIND_INCOME ? '收入' : '支出');
      sheetKV(box, '金额', fmt(x.amt));
      if(x.cat) sheetKV(box, '分类', x.cat);
      if(x.merchant) sheetKV(box, '商户', x.merchant);
    }
    sheetKV(box, '通知原文', x.raw || x.label, true);
    var acts = document.createElement('div'); acts.className = 'sheet-acts';
    if(x.skip){
      var guess = pickAmountFromText(x.raw || x.label);
      if(guess > 0){
        var b1 = document.createElement('button'); b1.className='btn'; b1.textContent='补记为支出';
        b1.onclick = function(){ manualFromAuto(x, guess, KIND_EXPENSE); };
        var b2 = document.createElement('button'); b2.className='btn ghost'; b2.textContent='补记为收入';
        b2.onclick = function(){ manualFromAuto(x, guess, KIND_INCOME); };
        acts.appendChild(b1); acts.appendChild(b2);
      } else {
        var b3 = document.createElement('button'); b3.className='btn ghost'; b3.textContent='去手动记一笔';
        b3.onclick = function(){ closeAutoDetail(); goNav('ledger'); };
        acts.appendChild(b3);
      }
    } else {
      if(x.rid){
        var b4 = document.createElement('button'); b4.className='btn ghost'; b4.textContent='改方向';
        b4.onclick = function(){ flipAuto(x); };
        var b5 = document.createElement('button'); b5.className='btn ghost'; b5.textContent='删除这笔';
        b5.onclick = function(){ deleteAuto(x); };
        acts.appendChild(b4); acts.appendChild(b5);
      }
    }
    var b6 = document.createElement('button'); b6.className='btn ghost'; b6.textContent='关闭';
    b6.onclick = closeAutoDetail; acts.appendChild(b6);
    box.appendChild(acts);
    s.mask.hidden = false;
  }
  function manualFromAuto(x, amt, kind){
    if(!state.u){ showToast('请先选择成员', true); return; }
    var stamp = nowStamp();
    var props = flowProps(stamp, amt, classifyBillText(String(x.raw || x.label || '')), (x.app || '') + ' 补记', kind);
    addRecordSafe(flowDbOf(stamp.slice(0,7)), props).then(function(){
      x.skip = false; x.reason = ''; x.amt = amt; x.kind = kind; x.stamp = stamp; x.rid = '';
      closeAutoDetail(); renderAutoLog(); renderAutoCard();
      showToast('已补记 ' + (kind === KIND_INCOME ? '+' : '-') + fmt(amt));
      // 补记用的就是当前时刻 → 算在今天，做一次超额判断
      if(kind === KIND_EXPENSE) maybeWarnBudget();
      return autoLogRefresh();
    }).catch(function(e){ console.error('[manualFromAuto]', e); showToast('补记失败，请重试', true); });
  }
  function flipAuto(x){
    if(!x.rid){ showToast('缺少记录标识，无法修改', true); return; }
    var nk = (x.kind === KIND_INCOME) ? KIND_EXPENSE : KIND_INCOME;
    var cat = x.cat || '其他';
    var props = { '收支类型':{ text:nk } };
    if(nk === KIND_INCOME){ props['收入来源'] = { text:cat }; }
    else { props['分类'] = { text:cat }; }
    db.updateRecord({databaseId: flowDbOf(String(x.stamp || nowStamp()).slice(0,7)), recordId:x.rid, properties:props})
      .then(function(){
        x.kind = nk; closeAutoDetail(); renderAutoLog(); renderAutoCard();
        showToast('已改为' + (nk === KIND_INCOME ? '收入' : '支出'));
        return autoLogRefresh();
      })
      .catch(function(e){ console.error('[flipAuto]', e); showToast('修改失败，请重试', true); });
  }
  function deleteAuto(x){
    if(!x.rid){ showToast('缺少记录标识，无法删除', true); return; }
    db.deleteRecord({databaseId: flowDbOf(String(x.stamp || nowStamp()).slice(0,7)), recordId:x.rid})
      .then(function(){
        x.skip = true; x.reason = '已删除'; x.rid = '';
        closeAutoDetail(); renderAutoLog(); renderAutoCard();
        showToast('已删除这条记录');
        return autoLogRefresh();
      })
      .catch(function(e){ console.error('[deleteAuto]', e); showToast('删除失败，请重试', true); });
  }
  // 驾驶舱 KPI：金额过长时自动缩小字号（min-width:0 已防溢出，这里是兜底自适应）
  function fitNumbers(){
    var nodes = document.querySelectorAll('#sec-dashboard .netbar .nb .v, #sec-dashboard .grid3 .stat .v');
    for(var i=0;i<nodes.length;i++){
      var n = nodes[i];
      n.style.fontSize = '';
      var base = parseFloat((window.getComputedStyle(n) || {}).fontSize) || 17;
      var size = base, guard = 0;
      while(n.scrollWidth > n.clientWidth + 1 && size > 11 && guard < 24){
        size -= 1; guard++;
        n.style.fontSize = size + 'px';
      }
    }
  }
  var fitTimer = null;
  window.addEventListener('resize', function(){
    if(fitTimer) clearTimeout(fitTimer);
    fitTimer = setTimeout(function(){ try{ fitNumbers(); }catch(e){} }, 160);
  });
  function nowHm(){
    var d=new Date();
    return pad2(d.getHours())+':'+pad2(d.getMinutes());
  }
  // 秒级时刻（仅时分秒，不带日期）——给隐藏时间字段 / 自动记账日志用
  function nowHms(){
    var d=new Date();
    return pad2(d.getHours())+':'+pad2(d.getMinutes())+':'+pad2(d.getSeconds());
  }
  // 收到通知 → 解析 → 入库。skipRefresh 用于批量补记（最后统一刷新一次）
  function onBillNotification(ev, skipRefresh){
    try{
      if(autoIsPaused()) return Promise.resolve();
      if(!state.u) return Promise.resolve();     // 还没选成员，先不动（队列也不会被消费）
      if(!db) return Promise.resolve();
      var p = parsePayNotification(ev);
      if(!p){
        var nm = PAY_APP_NAMES[String(ev && ev.pkg || '')] || '';
        var raw = String(ev && ev.full || '');
        if(nm && /(支付|付款|消费|扣款|收入|到账|收款|支出|转账|元|¥|￥)/.test(raw)){
          autoAddLog({ time:nowHm(), stamp:nowStamp(), app:nm, raw:raw,
                       label:nm+'：'+raw.slice(0,44), skip:true, reason:'未识别' });
        }
        return Promise.resolve();
      }
      // 微信/支付宝「未收取」的转账/红包：等点击收取后再记（金额此刻不可靠）
      if(p.skip === 'pending-receive'){
        autoAddLog({ time:nowHm(), stamp:nowStamp(), app:p.app, raw:p.text,
                     label:(p.merchant||p.app)+' · 未收取，等收取后再记', skip:true, reason:'未收取' });
        return Promise.resolve();
      }
      if(autoIsDup(p)){
        autoAddLog({ time:nowHm(), stamp:nowStamp(), app:p.app, raw:p.text,
                     label:'重复通知：'+(p.merchant||p.app), skip:true, reason:'重复' });
        return Promise.resolve();
      }
      p.conf = (p.conf||0) + 5;   // §6 去重通过 +5
      // 方向不明 → 一律待确认（用户要求：不明确的要标记出来确认）
      if(p.kind == null){
        pendingAdd({ id: genU(), app: p.app, amt: p.amt, merchant: p.merchant,
                     dirHint: p.dir, conf: p.conf, text: p.text, stamp: nowStamp() });
        autoAddLog({ time:nowHm(), stamp:nowStamp(), app:p.app, raw:p.text,
                     label:(p.merchant||p.app)+' · 待确认（方向不明）', skip:true, reason:'待确认' });
        showToast('新增 1 笔待确认：'+(p.merchant||p.app));
        return Promise.resolve();
      }
      // 方向明确但低置信 → 噪声，忽略
      if(p.conf < AUTO_CONF_SKIP){
        autoAddLog({ time:nowHm(), stamp:nowStamp(), app:p.app, raw:p.text,
                     label:(p.merchant||p.app)+' · 已忽略（低置信 '+p.conf+'）', skip:true, reason:'低置信' });
        return Promise.resolve();
      }
      // 中置信 → 待确认（方向已猜好，一键确认）
      if(p.conf < AUTO_CONF_AUTO){
        pendingAdd({ id: genU(), app: p.app, amt: p.amt, merchant: p.merchant,
                     dirHint: p.dir, conf: p.conf, text: p.text, stamp: nowStamp() });
        autoAddLog({ time:nowHm(), stamp:nowStamp(), app:p.app, raw:p.text,
                     label:(p.merchant||p.app)+' · 待确认', skip:true, reason:'待确认' });
        showToast('新增 1 笔待确认：'+(p.merchant||p.app));
        return Promise.resolve();
      }
      var today = nowStamp();
      var note = p.merchant || p.app;
      var props = flowProps(today, p.amt, p.cat, note, p.kind);
      return addRecordSafe(flowDbOf(today.slice(0,7)), props)
        .then(function(res){
          var rid = (res && (res.recordId || res.id)) || '';
          autoAddLog({ time:nowHm(), stamp:today, app:p.app, raw:p.text, merchant:p.merchant, cat:p.cat,
                       label:p.app+' · '+note+' · '+p.cat, amt:p.amt, kind:p.kind, rid:rid });
          if(skipRefresh) return;
          showToast('自动记账：'+note+' '+((p.kind===KIND_INCOME?'+':'-')+fmt(p.amt)));
          return reloadRange().then(function(){
            refreshAll(); setSync('synced');
            // 自动记账的时间就是「现在」→ 支出时同样做超额判断
            if(p.kind === KIND_EXPENSE) maybeWarnBudget();
          });
        })
        .catch(function(e){
          console.error('[auto ledger]', e);
          autoAddLog({ time:nowHm(), stamp:today, app:p.app, raw:p.text,
                       label:'写入失败：'+note, skip:true, reason:'失败' });
        });
    }catch(e){
      console.error('[onBillNotification]', e);
      return Promise.resolve();
    }
  }
  // App 回到前台 / 刚选完成员时，把原生侧攒下的通知取出来补记
  function drainAutoQueue(P){
    P = P || billPlugin();
    if(!P || !P.drainPending) return;
    if(!state.u) return;             // 还没选成员：队列先留着，等选完再补
    try{
      P.drainPending().then(function(r){
        var evs = (r && r.events) || [];
        if(!evs.length){ autoQueue = 0; renderAutoCard(); return; }
        showToast('正在补记 '+evs.length+' 条后台通知…');
        var jobs = [];
        for(var i=0;i<evs.length;i++) jobs.push(onBillNotification(evs[i], true));
        Promise.all(jobs).then(function(){
          autoQueue = 0;
          renderAutoCard();
          return reloadRange().then(function(){ refreshAll(); setSync('synced'); });
        }).catch(function(e){ console.error('[drainAutoQueue]', e); });
      }).catch(function(){});
    }catch(e){ console.error('[drainAutoQueue]', e); }
  }
  function renderAutoCard(){
    var stat = $('auto-stat'), tip = $('auto-tip');
    var gBtn = $('auto-grant'), pBtn = $('auto-pause');
    if(!stat) return;
    if(!autoSupported){
      stat.innerHTML = '<span class="ds">状态 <b>仅手机 App 可用</b></span>';
      if(gBtn){ gBtn.disabled = true; gBtn.textContent = '需在 App 内使用'; }
      if(pBtn){ pBtn.disabled = true; }
      if(tip) tip.textContent = '自动记账依赖手机系统能力（读取支付通知），网页版无法使用。装到手机 App 后回来开启即可。';
      return;
    }
    var paused = autoIsPaused();
    var todayN = 0;
    autoLog.forEach(function(x){ if(!x.skip) todayN++; });
    stat.innerHTML =
      '<span class="ds">状态 <b>'+(autoGranted ? (paused?'已暂停':'监听中') : '未开启')+'</b></span>'+
      (autoGranted ? '<span class="ds">服务 <b>'+(autoConnected?'已连接':'未连接')+'</b></span>' : '')+
      (autoQueue ? '<span class="ds">待补记 <b>'+autoQueue+'</b> 条</span>' : '')+
      (pendingCount() ? '<span class="ds" style="background:#FBE8C0;border-color:#F0C36A;color:#B57A1A">待确认 <b>'+pendingCount()+'</b> 笔</span>' : '')+
      '<span class="ds">本次会话 <b>'+todayN+'</b> 笔</span>';
    if(gBtn){
      gBtn.disabled = false;
      gBtn.textContent = autoGranted ? '重新检查权限' : '去系统设置开启';
    }
    if(pBtn){
      pBtn.disabled = !autoGranted;
      pBtn.textContent = paused ? '恢复自动记账' : '暂停自动记账';
    }
    if(tip){
      if(!autoGranted){
        tip.textContent = '还没授权：点上面按钮跳到系统「通知使用权」页面，在列表里勾选「小账本 · 自动记账」，返回即生效。';
      } else if(!autoConnected){
        tip.textContent = '已勾选授权，但系统还没把监听服务连上。请确认列表里「小账本 · 自动记账」确实处于开启状态；若刚开启，退到桌面再打开 App 即可。';
      } else if(paused){
        tip.textContent = '已暂停：通知仍会读取，但不会自动记账。点上面的按钮恢复。';
      } else {
        tip.textContent = '正在监听：收到微信 / 支付宝 / 银行等支付通知会自动记一笔。App 在后台时通知会先存下来，回到 App 自动补记。点下面任意一条可查看详情（含通知原文），未识别的可一键补记。';
      }
    }
  }
  function initAutoLedger(){
    var P = billPlugin();
    if(!P) { autoSupported = false; renderAutoCard(); return; }
    autoSupported = true;
    try{ P.start(); }catch(e){}
    try{
      P.addListener('billNotification', function(ev){ onBillNotification(ev); });
    }catch(e){ console.error('[addListener]', e); }
    function refreshGranted(){
      try{
        if(P.getStatus){
          P.getStatus().then(function(r){
            autoGranted = !!(r && r.granted);
            autoConnected = !!(r && r.connected);
            autoQueue = (r && r.queueCount) || 0;
            renderAutoCard();
          }).catch(function(){ renderAutoCard(); });
        } else {
          P.isEnabled().then(function(r){
            autoGranted = !!(r && r.enabled);
            renderAutoCard();
          }).catch(function(){ renderAutoCard(); });
        }
      }catch(e){ renderAutoCard(); }
    }
    refreshGranted();
    // 启动时先补记一次（App 在后台期间攒下的通知）
    drainAutoQueue(P);
    // 从系统设置页 / 后台返回时：重新检查授权 + 补记期间攒下的通知
    document.addEventListener('visibilitychange', function(){
      if(document.visibilityState !== 'visible') return;
      refreshGranted();
      drainAutoQueue(P);
    });
    renderPending();
  }

  // 一键诊断：把授权 / 连接 / 队列 / 最近事件一次性摆出来，快速定位自动记账是否正常
  function agoStr(ts){
    var d = Date.now() - (ts||0);
    if(d < 0) d = 0;
    var m = Math.floor(d/60000);
    if(m < 1) return '刚刚';
    if(m < 60) return m + ' 分钟';
    var h = Math.floor(m/60);
    if(h < 24) return h + ' 小时';
    return Math.floor(h/24) + ' 天';
  }
  function runAutoDiagnosis(){
    var P = billPlugin();
    var out = $('auto-diag-out');
    function show(msg){ if(out){ out.textContent = msg; out.hidden = false; } }
    if(!P || !P.getStatus){ show('诊断不可用：需要在手机 App 内才能检查通知监听。'); return; }
    show('正在诊断…');
    try{
      P.getStatus().then(function(r){
        var granted = !!(r && r.granted);
        var connected = !!(r && r.connected);
        var q = (r && r.queueCount) || 0;
        var last = (r && r.lastEventAt) || 0;
        autoGranted = granted; autoConnected = connected; autoQueue = q;
        var parts = [];
        parts.push('授权：' + (granted ? '已授权' : '未授权'));
        parts.push('服务：' + (connected ? '已连接' : '未连接'));
        parts.push('待补记：' + q + ' 条');
        parts.push('最近事件：' + (last ? agoStr(last) + '前' : '本会话未收到'));
        var verdict;
        if(!granted) verdict = '结论：未授权 —— 点「去系统设置开启」，勾选「小账本 · 自动记账」';
        else if(!connected) verdict = '结论：服务未连接 —— 到系统设置确认开关，或退到桌面再打开 App';
        else if(!last) verdict = '结论：已就绪，去微信/支付宝付一笔即可触发';
        else verdict = '结论：正常监听中';
        parts.push(verdict);
        show(parts.join('　|　'));
        renderAutoCard();
      }).catch(function(e){ show('诊断失败：' + ((e && e.message) || e)); });
    }catch(e){ show('诊断失败：' + (e && e.message ? e.message : e)); }
  }

  // 驾驶舱「数据备份与迁移」概览
  function renderDataStat(){
    var el=$('d-datastat'); if(!el) return;
    var all=allKnown(), ms={}, n=0;
    all.forEach(function(r){
      n++;
      var d=String(r['日期']||'').slice(0,7);
      if(/^\d{4}-\d{2}$/.test(d)) ms[d]=1;
    });
    var store = (typeof DB_IS_LOCAL!=='undefined' && DB_IS_LOCAL) ? '本机存储' : '云端在线';
    el.innerHTML =
      '<span class="ds">已载入 <b>'+n+'</b> 笔</span>'+
      '<span class="ds">覆盖 <b>'+Object.keys(ms).length+'</b> 个月</span>'+
      '<span class="ds">存储位置 <b>'+store+'</b></span>';
  }
  function setVal(id, v){ var e=$(id); if(e && v!=null) e.value=v; }
  function optionsFor(field, fallback){
    var o = SCHEMA_OPTIONS[field];
    if(o && o.length) return o;
    return fallback.map(function(t){ return {text:t}; });
  }
  // 按当前收支类型填充分类下拉：支出用「分类」，收入用「收入来源」
  function fillCatSelect(sel, kind){
    if(!sel) return;
    var keep = sel.value;
    sel.innerHTML='';
    if(sel.options && sel.options.length){ sel.options.length = 0; }
    var opts = (kind===KIND_INCOME)
      ? optionsFor('收入来源', INC_FALLBACK)
      : optionsFor('分类', CAT_FALLBACK);
    opts.forEach(function(o){ var op=document.createElement('option'); op.value=o.id||o.text; op.textContent=o.text; sel.appendChild(op); });
    // 尽量保留原选中项（支出/收入列表不同，多数情况会落到第一项）
    for(var i=0;i<sel.options.length;i++){ if(sel.options[i].textContent===keep){ sel.selectedIndex=i; return; } }
  }
  function populateCats(){
    fillCatSelect($('q-cat'), curQKind());
    fillCatSelect($('l-cat'), curLKind());
  }
  // 以容器上的 data-kind 为唯一真源（seg 按钮是 segbar 的子元素，$() 取不到它们）
  function curQKind(){
    var bar=$('q-bar');
    return (bar && bar.getAttribute('data-kind')===KIND_INCOME) ? KIND_INCOME : KIND_EXPENSE;
  }
  function curLKind(){
    var bar=$('l-kind-wrap');
    return (bar && bar.getAttribute('data-kind')===KIND_INCOME) ? KIND_INCOME : KIND_EXPENSE;
  }
  // 切换收支类型：更新高亮 + 重填分类 + 更新按钮文案与提示
  function setKind(scope, kind){
    var bar=$(scope+'-kind'); if(!bar) return;
    bar.querySelectorAll('.seg').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-kind')===kind); });
    if(scope==='q'){
      $('q-bar').setAttribute('data-kind', kind);
      fillCatSelect($('q-cat'), kind);
      $('q-save').textContent = (kind===KIND_INCOME) ? '保存收入' : '保存并换算工时';
      setHint('q-hint', kind===KIND_INCOME
        ? '收入同样按真实时薪换算成「工作时长」——看看这笔钱买回了多少小时。'
        : '保存后立刻按真实时薪换算成「工作时长」，看得见每一笔花掉的时间。');
    } else {
      $('l-kind-wrap').setAttribute('data-kind', kind);
      fillCatSelect($('l-cat'), kind);
      if(!ledgerEditId) $('l-save').textContent = (kind===KIND_INCOME) ? '保存收入' : '保存支出';
      setHint('l-kind-hint', kind===KIND_INCOME ? '当前记录类型：收入' : '当前记录类型：支出');
    }
  }
  function setHint(id, txt){ var e=$(id); if(e) e.textContent=txt; }
  // 取选中项的 **text**（不是 id）：实测 select 字段写入用 option id 会被后端拒
  // （invalid fields (not found in schema)），用 text 才能落库。
  function catValue(sel){
    if(!sel) return '';
    var i=sel.selectedIndex;
    var o=(sel.options && sel.options[i]) ? sel.options[i] : null;
    if(o){
      if(o.textContent!=null) return String(o.textContent);
      if(o.text!=null) return String(o.text);
    }
    return String(sel.value||'');
  }
  // 组装一条流水的 properties：收入写「收入来源」，支出写「分类」，两者都写「收支类型」
  // 「记录时间」= 精确到秒的本地时间戳（'YYYY-MM-DD HH:mm:ss'），随「点保存」那一刻写入。
  // 为什么单独存一份而不只靠「日期」：云端 date 字段读回是 ISO-8601 UTC（2026-10-13T05:45:07Z），
  // 经时区换算后秒可能与写入时不同；text 字段是无损透传，能保证「秒」原样保留。
  // 「日期」仍是 date 类型，负责区间筛选与排序，两者职责分开。
  function flowProps(date, amt, cat, note, kind){
    var sec = normalizeStamp(date);            // 一律规整到 'YYYY-MM-DD HH:mm:ss'
    if(sec.length !== 19) sec = normalizeStamp(nowStamp());
    var p = withU({ '日期':{date:date}, '记录时间':{text:sec}, '金额':{number:round2(amt)}, '收支类型':{text:kind}, '备注':{text:note} });
    if(kind===KIND_INCOME) p['收入来源'] = { text: cat };
    else p['分类'] = { text: cat };
    return p;
  }
  // 取一条记录的「精确到秒」时间：优先 text 的「记录时间」，回退到「日期」。
  // 这样老数据（没有「记录时间」字段）也能正常显示，不会因为缺字段报错。
  function recStamp(r){
    if(!r) return '';
    var t = r['记录时间'];
    if(t){ var ns = normalizeStamp(t); if(ns) return ns; }
    return normalizeStamp(r['日期']);
  }

  /* ---------- 导入去重指纹 ---------- */
  // 字段归一化：去首尾空白 + 把连续空白压成一个 + 去掉 \r\n 这类行尾噪声。
  // 不做全角/大小写转换 —— 中文备注里全角半角可能语义不同，误合并比漏合并更糟。
  function dedupText(v){
    return String(v==null?'':v).replace(/[\r\n\t\u00A0]/g,' ').replace(/\s+/g,' ').trim();
  }
  // 日期一律截到「天」。备份导出用 normalizeStamp（可能带时分），而用户手抄只到日；
  // 若参与指纹会因「2026-10-12」≠「2026-10-12 12:30」而判定为新记录 → 重复导入。
  function dedupDate(v){
    var s = normalizeStamp(v);
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    return m ? (m[1]+'-'+m[2]+'-'+m[3]) : dedupText(s);
  }
  // 字段指纹：日期(到天) + 收支 + 金额(2位) + 分类 + 备注（均已归一化）
  function flowFingerprint(date, kind, amt, cat, note){
    return [dedupDate(date), kind, round2(amt).toFixed(2), dedupText(cat), dedupText(note)].join('|');
  }
  // 外部单号归一化：去掉空白，统一大写（单号大小写不敏感，避免 WX001 与 wx001 被当成两条）
  function dedupNo(v){ return dedupText(v).toUpperCase(); }

  // 保存那一刻刷新一次隐藏时间字段：只选日期的用户，时分自动补当前时刻
  // 保存那一刻刷新一次隐藏时间字段：只选日期的用户，时分秒自动补当前时刻。
  // 注意这里用 nowHms()（带秒），配合 stampOfPickedDate 让「点保存」的秒级时刻真正落库。
  function refreshAutoTime(){ var e=$('l-time'); if(e) e.value = nowHms(); return e ? e.value : nowHms(); }

  function addFlow(){
    if(!db){ setSync('offline'); showToast('当前环境未挂载线上数据库，无法保存','err'); return; }
    var tk=refreshAutoTime();
    var date=stampOfPickedDate($('l-date').value, tk);
    var amt=num($('l-amt').value);
    var cat=catValue($('l-cat'));
    var note=$('l-note').value;
    var kind=curLKind();
    if(!(amt>0)){ showToast('请输入大于 0 的金额','err'); return; }
    setSync('syncing');
    db.addRecord({databaseId:flowDbOf(String(date).slice(0,7)), properties:flowProps(date, amt, cat, note, kind)})
      .then(function(res){
        if(res && res.id){ return reloadRange(); }
        return reloadRange();
      })
      .then(function(){ ledgerEditId=null; resetLedgerForm(); cacheClear('ledger'); setSync('synced'); showToast(kind===KIND_INCOME? '收入已记录' : '已保存并换算工时'); refreshAll();
        // 只在支出且是「今天」的记录上做超额判断 —— 补记历史日期不该弹今天的额度提醒
        if(kind===KIND_EXPENSE && String(date).slice(0,10)===todayStr()) maybeWarnBudget(); })
      .catch(function(e){ console.error('[addFlow]', e); setSync('error'); showToast('保存失败，请重试','err'); });
  }
  function editFlow(r){
    ledgerEditId=r._id;
    // 先切到该记录真实的收支类型，再回填对应分类列表
    setKind('l', kindOf(r));
    var stamp=normalizeStamp(r['日期']);
    setVal('l-date', stamp.slice(0,10));
    // 回填精确到秒；老数据（只到分）自动补 :00，不会因为格式差异丢时间
    var hm = stamp.slice(11,19);
    setVal('l-time', /^\d{2}:\d{2}:\d{2}$/.test(hm) ? hm : (/^\d{2}:\d{2}$/.test(hm.slice(0,5)) ? hm.slice(0,5)+':00' : nowHms()));
    setVal('l-amt', r['金额']);
    // 分类匹配（支出取「分类」，收入取「收入来源」）
    var want=catOf(r);
    var sel=$('l-cat'); for(var i=0;i<sel.options.length;i++){ if(sel.options[i].textContent===want){ sel.selectedIndex=i; break; } }
    setVal('l-note', r['备注']);
    $('l-save').textContent='更新这笔记录';
    $('l-edit-hint').style.display='block';
    goNav('ledger');
  }
  // 删除一笔流水。
  // 关键点：recordId/_id 只在「它所在的那张月表」里有效，必须按记录自身的日期定位月表；
  // 且删除后要显式校验是否真的少了一条 —— 云端权限/表未关联时会静默成功但实际没删，
  // 原实现无论真假都弹「已删除」，导致用户以为删了其实还在。
  function delFlow(r){
    if(!db){ showToast('当前环境未挂载线上数据库','err'); return; }
    if(!confirm('确定删除这笔记录吗？此操作不可撤销。')) return;
    var rid = r._id || r.record_id;
    if(!rid){ showToast('这条记录缺少标识，无法删除','err'); return; }
    var stamp = normalizeStamp(r['日期'] || nowStamp());
    var dbId = flowDbOf(stamp.slice(0,7));
    var before = (state.flow||[]).length;
    setSync('syncing');
    db.deleteRecord({databaseId:dbId, recordId:rid})
      .then(function(){
        // 先本地摘掉，UI 立即反馈，不等重新拉取
        state.flow = (state.flow||[]).filter(function(x){ return (x._id||x.record_id) !== rid; });
        if(state.extraFlow) state.extraFlow = state.extraFlow.filter(function(x){ return (x._id||x.record_id) !== rid; });
        return reloadRange();
      })
      .then(function(list){
        var after = (list||[]).length;
        if(after < before || after === before){ setSync('synced'); }
        if(after >= before && before > 0){
          // 重新拉取后条数没变 → 实际没删掉
          setSync('error');
          showToast('删除未生效：该月数据表可能未对本页开放写入权限','err');
          return;
        }
        setSync('synced'); showToast('已删除');
      })
      .catch(function(e){ console.error('[delFlow]', e); setSync('error'); showToast('删除失败：'+(e&&e.message||'请重试'),'err'); });
  }
  function resetLedgerForm(){
    setVal('l-amt',''); setVal('l-note',''); setVal('l-date',todayStr()); setVal('l-time', nowHm());
    ledgerEditId=null;
    setKind('l', KIND_EXPENSE);
    $('l-save').textContent='保存支出'; $('l-edit-hint').style.display='none';
  }

  // 快速记账（驾驶舱）
  function quickAdd(){
    if(!db){ setSync('offline'); showToast('当前环境未挂载线上数据库，无法保存','err'); return; }
    var amt=num($('q-amt').value); var cat=catValue($('q-cat')); var note=$('q-note').value;
    var kind=curQKind();
    if(!(amt>0)){ showToast('请输入大于 0 的金额','err'); return; }
    setSync('syncing');
    db.addRecord({databaseId:flowDbOf(curMonth()), properties:flowProps(nowStamp(), amt, cat, note, kind)})
      .then(function(){ return reloadRange(); })
      .then(function(){ setSync('synced'); showToast(kind===KIND_INCOME? '收入已记录' : '已保存并换算工时'); $('q-amt').value=''; $('q-note').value=''; refreshAll();
        // 快速记账的时间就是「现在」→ 必然算在今天，直接做超额判断
        if(kind===KIND_EXPENSE) maybeWarnBudget(); })
      .catch(function(e){ console.error('[quickAdd]', e); setSync('error'); showToast('保存失败，请重试','err'); });
  }

  /* ---------- 表单草稿缓存（DSDK008） ---------- */
  function cacheSave(key){
    try{
      var o={};
      if(key==='ledger'){ o={ date:$('l-date').value, amt:$('l-amt').value, cat:$('l-cat').value, note:$('l-note').value }; }
      localStorage.setItem('wb_ledger_draft_'+key, JSON.stringify(o));
    }catch(e){}
  }
  function cacheRestore(key){
    try{
      var raw=localStorage.getItem('wb_ledger_draft_'+key); if(!raw) return;
      var o=JSON.parse(raw);
      if(key==='ledger'){ if(o.date)$('l-date').value=o.date; if(o.amt)$('l-amt').value=o.amt; if(o.note)$('l-note').value=o.note; }
    }catch(e){}
  }
  function cacheClear(key){ try{ localStorage.removeItem('wb_ledger_draft_'+key); }catch(e){} }

  /* ---------- 导航 ---------- */
  function goNav(name){
    var pages={dashboard:'今日驾驶舱',hourly:'我的时薪',ledger:'10 秒记账',stats:'支出统计',monthly:'月度总结',freedom:'自由基金',findings:'有趣发现'};
    document.querySelectorAll('section.page').forEach(function(s){ s.classList.remove('active'); });
    var sec=$('sec-'+name); if(sec) sec.classList.add('active');
    document.querySelectorAll('[data-nav]').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-nav')===name); });
    $('pageTitle').firstChild.textContent=pages[name]||'';
    window.scrollTo(0,0);
  }

  /* ---------- 绑定事件 ---------- */
  function bindEvents(){
    document.querySelectorAll('[data-nav]').forEach(function(b){ b.onclick=function(){ goNav(b.getAttribute('data-nav')); }; });
    // 内联 onclick 在全局作用域执行，访问不到 IIFE 内的 goNav，必须在这里绑定
    var goLedger=$('d-goLedger'); if(goLedger) goLedger.onclick=function(){ goNav('ledger'); };
    // 统计页「按月结余 / 本月每日」视图切换
    var mbTabs=$('mb-tabs');
    if(mbTabs) mbTabs.querySelectorAll('.mtb').forEach(function(b){
      b.onclick=function(){ setMbView(b.getAttribute('data-v')); };
    });
    // 收支类型切换
    ['q','l'].forEach(function(scope){
      var bar=$(scope+'-kind'); if(!bar) return;
      bar.querySelectorAll('.seg').forEach(function(b){
        b.onclick=function(){ setKind(scope, b.getAttribute('data-kind')); };
      });
    });
    $('pageTitle').firstChild.textContent='今日驾驶舱';
    $('todayTxt').textContent=' · '+todayStr();
    setVal('l-date', todayStr());
    populateCats();
    cacheRestore('ledger'); cacheRestore('monthly');

    // ---- 明细查询范围（默认本月）----
    setVal('l-range-month', curMonth());
    var rm=$('l-range-month');
    if(rm) rm.onchange=function(){ if(rm.value) applyRange({mode:'month', cm:rm.value}); };
    var rApply=$('l-range-apply');
    if(rApply) rApply.onclick=function(){
      applyRange({mode:'custom', from:$('l-range-from').value, to:$('l-range-to').value});
    };
    var rThis=$('l-range-this');
    if(rThis) rThis.onclick=function(){ applyRange({mode:'month', cm:curMonth()}); };
    var rExp=$('l-export');
    if(rExp) rExp.onclick=function(){
      var r=state.range;
      var cm = (r && r.mode==='custom' && r.from) ? r.from.slice(0,7) : curMonth();
      exportMonthCSV(cm);
    };
    var rExpAll=$('l-export-all');
    if(rExpAll) rExpAll.onclick=function(){ exportAllData(); };
    var rImp=$('l-import');
    if(rImp) rImp.onclick=function(){ onImportClick(rImp); };
    // 驾驶舱「数据备份与迁移」卡片
    var dImp=$('d-import');
    if(dImp) dImp.onclick=function(){ onImportClick(dImp); };
    // 驾驶舱内「切换用户」：弹确认窗（取消 / 确定），确定后清空全部数据并回登录门。
    var dSw=$('d-switch-user');
    if(dSw) dSw.onclick=function(){ openSwitchConfirm(); };
    // 登录门里的「导入 Excel 备份」（首次进入时先导入数据，再选成员）
    var gImp=$('gateImpBtn');
    if(gImp) gImp.onclick=function(){ onImportClick(gImp, {gate:true}); };
    var dExp=$('d-export-all');
    if(dExp) dExp.onclick=function(){ exportAllData(dExp); };
    // 驾驶舱「今日消费额度」：保存额度（写进设置表的两个字段）
    var bSave=$('dBudgetSave');
    if(bSave) bSave.onclick=function(){ saveBudgetLimit(); };
    var bInp=$('dBudgetInput');
    if(bInp) bInp.onkeydown=function(e){ if(e.key==='Enter'){ e.preventDefault(); saveBudgetLimit(); } };
    // 侧栏「数据备份与迁移」→ 回驾驶舱并定位到该卡片
    var navData=$('navData');
    if(navData) navData.onclick=function(){
      goNav('dashboard');
      setTimeout(function(){ var c=$('d-data-card'); if(c && c.scrollIntoView) c.scrollIntoView({behavior:'smooth', block:'center'}); }, 60);
    };
    // 自动记账：授权引导 + 暂停开关
    var aGrant=$('auto-grant');
    if(aGrant) aGrant.onclick=function(){
      var P=billPlugin(); if(!P) return;
      if(autoGranted){
        // 已授权 → 重新检查并直接显示诊断结果（有可见反馈）
        showToast('正在重新检查授权状态…');
        runAutoDiagnosis();
        return;
      }
      try{
        P.openSettings().catch(function(e){ showToast('打开设置失败：'+((e&&e.message)||''),'err'); });
      }catch(e){ showToast('打开设置失败','err'); }
      showToast('请在列表里勾选「小账本 · 自动记账」，然后返回');
    };
    var aPause=$('auto-pause');
    if(aPause) aPause.onclick=function(){
      autoSetPaused(!autoIsPaused());
      renderAutoCard();
      showToast(autoIsPaused() ? '已暂停自动记账' : '已恢复自动记账');
    };
    var aDiag=$('auto-diag');
    if(aDiag) aDiag.onclick=runAutoDiagnosis;

    $('q-save').onclick=quickAdd;
    $('l-save').onclick=function(){
      if(ledgerEditId){
        // 更新模式
        if(!db){ setSync('offline'); showToast('当前环境未挂载线上数据库','err'); return; }
        refreshAutoTime();   // 与新增一致：保存时刻自动补当前时分（编辑回填的时分优先保留）
        var date=stampOfPickedDate($('l-date').value, $('l-time').value), amt=num($('l-amt').value), cat=catValue($('l-cat')), note=$('l-note').value;
        if(!(amt>0)){ showToast('请输入大于 0 的金额','err'); return; }
        setSync('syncing');
        db.updateRecord({databaseId:flowDbOf(String(date).slice(0,7)), recordId:ledgerEditId, properties:flowProps(date, amt, cat, note, curLKind())})
          .then(function(){ return reloadRange(); })
          .then(function(){ resetLedgerForm(); cacheClear('ledger'); setSync('synced'); showToast('已更新'); refreshAll(); })
          .catch(function(e){ console.error('[updFlow]', e); setSync('error'); showToast('更新失败，请重试','err'); });
      } else { addFlow(); }
    };
    $('l-amt').addEventListener('input', function(){ cacheSave('ledger'); });
    $('l-note').addEventListener('input', function(){ cacheSave('ledger'); });

    // 设置输入：本地即时重算 + 标记未保存；落库改由「保存并重算」按钮显式触发
    [['s-monthly','到手月薪'],['s-paymonths','发薪月数'],['s-cost','工作成本'],['s-onsite','在场时间'],['s-commute','通勤'],['s-ot','加班'],
     ['f-goal','自由目标'],['f-target','目标月份'],['f-saved','已攒金额'],['f-cost','每月开销'],['f-start','起始月'],['f-decl','自由宣言']].forEach(function(pair){
      var e=$(pair[0]); if(!e) return;
      var evt=(e.type==='number'||e.type==='text'||e.type==='date')?'input':'change';
      e.addEventListener(evt, function(){ onSettingChange(pair[1], e.value); });
    });
    // 参数保存按钮（时薪页 / 自由基金页）
    ['h-save','f-save'].forEach(function(id){
      var b=$(id); if(!b) return;
      b.onclick=saveSettingsNow;
    });

    // 情景滑块

    // 自由基金：目标设置折叠/展开
    (function(){
      var head=$('f-foldhead'), card=$('f-foldcard');
      if(!head||!card) return;
      function toggle(){
        var closed=card.classList.toggle('closed');
        head.setAttribute('aria-expanded', closed?'false':'true');
      }
      head.addEventListener('click', toggle);
      head.addEventListener('keydown', function(e){
        if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); }
      });
    })();

    // 平台数据变更订阅：多端同步
    if(db && typeof db.onUpdated==='function'){
      db.onUpdated(function(payload){
        var ids=(payload&&payload.databaseIds)||[];
        if(ids.indexOf(DB_USER)>-1 && state.users.length){ loadUsers().then(renderUserList); }
        if(isFlowDbId(ids) || ids.indexOf(DB_SETTINGS)>-1 || ids.indexOf(DB_MONTHLY)>-1){
          if(state.u) loadAllData();
        }
      });
    }

    // 成员身份：侧栏切换 + 登录 + 首次选择
    $('whoami').onclick=function(){
      loadUsers().then(function(){ state.pendingAcct=null; openGate(); });
    };
    // 「切换用户」：侧栏按钮与驾驶舱数据卡按钮共用 openSwitchConfirm() 确认弹窗。
    // 确定后会清空全部数据（wipeAllData）再 switchUserOut 回登录门，弹窗里有醒目提示。
    var swUser=$('navSwitchUser');
    if(swUser) swUser.onclick=function(){ openSwitchConfirm(); };
    $('btnLogin').onclick=function(){ doLogin(); };
    $('uaddBtn').onclick=function(){
      var w=$('unewWrap'); if(!w) return;
      var showing = w.style.display!=='none';
      w.style.display = showing?'none':'';
      if(!showing) $('unewName').focus();
    };
    $('unewOk').onclick=function(){ createUser($('unewName').value); };
    $('unewName').addEventListener('keydown', function(e){
      if(e.key==='Enter'){ e.preventDefault(); createUser($('unewName').value); }
    });
    // 输入实时提示：重名 / 长度 / 可用
    $('unewName').addEventListener('input', function(){
      var hint=$('unewHint'), box=this;
      if(!hint) return;
      var raw=this.value||'';
      var nm=raw.replace(/　/g,' ').replace(/\s+/g,' ').trim();
      box.classList.remove('dup');
      hint.className='hint';
      if(!nm){ hint.textContent=''; return; }
      if(nm.length>12){ hint.className='hint warn'; hint.textContent='名字最多 12 个字'; return; }
      var dup=findUserByName(nm);
      if(dup){
        box.classList.add('dup');
        hint.className='hint warn';
        hint.textContent='「'+nm+'」已经存在，点「创建并进入」会直接切换到ta';
      } else {
        hint.className='hint ok';
        hint.textContent='「'+nm+'」可以使用，创建后每人拥有各自独立的账';
      }
    });
  }

  /* ---------- 启动 ---------- */
  function init(){
    bindEvents();
    initAutoLedger();
    function renderSkeleton(){
      renderDashboard(); renderHourly(); renderLedger(); renderMonthly();
      renderFreedom(); renderFindings(); renderDataStat();
    }
    // 先渲染界面（骨架），再异步拉取线上数据
    if(!db){
      setSync('offline');
      renderSkeleton();
      showError('未检测到资料库运行环境，页面以只读演示形态展示。请在资料库中打开以读写线上数据。', null);
      openGate();
      return;
    }
    // 拉成员列表 → 决定进入方式
    loadUsers().then(function(){
      state.u = readU();
      if(state.u && !userByU(state.u)) state.u = null;
      renderWhoami();
      // ① 本地环境（手机 App / 离线）没有平台登录能力 → 直接选人进入
      if(typeof db.getUserInfo!=='function'){
        if(!state.u && state.users.length===1){ state.u=state.users[0].u; writeU(state.u); renderWhoami(); }
        if(state.u){ renderSkeleton(); loadAllData(); drainAutoQueue(billPlugin()); } else { renderSkeleton(); openGate(); }
        return;
      }
      // ② 线上环境：**不主动调用 getUserInfo**（未登录会强制跳登录页，导致「登录不进」）。
      //    本机已记住成员 → 直接进入；否则退回选人/新建（匿名也能用，数据按成员 u 隔离）。
      if(state.u){
        renderSkeleton(); loadAllData(); drainAutoQueue(billPlugin());
        return;
      }
      if(state.users.length===1){
        state.u=state.users[0].u; writeU(state.u); renderWhoami();
        renderSkeleton(); loadAllData(); drainAutoQueue(billPlugin());
        return;
      }
      renderSkeleton(); setSync('synced'); openGate();
    });
  }
  // 调试句柄：整个页面跑在一个 IIFE 里，外部（控制台 / 自动化测试）默认取不到 state 与内部函数。
  // 这里只暴露一个**只读诊断**入口，方便排查「导入成功但看不到数据」这类问题。
  // 注意不要在这里塞写操作，避免绕过正常的交互路径。
  window.__ledgerDebug = {
    get state(){ return state; },
    get isLocal(){ return DB_IS_LOCAL; },
    get dbName(){ return (typeof LOCAL_DB_NAME !== 'undefined') ? LOCAL_DB_NAME : null; },
    switchToUser: switchToUser,
    switchUserOut: switchUserOut,
    openGate: openGate,
    closeGate: closeGate,
    curMonth: curMonth,
  };
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();
