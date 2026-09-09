import { registerSW } from 'virtual:pwa-register';
let installPrompt;
let update;
let offlineReady=false;
let updateReady=false;
window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();installPrompt=event;
});
window.addEventListener('appinstalled',()=>{installPrompt=null;});
update=registerSW({
  onOfflineReady(){offlineReady=true;window.dispatchEvent(new Event('offline-ready'));},
  onNeedRefresh(){updateReady=true;},
  onRegisterError(error){console.warn('Installazione offline non disponibile:',error.message);},
});
export async function requestInstall() {
  if(!installPrompt) return false;
  await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;return true;
}
export const getInstallState=()=>({offlineReady,updateReady,installed:matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true});
export const applyUpdate=()=>update?.(true);
