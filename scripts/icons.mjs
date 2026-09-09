import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './browser.mjs';
const browser=await launchBrowser();
try {
  const page=await browser.newPage();
  const svg=await readFile(new URL('../public/icons/icon.svg',import.meta.url),'utf8');
  await mkdir(new URL('../public/icons',import.meta.url),{recursive:true});
  for(const [size,name] of [[192,'icon-192'],[512,'icon-512'],[512,'maskable-512'],[180,'apple-touch-icon']]) {
    await page.setViewport({width:size,height:size,deviceScaleFactor:1});
    await page.setContent(`<style>body{margin:0;background:#234d3e}svg{width:100vw;height:100vh;display:block}</style>${svg}`);
    await page.screenshot({path:fileURLToPath(new URL(`../public/icons/${name}.png`,import.meta.url))});
  }
} finally {await browser.close();}
