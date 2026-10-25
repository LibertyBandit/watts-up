// Regression loops for the 0.9.4 fixes. Run in the browser console on a loaded Watts Up page, then:
//   (0,eval)(await (await fetch('/tools/regression-checks.js')).text())   // served by any local http server
//   window.__bugB()  -> {mixed:[]} expected;  await window.__bugA() -> every list shows all phases linked (L), no violations
//   await window.__repairLoad() -> loadError null, all phases linked. They replace the open project, so use a throwaway tab.
// throwaway regression loops for the 0.9.4 bug fixes (deleted before commit)
window.confirm=()=>true;window.__alerts=[];window.alert=m=>window.__alerts.push(m);
window.showChoiceDialog=async()=>'copy';
const pw=(w,v)=>({w,var:v||0,va:Math.hypot(w,v||0),a:null,pf:null});

window.__bugB=function(){
  state=freshState(); collapsed=new Set(); reportCfg=null;
  const root=state.rootIds[0];
  const mk=(p,t,d,x={})=>addNode(p,{type:t,description:d,acDc:'ac',voltage:115,capacity:{a:null,va:30000},existingLoad:pw(1000,100),...x});
  const g=mk(root,'Generator','Gen');
  const F=[['A',0],['B',1],['C',2]].map(([l,s])=>mk(g,'Feeder','Cabin Feed',{phase:l,phaseGroupId:'FG',phaseSeq:s}));
  const lone=(parent,l,name)=>{ const cb=mk(parent,'Circuit Breaker',name,{phase:l,phaseGroupId:'g-'+name,phaseSeq:0,capacity:{a:5,va:575}}); addNode(cb,{type:'Load',description:name+' load',acDc:'ac',voltage:115,status:'new',phase:l,phaseGroupId:'l-'+name,phaseSeq:0,loadValue:pw(100,10)}); return cb; };
  lone(F[1],'B','CB B1'); lone(F[1],'B','CB B2'); lone(F[2],'C','CB C1');
  // a real phase-mate group of children under all three feeders must still share one table
  [['A',0],['B',1],['C',2]].forEach(([l,s],i)=>{ const b=mk(F[i],'Bus','Sub Bus',{phase:l,phaseGroupId:'SBG',phaseSeq:s}); addNode(b,{type:'Load',description:'SB load',acDc:'ac',voltage:115,status:'new',phase:l,phaseGroupId:'sbl'+i,phaseSeq:0,loadValue:pw(100,10)}); });
  recalc();
  const cols=ladAltUnionCols(AC_GROUPS,(reportCfg||defaultPrintCfg()).ac);
  const plan=ladSiblingPlan('ac',ladMaxSiblings(cols.length),makeAnnotator());
  const hits=[];
  plan.forEach((t,ti)=>{ const ms=t.members.map(m=>m.node); const parents=new Set(ms.map(m=>m.parentId)); const allMates=ms.every(m=>m.phase&&m.phaseGroupId===ms[0].phaseGroupId);
    if(parents.size>1&&!allMates&&!ms.every(m=>m.convRole==='out')&&ms.some(m=>m.phase)) hits.push({path:t.path&&t.path.join(' > '),members:ms.map(m=>m.description+' ('+(m.phase||'')+') <- '+state.nodes[m.parentId].description+' ('+(state.nodes[m.parentId].phase||'')+')')}); });
  return {tables:plan.map(t=>(t.path?t.path.join('>')+' :: ':'')+t.members.map(m=>m.node.description+(m.node.phase?'('+m.node.phase+')':'')).join(', ')),mixed:hits};
};

