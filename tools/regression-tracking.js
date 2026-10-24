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

// Notes and references (0.9.7): marks in the notes lists / markers / References list
window.__trkNotesRefs=function(){
  const o={}; const ids=window.__trkBuild();
  state.meta.rowNoteDefs.push({key:'n1',text:'Original note',sharedPeerKey:null});
  state.meta.references.push({key:'r0',organization:'FAA',docNumber:'AC 25.1351',title:'Electrical Systems',revision:'',date:'',sharedPeerKey:null});
  state.nodes[ids.l1].rowNotes=[{key:'n1',group:null}]; state.nodes[ids.l1].rowRefs=[{key:'r0',comment:'see para 3',group:null}];
  recalc(); trackOn(); trackAfterChange();
  state.meta.rowNoteDefs[0].text='Edited note'; recalc(); renderAll();
  o.noteEntry=[...document.querySelectorAll('#lad-container .rpt-detail-notes li')].map(li=>li.textContent+(li.querySelector('.rpt-chg')?' [chg]':''));
  state.nodes[ids.l2].rowNotes=[{key:'n1',group:null}]; recalc(); renderAll();
  o.markers=[...document.querySelectorAll('#lad-container tr')].filter(r=>r.querySelector('.rpt-note-marker.rpt-chg')).map(r=>r.cells[0].textContent.trim());
  return o;   // expect: the edited note is [chg] but not the unchanged ref line; the marker on Load 2 only
};

// Reject All / per-item (0.9.8): after changing a value, adding, renaming and deleting items, trackRejectAll() must put the
// project back exactly (compare trackStable of every node and the computed totals before and after).
window.__trkReject=function(){
  const ids=window.__trkBuild(); const sig=()=>JSON.stringify(Object.values(state.nodes).map(n=>[n.id,trackStable(n),n._newLoad&&n._newLoad.va]).sort());
  const before=sig(); trackOn(); trackAfterChange();
  state.nodes[ids.l1].loadValue=pw(900,100); addNode(ids.bB,{type:'Load',description:'Load 4',acDc:'ac',voltage:115,status:'new',loadValue:pw(300,30)});
  state.nodes[ids.bB].description='Bus B renamed'; detachChild(ids.l3,state.nodes[ids.l3].parentId); delete state.nodes[ids.l3]; recalc();
  const plan=trackPlan(); trackRejectAll(); trackAfterChange();
  return {plan,restoredExactly:sig()===before,marks:trackSummary()};   // expect restoredExactly:true and all marks 0
};
