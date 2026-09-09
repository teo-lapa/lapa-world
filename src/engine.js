/** A quiet, layered toy-van engine; all sound is synthesized on the device. */
export function createEngineSound(context) {
  const output=context.createGain();output.gain.value=0;output.connect(context.destination);
  const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=320;filter.Q.value=.65;filter.connect(output);
  const rumble=context.createGain();rumble.gain.value=.55;rumble.connect(filter);
  const engine=context.createOscillator();engine.type='sawtooth';engine.frequency.value=43;engine.connect(rumble);
  const harmonic=context.createOscillator();harmonic.type='triangle';harmonic.frequency.value=86;
  const harmonicGain=context.createGain();harmonicGain.gain.value=.24;harmonic.connect(harmonicGain);harmonicGain.connect(filter);
  const pulse=context.createOscillator();pulse.frequency.value=11;
  const pulseDepth=context.createGain();pulseDepth.gain.value=.10;pulse.connect(pulseDepth);pulseDepth.connect(rumble.gain);
  const noiseBuffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate);const samples=noiseBuffer.getChannelData(0);
  let brown=0;for(let i=0;i<samples.length;i++){brown=(brown+(Math.random()*2-1)*.03)/1.02;samples[i]=brown*3;}
  const air=context.createBufferSource();air.buffer=noiseBuffer;air.loop=true;
  const airGain=context.createGain();airGain.gain.value=.13;air.connect(airGain);airGain.connect(filter);
  const sources=[engine,harmonic,pulse,air];sources.forEach(node=>node.start());
  let mode='off',ducked=false,disposed=false;
  function ramp(param,value,duration=.16){const now=context.currentTime;param.cancelScheduledValues(now);param.setValueAtTime(param.value,now);param.linearRampToValueAtTime(value,now+duration);}
  function volume(){ramp(output.gain,(mode==='drive'?.13:mode==='idle'?.065:0)*(ducked?.3:1));}
  return {
    setMode(next){
      if(disposed)return;next=['off','idle','drive'].includes(next)?next:'off';if(next===mode)return;
      const starting=mode==='off'&&next!=='off';mode=next;
      const frequency=mode==='drive'?79:43;
      if(starting){engine.frequency.value=24;harmonic.frequency.value=48;}
      ramp(engine.frequency,frequency,starting?.55:.35);ramp(harmonic.frequency,frequency*2,starting?.55:.35);
      ramp(pulse.frequency,mode==='drive'?19:11,.3);ramp(filter.frequency,mode==='drive'?650:320,.3);volume();
    },
    setDucked(value){ducked=Boolean(value);if(!disposed)volume();},
    dispose(){if(disposed)return;disposed=true;sources.forEach(node=>{node.stop();node.disconnect();});[output,filter,rumble,harmonicGain,pulseDepth,airGain].forEach(node=>node.disconnect());},
  };
}
