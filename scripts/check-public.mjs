import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { launchBrowser } from './browser.mjs';
const url=process.env.GAME_URL||'https://teo-lapa.github.io/lapa-world/';
let reachable=false;
const localHtml=await readFile('dist/index.html','utf8').catch(()=>'');
const expectedScript=localHtml.match(/src="([^"]*\/assets\/index-[^"]+\.js)"/)?.[1];
for(let attempt=0;attempt<12;attempt++){
  const response=await fetch(url,{cache:'no-store'});
  const html=await response.text();
  if(response.ok&&html.includes('LAPA World')&&(!expectedScript||html.includes(expectedScript))){reachable=true;break;}
  await new Promise(resolve=>setTimeout(resolve,5000));
}
assert.ok(reachable,'Expected public build must become reachable');
const browser=await launchBrowser();
try{
  const page=await browser.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error'||message.type()==='warn')console.log(message.type(),message.text());});
  page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()}: ${response.url()}`);});
  await page.setViewport({width:1440,height:900,deviceScaleFactor:1});
  await page.goto(url,{waitUntil:'networkidle0'});
  await page.waitForSelector('#world canvas');
  const manifest=await page.evaluate(async()=>await(await fetch(document.querySelector('link[rel=manifest]').href)).json());
  assert.equal(manifest.name,'LAPA World');
  assert.equal(manifest.start_url,'/lapa-world/');
  for(const icon of manifest.icons){const response=await fetch(new URL(icon.src,url));assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/image/);}
  await page.waitForFunction(async()=>{
    const registrations=await navigator.serviceWorker.getRegistrations();
    return registrations.some(registration=>registration.active?.state==='activated');
  },{timeout:30000});
  // With prompted updates, a first install takes control on the next navigation.
  await page.reload({waitUntil:'networkidle0'});
  await page.waitForFunction(()=>navigator.serviceWorker.controller!==null,{timeout:15000});
  await mkdir('test-results',{recursive:true});
  await new Promise(resolve=>setTimeout(resolve,4200));
  await page.screenshot({path:'test-results/public-desktop.png'});
  await page.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await new Promise(resolve=>setTimeout(resolve,1200));
  await page.screenshot({path:'test-results/public-mobile.png'});
  await page.setOfflineMode(true);await page.reload({waitUntil:'networkidle0'});
  await page.type('#player-name','Prova');
  await page.click('#profile-form button[type=submit]');
  await page.click('[data-level="0"]');
  await page.click('[data-action=load][data-product=tomato]');
  assert.equal(await page.$eval('[data-action=depart]',e=>e.disabled),false);
  const voices=await page.evaluate(async()=>{
    let n=0;for(const name of await caches.keys())for(const request of await(await caches.open(name)).keys())if(new URL(request.url).pathname.endsWith('.mp3'))n++;
    return n;
  });
  assert.equal(voices,37,'Public update includes all offline narration');
  await page.click('[data-action=depart]');await page.click('[data-action=cockpit]');
  assert.equal(await page.$eval('body',e=>e.dataset.cockpit),'true');
  await new Promise(resolve=>setTimeout(resolve,900));
  await page.screenshot({path:'test-results/public-cab-mobile.png'});
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({url,https:await page.evaluate(()=>isSecureContext),manifest:'valid',icons:'200',world:'rendered',offline:'reloaded and played in cab',voiceClips:voices,browserErrors:errors.length}));
}finally{await browser.close();}
