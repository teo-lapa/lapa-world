let enabled=true;
let context;
export function setSound(value) {
  enabled=value;
  if(!enabled) window.speechSynthesis?.cancel();
}
export function speak(text) {
  if(!enabled || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const speech=new SpeechSynthesisUtterance(text);
  speech.lang='it-IT';speech.rate=0.9;speech.pitch=1.08;
  const localVoice=window.speechSynthesis.getVoices().find(v=>v.lang.startsWith('it')&&v.localService);
  if(localVoice) speech.voice=localVoice;
  window.speechSynthesis.speak(speech);
}
export function chime(kind='good') {
  if(!enabled) return;
  try {
    const AudioCtx=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtx) return;
    context ||= new AudioCtx();
    if(context.state==='suspended') context.resume().catch(()=>{});
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