window.__bugA=async function(){
  const o={}; window.__alerts.length=0;
  state=freshState(); collapsed=new Set(); reportCfg=null;
  const root=state.rootIds[0];
  const g=addNode(root,{type:'Generator',description:'Gen',acDc:'ac',voltage:115,capacity:{a:null,va:90000,w:null},existingLoad:pw(1000,100)});
  const mkb=(l,s)=>addNode(g,{type:'Bus',description:'Bus',acDc:'ac',voltage:115,capacity:{a:null,va:30000},existingLoad:pw(1000,100),phase:l,phaseGroupId:'BUS-G',phaseSeq:s});
  const bA=mkb('A',0),bB=mkb('B',1),bC=mkb('C',2);
  const cg='CG-1';
  const tin=addNode(bA,{type:'TRU',description:'TRU 1',acDc:'ac',voltage:115,convRole:'in',convGroupId:cg,phaseOrder:0,efficiency:0.85,convPf:0.95,capacity:{a:null,va:3000},existingLoad:pw(300,30)});
  addNode(tin,{type:'TRU',description:'TRU 1 DC',acDc:'dc',voltage:28,convRole:'out',convGroupId:cg,efficiency:0.85,convPf:0.95,capacity:{a:100,w:2800},existingLoad:{a:5,w:140}});
  addNode(tin,{type:'Load',description:'DC load',acDc:'dc',voltage:28,status:'new',loadValue:{a:2,w:56}});
  recalc();
  createPcmAnalysis(); switchAnalysis('ap');
  await shareWithOther(tin);
  const apN=state.analyses.ap.nodes, pcN=state.analyses.pcm.nodes;
  const ins=ns=>Object.values(ns).filter(n=>n.convRole==='in').sort((a,b)=>(a.phaseOrder||0)-(b.phaseOrder||0));
  const show=ns=>ins(ns).map(n=>(n.phase||'?')+':'+(n.sharedPeerId?'L':'-')+(n.sharedPeerId?'':''));
  const sum=ns=>ins(ns).reduce((a,n)=>a+(n.existingLoad&&n.existingLoad.va||0),0).toFixed(1);
  o.afterShare={ap:show(apN),pcm:show(pcN)};
  const edit=async(fn)=>{ openEdit(tin); await new Promise(r=>setTimeout(r,100)); fn(); await doEditSave(); await new Promise(r=>setTimeout(r,200)); };
  await edit(()=>{ efTruAddParent(); efTruAddParent(); efTruAdditionalParents[0].parentId=bB; efTruAdditionalParents[1].parentId=bC; efTruRenderAdditionalParents(); });
  const peerOK=ns=>ins(ns).every(n=>n.sharedPeerId);
  const linksOK=()=>ins(apN).every(n=>pcN[n.sharedPeerId]&&pcN[n.sharedPeerId].sharedPeerId===n.id&&pcN[n.sharedPeerId].phase===n.phase);
  o.afterAdd={ap:show(apN),pcm:show(pcN),linksOK:linksOK(),violAP:phaseViolations(apN),violPCM:phaseViolations(pcN),twinParents:ins(pcN).map(n=>pcN[n.parentId].phase),sumAP:sum(apN),sumPCM:sum(pcN),alerts:window.__alerts.slice()};
  // remove phase C through the dialog
  await edit(()=>{ efTruRemoveParent(1); });
  o.afterRemove={ap:show(apN),pcm:show(pcN),linksOK:linksOK(),violAP:phaseViolations(apN),violPCM:phaseViolations(pcN),outputsLinked:Object.values(apN).filter(n=>n.convRole==='out').every(n=>n.sharedPeerId),alerts:window.__alerts.slice()};
  // the same from the other side: add phase C again while viewing PCM
  switchAnalysis('pcm'); const pin=Object.values(pcN).find(n=>n.convRole==='in'&&n.phase==='A').id;
  openEdit(pin); await new Promise(r=>setTimeout(r,100)); efTruAddParent(); efTruAdditionalParents[efTruAdditionalParents.length-1].parentId=Object.values(pcN).find(n=>n.type==='Bus'&&n.phase==='C').id; efTruRenderAdditionalParents(); await doEditSave(); await new Promise(r=>setTimeout(r,200));
  switchAnalysis('ap');
  o.fromPcm={ap:show(apN),pcm:show(pcN),linksOK:linksOK(),violAP:phaseViolations(apN),violPCM:phaseViolations(pcN)};
  return o;
};

