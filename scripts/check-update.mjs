import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { launchBrowser } from './browser.mjs';

// Supply a previous published gh-pages snapshot here before running this check.
const oldRoot=path.resolve(process.env.PREVIOUS_BUILD||'.superpowers/v1-pages');
const newRoot=path.resolve('dist');
await readFile(path.join(oldRoot,'index.html'));
let latest=false;
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.mp3':'audio/mpeg'};
const server=http.createServer(async(req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const root=latest?newRoot:oldRoot;
  const relative=pathname.replace(/^\/lapa-world\//,'')||'index.html';
  const file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)){res.writeHead(400);res.end();return;}
  try{const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);}
  catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(4182,'127.0.0.1',resolve));
const browser=await launchBrowser();
try{
  const page=await browser.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setViewport({width:1280,height:900});
  const url='http://127.0.0.1:4182/lapa-world/';
  await page.goto(url,{waitUntil:'networkidle0'});
  await page.waitForFunction(async()=>{const r=await navigator.serviceWorker.getRegistration();return r?.active?.state==='activated';});
  const fixture={version:1,activeId:'existing-pilot',sound:true,profiles:[
    {id:'existing-pilot',name:'Pilota esistente',mode:'little',stars:[3,3,0,0,0]},
    {id:'existing-explorer',name:'Esploratrice',mode:'explorer',stars:[3,0,0,0,0]},
  ]};
  await page.evaluate(save=>localStorage.setItem('lapa-world-v1',JSON.stringify(save)),fixture);
  await page.reload({waitUntil:'networkidle0'});
  await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
  await page.click('[data-level="0"]');
  await page.click('[data-action=load][data-product=tomato]');
  await page.click('[data-action=depart]');
  assert.equal(await page.$('[data-action=cockpit]'),null,'Old release has no cockpit yet');
  latest=true;
  await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration()).update();});
  await page.waitForFunction(async()=>Boolean((await navigator.serviceWorker.getRegistration())?.waiting),{timeout:30000});
  assert.equal(await page.$eval('body',e=>e.dataset.stage),'drive','Update must not interrupt a trip');
  assert.equal(await page.$('.update-notice'),null,'Update is offered between trips');
  await page.click('[data-action=home]');await page.click('[data-action=confirm-exit]');
  await page.waitForSelector('.update-notice');
  await Promise.all([page.waitForNavigation({waitUntil:'networkidle0'}),page.click('[data-action=update]')]);
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('lapa-world-v1'))),fixture,'Both existing profiles and all stars survive the update');
  assert.match(await page.$eval('.star-total',e=>e.textContent),/6/);
  const cachedVoices=await page.evaluate(async()=>{
    let count=0;for(const name of await caches.keys())for(const request of await(await caches.open(name)).keys())if(new URL(request.url).pathname.endsWith('.mp3'))count++;
    return count;
  });
  assert.equal(cachedVoices,37,'Updated audio is already available offline');
  await page.setOfflineMode(true);await page.reload({waitUntil:'networkidle0'});
  await page.click('[data-level="0"]');await page.click('[data-action=load][data-product=tomato]');await page.click('[data-action=depart]');
  await page.click('[data-action=cockpit]');
  assert.equal(await page.$eval('body',e=>e.dataset.cockpit),'true','New cockpit runs offline after prompted update');
  assert.deepEqual(errors,[]);
  console.log('PASS: real service-worker update from previous published release, no interruption mid-trip, update prompt on map, both profiles and stars preserved, all 37 clips cached, updated cockpit works offline.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
