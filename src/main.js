import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-800.css';
import './style.css';
import './world-first.css';
import { createWorld } from './world.js';
import { PRODUCTS, MODES, LEVELS, startLevel, loadProduct, removeProduct, depart, arrive, unloadProduct, answerQuiz, countProduct, totalOrder, isLoaded, startBonus, buyProduct, confirmPurchase, chooseVisit, autoLoad } from './game.js';
import { loadSave, persistSave, addProfile, renameProfile, recordCompletion, unlockedLevel, buyUpgrade, recordBonus } from './storage.js';
import { CHAPTERS, CUSTOMERS } from './campaign.js';
import { campaignMap, revealedChapter, companyPanel, purchasePanel, visitBrief, visitPanel } from './campaign-ui.js';
import { speak, chime, setSound, setEngine, stopSpeech } from './audio.js';
import { requestInstall, getInstallState, applyUpdate } from './install.js';

const app=document.querySelector('#app');
const dialog=document.querySelector('#dialog');
const toastElement=document.querySelector('#toast');
let data=loadSave();
let screen=data.activeId?'map':'welcome';
let chapterPage=null;
let levelsExpanded=false;
let taskCollapsed=false;
let autoDriving=false;
let selectedMode='little';
let session=null;
let driving=false;
let cockpit=false;
let world;
let toastTimer;
let celebrationTimer;
let completedRecorded=false;
let renderedStage;
let pointerActivation;
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const profile=()=>data.profiles.find(p=>p.id===data.activeId);
const customer=()=>CUSTOMERS[session?.level.destination]?.name||'il cliente';
setSound(data.sound);