// repair on load: both analyses already hold all three phases, only the first is linked
window.__repairLoad=async function(){
  await window.__bugA();
  // damage: unlink B and C on both sides (the shape of the user's file)
  const apN=state.analyses.ap.nodes, pcN=state.analyses.pcm.nodes;
  Object.values(apN).filter(n=>n.convRole==='in'&&n.phase!=='A').forEach(n=>{ if(n.sharedPeerId&&pcN[n.sharedPeerId]) pcN[n.sharedPeerId].sharedPeerId=null; n.sharedPeerId=null; });
  const snap=JSON.parse(JSON.stringify(snapshotState()));
  const before=phaseViolations(snap.analyses.ap.nodes);
  migrateLegacy(snap);
  let err=null; try{ validateImport(snap); }catch(e){ err=e.message; }
  const ins=ns=>Object.values(ns).filter(n=>n.convRole==='in').sort((a,b)=>(a.phaseOrder||0)-(b.phaseOrder||0));
  return {violationsBefore:before,loadError:err,ap:ins(snap.analyses.ap.nodes).map(n=>n.phase+':'+(n.sharedPeerId?'L':'-')),pcm:ins(snap.analyses.pcm.nodes).map(n=>n.phase+':'+(n.sharedPeerId?'L':'-')),notes:window.__lastRepairNotes||null};
};
'tests loaded'

// 0.9.11: moving an UNLABELED item (e.g. a generator) to the top level or under another unlabeled parent must keep the
// phase splits below it, in both analyses. __moveLoop(url) replays the move on a saved project file (AC Generator 1 -> top level);
// __moveSynthetic() does the same on a small built tree. Expect after counts equal before counts (and, for the synthetic one, a labeled item
// moved to the top level still loses its label).
window.__moveLoop=async function(url){
  const txt=await (await fetch(url)).text(); const p=JSON.parse(txt); migrateLegacy(p); validateImport(p);
  state=p; reportCfg=p.reportCfg||defaultPrintCfg(); recalc(); renderAll();
  const phaseCount=an=>Object.values(state.analyses[an].nodes).filter(n=>n.phase).length;
  const before={ap:phaseCount('ap'),pcm:phaseCount('pcm')};
  const gen=Object.values(state.analyses.ap.nodes).find(n=>n.description==='AC Generator 1');
  state.currentAnalysis='ap'; openEdit(gen.id); await new Promise(r=>setTimeout(r,200));
  const sel=document.getElementById('ef-parent'); sel.value=''; sel.dispatchEvent(new Event('change'));
  await doEditSave(); await new Promise(r=>setTimeout(r,300));
  return {before,after:{ap:phaseCount('ap'),pcm:phaseCount('pcm')},viol:[...phaseViolations(state.analyses.ap.nodes),...phaseViolations(state.analyses.pcm.nodes)].length};
};
window.__moveSynthetic=async function(){
  window.showChoiceDialog=async()=>'copy';
  state=freshState(); collapsed=new Set(); reportCfg=null;
  const pw=(w,v)=>({w,var:v||0,va:Math.hypot(w,v||0),a:null,pf:null});
  const root=state.rootIds[0];
  const mk=(p,t,d,x={})=>addNode(p,{type:t,description:d,acDc:'ac',voltage:115,capacity:{a:null,va:30000},existingLoad:pw(1000,100),...x});
  const gen=mk(root,'Generator','Gen'), other=mk(root,'Generator','Other Gen');
  const bs=[['A',0],['B',1],['C',2]].map(([l,s])=>mk(gen,'Bus','Bus',{phase:l,phaseGroupId:'BG',phaseSeq:s}));
  bs.forEach((b,i)=>mk(b,'Circuit Breaker','CB '+i,{phase:['A','B','C'][i],phaseGroupId:'CBG'+i,phaseSeq:0}));
  recalc(); createPcmAnalysis(); switchAnalysis('ap'); await shareWithOther(gen); await shareWithOther(other); recalc();
  const count=an=>Object.values(state.analyses[an].nodes).filter(n=>n.phase).length;
  const before={ap:count('ap'),pcm:count('pcm')};
  const move=async(id,parent)=>{ openEdit(id); await new Promise(r=>setTimeout(r,150)); const s=document.getElementById('ef-parent'); s.value=parent||''; s.dispatchEvent(new Event('change')); await doEditSave(); await new Promise(r=>setTimeout(r,250)); };
  await move(gen,'');                                  // unlabeled item to the top level: splits below stay
  const afterRoot={ap:count('ap'),pcm:count('pcm')};
  await move(gen,other);                               // and back under another unlabeled parent
  const afterUnder={ap:count('ap'),pcm:count('pcm')};
  return {before,afterRoot,afterUnder,viol:[...phaseViolations(state.analyses.ap.nodes),...phaseViolations(state.analyses.pcm.nodes)].length};
};
