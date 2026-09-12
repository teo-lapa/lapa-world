import test from 'node:test';
import assert from 'node:assert/strict';
import { levelCount } from '../src/campaign.js';
import * as saves from '../src/storage.js';

test('corrupted or malformed saves recover without crashing', () => {
  for (const raw of ['{','null','[]','{"version":1,"profiles":[null]}']) {
    assert.deepEqual(saves.parseSave(raw).profiles,[]);
  }
});
test('each profile and mode has independent unlocks; repeated play does not inflate stars', () => {
  let data=saves.parseSave(null);
  data=saves.addProfile(data,'Uno','little','one');
  data=saves.addProfile(data,'Due','explorer','two');
  data=saves.recordCompletion(data,'one',0);
  data=saves.recordCompletion(data,'one',0);
  assert.deepEqual(data.profiles[0].stars,[3,...Array(39).fill(0)]);
  assert.deepEqual(data.profiles[1].stars,Array(60).fill(0));
  assert.equal(saves.unlockedLevel(data.profiles[0]),1);
  assert.equal(saves.unlockedLevel(data.profiles[1]),0);
  const cheated=saves.recordCompletion(data,'two',4);
  assert.deepEqual(cheated.profiles[1].stars,Array(60).fill(0));
});
test('completed final level remains inside level selection bounds', () => {
  let data=saves.addProfile(saves.parseSave(null),'Pilot','little','p');
  for(let i=0;i<40;i++) data=saves.recordCompletion(data,'p',i);
  assert.equal(saves.unlockedLevel(data.profiles[0]),39);
  assert.equal(data.profiles[0].stars.reduce((a,b)=>a+b,0),120);
  assert.deepEqual(saves.parseSave(JSON.stringify(data)).profiles,data.profiles);
});
test('untrusted names and stored stars are normalized at boundary', () => {
  const data=saves.parseSave(JSON.stringify({version:1,profiles:[{id:'a',name:'  '+ 'a'.repeat(50),mode:'little',stars:[99,-2,'3',null,3]}]}));
  assert.equal(data.profiles[0].name.length,20);
  assert.deepEqual(data.profiles[0].stars,[3,...Array(39).fill(0)]);
});

test('renaming persists normalized names without changing progress or other profiles', () => {
  const prior=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  const values=new Map();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)}});
  try {
    let data=saves.addProfile(saves.parseSave(null),'Uno','little','one');
    data=saves.recordCompletion(data,'one',0);
    data=saves.addProfile(data,'Due','explorer','two');
    const other=data.profiles[1];
    data=saves.renameProfile(data,'one','  Nome nuovo  ');
    assert.equal(data.profiles[1],other);
    assert.equal(saves.persistSave(data),true);
    const restored=saves.loadSave();
    assert.deepEqual(restored.profiles[0],{id:'one',name:'Nome nuovo',mode:'little',stars:[3,...Array(39).fill(0)],coins:10,upgrades:[],bonusRounds:0});
    assert.deepEqual(restored.profiles[1],other);
    assert.equal(restored.activeId,'two');
    assert.equal(saves.renameProfile(restored,'one','   ').profiles[0].name,'Pilota');
    assert.equal(saves.renameProfile(restored,'one','x'.repeat(30)).profiles[0].name.length,20);
    assert.deepEqual(saves.renameProfile(restored,'missing','Name'),restored);
  } finally {
    if(prior)Object.defineProperty(globalThis,'localStorage',prior);else delete globalThis.localStorage;
  }
});
