import test from 'node:test';
import assert from 'node:assert/strict';
import * as game from '../src/game.js';

test('each mode has a full campaign with complete solvable orders', () => {
  for (const mode of ['little', 'explorer']) {
    assert.equal(game.LEVELS[mode].length, mode==='little'?40:60);
    for (const level of game.LEVELS[mode]) {
      assert.ok(Object.entries(level.order).every(([id, n]) => game.PRODUCTS[id] && Number.isInteger(n) && n > 0));
      if (mode === 'explorer' && level.kind!=='visit') assert.ok(level.quiz.options.includes(level.quiz.answer));
    }
  }
});

test('cannot depart with a missing product, overload or load wrong goods', () => {
  let session = game.startLevel('little', 0);
  assert.equal(game.depart(session).ok, false);
  assert.equal(game.loadProduct(session, 'milk').ok, false);
  const loaded = game.loadProduct(session, 'tomato');
  assert.equal(loaded.ok, true);
  session = loaded.session;
  assert.equal(game.loadProduct(session, 'tomato').ok, false);
  assert.equal(game.depart(session).session.stage, 'drive');
});

test('unloading is possible only after arrival and completion only after all goods', () => {
  let s = game.startLevel('little', 2);
  assert.equal(game.unloadProduct(s, 'flour').ok, false);
  assert.equal(game.arrive(s).ok, false);
  for (const [id, amount] of Object.entries(s.level.order)) for(let i=0;i<amount;i++) s=game.loadProduct(s,id).session;
  s = game.depart(s).session;
  assert.equal(game.loadProduct(s,'flour').ok,false);
  s = game.arrive(s).session;
  const ids = [...s.cargo];
  ids.forEach((id, index) => {
    s = game.unloadProduct(s, id).session;
    assert.equal(s.stage, index === ids.length-1 ? 'complete' : 'unload');
  });
  assert.equal(game.unloadProduct(s, ids[0]).ok, false);
});

test('explorer must answer the question correctly, mistakes are retryable', () => {
  let s = game.startLevel('explorer', 0);
  for(const [id,n] of Object.entries(s.level.order)) for(let i=0;i<n;i++) s=game.loadProduct(s,id).session;
  s=game.arrive(game.depart(s).session).session;
  for(const id of [...s.cargo]) s=game.unloadProduct(s,id).session;
  assert.equal(s.stage,'quiz');
  assert.equal(game.answerQuiz(s,-1).ok,false);
  assert.equal(s.stage,'quiz');
  s=game.answerQuiz(s,s.level.quiz.answer).session;
  assert.equal(s.stage,'complete');
});

test('removing cargo restores loading capacity without mutating prior state', () => {
  const initial=game.startLevel('little',0);
  const loaded=game.loadProduct(initial,'tomato').session;
  assert.deepEqual(initial.cargo,[]);
  const removed=game.removeProduct(loaded,'tomato').session;
  assert.deepEqual(removed.cargo,[]);
  assert.deepEqual(loaded.cargo,['tomato']);
});

test('invalid mode or level safely opens first little-driver level', () => {
  assert.equal(game.startLevel('bad',999).mode,'little');
  assert.equal(game.startLevel('explorer',-1).index,0);
});
