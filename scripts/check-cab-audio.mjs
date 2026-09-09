import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { voiceLines } from './voice-lines.mjs';
import { launchBrowser } from './browser.mjs';

const url=process.env.GAME_URL||'http://127.0.0.1:4173/lapa-world/';
const voiceMap=JSON.parse(await readFile('src/voice-map.json','utf8'));
assert.deepEqual(Object.keys(voiceMap).sort(),[...voiceLines].sort(),'Every instruction must have a bundled clip');
const engineSource=await readFile('src/engine.js','utf8');
const browser=await launchBrowser();
let page;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
await mkdir('test-results',{recursive:true});
try{
  page=await browser.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()}: ${response.url()}`);});
  await page.evaluateOnNewDocument(()=>{
    window.audioProbe={voices:0,fallbacks:0,oscillators:[]};
    const originalSource=AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource=function(){
      const source=originalSource.call(this),start=source.start.bind(source);
      source.start=(...args)=>{if(!source.loop)window.audioProbe.voices++;return start(...args);};return source;
    };
    const originalOscillator=AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator=function(){const oscillator=originalOscillator.call(this);window.audioProbe.oscillators.push(oscillator);return oscillator;};
    const originalSpeak=speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak=utterance=>{window.audioProbe.fallbacks++;return originalSpeak(utterance);};
  });
  await page.setViewport({width:1440,height:900,deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await page.goto(url,{waitUntil:'networkidle0'});
  const audio=await page.evaluate(async({engineSource,files})=>{
    const {createEngineSound}=await import(URL.createObjectURL(new Blob([engineSource],{type:'text/javascript'})));
    async function rms(mode,ducked=false){
      const context=new OfflineAudioContext(1,44100,44100);
      const engine=createEngineSound(context);engine.setMode(mode);engine.setDucked(ducked);
      const buffer=await context.startRendering();const data=buffer.getChannelData(0).slice(22050);
      engine.dispose();return Math.sqrt(data.reduce((sum,n)=>sum+n*n,0)/data.length);
    }
    const levels={off:await rms('off'),idle:await rms('idle'),drive:await rms('drive'),ducked:await rms('drive',true)};
    const decoder=new OfflineAudioContext(1,44100,44100),durations=[];
    for(const file of files){const response=await fetch(new URL(`audio/${file}`,location.href));const buffer=await decoder.decodeAudioData(await response.arrayBuffer());durations.push(buffer.duration);}
    return {levels,clips:durations.length,shortest:Math.min(...durations),longest:Math.max(...durations)};
  },{engineSource,files:Object.values(voiceMap)});
  assert.equal(audio.levels.off,0);assert.ok(audio.levels.idle>.002);
  assert.ok(audio.levels.drive>audio.levels.idle*1.4);assert.ok(audio.levels.ducked<audio.levels.drive*.5);
  assert.ok(audio.shortest>1&&audio.longest<30);
  await page.type('#player-name','Prova cabina');
  await page.click('#profile-form button[type=submit]');
  await page.waitForFunction(()=>audioProbe.voices>0);
  await page.click('[data-level="0"]');
  await page.click('[data-action=load][data-product=tomato]');
  await page.click('[data-action=depart]');
  assert.equal(await page.$eval('body',e=>e.dataset.cockpit),'false');
  await page.click('[data-action=cockpit]');
  assert.equal(await page.$eval('body',e=>e.dataset.cockpit),'true');
  await delay(1500);
  const idleFrequency=await page.evaluate(()=>audioProbe.oscillators.find(o=>o.type==='sawtooth').frequency.value);
  await page.screenshot({path:'test-results/cab-desktop.png'});
  await page.keyboard.down('Space');await delay(1800);await page.keyboard.up('Space');
  await page.screenshot({path:'test-results/cab-desktop-driving.png'});
  await page.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await delay(700);
  await page.screenshot({path:'test-results/cab-portrait.png'});
  for(const size of [{width:390,height:844},{width:375,height:667},{width:844,height:390}]){
    await page.setViewport({...size,deviceScaleFactor:1,isMobile:true,hasTouch:true});await delay(400);
    const controls=await page.$eval('#drive',e=>{const r=e.getBoundingClientRect();return {bottom:r.bottom,right:r.right,visible:r.height>40&&r.top>=0&&r.bottom<=innerHeight&&r.right<=innerWidth};});
    assert.ok(controls.visible,`Drive control visible at ${size.width}x${size.height}: ${JSON.stringify(controls)}`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  await page.screenshot({path:'test-results/cab-landscape.png'});
  await page.click('[data-action=cockpit]');
  assert.equal(await page.$eval('body',e=>e.dataset.cockpit),'false');
  await page.click('[data-action=cockpit]');
  const box=await(await page.$('#drive')).boundingBox();
  await page.touchscreen.touchStart(box.x+box.width/2,box.y+box.height/2);await delay(600);
  const driveFrequency=await page.evaluate(()=>audioProbe.oscillators.find(o=>o.type==='sawtooth').frequency.value);
  assert.ok(driveFrequency>idleFrequency,'Holding the drive button revs the engine');
  await delay(3500);await page.screenshot({path:'test-results/cab-on-road.png'});
  await page.waitForSelector('[data-action=unload]',{timeout:60000});await page.touchscreen.touchEnd();await delay(150);
  assert.equal(await page.$$eval('[data-action=unload]',nodes=>nodes.length),1,'Cab view does not cause a ghost delivery on release');
  assert.equal(await page.$eval('body',e=>e.dataset.cockpit),'false');
  await page.click('[data-action=unload]');await page.waitForSelector('#reward-title');
  await page.click('[data-action=home]');
  await page.reload({waitUntil:'networkidle0'});await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
  await page.setOfflineMode(true);await page.reload({waitUntil:'networkidle0'});
  await page.click('[data-level="1"]');await page.waitForFunction(()=>audioProbe.voices>0);
  assert.equal(await page.evaluate(()=>audioProbe.fallbacks),0,'Included instructions must play offline without the metallic device voice');
  assert.equal(await page.$eval('.profile-chip span',e=>e.textContent),'Prova cabina');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({result:'PASS',audio,checks:['cab desktop/portrait/landscape','enter/exit without resetting trip','touch arrival without ghost tap','engine revs on hold','narration offline','no device TTS fallback','no browser errors']}));
}catch(error){if(page)await page.screenshot({path:'test-results/cab-failure.png'});throw error;}
finally{await browser.close();}
