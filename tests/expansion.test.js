import test from 'node:test';
import assert from 'node:assert/strict';
import * as game from '../src/game.js';
import * as saves from '../src/storage.js';
import { REGION_DESTINATIONS } from '../src/world-expansion.js';

function finish(s) {
  if(s.stage==='purchase') {
    assert.equal(game.confirmPurchase(s).ok,false);
    for(const [id,n] of Object.entries(s.level.order)) {
      while((s.stock[id]||0)<n) s=game.buyProduct(s,id).session;
    }
    assert.ok(s.budget>=0);
    s=game.confirmPurchase(s).session;
  }
  if(s.stage==='brief') s=game.depart(s).session;
  else {
    for(const [id,n] of Object.entries(s.level.order)) for(let i=0;i<n;i++) s=game.loadProduct(s,id).session;
    s=game.depart(s).session;
  }
  s=game.arrive(s).session;
  if(s.stage==='visit') {
    assert.equal(game.chooseVisit(s,'invalid').ok,false);
    s=game.chooseVisit(s,s.level.request).session;
  } else {
    for(const id of [...s.cargo]) s=game.unloadProduct(s,id).session;
  }
  if(s.stage==='quiz') s=game.answerQuiz(s,s.level.quiz.answer).session;
  assert.equal(s.stage,'complete');
  return s;
}

test('all 100 missions are solvable with progressive region and age limits',()=>{
  assert.equal(game.LEVELS.little.length,40);
  assert.equal(game.LEVELS.explorer.length,60);
  for(const mode of ['little','explorer']) for(let i=0;i<game.LEVELS[mode].length;i++) {
    const level=game.LEVELS[mode][i];
    assert.ok(level.chapter>=0 && level.chapter<8);
    assert.ok(REGION_DESTINATIONS[level.destination].chapter<=level.chapter,'Every destination must be physically revealed before its mission');
    if(mode==='little'&&i>=5) assert.ok(game.totalOrder(level)<=4);
    finish(game.startLevel(mode,i));
  }
});
test('purchase cannot overspend, overbuy or be bypassed',()=>{
  const i=game.LEVELS.explorer.findIndex(l=>l.purchase);
  let s=game.startLevel('explorer',i);
  assert.equal(s.stage,'purchase');
  assert.equal(game.depart(s).ok,false);
  assert.equal(game.loadProduct(s,Object.keys(s.level.order)[0]).ok,false);
  assert.equal(game.buyProduct(s,'invalid').ok,false);
  const id=Object.keys(s.level.order).find(id=>(s.stock[id]||0)<s.level.order[id]);
  assert.equal(game.buyProduct({...s,budget:0},id).ok,false);
  finish(s);
});
test('old finished profiles migrate without losing stars; campaign rewards are one-time',()=>{
  let data=saves.parseSave(JSON.stringify({version:1,activeId:'p',profiles:[{id:'p',name:'Aurelio',mode:'little',stars:[3,3,3,3,3]}]}));
  assert.equal(data.profiles[0].stars.length,40);
  assert.deepEqual(data.profiles[0].stars.slice(0,5),[3,3,3,3,3]);
  assert.equal(saves.unlockedLevel(data.profiles[0]),5);
  const coins=data.profiles[0].coins;
  data=saves.recordCompletion(data,'p',5);
  assert.ok(data.profiles[0].coins>coins);
  assert.deepEqual(saves.recordCompletion(data,'p',5),data);
  assert.deepEqual(saves.recordCompletion(data,'p',8),data);
  assert.deepEqual(saves.parseSave(JSON.stringify(data)),data);
});
test('company upgrades spend once, respect unlocks and belong to each profile',()=>{
  let data=saves.addProfile(saves.parseSave(null),'Joy','explorer','p');
  data=saves.addProfile(data,'Aurelio','little','q');
  assert.equal(saves.buyUpgrade(data,'p','helper').ok,false);
  for(let i=0;i<15;i++) data=saves.recordCompletion(data,'p',i);
  const before=data.profiles[0].coins;
  const result=saves.buyUpgrade(data,'p','helper');
  assert.equal(result.ok,true);data=result.data;
  assert.equal(data.profiles[0].coins,before-saves.UPGRADES.helper.cost);
  assert.equal(saves.buyUpgrade(data,'p','helper').ok,false);
  assert.deepEqual(data.profiles[1].upgrades,[]);
  let s=game.startLevel('explorer',0);
  s=game.autoLoad(s).session;
  assert.equal(game.isLoaded(s),true);
});
test('bonus missions vary and completion is sequential, persistent and independent of stars',()=>{
  let data=saves.addProfile(saves.parseSave(null),'Joy','explorer','p');
  assert.deepEqual(saves.recordBonus(data,'p',0),data);
  for(let i=0;i<60;i++)data=saves.recordCompletion(data,'p',i);
  const stars=[...data.profiles[0].stars];
  for(let round=0;round<12;round++) {
    finish(game.startBonus('explorer',round));
    data=saves.recordBonus(data,'p',round);
    assert.equal(data.profiles[0].bonusRounds,round+1);
    assert.deepEqual(saves.recordBonus(data,'p',round),data);
  }
  assert.deepEqual(data.profiles[0].stars,stars);
  assert.deepEqual(saves.parseSave(JSON.stringify(data)),data);
});

test('malformed fractional progress never unlocks districts past a gap',()=>{
  const data=saves.parseSave(JSON.stringify({version:1,profiles:[{id:'p',name:'P',mode:'little',stars:[0.5,3,3,3,3,3]}]}));
  assert.ok(data.profiles[0].stars.every(n=>n===0));
  assert.equal(saves.unlockedLevel(data.profiles[0]),0);
});