const icons={
  arrow:'<path d="m9 5 7 7-7 7"/>',back:'<path d="m15 5-7 7 7 7"/>',
  home:'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
  sound:'<path d="m11 4-6 5H2v6h3l6 5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute:'<path d="m11 4-6 5H2v6h3l6 5Z"/><path d="m16 9 5 6m0-6-5 6"/>',
  install:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3c-1 0-1 1-1 2m0 3h.01"/>',
  check:'<path d="m5 12 4 4L19 6"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  person:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
};
const icon=name=>`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.arrow}</svg>`;
const button=(action,label,cls='primary',extra='')=>`<button type="button" class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
const stars=(n=0)=>`<span class="stars" aria-label="${n} stelle su 3">${[1,2,3].map(i=>`<span class="${i<=n?'earned':''}">★</span>`).join('')}</span>`;

function save(){if(!persistSave(data))toast('I progressi restano in questa partita: il salvataggio sul dispositivo non è disponibile.');}
function toast(text){clearTimeout(toastTimer);toastElement.textContent=text;toastElement.classList.add('visible');toastTimer=setTimeout(()=>toastElement.classList.remove('visible'),4200);}
function instruction(){
  if(!session)return 'Scegli un’avventura e sali sul camion!';
  if(session.stage==='purchase')return 'Controlla la dispensa e acquista le cassette mancanti.';
  if(session.stage==='brief')return session.level.intro;
  if(session.stage==='visit')return session.level.visitText;
  if(session.stage==='load')return `${session.level.intro} Tocca i prodotti per caricarli sul camion.`;
  if(session.stage==='drive')return `Si parte per ${customer()}! Tieni premuto il pulsante per guidare.`;
  if(session.stage==='unload')return `Siamo arrivati! Tocca le cassette per consegnarle a ${customer()}.`;
  if(session.stage==='quiz')return session.level.quiz.question;
  return 'Consegna completata! Hai guadagnato tre stelle!';
}

function header(){
  const p=profile();
  return `<header class="topbar">
    <button class="brand" data-action="home" aria-label="LAPA World, vai alla mappa"><img src="${import.meta.env.BASE_URL}logo-lapa.png" alt=""/><span>LAPA<span class="brand-world">WORLD</span></span></button>
    <div class="top-actions">${p?`<button class="profile-chip" data-action="profiles" aria-label="Cambia giocatore">${MODES[p.mode].icon}<span>${esc(p.name)}</span></button>`:''}
    ${button('sound',icon(data.sound?'sound':'mute'),'icon-button',`aria-label="${data.sound?'Disattiva':'Attiva'} audio" aria-pressed="${data.sound}"`)}
    ${button('install',icon('install'),'icon-button','aria-label="Installa il gioco"')}
    ${button('help',icon('help'),'icon-button help-button','aria-label="Come si gioca"')}</div>
  </header>`;
}

function welcome(){
  const saved=data.profiles.length?`<div class="saved-profiles"><p>Oppure continua con</p><div>${data.profiles.map(p=>button('select-profile',`${MODES[p.mode].icon} ${esc(p.name)}`,'saved-profile',`data-id="${esc(p.id)}"`)).join('')}</div></div>`:'';
  return `<div class="world-caption"><span class="location-pin">●</span> Il tuo piccolo mondo, grandi avventure.</div>
    <section class="panel welcome-panel" aria-labelledby="welcome-title">
      <div class="ticket-tag"><span></span> Otto zone · Un mondo da scoprire</div>
      <h1 id="welcome-title">Si parte!</h1><p class="intro">Un camion rosso.<br> Un mondo che cresce con te.</p>
      <form id="profile-form"><label for="player-name">Come ti chiami?</label><input id="player-name" name="name" maxlength="20" placeholder="Il tuo nome" autocomplete="off" value=""/>
      <fieldset><legend>Scegli la tua avventura</legend>
      <div class="mode-choices">${Object.entries(MODES).map(([key,m])=>`<button type="button" class="mode-choice ${selectedMode===key?'selected':''}" data-action="mode" data-mode="${key}" aria-pressed="${selectedMode===key}"><span class="mode-emoji">${m.icon}</span><span><strong>${m.name}</strong><small>${m.age} · ${m.description}</small></span><span class="mode-dot">${selectedMode===key?icon('check'):''}</span></button>`).join('')}</div></fieldset>
      <button class="primary wide" type="submit">Andiamo! ${icon('arrow')}</button></form>${saved}
    </section><div class="corner-note">Fatto di curiosità e buone cose.</div>`;
}

function map(){const p=profile();return p?campaignMap(p,chapterPage,levelsExpanded):welcome();}

function journeySteps(){
  const visit=session.level.kind==='visit';
  const steps=visit?['brief','drive','visit']:session.level.purchase?['purchase','load','drive','unload','quiz']:['load','drive','unload',...(session.mode==='explorer'?['quiz']:[])];
  const labels={brief:'Scegli',purchase:'Acquista',load:'Carica',drive:'Viaggia',unload:'Consegna',visit:'Ascolta',quiz:'Scopri'};
  const active=steps.indexOf(session.stage);
  return `<nav class="journey" aria-label="Fasi della missione">${steps.map((stage,i)=>`<span class="${i===active?'active':i<active?'done':''}"><b>${i<active?'✓':i+1}</b>${labels[stage]}</span>`).join('')}</nav>`;
}

function play(){
  const p=profile();const s=session;const order=s.level.order;
  const base=`<div class="mission-badge">${button('exit',icon('back'),'icon-button','aria-label="Torna ai livelli"')}<span><small>${s.level.bonus?'Incarico libero '+(s.bonusRound+1):'Livello '+(s.index+1)} · ${esc(p.name)}</small><strong>${s.level.title}</strong></span>${button('repeat',icon('sound'),'repeat-button','aria-label="Ascolta le istruzioni"')}</div>`;
  if(s.stage==='complete')return reward();
  let content='';
  if(s.stage==='purchase')content=purchasePanel(s);
  else if(s.stage==='brief')content=visitBrief(s);
  else if(s.stage==='visit')content=visitPanel(s);
  else if(s.stage==='load'){
    const ready=isLoaded(s);const shelf=Object.keys(order);
    const distractor=Object.keys(PRODUCTS).find(id=>!shelf.includes(id));if(s.mode==='explorer'&&distractor)shelf.push(distractor);
    content=`<div class="task-title"><div><h2>Carichiamo il camion!</h2><p>L’ordine di <strong>${customer()}</strong></p></div><span class="parcel-count">📦 ${s.cargo.length}<small>/${totalOrder(s.level)}</small></span></div>
      <div class="order-strip" aria-label="Prodotti richiesti">${Object.entries(order).map(([id,n])=>`<div class="order-item ${countProduct(s.cargo,id)===n?'fulfilled':''}"><span>${PRODUCTS[id].emoji}</span><b>${n}</b><small>${PRODUCTS[id].name}</small>${countProduct(s.cargo,id)===n?icon('check'):''}</div>`).join('')}</div>
      <div class="shelf-label"><span>Tocca un prodotto per caricarlo</span><span>↓</span></div>
      <div class="product-shelf">${shelf.map(id=>`<button class="product" data-action="load" data-product="${id}" aria-label="Carica ${PRODUCTS[id].name}" style="--product-color:${PRODUCTS[id].color}"><span class="product-emoji">${PRODUCTS[id].emoji}</span><strong>${PRODUCTS[id].name}</strong><small>${PRODUCTS[id].zone}</small></button>`).join('')}</div>
      <div class="cargo-row"><span class="cargo-label">Sul camion</span><div class="cargo-slots">${Array.from({length:totalOrder(s.level)},(_,i)=>s.cargo[i]?`<button class="cargo-slot filled" data-action="remove" data-product="${s.cargo[i]}" aria-label="Togli ${PRODUCTS[s.cargo[i]].name}">${PRODUCTS[s.cargo[i]].emoji}</button>`:'<span class="cargo-slot empty" aria-hidden="true">·</span>').join('')}</div></div>
      ${p.upgrades.includes('helper')&&!ready?button('auto-load','👩‍🔧 Marta, aiutami a caricare','secondary wide'):''}
      ${button('depart',`${ready?'Tutto pronto, partiamo!':'Prima carichiamo l’ordine'} ${icon('arrow')}`,'primary wide',ready?'':'disabled')}`;
  }else if(s.stage==='drive'){
    content=`<div class="task-title"><div><h2>Andiamo da ${customer()}!</h2><p>${s.level.vehicle==='car'?'Oggi sei in macchina: andiamo a conoscere il cliente.':'Tieni premuto per far viaggiare il camion.'}</p></div><span class="destination-emoji">${CUSTOMERS[s.level.destination].emoji}</span></div>
      <div class="drive-tools ${p.upgrades.includes('driver')?'with-driver':''}">${button('cockpit',`${cockpit?'🌳 Vista dall’alto':s.level.vehicle==='car'?'🚙 Sali in macchina':'🚚 Sali a bordo'} ${icon('arrow')}`,'cab-toggle',`aria-pressed="${cockpit}"`)}
      ${p.upgrades.includes('driver')?button('auto-drive',autoDriving?'⏸ Ferma Leo':'🧑‍✈️ Leo, guida tu','secondary wide',`aria-pressed="${autoDriving}"`):''}</div>
      <button class="drive-button" id="drive" aria-label="Tieni premuto per guidare"><span class="steering-wheel">◉</span><span><strong>Tieni premuto</strong><small>e si parte!</small></span><span class="drive-arrow">↑</span></button><p class="keyboard-hint">Sul computer puoi tenere premuta la barra spaziatrice.</p>`;
  }else if(s.stage==='unload'){
    content=`<div class="task-title"><div><h2>Eccoci, consegna in arrivo!</h2><p>Tocca le cassette per darle al cliente.</p></div><span class="destination-emoji">👨‍🍳</span></div>
      <div class="customer-speech">«Ciao ${esc(p.name)}, ti aspettavamo!»<span>${customer()}</span></div>
      <div class="unload-shelf">${s.cargo.map((id,i)=>`<button class="delivery-crate" data-action="unload" data-product="${id}" aria-label="Consegna ${PRODUCTS[id].name}" style="--product-color:${PRODUCTS[id].color}"><span>${PRODUCTS[id].emoji}</span><small>${PRODUCTS[id].name}</small>${icon('arrow')}</button>`).join('')}</div><p class="task-foot">Ancora ${s.cargo.length} ${s.cargo.length===1?'cassetta':'cassette'} da consegnare</p>`;
  }else if(s.stage==='quiz'){
    content=`<div class="task-title"><div><div class="ticket-tag">Una piccola scoperta</div><h2>Facciamo due conti!</h2></div><span class="destination-emoji">🧩</span></div><p class="quiz-question">${s.level.quiz.question}</p><div class="quiz-picture" aria-hidden="true">${s.level.quiz.picture}</div><div class="answers">${s.level.quiz.options.map(n=>button('answer',n,'answer',`data-answer="${n}" aria-label="Risposta ${n}"`)).join('')}</div><p class="task-foot">Prenditi il tuo tempo. Puoi riprovare!</p>`;
  }
  return `<section class="panel play-panel ${s.stage}-panel ${taskCollapsed?'task-collapsed':''}" aria-label="${s.stage==='load'?'Caricamento':s.stage==='drive'?'Viaggio':s.stage==='unload'?'Consegna':'Enigma'}"><button class="task-toggle" data-action="toggle-task" aria-expanded="${!taskCollapsed}">${taskCollapsed?'Mostra i comandi':'Guarda la mappa'} ${taskCollapsed?'&#9650;':'&#9660;'}</button><div class="task-content">${base}${journeySteps()}${content}</div></section>`;
}

function reward(){
  const p=profile(),last=session.index===LEVELS[session.mode].length-1,bonus=session.level.bonus;
  const opened=!bonus&&!last&&LEVELS[session.mode][session.index+1].chapter>session.level.chapter;
  const newZone=opened?CHAPTERS[session.level.chapter+1]:null;
  return `<section class="panel reward-panel" aria-labelledby="reward-title"><div class="reward-sticker">${opened?newZone.icon:last?'🏆':session.level.sticker}</div><div class="reward-stars" aria-label="Tre stelle">★ ★ ★</div><h1 id="reward-title">${opened?'Una nuova zona!':last?'Il mondo è tuo!':session.level.kind==='visit'?'Un nuovo amico!':'Consegna fatta!'}</h1><p>${opened?`Le nuvole si aprono: <strong>${newZone.name}</strong> ti aspetta con nuovi clienti e nuove strade.`:last?'Hai aperto tutte le strade! Ora ti aspettano gli incarichi liberi, sempre diversi.':session.level.kind==='visit'?`${customer()} si affida a te per i prossimi ordini!`:`${customer()} ha tutto il necessario.<br>Grazie, ${esc(p.name)}!`}</p>${p.mode==='explorer'?`<p class="reward-coins">🪙 ${p.coins} monete nella tua attività</p>`:''}${button(bonus?'bonus':last?'map':opened?'map':'next',`${bonus?'Un altro incarico':last?'Esplora il mondo':opened?'Scopri la nuova zona':'Prossima avventura'} →`,'primary wide')}${button('replay','Rifacciamo questo giro?','text-button')}</section>`;
}

function render(){
  const active=document.activeElement;
  const focused=app.contains(active)?{id:active.id,tag:active.tagName,data:{...active.dataset},type:active.type}:null;
  const stage=screen==='play'?`${screen}:${session.index}:${session.stage}`:screen;
  const stageChanged=renderedStage!==undefined&&renderedStage!==stage;
  const initial=renderedStage===undefined;
  if(stageChanged)taskCollapsed=false;
  renderedStage=stage;
  const name=document.querySelector('#player-name')?.value;
  const updateNotice=getInstallState().updateReady&&['welcome','map'].includes(screen)?`<aside class="update-notice" aria-label="Aggiornamento disponibile"><p>Una nuova versione di LAPA World è pronta.</p>${button('update','Aggiorna il gioco','secondary')}</aside>`:'';
  app.innerHTML=header()+(screen==='welcome'?welcome():screen==='map'?map():play())+updateNotice;
  if(name!==undefined&&screen==='welcome')document.querySelector('#player-name').value=name;
  if(!initial&&!dialog.open){
    let target;
    if(!stageChanged&&focused)target=[...app.querySelectorAll('button,input')].find(el=>el.tagName===focused.tag&&!el.disabled&&(focused.id?el.id===focused.id:Object.keys(focused.data).length?JSON.stringify({...el.dataset})===JSON.stringify(focused.data):el.type===focused.type));
    if(!target&&(stageChanged||focused))target=app.querySelector('.panel h1,.panel h2');
    if(target){if(!target.matches('button,input'))target.tabIndex=-1;target.focus({preventScroll:true});}
  }
  document.body.dataset.screen=screen;document.body.dataset.stage=session?.stage||'';
  document.body.dataset.cockpit=String(cockpit&&session?.stage==='drive');
  if(screen==='welcome'){
    document.querySelector('#profile-form').addEventListener('submit',event=>{
      event.preventDefault();
      if(data.profiles.length>=12){toast('Ci sono già 12 piloti. Scegli un profilo esistente.');return;}
      const name=new FormData(event.target).get('name');
      data=addProfile(data,name,selectedMode,crypto.randomUUID());save();chapterPage=null;screen='map';world?.setRegion(0);render();chime();
      speak('Benvenuto a bordo! Scegli la tua prima consegna.');
    });
  }
  const drive=document.querySelector('#drive');
  if(drive){
    drive.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();drive.setPointerCapture(event.pointerId);setDriving(true);});
    drive.addEventListener('pointerup',()=>setDriving(false));
    drive.addEventListener('pointercancel',()=>setDriving(false));
    drive.addEventListener('lostpointercapture',()=>setDriving(false));
  }
}

function openLevel(index){
  const p=profile();if(!p||index>unlockedLevel(p))return;
  setDriving(false);cockpit=false;setEngine('off');session=startLevel(p.mode,index);screen='play';completedRecorded=false;
  clearCelebration();world?.reset();world?.setRegion(revealedChapter(p));world?.prepareTrip(session.level.destination,session.level.vehicle);world?.setView('depot');render();speak(instruction());
}
function openBonus(round){
  const p=profile();if(!p||!p.stars.every(n=>n>0))return;
  setDriving(false);cockpit=false;setEngine('off');session=startBonus(p.mode,round??p.bonusRounds);screen='play';completedRecorded=false;
  clearCelebration();world?.reset();world?.setRegion(7);world?.prepareTrip(session.level.destination,session.level.vehicle);world?.setView('depot');render();speak(instruction());
}
function updateCargo(){world?.setCargo(session.cargo.map(id=>({id,color:PRODUCTS[id].color})));}
function transition(result){
  if(!result.ok){chime('soft');toast(result.message);speak(result.message);return;}
  const previous=session.stage;session=result.session;updateCargo();
  if(session.stage==='drive'){world?.setView('road');syncEngine();}
  if(['unload','visit'].includes(session.stage)){setDriving(false);world?.setView(session.level.destination);}
  if(session.stage==='complete'&&!completedRecorded){
    completedRecorded=true;data=session.level.bonus?recordBonus(data,data.activeId,session.bonusRound):recordCompletion(data,data.activeId,session.index);save();chime('win');celebrate();
  }else chime();
  if(session.stage!==previous){clearTimeout(toastTimer);toastElement.classList.remove('visible');}
  if(session.stage!=='drive')setEngine('off');
  render();
  if(session.stage!==previous)speak(instruction());
  else if(session.stage==='load'&&isLoaded(session))speak('Perfetto! Il camion è pronto. Partiamo!');
}
function setDriving(value){
  if(!value){autoDriving=false;const control=document.querySelector('[data-action=auto-drive]');if(control){control.textContent='🧑‍✈️ Leo, guida tu';control.setAttribute('aria-pressed','false');}}
  driving=Boolean(value&&screen==='play'&&session?.stage==='drive'&&!dialog.open);
  world?.setDriving(driving);document.querySelector('#drive')?.classList.toggle('driving',driving);
  syncEngine();
}
function syncEngine(){setEngine(screen==='play'&&session?.stage==='drive'&&!dialog.open&&!document.hidden?(driving?'drive':'idle'):'off');}
function toMap(){chapterPage=null;levelsExpanded=false;setDriving(false);setEngine('off');stopSpeech();cockpit=false;session=null;screen=profile()?'map':'welcome';clearCelebration();world?.reset();world?.setRegion(profile()?revealedChapter(profile()):0);render();}
function clearCelebration(){clearTimeout(celebrationTimer);document.querySelector('#celebration').replaceChildren();}
function celebrate(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const colors=['#e55245','#efc957','#71aa79','#76c3d2'];
  document.querySelector('#celebration').innerHTML=Array.from({length:30},(_,i)=>`<i style="left:${(i*37)%100}%;--delay:${(i%7)*0.1}s;--turn:${i%2?'-':''}280deg;background:${colors[i%4]}"></i>`).join('');
  celebrationTimer=setTimeout(clearCelebration,4500);
}
function modal(content){dialog.removeAttribute('aria-labelledby');setDriving(false);setEngine('off');dialog.innerHTML=`${content}${button('close-dialog','Chiudi','secondary wide')}`;dialog.showModal();}

async function action(event){
  const element=event.target.closest('[data-action]');if(!element||element.disabled)return;
  // A released hold must never activate a replacement control mounted beneath it.
  if(event.detail>0&&pointerActivation){
    const original=pointerActivation;pointerActivation=null;
    if(original.element!==element||original.action!==element.dataset.action){event.preventDefault();return;}
  }
  const a=element.dataset.action;
  if(a==='toggle-levels'){levelsExpanded=!levelsExpanded;render();}
  else if(a==='toggle-task'){setDriving(false);taskCollapsed=!taskCollapsed;render();}
  else if(a==='chapter'){
    const next=Number(element.dataset.chapter);if(next>revealedChapter(profile()))return;chapterPage=next;render();
  }else if(a==='company')modal(companyPanel(profile()));
  else if(a==='upgrade'){
    const result=buyUpgrade(data,data.activeId,element.dataset.upgrade);
    if(!result.ok){toast(result.message);return;}
    data=result.data;save();dialog.close();render();modal(companyPanel(profile()));chime('win');
  }else if(a==='buy-product')transition(buyProduct(session,element.dataset.product));
  else if(a==='purchase-done')transition(confirmPurchase(session));
  else if(a==='visit-product')transition(chooseVisit(session,element.dataset.product));
  else if(a==='auto-load'&&profile().upgrades.includes('helper'))transition(autoLoad(session));
  else if(a==='auto-drive'&&profile().upgrades.includes('driver')){
    autoDriving=!autoDriving;setDriving(autoDriving);render();
  }else if(a==='vehicle'&&session?.stage==='brief'){
    session={...session,level:{...session.level,vehicle:element.dataset.vehicle==='car'?'car':'truck'}};world?.prepareTrip(session.level.destination,session.level.vehicle);render();
  }else if(a==='bonus')openBonus();
  else if(a==='cockpit'){
    setDriving(false);cockpit=!cockpit;world?.setCockpit(cockpit);render();
  }else if(a==='rename'){
    modal(`<h2 id="rename-title">Modifica il tuo nome</h2><form id="rename-form"><label for="rename-name">Nome del pilota</label><input id="rename-name" name="name" maxlength="20" autocomplete="off" value="${esc(profile().name)}"/><button type="submit" class="primary wide">Salva nome</button></form>`);
    dialog.setAttribute('aria-labelledby','rename-title');
    document.querySelector('#rename-name').focus();
    document.querySelector('#rename-form').addEventListener('submit',event=>{
      event.preventDefault();data=renameProfile(data,data.activeId,new FormData(event.target).get('name'));save();dialog.close();render();document.querySelector('[data-action="rename"]')?.focus();
    });
  }else if(a==='mode'){
    selectedMode=element.dataset.mode;
    const input=document.querySelector('#player-name');const name=input.value;render();document.querySelector('#player-name').value=name;
  }else if(a==='select-profile'){
    data={...data,activeId:element.dataset.id};save();chapterPage=null;screen='map';session=null;world?.reset();world?.setRegion(revealedChapter(profile()));render();
  }else if(a==='profiles'){
    if(screen==='play'){modal('<h2>Cambiare pilota?</h2><p>Questa consegna ricomincerà dall’inizio. Le stelle conquistate restano salvate.</p>'+button('confirm-profiles','Cambia pilota','primary wide'));}
    else{chapterPage=null;screen='welcome';session=null;world?.reset();world?.setRegion(0);render();}
  }else if(a==='confirm-profiles'){
    dialog.close();setEngine('off');stopSpeech();cockpit=false;screen='welcome';session=null;clearCelebration();world?.reset();render();
  }else if(a==='level')openLevel(Number(element.dataset.level));
  else if(a==='load')transition(loadProduct(session,element.dataset.product));
  else if(a==='remove')transition(removeProduct(session,element.dataset.product));
  else if(a==='depart')transition(depart(session));
  else if(a==='unload')transition(unloadProduct(session,element.dataset.product));
  else if(a==='answer')transition(answerQuiz(session,Number(element.dataset.answer)));
  else if(a==='next')openLevel(session.index+1);
  else if(a==='replay'){if(session.level.bonus)openBonus(session.bonusRound);else openLevel(session.index);}
  else if(a==='map')toMap();
  else if(a==='home'||a==='exit'){
    if(screen==='play'&&session.stage!=='complete')modal('<h2>Torniamo alla mappa?</h2><p>Puoi ricominciare questa consegna quando vuoi. Le tue stelle sono al sicuro.</p>'+button('confirm-exit','Torna alla mappa','primary wide'));
    else toMap();
  }else if(a==='confirm-exit'){dialog.close();toMap();}
  else if(a==='sound'){data={...data,sound:!data.sound};setSound(data.sound);save();render();if(data.sound)speak('Audio attivato.');}
  else if(a==='repeat')speak(instruction());
  else if(a==='close-dialog')dialog.close();
  else if(a==='help')modal('<div class="dialog-emoji">🚚</div><h2>Pronti a partire?</h2><ol class="help-list"><li>Carica i prodotti indicati nell’ordine.</li><li>Tieni premuto il pulsante per guidare.</li><li>Tocca le cassette per consegnarle.</li><li>Nuove missioni aprono nuove strade e quartieri.</li><li>In macchina, visita il cliente e scegli il prodotto richiesto.</li><li>Negli Esploratori, acquista le scorte mancanti e risolvi gli enigmi. In «La mia LAPA» puoi assumere aiutanti.</li></ol><p>Puoi ascoltare le istruzioni con l’altoparlante. Ogni pilota ha le sue stelle, salvate su questo dispositivo.</p>');
  else if(a==='install'){
    if(await requestInstall())return;
    const state=getInstallState();
    modal(`<div class="dialog-emoji">📲</div><h2>${state.installed?'LAPA è già con te!':'Porta LAPA con te'}</h2><p><strong>iPhone e iPad:</strong> apri in Safari, tocca Condividi e poi “Aggiungi alla schermata Home”.</p><p><strong>Android:</strong> nel menu del browser scegli “Installa app” o “Aggiungi a schermata Home”.</p><p class="offline-note">${state.offlineReady?'✓ Il gioco è pronto anche senza connessione.':'Apri il gioco con una connessione per scaricare tutti i livelli. Il primo caricamento può richiedere qualche istante.'}</p><p class="small-note">I progressi sono salvati su questo dispositivo. Le istruzioni vocali sono incluse nel gioco e funzionano anche offline.</p>${state.updateReady?button('update','Aggiorna il gioco','primary wide'):''}`);
  }else if(a==='update'){dialog.close();applyUpdate();}
}

document.addEventListener('pointerdown',event=>{
  const element=event.target.closest('button');
  pointerActivation={element,action:element?.dataset.action};
},true);
document.addEventListener('pointercancel',()=>{pointerActivation=null;},true);
document.addEventListener('click',action);
document.addEventListener('keydown',event=>{
  if(dialog.open||event.target.matches('input,textarea'))return;
  if(screen==='play'&&session?.stage==='drive'&&['Space','ArrowUp'].includes(event.code)) {event.preventDefault();setDriving(true);}
});
document.addEventListener('keyup',event=>{if(['Space','ArrowUp'].includes(event.code))setDriving(false);});
window.addEventListener('blur',()=>{setDriving(false);setEngine('off');});
window.addEventListener('focus',syncEngine);
document.addEventListener('visibilitychange',()=>{if(document.hidden){setDriving(false);setEngine('off');stopSpeech();}else syncEngine();});
dialog.addEventListener('close',syncEngine);
window.addEventListener('update-ready',()=>{if(['welcome','map'].includes(screen))render();});
window.addEventListener('offline-ready',()=>toast('Il mondo LAPA è pronto anche senza connessione.'));
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});

render();
try {
  world=createWorld(document.querySelector('#world'),{onArrive:()=>{
    if(session?.stage==='drive')transition(arrive(session));
  }});
  world.setRegion(profile()?revealedChapter(profile()):0);
} catch(error){
  console.error('3D initialization failed:',error);
  app.innerHTML=`<main class="panel unsupported"><div class="dialog-emoji">🚚</div><h1>Accendiamo il motore?</h1><p>Il 3D non è disponibile in questo browser. Prova ad aprire il gioco in una versione aggiornata di Safari o Chrome.</p><button class="primary wide" onclick="location.reload()">Riprova</button></main>`;
}
