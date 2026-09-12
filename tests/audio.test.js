import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { LEVELS } from '../src/game.js';
import { CUSTOMERS, bonusLevel } from '../src/campaign.js';
import { voiceLines } from '../scripts/voice-lines.mjs';

const root = new URL('../', import.meta.url);
const voiceMap = JSON.parse(readFileSync(new URL('src/voice-map.json', root), 'utf8'));
const main = readFileSync(new URL('src/main.js', root), 'utf8');
// Exercise the actual UI instruction function without booting its DOM/3D renderer.
const instructionSource = main.match(/function instruction\(\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(instructionSource, 'The UI instruction function must be discoverable');
const instruction = new Function('session', 'customer', `${instructionSource}; return instruction();`);
function covered(text) {
  assert.equal(typeof voiceMap[text], 'string', `Missing bundled narration: ${text}`);
}
function checkLevel(level) {
  const customer = () => CUSTOMERS[level.destination].name;
  const stages = level.kind === 'visit' ? ['brief', 'drive', 'visit', 'complete'] :
    ['load', 'drive', 'unload', 'complete', ...(level.purchase ? ['purchase'] : []), ...(level.quiz ? ['quiz'] : [])];
  for (const stage of stages) covered(instruction({ level, stage }, customer));
  if (level.quiz) covered(level.quiz.hint);
}

test('all 100 campaign missions have offline instructions and hints', () => {
  assert.equal(Object.values(LEVELS).flat().length, 100);
  Object.values(LEVELS).flat().forEach(checkLevel);
  covered(instruction(null, () => ''));
});

test('rotating bonus missions retain offline narration across 3360 rounds per mode', () => {
  for (const mode of Object.keys(LEVELS)) {
    for (let round = 0; round < 3360; round++) checkLevel(bonusLevel(mode, round));
  }
});

test('fixed UI speech and every game retry message have offline clips', () => {
  const game = readFileSync(new URL('src/game.js', root), 'utf8');
  for (const match of game.matchAll(/fail\('([^']+)'\)/g)) covered(match[1]);
  for (const match of main.matchAll(/speak\('([^']+)'\)/g)) covered(match[1]);
});

test('voice map matches fixed copy and every content-addressed MP3 is nonempty', () => {
  assert.deepEqual(Object.keys(voiceMap).sort(), [...voiceLines].sort());
  for (const [text, file] of Object.entries(voiceMap)) {
    assert.equal(file, `${createHash('sha256').update(text).digest('hex').slice(0, 16)}.mp3`);
    assert.ok(statSync(new URL(`public/audio/${file}`, root)).size >= 500, file);
  }
});
