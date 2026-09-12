import { PRODUCTS, MODES, ORIGINAL_LEVELS } from './original-levels.js';
import { expandCampaign, bonusLevel, priceOf } from './campaign.js';
export { PRODUCTS, MODES };
export const LEVELS=expandCampaign(ORIGINAL_LEVELS);

const success = session => ({ ok: true, session });
const fail = message => ({ ok: false, message });
export const countProduct = (cargo, id) => cargo.filter(item => item === id).length;
export const totalOrder = level => Object.values(level.order).reduce((a,b) => a+b, 0);
export const isLoaded = session => Object.entries(session.level.order).every(([id, n]) => countProduct(session.cargo,id) === n);

export function startLevel(mode, index) {
  mode = Object.hasOwn(MODES,mode) ? mode : 'little';
  index = Number.isInteger(index) && index >= 0 && index < LEVELS[mode].length ? index : 0;
  return createSession(mode,index,LEVELS[mode][index]);
}
function createSession(mode,index,level){
  return {mode,index,level,stage:level.kind==='visit'?'brief':level.purchase?'purchase':'load',cargo:[],stock:{...level.stock},budget:level.budget||0};
}
export function startBonus(mode,round){
  mode=Object.hasOwn(MODES,mode)?mode:'little';
  round=Number.isSafeInteger(round)&&round>=0?round:0;
  return {...createSession(mode,-1,bonusLevel(mode,round)),bonusRound:round};
}
export function buyProduct(session,id){
  if(session.stage!=='purchase'||!Object.hasOwn(session.level.order,id))return fail('Acquistiamo solo i prodotti indicati nell’ordine.');
  if((session.stock[id]||0)>=session.level.order[id])return fail('Di questo prodotto ne abbiamo già abbastanza!');
  const price=priceOf(id);
  if(session.budget<price)return fail('Non ci sono abbastanza monete per questa cassetta.');
  return success({...session,budget:session.budget-price,stock:{...session.stock,[id]:(session.stock[id]||0)+1}});
}
export function confirmPurchase(session){
  if(session.stage!=='purchase'||!Object.entries(session.level.order).every(([id,n])=>session.stock[id]>=n))return fail('Controlla la dispensa e acquista le cassette mancanti.');
  return success({...session,stage:'load'});
}
export function chooseVisit(session,id){
  if(session.stage!=='visit')return fail('Prima raggiungiamo il cliente.');
  if(id!==session.level.request)return fail('Ascolta il cliente e cerca il prodotto che desidera.');
  return success({...session,stage:'complete'});
}
export function autoLoad(session){
  if(session.stage!=='load')return fail('Prima prepariamo tutti i prodotti.');
  return success({...session,cargo:Object.entries(session.level.order).flatMap(([id,n])=>Array(n).fill(id))});
}
export function loadProduct(session, id) {
  if(session.stage !== 'load') return fail('Ora seguiamo la consegna.');
  if(!Object.hasOwn(session.level.order,id)) return fail('Guarda le figure dell’ordine: ci serve un altro prodotto.');
  if(countProduct(session.cargo,id) >= session.level.order[id]) return fail('Di questo prodotto ne abbiamo già abbastanza!');
  return success({...session,cargo:[...session.cargo,id]});
}
export function removeProduct(session,id) {
  if(session.stage !== 'load' || !session.cargo.includes(id)) return fail('Questa cassetta non è sul camion.');
  const cargo=[...session.cargo];
  cargo.splice(cargo.indexOf(id),1);
  return success({...session,cargo});
}
export function depart(session) {
  if(session.stage==='brief')return success({...session,stage:'drive'});
  if(session.stage !== 'load' || !isLoaded(session)) return fail('Carichiamo prima tutte le cassette dell’ordine.');
  return success({...session,stage:'drive'});
}
export function arrive(session) {
  return session.stage === 'drive' ? success({...session,stage:session.level.kind==='visit'?'visit':'unload'}) : fail('Prima raggiungiamo il cliente.');
}
export function unloadProduct(session,id) {
  if(session.stage !== 'unload' || !session.cargo.includes(id)) return fail('Questa cassetta non si può scaricare adesso.');
  const cargo=[...session.cargo]; cargo.splice(cargo.indexOf(id),1);
  return success({...session,cargo,stage:cargo.length ? 'unload' : session.mode === 'explorer' ? 'quiz' : 'complete'});
}
export function answerQuiz(session,answer) {
  if(session.stage !== 'quiz') return fail('Prima completiamo la consegna.');
  return answer === session.level.quiz.answer ? success({...session,stage:'complete'}) : fail(session.level.quiz.hint);
}
