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
      const stars=Array.from({length:5},(_,i)=>{
        const n=p.stars?.[i];
        if(gap || typeof n!=='number' || !Number.isFinite(n) || n<=0) {gap=true;return 0;}
        return Math.min(3,Math.floor(n));
      });
      return {id:p.id,name:cleanName(p.name),mode:p.mode,stars};
    });
    return {version:1,profiles,activeId:profiles.some(p=>p.id===data.activeId)?data.activeId:null,sound:data.sound!==false};
  } catch {return blank();}
}
export function addProfile(data,name,mode,id) {
  if(!['little','explorer'].includes(mode) || data.profiles.some(p=>p.id===id) || data.profiles.length>=12) return data;
  return {...data,activeId:id,profiles:[...data.profiles,{id,name:cleanName(name),mode,stars:[0,0,0,0,0]}]};
}
export function renameProfile(data,id,name) {
  return {...data,profiles:data.profiles.map(p=>p.id===id?{...p,name:cleanName(name)}:p)};
}
export function unlockedLevel(profile) {
  const first=profile.stars.findIndex(n=>n===0);
  return first===-1 ? 4 : first;
}
export function recordCompletion(data,id,index) {
  if(!Number.isInteger(index)||index<0||index>4) return data;
  return {...data,profiles:data.profiles.map(p=>{
    if(p.id!==id || index>unlockedLevel(p)) return p;
    const stars=[...p.stars];stars[index]=3;
    return {...p,stars};
  })};
}
export function loadSave() {
  try {return parseSave(localStorage.getItem(SAVE_KEY));}catch{return blank();}
}
export function persistSave(data) {
  try {localStorage.setItem(SAVE_KEY,JSON.stringify(data));return true;}catch{return false;}
}
