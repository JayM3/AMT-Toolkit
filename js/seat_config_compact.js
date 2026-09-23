/* Compact Seat Config: same inputs, state and solver; reversible presentation only. */
(() => {
  let mounted = false, restoreStandard = null, lastTab = 'routes';
  const hookNames = ['toggleLegCargo','addOrUpdateLeg','cancelLegEdit','clearLegForm','editLeg','addAuditToSeatConfig','handleLegDragOver','handleLegDragEnd','renderCircuitStatus','renderCircuitTable','renderActivePlanDetails','renderCircuitSchedule','renderFinancialOverview','toggleSeatConfigComparator'];

  // Keep the actual nodes, including their input values and event listeners. The
  // snapshot is taken afresh on every entry, never from an HTML clone or saved data.
  function snapshotTree(root) {
    const records = [];
    function visit(node) {
      records.push({node, children:[...node.childNodes], attrs:node.nodeType===1?[...node.attributes].map(a=>[a.name,a.value]):null, text:node.nodeType===3?node.data:null});
      for (const child of node.childNodes) visit(child);
    }
    visit(root);
    return () => {
      for (const {node,children,attrs,text} of records) {
        if (attrs) {
          const liveInput = node.matches('input,select,textarea');
          const preserve = name => liveInput && ['value','checked','selected'].includes(name);
          for (const a of [...node.attributes]) if (!preserve(a.name)) node.removeAttribute(a.name);
          for (const [name,value] of attrs) if (!preserve(name)) node.setAttribute(name,value);
          node.replaceChildren(...children);
        } else if (text !== null) node.data = text;
      }
    };
  }

  function mount() {
    const view = document.getElementById('view_seat_config');
    if (!document.getElementById('sc_aircraft_comparator_panel').classList.contains('hidden')) {
      toggleSeatConfigComparator();
    }
    const restore = snapshotTree(view);
    const originals = Object.fromEntries(hookNames.map(name=>[name,window[name]]));
    mounted = true;
    view.classList.add('sc-compact');
    const [setup,editor,routes,schedule,fleet,financials] = view.querySelectorAll(':scope > section');
    setup.id='sc_layout_setup'; editor.id='sc_layout_editor'; routes.id='sc_layout_routes';
    const toolbar=document.createElement('div');toolbar.className='sc_layout_toolbar';
    toolbar.innerHTML='<button type="button" onclick="openSaveCircuitModal()">Save</button><button type="button" onclick="openSavedCircuitsModal()">Circuits</button><button type="button" onclick="openSavedAuditsModal()">Audits</button><button type="button" onclick="clearAllLegs()" class="sc_layout_clear">Clear</button>';
    view.append(toolbar);
    const examples=document.createElement('div');examples.className='sc_layout_examples';
    examples.innerHTML='<button type="button" title="Load standard 24-hour example" onclick="loadExample24hCircuit()">24h</button><button type="button" title="Load standard 168-hour example" onclick="loadExample168hCircuit()">168h</button>';
    setup.append(examples);
    const tabs=document.createElement('div');tabs.className='sc_layout_tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Seat configuration workspace');setup.after(tabs);
    const panels={};
    for(const [key,nodes] of Object.entries({routes:[editor,routes],fleet:[fleet],schedule:[schedule],financials:[financials]})) {
      const panel=document.createElement('div');panel.id='sc_layout_panel_'+key;panel.className='sc_layout_pane';panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','sc_layout_tab_'+key);panel.append(...nodes);view.insertBefore(panel,toolbar);panels[key]=panel;
      const button=document.createElement('button');button.type='button';button.id='sc_layout_tab_'+key;button.textContent=key[0].toUpperCase()+key.slice(1);button.setAttribute('role','tab');button.setAttribute('aria-controls',panel.id);button.onclick=()=>window.scSelectCompactTab(key);tabs.append(button);
    }
    window.scSelectCompactTab=key=>{
      lastTab=key;
      for(const [name,panel] of Object.entries(panels)) {
        panel.hidden=name!==key;
        const button=document.getElementById('sc_layout_tab_'+name);button.setAttribute('aria-selected',String(name===key));button.tabIndex=name===key?0:-1;
      }
    };
    tabs.addEventListener('keydown',event=>{
      const buttons=[...tabs.children],index=buttons.indexOf(document.activeElement);
      const next={ArrowRight:(index+1)%4,ArrowLeft:(index+3)%4,Home:0,End:3}[event.key];
      if(next!==undefined){event.preventDefault();buttons[next].click();buttons[next].focus();}
    });
    for(const kind of ['eco','bus','first','cargo']) for(const field of ['price','demand']) {
      const input=document.getElementById(`sc_leg_${field}_${kind}`);
      input.setAttribute('aria-label',`${{eco:'Economy',bus:'Business',first:'First class',cargo:'Cargo'}[kind]} ${field}${kind==='cargo'?(field==='price'?' per ton':' in tons'):''}`);
      input.placeholder='0';
    }
    document.getElementById('sc_leg_dur_hours').setAttribute('aria-label','Round trip hours');
    document.getElementById('sc_leg_dur_mins').setAttribute('aria-label','Round trip minutes');
    const dialogs=buildCompact();
    restoreStandard=()=>{
      const editing=document.getElementById('sc_editing_leg_id').value;
      const visible=view.classList.contains('hidden');
      // Reattaching a select's options can reset its selected value. Restore live
      // control properties after the structural move, before invoking the solver.
      const controls=[...view.querySelectorAll('input,select,textarea')].map(node=>({node,value:node.value,checked:node.checked}));
      const hubLabels=['sc_hub_info','sc_form_hub_badge'].map(id=>{const node=document.getElementById(id);return {node,text:node.textContent,className:node.className};});
      for(const dialog of dialogs) dialog.close();
      for(const [name,fn] of Object.entries(originals))window[name]=fn;
      restore();
      for(const {node,value,checked} of controls){node.value=value;if(checked!==undefined)node.checked=checked;}
      for(const {node,text,className} of hubLabels){node.textContent=text;node.className=className;}
      view.classList.toggle('hidden',visible);
      for(const dialog of dialogs)dialog.remove();
      delete window.scSelectCompactTab;delete window.scFinancialScope;
      document.getElementById('sc_leg_form_title').textContent=editing?'✏️ Edit Route':'➕ Add Route to Circuit';
      document.getElementById('sc_add_leg_btn_label').textContent=editing?'Update Route in Circuit':'Add Route to Circuit';
      document.getElementById('sc_cancel_edit_btn').classList.toggle('hidden',!editing);
      document.getElementById('sc_leg_dist_km').readOnly=!document.getElementById('sc_leg_dist_override').checked;
      toggleLegCargo();onLegDestinationChange(true);renderCircuitAll();updateAircraftBadges(getActiveAircraft());
      updateActiveCircuitIndicator();updateSavedCircuitsBadge();
    };
  }

  function buildCompact() {
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = value => Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
  const money = value => '$' + num(Math.round(value || 0));
  const short = value => {
    const n = Number(value || 0), a = Math.abs(n);
    return '$' + (a >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : a >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : a >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : num(n));
  };
  const cash = n => `<span title="${money(n)}">${short(n)}</span>`;
  const classes = ['eco','bus','first','cargo'], labels = ['Y','J','F','T'];
  const colors = ['#22d3ee','#60a5fa','#fbbf24','#34d399'];
  const clock = hours => `${String(Math.floor(hours) % 24).padStart(2,'0')}:${String(Math.round((hours % 1) * 60)).padStart(2,'0')}`;
  const duration = h => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2,'0')}`;
  const btn = (label, action, title, extra = '') => `<button type="button" onclick="${action}" title="${esc(title || label)}" aria-label="${esc(title || label)}" ${extra}>${label}</button>`;
  const el = (tag, className, html) => { const n=document.createElement(tag); n.className=className; if(html) n.innerHTML=html; return n; };
  const stash = nodes => { const n=el('div','sc-source'); n.hidden=true; n.append(...nodes); return n; };
  const kpis = values => `<div class="sc-kpis">${values.map(([label,value,tone])=>`<div><small>${label}</small><strong class="${tone||''}">${value}</strong></div>`).join('')}</div>`;
  const empty = '<div class="sc-empty">Add a route or load an example to calculate this view.</div>';

  // One control row and one status strip, instead of a large shared setup card.
  const setup=$('sc_layout_setup'), aircraft=$('sc_aircraft_combobox_root');
  const setupSource=stash([...setup.children]), top=el('div','sc-topline');
  setup.append(setupSource);
  const hub=$('sc_circuit_hub'); hub.setAttribute('aria-label','Circuit hub');
  const browse=setupSource.querySelector('button[onclick="openAircraftModal()"]'), compare=$('sc_btn_compare_aircraft');
  browse.textContent='Browse'; browse.title='Browse aircraft catalog';
  compare.querySelector('svg')?.remove(); $('sc_compare_btn_badge').style.display='none';
  const info=el('button','sc-info','ⓘ'); info.title='Hub and aircraft specifications'; info.setAttribute('aria-label',info.title);
  top.append(hub,aircraft,browse,compare,info);
  const summary=el('div','sc-statusline'); summary.id='sc_compact_status';
  const warning=el('div','sc-warning'); warning.id='sc_compact_warning';
  setup.replaceChildren(top,summary,warning,setupSource);
  const infoDialog=el('dialog','sc-dialog'); infoDialog.setAttribute('aria-label','Hub and aircraft specifications');
  infoDialog.append(el('div','sc-dialog-title','<strong>Hub & aircraft</strong><button onclick="this.closest(\'dialog\').close()" aria-label="Close specifications">×</button>'),$('sc_hub_info'),$('sc_aircraft_specs_summary'));
  document.body.append(infoDialog); info.onclick=()=>infoDialog.showModal();
  const exampleButtons=setupSource.querySelector('.sc_layout_examples');
  document.querySelector('.sc_layout_toolbar').append(exampleButtons);

  // Three fields across, then class columns. Retain original input nodes/listeners.
  const editor=$('sc_layout_editor'), editorSource=stash([...editor.children]);
  editor.append(editorSource);
  const title=el('div','sc-section-title'); title.append($('sc_leg_form_title'),$('sc_form_hub_badge'));
  const fieldRow=el('div','sc-fields');
  const dest=el('label','', 'Destination'); dest.append($('sc_leg_dst'));
  const distance=el('div',''), dl=el('div','sc-field-label','<label for="sc_leg_dist_km">Distance · km</label>');
  const manual=el('label','sc-manual'); manual.append($('sc_leg_dist_override'),document.createTextNode('Manual')); dl.append(manual); distance.append(dl,$('sc_leg_dist_km'));
  const time=el('div','','<span class="sc-field-label">Round trip · h:m</span>'), times=el('div','sc-times'); times.append($('sc_leg_dur_hours'),document.createTextNode(':'),$('sc_leg_dur_mins'));time.append(times);
  fieldRow.append(dest,distance,time);
  const hints=el('div','sc-hints'); hints.append($('sc_leg_dst_info'),$('sc_leg_range_status'));
  const matrix=el('div','sc-input-matrix');
  matrix.append(el('span','',''),...labels.map((label,i)=>el('span','sc-class-'+classes[i],['Economy','Business','First','Cargo · T'][i])));
  matrix.append(el('span','sc-input-label','Price $')); classes.forEach(c=>matrix.append($('sc_leg_price_'+c)));
  matrix.append(el('span','sc-input-label','Demand')); classes.forEach(c=>matrix.append($('sc_leg_demand_'+c)));
  const editorActions=el('div','sc-editor-actions'), cargoLabel=el('label','sc-cargo-toggle');cargoLabel.append($('sc_leg_cargo_enabled'),document.createTextNode('Cargo'));
  editorActions.append(cargoLabel,$('sc_audit_basis_toggle_group'),$('sc_cancel_edit_btn'),$('sc_clear_form_btn'),$('sc_add_leg_btn'));
  editor.append(editorActions);
  $('sc_clear_form_btn').replaceChildren(document.createTextNode('Reset')); $('sc_add_leg_btn').querySelector('svg')?.remove();
  editor.replaceChildren(title,fieldRow,hints,matrix,editorActions,editorSource);
  const syncForm=()=>{
    const editing=!!$('sc_editing_leg_id').value;
    $('sc_leg_form_title').textContent=editing?'Edit route':'Add route'; $('sc_add_leg_btn_label').textContent=editing?'Update':'+ Add';
    [$('sc_leg_price_cargo'),$('sc_leg_demand_cargo')].forEach(input=>{input.disabled=!$('sc_leg_cargo_enabled').checked;});
  };
  const originalCargo=window.toggleLegCargo;window.toggleLegCargo=()=>{originalCargo();syncForm();};
  for(const name of ['addOrUpdateLeg','cancelLegEdit','clearLegForm','editLeg','addAuditToSeatConfig']) {
    const original=window[name]; window[name]=function(...args){if(name==='editLeg'||name==='addAuditToSeatConfig')window.scSelectCompactTab('routes');const result=original.apply(this,args);syncForm();return result;};
  }
  syncForm();
  // Reuse standard reorder behavior, with compact row highlighting.
  window.handleLegDragOver=e=>{e.preventDefault();e.dataTransfer.dropEffect='move';document.querySelectorAll('.sc-route.drag-over').forEach(n=>n.classList.remove('drag-over'));e.currentTarget.classList.add('drag-over');};
  const endDrag=window.handleLegDragEnd;window.handleLegDragEnd=e=>{endDrag(e);document.querySelectorAll('.sc-route').forEach(n=>n.classList.remove('dragging','drag-over'));};
  const routeHeading=$('sc_layout_routes').firstElementChild;
  routeHeading.innerHTML='<strong>Rotation</strong><span id="sc_compact_route_count"></span><span class="sc-muted">Demand / audit price</span>';routeHeading.className='sc-section-title';
  const fleet=$('circuit_fleet_config_section'), schedule=$('circuit_schedule_section'), financials=$('circuit_financials_section');
  [fleet,schedule,financials].forEach(n=>n.classList.add('sc-results'));
  const fleetView=el('div','sc-fleet-view');fleetView.id='sc_compact_fleet';
  const strategy=el('div','sc-strategy');strategy.append($('sc_strategy_btn_maxprofit'),$('sc_strategy_btn_zeroempty'));
  const fleetSource=stash([...fleet.children]);fleet.replaceChildren(strategy,fleetView,fleetSource);
  const scheduleView=el('div','sc-schedule-view');scheduleView.id='sc_compact_schedule';schedule.replaceChildren(stash([...schedule.children]),scheduleView);
  const financialView=el('div','sc-financial-view');financialView.id='sc_compact_financials';financials.replaceChildren(stash([...financials.children]),financialView);
  let selectedFinance='all';

  function renderHeader(){
    const stats=detectCircuitStats(),plan=window.ACTIVE_FLEET_PLAN;
    summary.innerHTML=`<span>${stats.legsCount?esc(stats.type):'No circuit'}</span><span><b>${duration(stats.totalHours||0)}</b> / ${stats.targetHours}h</span><span><b>${plan?.totalPlanes||0}</b> aircraft</span><span class="sc-good">${duration(Math.max(0,stats.targetHours-stats.totalHours))} free</span>`;
    warning.textContent=(stats.rangeWarning||stats.categoryWarning||stats.isOverTime)?$('circuit_range_warning').textContent:''; warning.hidden=!warning.textContent;
    setup.title=$('active_circuit_name')?.textContent||'Circuit setup'; $('sc_layout_tab_routes').textContent=`Routes ${window.CIRCUIT_LEGS.length}`;
  }
  function renderRoutes(){
    const legs=window.CIRCUIT_LEGS||[],stats=detectCircuitStats(); $('sc_compact_route_count').textContent=legs.length+' routes';
    $('sc_circuit_table_container').innerHTML=legs.length?legs.map((leg,i)=>{
      const ap=leg.dstAirport||findAirport(leg.dst);
      return `<div class="sc-route" draggable="true" ondragstart="handleLegDragStart(event,${i})" ondragover="handleLegDragOver(event)" ondrop="handleLegDrop(event,${i})" ondragend="handleLegDragEnd(event)">
      <div class="sc-route-top"><span class="sc-route-code" title="${esc(leg.hub+' → '+leg.dst+' · '+(ap?.name||'')+' · '+(ap?.country||'')+' · Cat '+(ap?.cat||'—'))}" style="border-color:${esc(leg.color)}">${esc(leg.dst)}</span><span class="sc-route-meta">${num(leg.distanceKm)} km · <b>${duration(leg.durationHours)}</b></span>
      <span class="sc-route-actions">${stats.type==='24h'?`<span class="sc-stepper">${btn('−',`updateLegFlights(${i},-1)`,'Decrease '+leg.dst+' flights')}<b>${leg.flightsPerDay||1}×</b>${btn('+',`updateLegFlights(${i},1)`,'Increase '+leg.dst+' flights')}</span>`:''}${btn('↑',`moveLegUp(${i})`,'Move '+leg.dst+' up',i===0?'disabled':'')}${btn('↓',`moveLegDown(${i})`,'Move '+leg.dst+' down',i===legs.length-1?'disabled':'')}${btn('✎',`editLeg('${esc(leg.id)}')`,'Edit '+leg.dst)}${btn('×',`deleteLeg('${esc(leg.id)}')`,'Remove '+leg.dst)}</span></div>
      <div class="sc-route-demand">${classes.map((c,j)=>`<span class="sc-class-${c}" title="${esc(labels[j]+': daily demand '+leg.demand[c]+'; audit price '+money(leg.prices[c]))}">${labels[j]} <b>${c==='cargo'&&!leg.cargoEnabled?'off':num(leg.demand[c])}</b> <small>/ ${num(leg.prices[c])}</small></span>`).join('')}</div></div>`;
    }).join(''):empty;
  }
  function keyOf(g){const p=g.cabin;return `${g.startUnitIndex}-${g.endUnitIndex}_${p.eco}-${p.bus}-${p.first}-${p.cargo}`;}
  function fulfilled(g,p){const total=g.count*p.planesPerUnit,v=window.CIRCUIT_FULFILLED_CONFIGS?.[keyOf(g)]??window.CIRCUIT_FULFILLED_CONFIGS?.[`${g.startUnitIndex}-${g.endUnitIndex}`];return v===true?total:Math.max(0,Math.min(total,Number(v)||0));}
  function renderFleet(){
    const p=window.ACTIVE_FLEET_PLAN;if(!p){fleetView.innerHTML=empty;return;}
    const groups=[...p.stackedGroups].sort((a,b)=>(b.financials?.stackDailyRev||0)-(a.financials?.stackDailyRev||0)||b.count-a.count);
    const done=groups.reduce((s,g)=>s+fulfilled(g,p),0);
    fleetView.innerHTML=kpis([['Aircraft',p.totalPlanes],['Daily revenue',cash(p.fleetDailyRev),'sc-good'],['Load',p.circuitLoadFactor+'%'],['Capital',cash(p.totalFleetCost)]])+`
      <div class="sc-inline-info"><span>${done}/${p.totalPlanes} configured${p.is168h?' · '+p.totalUnits+' waves × 7':''}</span>${btn(done===p.totalPlanes?'Reset all':'Mark all',`setAllConfigsFulfilled(${done!==p.totalPlanes})`)}<span class="sc-spacer"></span>${btn('Expand','toggleAllConfigAccordions(true)','Expand cabin details')}${btn('Collapse','toggleAllConfigAccordions(false)','Collapse cabin details')}</div>
      <table class="sc-table sc-fleet-table"><caption class="sc-muted">Seats per aircraft · cargo in tons · revenue per stack/day</caption><thead><tr><th>Done / qty</th><th class="sc-class-eco">Y</th><th class="sc-class-bus">J</th><th class="sc-class-first">F</th><th class="sc-class-cargo">T</th><th>Rev/day</th><th></th></tr></thead><tbody>${groups.map(g=>{
        const c=g.cabin,key=keyOf(g),count=g.count*p.planesPerUnit,n=fulfilled(g,p),open=!!window.CIRCUIT_ACCORDION_EXPANDED?.[key];
        return `<tr class="${n===count?'sc-complete':''}"><td><span class="sc-stepper">${btn('−',`stepConfigFulfilled('${key}',-1,${count})`,'Decrease configured aircraft')}<button onclick="setExactConfigFulfilled('${key}',${n===count?0:count},${count})" title="Mark or reset this stack">${n}/${count}</button>${btn('+',`stepConfigFulfilled('${key}',1,${count})`,'Increase configured aircraft')}</span></td>${classes.map(cl=>`<td class="sc-class-${cl}">${num(c[cl])}</td>`).join('')}<td><button class="sc-good" onclick="openConfigFinancialPopover(event,'${key}')" title="${money(g.financials?.stackDailyRev)} per day; open financial breakdown">${short(g.financials?.stackDailyRev)}</button></td><td>${btn(open?'−':'⌄',`toggleConfigAccordion('${key}')`,'Cabin details',`aria-expanded="${open}"`)}</td></tr>${open?`<tr><td colspan="7"><div class="sc-cabin-detail"><span>${c.eco+c.bus+c.first} PAX · ${num(c.spaceUsed)}/${c.maxSeats} spaces (${c.spacePct}%)</span><span>Payload ${num(c.weightUsed)}/${c.maxPayload}T (${c.weightPct}%)</span><div class="sc-cabin-bar">${classes.slice(0,3).map((cl,i)=>`<span style="width:${100*c[cl]*[1,1.8,4.2][i]/c.maxSeats}%;background:${colors[i]}"></span>`).join('')}</div><span>Passengers ${num(c.eco*.1+c.bus*.125+c.first*.15)}T · Cargo ${c.cargo}T</span></div></td></tr>`:''}`;
      }).join('')}</tbody></table>
      <div class="sc-metric-line"><span>Weekly ${cash(p.fleetWeeklyRev)}</span><span>Potential ${cash(p.fleetMaxDailyRev)}/day</span><span class="sc-warn">Unmet ${cash(p.fleetDailyTotalUnmetLoss)}/day</span></div>`;
  }
  function timelineBlocks(){
    const legs=window.CIRCUIT_LEGS||[],stats=detectCircuitStats(),blocks=[];
    if(stats.type==='24h'){
      for(let day=0;day<7;day++){let time=day*24;for(let f=0;f<Math.max(0,...legs.map(l=>l.flightsPerDay||1));f++)for(const leg of legs){if(f<(leg.flightsPerDay||1)){blocks.push({leg,start:time,end:Math.min(time+leg.durationHours,(day+1)*24)});time+=leg.durationHours;}}}
    }else{let time=0;legs.forEach(leg=>{blocks.push({leg,start:time,end:time+leg.durationHours});time+=leg.durationHours;});}
    return blocks;
  }
  function renderSchedule(){
    const legs=window.CIRCUIT_LEGS||[],stats=detectCircuitStats();if(!legs.length){scheduleView.innerHTML=empty;return;}
    const blocks=timelineBlocks(),days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    scheduleView.innerHTML=kpis([['Scheduled',duration(stats.totalHours)],['Free',duration(Math.max(0,stats.targetHours-stats.totalHours))],['Utilized',(100*stats.totalHours/stats.targetHours).toFixed(1)+'%'],['Cycle',stats.targetHours+'h']])+`
      <div class="sc-section-title"><strong>Weekly schedule</strong><span class="sc-muted">${stats.type==='24h'?'Daily rotation repeats':'Continuous 7-day rotation'}</span></div>
      <div class="sc-week">${days.map((day,i)=>`<div class="sc-day"><span>${day}</span><div class="sc-day-track">${blocks.map(b=>({...b,s:Math.max(i*24,b.start),e:Math.min(i*24+24,b.end)})).filter(b=>b.s<b.e).map(b=>`<span style="left:${(b.s-i*24)/24*100}%;width:${(b.e-b.s)/24*100}%;background:${esc(b.leg.color)}" title="${day} ${clock(b.s)}–${b.e===(i+1)*24?'24:00':clock(b.e)} · ${esc(b.leg.hub+' → '+b.leg.dst)}">${b.leg.dst}</span>`).join('')}</div></div>`).join('')}<div class="sc-day sc-hours"><span></span><div><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div></div></div>
      <table class="sc-table"><thead><tr><th>Route</th><th>RT</th><th>${stats.type==='24h'?'Runs/day':'Runs/week'}</th><th>Scheduled</th><th>Sequence</th></tr></thead><tbody>${legs.map((l,i)=>`<tr><td><span class="sc-dot" style="background:${esc(l.color)}"></span>${esc(l.dst)}</td><td>${duration(l.durationHours)}</td><td>${stats.type==='24h'?`<span class="sc-stepper">${btn('−',`updateLegFlights(${i},-1)`,'Decrease '+l.dst+' flights')}<b>${l.flightsPerDay||1}</b>${btn('+',`updateLegFlights(${i},1)`,'Increase '+l.dst+' flights')}</span>`:1}</td><td>${duration(l.durationHours*(stats.type==='24h'?(l.flightsPerDay||1):1))}</td><td>${btn('↑',`moveLegUp(${i})`,'Move '+l.dst+' up',i===0?'disabled':'')}${btn('↓',`moveLegDown(${i})`,'Move '+l.dst+' down',i===legs.length-1?'disabled':'')}</td></tr>`).join('')}</tbody></table>
      <div class="sc-muted sc-schedule-note">Hover a block for exact times. ${stats.isOverTime?'Over capacity: '+duration(stats.totalHours-stats.targetHours)+' beyond the '+stats.targetHours+'h cycle.':'Colors follow the route order.'}</div>`;
  }
  function renderFinancials(){
    const p=window.ACTIVE_FLEET_PLAN;if(!p){financialView.innerHTML=empty;return;}
    if(selectedFinance!=='all'&&!p.routeResults.some(r=>r.leg.id===selectedFinance))selectedFinance='all';
    const selected=selectedFinance==='all'?p.routeResults:p.routeResults.filter(r=>r.leg.id===selectedFinance);
    const sum=(field,c)=>selected.reduce((s,r)=>s+Number(r[field]?.[c]||0),0), rev=c=>selected.reduce((s,r)=>s+r.sold[c]*r.prices[c],0);
    const metrics=[['Sold',c=>num(sum('sold',c))],['Demand',c=>num(sum('demand',c))],['Offer',c=>num(sum('offer',c))],['Coverage',c=>(sum('demand',c)?100*sum('sold',c)/sum('demand',c):100).toFixed(1)+'%'],['Unmet / empty',c=>num(sum('unmet',c))+' / '+num(sum('empty',c))],['Revenue / day',c=>cash(rev(c))],['Potential / day',c=>cash(sum('maxRev',c))],['Unmet loss',c=>cash(sum('unmetLoss',c))],['Empty loss',c=>cash(sum('emptyLoss',c))],['Revenue / week',c=>cash(rev(c)*7)]];
    financialView.innerHTML=kpis([['Realized / day',cash(p.fleetDailyRev),'sc-good'],['Potential / day',cash(p.fleetMaxDailyRev)],['Unmet loss',cash(p.fleetDailyTotalUnmetLoss),'sc-warn'],['Empty loss',cash(p.fleetDailyTotalEmptyLoss),'sc-warn']])+`
      <div class="sc-metric-line"><span>Capital ${cash(p.totalFleetCost)}</span><span>Payback ${p.paybackDays}d</span><span>Load ${p.circuitLoadFactor}%</span></div>
      <div class="sc-section-title"><strong>Class breakdown</strong><select aria-label="Financial breakdown scope" onchange="scFinancialScope(this.value)"><option value="all">Whole circuit</option>${p.routeResults.map(r=>`<option value="${esc(r.leg.id)}" ${r.leg.id===selectedFinance?'selected':''}>${esc(r.leg.hub+' → '+r.leg.dst)}</option>`).join('')}</select></div>
      <table class="sc-table sc-finance-matrix"><thead><tr><th>Daily basis</th>${labels.map((l,i)=>`<th class="sc-class-${classes[i]}">${l==='T'?'Cargo · T':l}</th>`).join('')}</tr></thead><tbody>${metrics.map(([label,value])=>`<tr><th>${label}</th>${classes.map(c=>`<td>${value(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <div class="sc-section-title"><strong>By route</strong><span class="sc-muted">Click route for its class breakdown</span></div>
      <table class="sc-table sc-route-finance"><thead><tr><th>Route / RT</th><th>Revenue<br>Potential</th><th>Unmet loss<br>Empty loss</th><th>Coverage<br>Load</th></tr></thead><tbody>${p.routeResults.map(r=>`<tr class="${r.leg.id===selectedFinance?'sc-selected':''}"><td><button onclick="scFinancialScope('${esc(r.leg.id)}')">${esc(r.leg.dst)}</button><small>${duration(r.leg.durationHours)} · ${r.flights}×</small></td><td><span class="sc-good">${cash(r.dailyRev)}</span><small>${cash(r.maxDailyRev)}</small></td><td><span class="sc-warn">${cash(r.totalUnmetLoss)}</span><small>${cash(r.totalEmptyLoss)}</small></td><td>${r.paxCoverage}%<small>${r.routeLoadFactor}%</small></td></tr>`).join('')}</tbody></table>
      <div class="sc-metric-line" title="k = thousand · M = million · hover amounts for exact values"><span>PAX coverage ${p.paxFillRate}%</span><span>Cargo coverage ${p.cargoFillRate}%</span><span>Weekly ${cash(p.fleetWeeklyRev)}</span></div>`;
  }
  window.scFinancialScope=value=>{selectedFinance=value;renderFinancials();};
  // Standard rendering updates computed state and per-stack economics first.
  for(const [name,after] of Object.entries({renderCircuitStatus:renderHeader,renderCircuitTable:renderRoutes,renderActivePlanDetails:renderFleet,renderCircuitSchedule:renderSchedule,renderFinancialOverview:renderFinancials})){
    const original=window[name];window[name]=function(...args){const result=original.apply(this,args);after();return result;};
  }
  const compareDialog=el('dialog','sc-dialog sc-compare-dialog');compareDialog.setAttribute('aria-label','Aircraft comparison');
  compareDialog.append(el('div','sc-dialog-title','<strong>Aircraft comparison</strong><button onclick="this.closest(\'dialog\').close()" aria-label="Close comparison">×</button>'),$('sc_aircraft_comparator_panel'));document.body.append(compareDialog);
  const originalCompare=window.toggleSeatConfigComparator;
  window.toggleSeatConfigComparator=()=>{originalCompare();if($('sc_aircraft_comparator_panel').classList.contains('hidden'))compareDialog.close();else if(!compareDialog.open)compareDialog.showModal();};
  compareDialog.addEventListener('close',()=>{if(!$('sc_aircraft_comparator_panel').classList.contains('hidden'))originalCompare();});
  renderCircuitAll();
  window.scSelectCompactTab(lastTab);
  return [infoDialog,compareDialog];

  }
  window.scSetCompactMode = compact => {
    if (compact && !mounted) mount();
    else if (!compact && mounted) { restoreStandard(); restoreStandard=null; mounted=false; }
  };
  document.addEventListener('DOMContentLoaded',()=>window.scSetCompactMode(document.body.classList.contains('amt-compact-mode')));
})();
