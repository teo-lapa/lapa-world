import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { launchBrowser } from './browser.mjs';
import { addProfile, parseSave, recordCompletion, buyUpgrade } from '../src/storage.js';
import { LEVELS } from '../src/game.js';
const url=process.env.GAME_URL||'http://127.0.0.1:4173/lapa-world/';
const browser=await launchBrowser();
const errors=[];
await mkdir('test-results',{recursive:true});
const page=await browser.newPage();
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const click=async selector=>{await page.waitForSelector(selector,{visible:true});await page.click(selector);};
const stage=()=>page.$eval('body',e=>e.dataset.stage);
async function fixture(mode,completed,upgrades=[]){
  let data=addProfile(parseSave(null),mode==='little'?'Pilota piccolo':'Esploratore',mode,'test');
  data.sound=false;
  for(let i=0;i<completed;i++)data=recordCompletion(data,'test',i);
  for(const id of upgrades){const result=buyUpgrade(data,'test',id);assert.ok(result.ok);data=result.data;}
  await page.evaluate(d=>localStorage.setItem('lapa-world-v1',JSON.stringify(d)),data);
  await page.reload({waitUntil:'networkidle0'});
  await page.waitForSelector('.chapter-nav');
}
async function drive(target,automatic=false){
  await click('[data-action=depart]');
  if(automatic){
    await click('[data-action=cockpit]');
    const rect=await page.$eval('#drive',e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:innerHeight};});
    assert.ok(rect.top>=0&&rect.bottom<=rect.height,`Cockpit manual control with hired driver: ${JSON.stringify(rect)}`);
    await click('[data-action=auto-drive]');
  }
  else await page.keyboard.down('Space');
  await page.waitForSelector(target,{timeout:90000});
  if(!automatic)await page.keyboard.up('Space');
}
try{
  await page.setViewport({width:1440,height:960,deviceScaleFactor:1});
  await page.goto(url,{waitUntil:'networkidle0'});
  await fixture('little',4);
  assert.equal(await page.$$eval('.chapter-tab:disabled',n=>n.length),7);
  await click('[data-level="4"]');
  for(const [id,n]of Object.entries(LEVELS.little[4].order))for(let i=0;i<n;i++)await click(`[data-action=load][data-product=${id}]`);
  await drive('[data-action=unload]');
  while(await page.$('[data-action=unload]'))await click('[data-action=unload]');
  assert.equal(await page.$eval('#reward-title',e=>e.textContent),'Una nuova zona!');
  await click('[data-action=map]');
  assert.equal(await page.$$eval('.chapter-tab:disabled',n=>n.length),6);
  await page.screenshot({path:'test-results/expansion-unlocked.png'});
  await click('[data-level="5"]');
  assert.equal(await stage(),'brief');
  assert.equal(await page.$eval('[data-vehicle=car]',e=>e.getAttribute('aria-pressed')),'true');
  await click('[data-vehicle=truck]');
  await click('[data-vehicle=car]');
  await click('[data-action=depart]');
  await page.keyboard.down('Space');
  await new Promise(r=>setTimeout(r,3000));
  await page.keyboard.up('Space');
  await page.screenshot({path:'test-results/expansion-car.png'});
  await click('[data-action=cockpit]');
  await page.keyboard.down('Space');
  await page.waitForSelector('[data-action=visit-product]',{timeout:90000});
  await page.keyboard.up('Space');
  const visit=LEVELS.little[5];
  await click(`[data-action=visit-product][data-product=${visit.choices.find(id=>id!==visit.request)}]`);
  assert.equal(await stage(),'visit');
  await click(`[data-action=visit-product][data-product=${visit.request}]`);
  assert.equal(await page.$eval('#reward-title',e=>e.textContent),'Un nuovo amico!');
  await click('[data-action=home]');
  await page.reload({waitUntil:'networkidle0'});
  assert.match(await page.$eval('.campaign-summary',e=>e.textContent),/6 \/ 40/);
  console.log('PASS: real chapter unlock, car selection, cockpit visit, wrong choice retry, preserved progress.');

  await page.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await fixture('explorer',22,['helper','driver']);
  await click('[data-action=company]');
  assert.equal(await page.$$eval('.upgrade button:disabled',n=>n.length),3);
  await page.screenshot({path:'test-results/expansion-company-mobile.png'});
  await click('[data-action=close-dialog]');
  await click('[data-level="22"]');
  assert.equal(await stage(),'purchase');
  assert.equal(await page.$eval('[data-action=purchase-done]',e=>e.disabled),true);
  await page.screenshot({path:'test-results/expansion-purchase-mobile.png'});
  for(const id of Object.keys(LEVELS.explorer[22].order)){
    const selector=`[data-action=buy-product][data-product=${id}]`;
    while(!await page.$eval(selector,e=>e.disabled))await click(selector);
  }
  await click('[data-action=purchase-done]');
  await click('[data-action=auto-load]');
  assert.equal(await page.$eval('[data-action=depart]',e=>e.disabled),false);
  await drive('[data-action=unload]',true);
  while(await page.$('[data-action=unload]'))await click('[data-action=unload]');
  await click(`[data-answer="${LEVELS.explorer[22].quiz.answer}"]`);
  await click('[data-action=home]');
  await page.reload({waitUntil:'networkidle0'});
  assert.match(await page.$eval('.campaign-summary',e=>e.textContent),/23 \/ 60/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log('PASS: mobile company, purchase shortages, helper loads, hired driver arrives, quiz and persisted reward.');

  await fixture('explorer',60,['helper','driver','warehouse']);
  assert.equal(await page.$$eval('.chapter-tab:disabled',n=>n.length),0);
  await page.screenshot({path:'test-results/expansion-full-mobile.png'});
  await click('[data-action=bonus]');
  await click('[data-action=auto-load]');
  await drive('[data-action=unload]',true);
  while(await page.$('[data-action=unload]'))await click('[data-action=unload]');
  // First bonus order is 3 gelato + 2 strawberries; quiz uses 3 - 2.
  await click('[data-answer="1"]');
  await click('[data-action=replay]');
  assert.match(await page.$eval('.mission-badge',e=>e.textContent),/Incarico libero 1/);
  await click('[data-action=home]');
  await click('[data-action=confirm-exit]');
  assert.match(await page.$eval('.frontier',e=>e.textContent),/1 incarichi liberi completati/);
  await page.waitForFunction(()=>navigator.serviceWorker.controller!==null,{timeout:30000});
  await page.setOfflineMode(true);
  await page.reload({waitUntil:'networkidle0'});
  assert.match(await page.$eval('.frontier',e=>e.textContent),/Incarico libero 2/);
  await click('[data-action=bonus]');
  assert.ok(await page.$('.play-panel'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.setOfflineMode(false);
  await page.setViewport({width:844,height:390,deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await page.screenshot({path:'test-results/expansion-landscape.png'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log('PASS: full campaign, bonus rewards and next round offline, landscape width.');
  assert.deepEqual(errors,[]);
}catch(e){await page.screenshot({path:'test-results/expansion-failure.png'});console.log(await page.$eval('#app',e=>e.textContent));throw e;}
finally{await browser.close();}
