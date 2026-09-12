import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { launchBrowser } from './browser.mjs';
import { campaignMap } from '../src/campaign-ui.js';
import { addProfile, parseSave } from '../src/storage.js';
const browser=await launchBrowser();
try{
  const page=await browser.newPage();
  const css=await readFile('src/style.css','utf8');
  const profile=addProfile(parseSave(null),'Pilota','little','p').profiles[0];
  for(const [width,height] of [[600,634],[390,844],[328,730],[760,820],[844,390],[1440,900]]){
    await page.setViewport({width,height});
    await page.setContent(`<style>${css}</style><div id="app">${campaignMap(profile,null)}</div>`);
    const bounds=await page.$eval('.campaign-panel',el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};});
    assert.ok(bounds.left>=0&&bounds.right<=width&&bounds.top>=0&&bounds.bottom<=height,`${width}x${height}: ${JSON.stringify(bounds)}`);
  }
  console.log('PASS: whole mission panel stays within Fold, phone, landscape and desktop bounds.');
}finally{await browser.close();}
