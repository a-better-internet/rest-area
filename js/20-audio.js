"use strict";
/* REST AREA · 20-audio.js
   the sound of the place, synthesised: the interstate, the wind in the
   crowns, birds by day and insects by night, the hum indoors
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   20 · AMBIENCE
   Nothing is recorded; every sound is built from noise and oscillators
   when the page starts, the same way every texture is drawn. It starts on
   the click that dismisses the boot card (browsers will not play before a
   gesture) and U turns it off and on.
   * The road is brown noise through a low-pass whose cutoff and level are
     set every frame from where the traffic actually is: a truck going by
     swells and brightens and passes from one ear to the other.
   * Wind is band-passed noise that follows the same gust the crowns do.
   * Birds are synthesised calls on a schedule, thick at dawn, gone at
     night; crickets and katydids are pulse trains that come in at dusk.
   * Indoors the outdoors is muffled and the tubes hum at 120 Hz.
   ---------------------------------------------------------------------- */
const AUDIO=(function(){
  let ctx=null, master=null, outBus=null, outLP=null, enabled=true, started=false;
  let road={}, wind={}, night={}, hum={}, gen={};
  let birdT=1.5;
  function noise(sec, color){
    const n=Math.floor(ctx.sampleRate*sec), b=ctx.createBuffer(1,n,ctx.sampleRate), d=b.getChannelData(0);
    let l=0, b0=0,b1=0,b2=0;
    for(let i=0;i<n;i++){
      const w=Math.random()*2-1;
      if(color==="brown"){ l=(l+0.02*w)/1.02; d[i]=l*3.5; }
      else if(color==="pink"){ b0=0.99765*b0+w*0.0990460; b1=0.96300*b1+w*0.2965164; b2=0.57000*b2+w*1.0526913;
                                d[i]=(b0+b1+b2+w*0.1848)*0.18; }
      else d[i]=w*0.5;
    }
    return b;
  }
  function loop(buf){ const s=ctx.createBufferSource(); s.buffer=buf; s.loop=true; s.start(); return s; }
  function start(){
    if(started) return;
    try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
    started=true;
    master=ctx.createGain(); master.gain.value=enabled?0.75:0; master.connect(ctx.destination);
    // everything outdoors goes through one low-pass, which closes when you go inside
    outLP=ctx.createBiquadFilter(); outLP.type="lowpass"; outLP.frequency.value=16000;
    outBus=ctx.createGain(); outBus.gain.value=1; outLP.connect(outBus); outBus.connect(master);
    const brown=noise(6,"brown"), pink=noise(5,"pink");
    // the road: rumble and tyre hiss, panned toward where the traffic is
    road.pan=ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    road.lp=ctx.createBiquadFilter(); road.lp.type="lowpass"; road.lp.frequency.value=500;
    road.g=ctx.createGain(); road.g.gain.value=0;
    loop(brown).connect(road.lp); road.lp.connect(road.g);
    road.hp=ctx.createBiquadFilter(); road.hp.type="bandpass"; road.hp.frequency.value=2400; road.hp.Q.value=0.7;
    road.hg=ctx.createGain(); road.hg.gain.value=0;
    loop(pink).connect(road.hp); road.hp.connect(road.hg);
    road.g.connect(road.pan); road.hg.connect(road.pan); road.pan.connect(outLP);
    // wind in the leaves
    wind.bp=ctx.createBiquadFilter(); wind.bp.type="bandpass"; wind.bp.frequency.value=700; wind.bp.Q.value=0.5;
    wind.g=ctx.createGain(); wind.g.gain.value=0;
    loop(pink).connect(wind.bp); wind.bp.connect(wind.g); wind.g.connect(outLP);
    // the night: crickets (a steady trill) and katydids (rasping pulses)
    night.g=ctx.createGain(); night.g.gain.value=0; night.g.connect(outLP);
    for(const [f,rate,amt] of [[4400,34,0.5],[4950,29,0.35],[3800,2.6,0.6]]){
      const o=ctx.createOscillator(); o.type="sine"; o.frequency.value=f;
      const am=ctx.createGain(); am.gain.value=0;
      const lfo=ctx.createOscillator(); lfo.type="square"; lfo.frequency.value=rate;
      const lg=ctx.createGain(); lg.gain.value=amt*0.5; lfo.connect(lg); lg.connect(am.gain);
      const bias=ctx.createConstantSource ? ctx.createConstantSource() : null;
      if(bias){ bias.offset.value=amt*0.5; bias.connect(am.gain); bias.start(); }
      o.connect(am); am.connect(night.g); o.start(); lfo.start();
    }
    // the hum indoors, and the transformer's out at the substation
    hum.g=ctx.createGain(); hum.g.gain.value=0; hum.g.connect(master);
    gen.g=ctx.createGain(); gen.g.gain.value=0; gen.g.connect(outLP);
    for(const [f,a,dst] of [[120,0.5,hum.g],[240,0.18,hum.g],[60,0.6,gen.g],[120,0.35,gen.g],[180,0.15,gen.g]]){
      const o=ctx.createOscillator(); o.type="sine"; o.frequency.value=f*(1+Math.random()*0.002);
      const g=ctx.createGain(); g.gain.value=a; o.connect(g); g.connect(dst); o.start();
    }
  }
  const _r=new T.Vector3();
  function update(dt, dark){
    if(!ctx || !enabled) return;
    if(ctx.state==="suspended") ctx.resume();
    const cam=camera.position, t=ctx.currentTime;
    const inside=indoorsAt(cam.x, cam.z, cam.y);
    outLP.frequency.setTargetAtTime(inside?700:16000, t, 0.15);
    outBus.gain.setTargetAtTime(inside?0.45:1, t, 0.15);
    // the road: every vehicle contributes by distance, trucks double
    let L=0, px=0;
    camera.getWorldDirection(_r);
    const rx=-_r.z, rz=_r.x;                      // the camera's right, on the ground
    for(const v of TRAFFIC){
      const dx=v.g.position.x-cam.x, dz=v.g.position.z-cam.z, d2=dx*dx+dz*dz;
      const w=(v.big?2.4:1)*(0.4+Math.min(1,v.speed/30)*0.6)/(1+d2/420);
      L+=w; px+=w*(dx*rx+dz*rz)/Math.sqrt(d2+1);
    }
    // and the steady wash of the interstate itself, nearer the closer you are
    const hd=Math.min(Math.abs(cam.x-HWY.nb), Math.abs(cam.x-HWY.sb));
    L+=0.10/(1+hd*hd/9000);
    const lv=Math.min(1, L*1.1);
    road.g.gain.setTargetAtTime(0.06+lv*0.75, t, 0.12);
    road.hg.gain.setTargetAtTime(lv*lv*0.30, t, 0.12);
    road.lp.frequency.setTargetAtTime(260+lv*1100, t, 0.15);
    if(road.pan.pan) road.pan.pan.setTargetAtTime(clamp(px/Math.max(L,1e-3),-0.85,0.85), t, 0.15);
    // wind follows the gust, and is louder in the trees
    const inWoods=smoothstep(-4, 12, Terrain.clearDist(cam.x, cam.z));
    wind.g.gain.setTargetAtTime((0.015+Wind.gust*0.10)*(0.5+inWoods*0.8), t, 0.3);
    wind.bp.frequency.setTargetAtTime(500+Wind.gust*600, t, 0.4);
    // the insects come in at dusk; fewer in October
    night.g.gain.setTargetAtTime(smoothstep(0.35,0.8,dark)*(FOREST.isAutumn()?0.006:0.016), t, 0.8);
    hum.g.gain.setTargetAtTime(inside?0.010:0, t, 0.2);
    let gd=1e9; for(const p of GEN_POS) gd=Math.min(gd, Math.hypot(cam.x-p.x, cam.z-p.z));
    gen.g.gain.setTargetAtTime(0.03/(1+gd*gd/300), t, 0.3);
    // birds: a call every second or two by day, more at the edge of the woods
    birdT-=dt;
    if(birdT<=0){
      const day=1-dark;
      birdT=(0.8+Math.random()*2.6)/Math.max(0.15, day*(0.6+inWoods));
      if(day>0.3 && !inside) bird(Math.random());
    }
  }
  function env(g, t, a, peak, hold, rel){
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t+a);
    g.gain.setValueAtTime(peak, t+a+hold); g.gain.exponentialRampToValueAtTime(0.0001, t+a+hold+rel);
  }
  function tone(type, f0, f1, dur, peak, at, pan, dest){
    const o=ctx.createOscillator(), g=ctx.createGain(); o.type=type;
    o.frequency.setValueAtTime(f0, at); if(f1) o.frequency.exponentialRampToValueAtTime(f1, at+dur);
    env(g, at, 0.01, peak, dur*0.6, dur*0.5);
    let n=g;
    if(ctx.createStereoPanner && pan!==undefined){ const p=ctx.createStereoPanner(); p.pan.value=pan; g.connect(p); n=p; }
    o.connect(g); n.connect(dest||outLP); o.start(at); o.stop(at+dur*1.3+0.05);
  }
  function bird(r){
    const t=ctx.currentTime+0.02, pan=Math.random()*1.6-0.8, v=0.010+Math.random()*0.012;
    if(r<0.35){                                    // a cardinal: slurred whistles, cheer cheer cheer
      const n=3+((Math.random()*3)|0);
      for(let k=0;k<n;k++) tone("sine", 3600, 2100, 0.16, v, t+k*0.22, pan);
    }else if(r<0.6){                               // a chickadee: fee-bee
      tone("sine", 3900, 3850, 0.32, v*0.8, t, pan); tone("sine", 3250, 3200, 0.36, v*0.8, t+0.42, pan);
    }else if(r<0.85){                              // the wood thrush, in the woods: a flute and a trill
      const base=1600+Math.random()*900;
      tone("sine", base, base*1.02, 0.18, v*0.9, t, pan);
      tone("sine", base*1.5, base*1.48, 0.14, v*0.7, t+0.2, pan);
      for(let k=0;k<6;k++) tone("triangle", base*2.2+(k%2)*300, null, 0.04, v*0.5, t+0.38+k*0.045, pan);
    }else{                                         // a crow, a long way off
      for(let k=0;k<2+((Math.random()*2)|0);k++) tone("sawtooth", 520, 380, 0.22, v*0.35, t+k*0.36, pan);
    }
  }
  // one-shots, from the things you press E at; x,z set where it comes from
  function blip(kind, x, z){
    if(!ctx || !enabled) return;
    const t=ctx.currentTime+0.01;
    let vol=1;
    if(x!==undefined){ const d=Math.hypot(camera.position.x-x, camera.position.z-z); vol=1/(1+d*d/80); }
    if(kind==="clunk"){
      tone("sine", 140, 50, 0.25, 0.25*vol, t, 0, master);
      const s=ctx.createBufferSource(); s.buffer=noise(0.3,"white"); const f=ctx.createBiquadFilter();
      f.type="lowpass"; f.frequency.value=900; const g=ctx.createGain(); env(g,t,0.005,0.15*vol,0.03,0.2);
      s.connect(f); f.connect(g); g.connect(master); s.start(t);
    }else if(kind==="dryer"){
      const s=ctx.createBufferSource(); s.buffer=noise(3.2,"pink"); const f=ctx.createBiquadFilter();
      f.type="bandpass"; f.frequency.value=1400; f.Q.value=0.6; const g=ctx.createGain();
      env(g,t,0.25,0.35*vol,2.2,0.6); s.connect(f); f.connect(g); g.connect(master); s.start(t);
      tone("sawtooth", 210, 230, 3.0, 0.02*vol, t, 0, master);
    }else if(kind==="tone"){
      tone("sine", 350, null, 2.2, 0.06*vol, t, 0, master); tone("sine", 440, null, 2.2, 0.06*vol, t, 0, master);
    }else if(kind==="horn"){
      tone("square", 410, null, 0.45, 0.05*vol, t); tone("square", 515, null, 0.45, 0.05*vol, t);
    }else if(kind==="airhorn"){
      tone("sawtooth", 262, null, 1.1, 0.06*vol, t); tone("sawtooth", 330, null, 1.1, 0.05*vol, t);
    }
  }
  return { start:start, update:update, blip:blip, on:()=>enabled,
           toggle:()=>{ enabled=!enabled; if(!started && enabled) start();
                        if(master) master.gain.value=enabled?0.75:0; } };
})();
