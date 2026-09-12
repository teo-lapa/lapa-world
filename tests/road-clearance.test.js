import test from 'node:test';
import assert from 'node:assert/strict';
import {roadClearance,TOWN_ROUTES} from '../src/road-clearance.js';
import {EXPANSION_ROUTES} from '../src/world-expansion.js';
test('town curve seen from cockpit and all route centers stay clear of trees',()=>{
  const clear=roadClearance({...TOWN_ROUTES,...EXPANSION_ROUTES});
  assert.equal(clear(10,10),false,'The tree reported on the pizzeria curve must not be planted');
  assert.equal(clear(0,-12),true,'Distant scenery remains available');
  for(const points of Object.values({...TOWN_ROUTES,...EXPANSION_ROUTES}))for(const [x,z]of points)assert.equal(clear(x,z),false);
});
