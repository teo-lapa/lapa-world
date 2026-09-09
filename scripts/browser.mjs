import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
export function launchBrowser() {
  const executablePath=[process.env.BROWSER_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/usr/bin/google-chrome','/usr/bin/chromium'].find(p=>p&&existsSync(p));
  if(!executablePath)throw new Error('Set BROWSER_PATH to a Chrome or Chromium executable.');
  return puppeteer.launch({executablePath,headless:true,args:['--no-first-run','--disable-search-engine-choice-screen','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
}
