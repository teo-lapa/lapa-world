import voiceMap from './voice-map.json';
import { createEngineSound } from './engine.js';

let enabled=true,context,engine,engineMode='off',narration,sequence=0;
const decodedClips=new Map();
function audioContext(){
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return null;
  context ||= new AudioCtx();
  if(context.state==='suspended')context.resume().catch(()=>{});
  return context;
}
export function stopSpeech(){
  sequence++;
  if(narration){try{narration.stop();}catch{}narration.disconnect();narration=null;}
  window.speechSynthesis?.cancel();engine?.setDucked(false);
}
export function setSound(value){
  enabled=Boolean(value);
  if(!enabled){stopSpeech();engine?.setMode('off');}
  else setEngine(engineMode);
}
export function setEngine(mode){
  engineMode=['off','idle','drive'].includes(mode)?mode:'off';
  if(!enabled){engine?.setMode('off');return;}
  if(engineMode!=='off'){
    const ctx=audioContext();if(!ctx)return;
    engine ||= createEngineSound(ctx);
  }
  engine?.setMode(engineMode);
}
function fallbackSpeech(text,token){
  if(!enabled||token!==sequence||!window.speechSynthesis)return;
  const speech=new SpeechSynthesisUtterance(text);speech.lang='it-IT';speech.rate=.94;speech.pitch=1;
  const voices=window.speechSynthesis.getVoices().filter(v=>v.lang.startsWith('it'));
  speech.voice=voices.find(v=>/natural|neural|google/i.test(v.name))||voices[0]||null;
  engine?.setDucked(true);
  speech.onend=speech.onerror=()=>{if(token===sequence)engine?.setDucked(false);};
  window.speechSynthesis.speak(speech);
}
export async function speak(text){
  stopSpeech();if(!enabled)return;
  const token=sequence;
  const file=voiceMap[text];
  const ctx=audioContext();
  if(!file||!ctx){fallbackSpeech(text,token);return;}
  try{
    let buffer=decodedClips.get(file);
    if(!buffer){
      const response=await fetch(`${import.meta.env.BASE_URL}audio/${file}`);
      if(!response.ok)throw new Error('Voice unavailable');
      buffer=await ctx.decodeAudioData(await response.arrayBuffer());
      if(decodedClips.size>=12)decodedClips.delete(decodedClips.keys().next().value);
      decodedClips.set(file,buffer);
    }
    if(!enabled||token!==sequence)return;
    narration=ctx.createBufferSource();narration.buffer=buffer;narration.connect(ctx.destination);
    const current=narration;engine?.setDucked(true);
    current.onended=()=>{current.disconnect();if(narration===current){narration=null;engine?.setDucked(false);}};
    current.start();
  }catch{fallbackSpeech(text,token);}
}
export function chime(kind='good') {
  if(!enabled) return;
  try {
    if(!audioContext()) return;
    const notes=kind==='win'?[523,659,784,1047]:kind==='soft'?[330,294]:[660,880];
    notes.forEach((frequency,i)=>{
      const osc=context.createOscillator();const gain=context.createGain();
      osc.type='sine';osc.frequency.value=frequency;
      const now=context.currentTime+i*0.10;
      gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(0.08,now+0.015);gain.gain.exponentialRampToValueAtTime(0.001,now+0.28);
      osc.connect(gain);gain.connect(context.destination);osc.start(now);osc.stop(now+0.3);
    });
  } catch { /* Silent gameplay remains available if audio is unavailable. */ }
}
