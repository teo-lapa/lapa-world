import test from 'node:test';
import assert from 'node:assert/strict';
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
  assert.deepEqual(data.profiles[0].stars,[3,0,0,0,0]);
  assert.deepEqual(data.profiles[1].stars,[0,0,0,0,0]);
  assert.equal(saves.unlockedLevel(data.profiles[0]),1);
  assert.equal(saves.unlockedLevel(data.profiles[1]),0);
  const cheated=saves.recordCompletion(data,'two',4);
  assert.deepEqual(cheated.profiles[1].stars,[0,0,0,0,0]);
});
test('completed final level remains inside level selection bounds', () => {
  let data=saves.addProfile(saves.parseSave(null),'Pilot','little','p');
  for(let i=0;i<5;i++) data=saves.recordCompletion(data,'p',i);
  assert.equal(saves.unlockedLevel(data.profiles[0]),4);
  assert.equal(data.profiles[0].stars.reduce((a,b)=>a+b,0),15);
  assert.deepEqual(saves.parseSave(JSON.stringify(data)).profiles,data.profiles);
});
test('untrusted names and stored stars are normalized at boundary', () => {
  const data=saves.parseSave(JSON.stringify({version:1,profiles:[{id:'a',name:'  '+ 'a'.repeat(50),mode:'little',stars:[99,-2,'3',null,3]}]}));
  assert.equal(data.profiles[0].name.length,20);
  assert.deepEqual(data.profiles[0].stars,[3,0,0,0,0]);
});
