import { levelCount } from './campaign.js';
const blank = () => ({ version:1, profiles:[], activeId:null, sound:true });
export const SAVE_KEY='lapa-world-v1';
export const cleanName = name => String(name ?? '').trim().slice(0,20) || 'Pilota';
export function parseSave(raw) {
  try {
    const data=JSON.parse(raw);
    if(!data || data.version !== 1 || !Array.isArray(data.profiles)) return blank();
    const seen = new Set();
    const profiles=data.profiles.filter(p=>{
      if(!p || typeof p.id!=='string' || p.id.length>80 || seen.has(p.id) || !['little','explorer'].includes(p.mode)) return false;
      seen.add(p.id); return true;
    }).slice(0,12).map(p=>{
      let gap=false;
      const stars=Array.from({length:levelCount(p.mode)},(_,i)=>{
        const n=p.stars?.[i];
        if(gap || typeof n!=='number' || !Number.isFinite(n) || n<1) {gap=true;return 0;}
        return Math.min(3,Math.floor(n));
      });
      const completed=stars.filter(n=>n>0).length;
      const upgrades=Array.isArray(p.upgrades)?[...new Set(p.upgrades.filter(id=>Object.hasOwn(UPGRADES,id)&&completed>=UPGRADES[id].after&&p.mode==='explorer'))]:[];
      const coins=Number.isSafeInteger(p.coins)&&p.coins>=0?Math.min(p.coins,1000000):completed*10;
      const bonusRounds=completed===levelCount(p.mode)&&Number.isSafeInteger(p.bonusRounds)&&p.bonusRounds>=0?Math.min(p.bonusRounds,1000000):0;
      return {id:p.id,name:cleanName(p.name),mode:p.mode,stars,coins,upgrades,bonusRounds};
    });
    return {version:1,profiles,activeId:profiles.some(p=>p.id===data.activeId)?data.activeId:null,sound:data.sound!==false};
  } catch {return blank();}
}
export function addProfile(data,name,mode,id) {
  if(!['little','explorer'].includes(mode) || data.profiles.some(p=>p.id===id) || data.profiles.length>=12) return data;
  return {...data,activeId:id,profiles:[...data.profiles,{id,name:cleanName(name),mode,stars:Array(levelCount(mode)).fill(0),coins:0,upgrades:[],bonusRounds:0}]};
}
export function renameProfile(data,id,name) {
  return {...data,profiles:data.profiles.map(p=>p.id===id?{...p,name:cleanName(name)}:p)};
}
export function unlockedLevel(profile) {
  const first=profile.stars.findIndex(n=>n===0);
  return first===-1 ? profile.stars.length-1 : first;
}
export function recordCompletion(data,id,index) {
  if(!Number.isInteger(index)||index<0) return data;
  return {...data,profiles:data.profiles.map(p=>{
    if(p.id!==id || index>=levelCount(p.mode) || index>unlockedLevel(p) || p.stars[index]>0) return p;
    const stars=[...p.stars];stars[index]=3;
    return {...p,stars,coins:Math.min(1000000,p.coins+10+(p.upgrades.includes('warehouse')?5:0))};
  })};
}
export function loadSave() {
  try {return parseSave(localStorage.getItem(SAVE_KEY));}catch{return blank();}
}
export function persistSave(data) {
  try {localStorage.setItem(SAVE_KEY,JSON.stringify(data));return true;}catch{return false;}
}

export const UPGRADES={
  helper:{name:'Marta, magazziniera',icon:'👩‍🔧',cost:60,after:12,description:'Carica tutte le cassette con il pulsante «Aiutami a caricare».'},
  driver:{name:'Leo, autista',icon:'🧑‍✈️',cost:90,after:20,description:'Può guidare al posto tuo. Scegli tu quando attivarlo e fermarlo.'},
  warehouse:{name:'Magazzino ampliato',icon:'🏭',cost:120,after:28,description:'Organizzi più ordini: ogni nuova missione rende 5 monete in più.'},
};
export function buyUpgrade(data,id,upgrade){
  const p=data.profiles.find(p=>p.id===id),item=UPGRADES[upgrade];
  if(!p||p.mode!=='explorer'||!Object.hasOwn(UPGRADES,upgrade))return {ok:false,message:'Scegli un miglioramento della tua attività.'};
  if(p.upgrades.includes(upgrade))return {ok:false,message:'Questo aiuto fa già parte della squadra!'};
  if(p.stars.filter(n=>n>0).length<item.after)return {ok:false,message:`Completa ${item.after} missioni per sbloccare questo aiuto.`};
  if(p.coins<item.cost)return {ok:false,message:'Completa altre missioni per guadagnare le monete mancanti.'};
  return {ok:true,data:{...data,profiles:data.profiles.map(x=>x.id===id?{...x,coins:x.coins-item.cost,upgrades:[...x.upgrades,upgrade]}:x)}};
}
export function recordBonus(data,id,round){
  if(!Number.isSafeInteger(round)||round<0)return data;
  return {...data,profiles:data.profiles.map(p=>{
    if(p.id!==id||!p.stars.every(n=>n>0)||p.bonusRounds!==round||round>=1000000)return p;
    return {...p,bonusRounds:round+1,coins:Math.min(1000000,p.coins+10+(p.upgrades.includes('warehouse')?5:0))};
  })};
}
