// Regression loops for change tracking (0.9.6). Load a page, then in the console:
//   (0,eval)(await (await fetch('/tools/regression-tracking.js')).text()); const ids=__trkBuild(); trackOn(); trackAfterChange(); ...
//   __chgCount() returns how many marks the Load Analysis Summary tab, the Word Summary and the Word horizontal detail currently show.
// throwaway tracking test loops (moved to tools/ before commit)
window.confirm=()=>true;window.__alerts=[];window.alert=m=>window.__alerts.push(m);
window.pw=(w,v)=>({w,var:v||0,va:Math.hypot(w,v||0),a:null,pf:null});
window.__trkBuild=function(){
  state=freshState(); collapsed=new Set(); reportCfg=defaultPrintCfg(); reportCfg.ac={cap:{va:true},exload:{va:true},added:{va:true},nc:{va:true},newload:{va:true},rem:{va:true}};
  ['cap','exload','added','nc','newload','rem'].forEach(g=>{ reportCfg.ac[g]={a:false,va:true,w:false,var:false,pf:false}; });
  const root=state.rootIds[0];
  const mk=(p,t,d,x={})=>addNode(p,{type:t,description:d,acDc:'ac',voltage:115,capacity:{a:null,va:30000,w:null},existingLoad:pw(1000,100),...x});
  const g=mk(root,'Generator','Gen',{capacity:{a:null,va:90000}});
  const bA=mk(g,'Bus','Bus A'), bB=mk(g,'Bus','Bus B');
  const l1=addNode(bA,{type:'Load',description:'Load 1',acDc:'ac',voltage:115,status:'new',loadValue:pw(800,100)});
  const l2=addNode(bA,{type:'Load',description:'Load 2',acDc:'ac',voltage:115,status:'new',loadValue:pw(500,50)});
  const l3=addNode(bB,{type:'Load',description:'Load 3',acDc:'ac',voltage:115,status:'new',loadValue:pw(600,60)});
  recalc();
  return {root,g,bA,bB,l1,l2,l3};
};
window.__chgCount=function(){
  renderAll();
  const scr=(document.getElementById('table-container').innerHTML.match(/rpt-chg/g)||[]).length;
  const w=buildTablesContent(); const wu=(w.match(/<w:u w:val="single"\/>/g)||[]).length;
  const h=buildLadHorizontalWordContent(); const hu=(h.match(/<w:u w:val="single"\/>/g)||[]).length;
  return {screenLAS:scr,wordLAS:wu,wordHoriz:hu};
};
'trk loaded'
