(function(){
  const KEY='swapnoneer_offline_v1';
  const TABLES=['members','payments','profits','expenses','assets','notices','member_dividend_visibility','admin_users'];
  let state=JSON.parse(localStorage.getItem(KEY)||'{"tables":{},"queue":[],"idMap":{}}');
  state.tables=state.tables||{}; state.queue=state.queue||[]; state.idMap=state.idMap||{};
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const clone=x=>JSON.parse(JSON.stringify(x));
  const nextId=()=>-(Date.now()*1000+Math.floor(Math.random()*1000));
  function rows(t){return state.tables[t]||[]}
  function setRows(t,r){state.tables[t]=r;save()}
  function resolve(v){let s=String(v); return state.idMap[s]??v}
  function resolveRow(row){const r=clone(row); ['id','member_id','user_id'].forEach(k=>{if(r[k]!=null)r[k]=resolve(r[k])}); return r}
  function localQuery(table,ops){
    let out=clone(rows(table));
    for(const f of ops.filters){out=out.filter(r=>f.op==='eq'?String(r[f.k])===String(f.v):f.op==='in'?f.v.map(String).includes(String(r[f.k])):true)}
    for(const o of ops.orders){out.sort((a,b)=>{const av=a[o.k],bv=b[o.k]; if(av==null&&bv==null)return 0;if(av==null)return o.nullsFirst?-1:1;if(bv==null)return o.nullsFirst?1:-1; const c=String(av).localeCompare(String(bv),'bn',{numeric:true});return o.asc?c:-c})}
    if(ops.range)out=out.slice(ops.range[0],ops.range[1]+1);
    if(ops.fields&&ops.fields!=='*'){const fs=ops.fields.split(',').map(s=>s.trim());out=out.map(r=>Object.fromEntries(fs.map(k=>[k,r[k]])))}
    return out;
  }
  function builder(table){
    const ops={filters:[],orders:[],range:null,fields:'*',single:false};
    const b={
      select(fields='*'){ops.fields=fields;return b},
      eq(k,v){ops.filters.push({op:'eq',k,v});return b},
      in(k,v){ops.filters.push({op:'in',k,v});return b},
      order(k,opt={}){ops.orders.push({k,asc:opt.ascending!==false,nullsFirst:!!opt.nullsFirst});return b},
      range(a,z){ops.range=[a,z];return b},
      maybeSingle(){ops.single=true;return b},
      then(resolveFn,rejectFn){return execute().then(resolveFn,rejectFn)},
      catch(rejectFn){return execute().catch(rejectFn)},
      update(row){ops.action='update';ops.row=row;return b},
      insert(row){ops.action='insert';ops.row=row;return b},
      delete(){ops.action='delete';return b},
      upsert(row,opts){ops.action='upsert';ops.row=row;ops.upsertOpts=opts||{};return b}
    };
    async function execute(){
      if(navigator.onLine && window.__remoteSb){
        const q=window.__remoteSb.from(table);
        if(ops.action==='update'){let x=q.update(ops.row);ops.filters.forEach(f=>x=f.op==='eq'?x.eq(f.k,f.v):x);return await x}
        if(ops.action==='insert'){let x=q.insert(ops.row); if(ops.fields)x=x.select(ops.fields); if(ops.single)x=x.maybeSingle();return await x}
        if(ops.action==='delete'){let x=q.delete();ops.filters.forEach(f=>x=f.op==='eq'?x.eq(f.k,f.v):x);return await x}
        if(ops.action==='upsert'){let x=q.upsert(ops.row,ops.upsertOpts);return await x}
        let x=q.select(ops.fields);ops.filters.forEach(f=>x=f.op==='eq'?x.eq(f.k,f.v):x);ops.orders.forEach(o=>x=x.order(o.k,{ascending:o.asc,nullsFirst:o.nullsFirst}));if(ops.range)x=x.range(...ops.range);if(ops.single)x=x.maybeSingle();return await x;
      }
      if(ops.action==='update'){
        let r=rows(table),matched=[]; r=r.map(x=>{const ok=ops.filters.every(f=>f.op==='eq'?String(x[f.k])===String(f.v):f.op==='in'?f.v.map(String).includes(String(x[f.k])):true);if(ok){matched.push(x);return {...x,...clone(ops.row)}}return x});setRows(table,r);state.queue.push({action:'update',table,filters:clone(ops.filters),row:clone(ops.row)});save();return {data:ops.single?(matched[0]?{...matched[0],...ops.row}:null):null,error:null};
      }
      if(ops.action==='delete'){
        const old=rows(table),deleted=old.filter(x=>ops.filters.every(f=>f.op==='eq'?String(x[f.k])===String(f.v):f.op==='in'?f.v.map(String).includes(String(x[f.k])):true));setRows(table,old.filter(x=>!deleted.includes(x)));state.queue.push({action:'delete',table,filters:clone(ops.filters)});save();return {data:null,error:null};
      }
      if(ops.action==='insert' || ops.action==='upsert'){
        const arr=Array.isArray(ops.row)?ops.row:[ops.row], added=[]; let r=rows(table);
        for(const raw of arr){let x=clone(raw);if(x.id==null)x.id=nextId();if(table==='member_dividend_visibility'&&x.member_id==null)continue; const key=table==='member_dividend_visibility'?'member_id':'id';const ix=r.findIndex(a=>String(a[key])===String(x[key]));if(ops.action==='upsert'&&ix>=0)r[ix]={...r[ix],...x};else {r.push(x);added.push(x)} state.queue.push({action:ops.action,table,row:x,upsertOpts:ops.upsertOpts||null});}
        setRows(table,r);return {data:ops.single?(added[0]||arr[0]||null):added,error:null};
      }
      let out=localQuery(table,ops);return {data:ops.single?(out[0]||null):out,error:null};
    }
    return b;
  }
  window.createHybridClient=function(remote){window.__remoteSb=remote;return {from:builder,auth:remote?.auth||{getSession:async()=>({data:{session:null}})}};
  };
  window.offlineStore={
    snapshot(data){for(const t of TABLES)if(data[t])state.tables[t]=clone(data[t]);save()},
    load(){return clone(state.tables)},
    pending:()=>state.queue.length,
    async sync(){if(!navigator.onLine||!window.__remoteSb)return; const q=state.queue.slice(); if(!q.length)return; state.queue=[];save(); for(const op of q){try{let filters=op.filters||[]; if(op.action==='insert'||op.action==='upsert'){let row=resolveRow(op.row); const oldId=op.row.id; if(Number(oldId)<0)delete row.id; let res=op.action==='upsert'?await window.__remoteSb.from(op.table).upsert(row,op.upsertOpts||{}):await window.__remoteSb.from(op.table).insert(row).select('*').maybeSingle(); if(res.error)throw res.error; if(oldId<0&&res.data?.id!=null){state.idMap[String(oldId)]=res.data.id; for(const t of TABLES){state.tables[t]=(state.tables[t]||[]).map(x=>{const y={...x}; for(const k of Object.keys(y))if(String(y[k])===String(oldId))y[k]=res.data.id;return y})}}}
          else if(op.action==='update'){let x=window.__remoteSb.from(op.table).update(resolveRow(op.row));for(const f0 of filters){const f={...f0,v:resolve(f0.v)};if(f.op==='eq')x=x.eq(f.k,f.v);else if(f.op==='in')x=x.in(f.k,f.v.map(resolve));}const res=await x;if(res.error)throw res.error;}
          else if(op.action==='delete'){let x=window.__remoteSb.from(op.table).delete();for(const f0 of filters){const f={...f0,v:resolve(f0.v)};if(f.op==='eq')x=x.eq(f.k,f.v);else if(f.op==='in')x=x.in(f.k,f.v.map(resolve));}const res=await x;if(res.error)throw res;}
        }catch(e){state.queue.push(op);console.error('Offline sync failed',op,e);break;}}
      save(); if(window.onOfflineSynced)window.onOfflineSynced();}
  };
})();
