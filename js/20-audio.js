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
  let road={}, wind={}, night={}, hum={}, gen={}, rain={}, dsl={};
  let birdT=1.5, clankT=3, flushT=12, jakeT=40, barkT=15, reefer={}, creakT=3;
  // the camp out back: the fire, a phone speaker, four kids talking
  let camp={}, crackT=0, voiceT=3, song=0, beat=null;
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
    // rain: a hiss outdoors, and on the roof a duller drumming you hear inside
    rain.g=ctx.createGain(); rain.g.gain.value=0; rain.g.connect(outLP);
    { const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=700;
      const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=7500;
      loop(pink).connect(hp); hp.connect(lp); lp.connect(rain.g); }
    rain.roof=ctx.createGain(); rain.roof.gain.value=0; rain.roof.connect(master);
    { const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=420; bp.Q.value=0.5;
      loop(noise(4,"pink")).connect(bp); bp.connect(rain.roof); }
    // the standby diesel: a firing beat at its speed, its fan, its exhaust
    dsl.g=ctx.createGain(); dsl.g.gain.value=0; dsl.g.connect(outLP);
    { dsl.lp=ctx.createBiquadFilter(); dsl.lp.type="lowpass"; dsl.lp.frequency.value=380; dsl.lp.connect(dsl.g);
      dsl.osc=[];
      for(const [f,a2,ty] of [[30,0.55,"sawtooth"],[60,0.40,"sawtooth"],[90,0.18,"square"],[15,0.25,"sine"]]){
        const o=ctx.createOscillator(); o.type=ty; o.frequency.value=f*0.2; const g=ctx.createGain(); g.gain.value=a2*0.4;
        o.connect(g); g.connect(dsl.lp); o.start(); dsl.osc.push({o:o, f:f}); }
      const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=900; bp.Q.value=0.4;
      const g=ctx.createGain(); g.gain.value=0.22; loop(noise(4,"pink")).connect(bp); bp.connect(g); g.connect(dsl.g); }
    // a reefer unit: a small diesel and its fans, a drone with a beat in it
    reefer.g=ctx.createGain(); reefer.g.gain.value=0; reefer.g.connect(outLP);
    { const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=900; lp.connect(reefer.g);
      for(const [f,a2] of [[37,0.5],[74,0.35],[111,0.2]]){ const o=ctx.createOscillator(); o.type="sawtooth"; o.frequency.value=f;
        const g=ctx.createGain(); g.gain.value=a2*0.4; o.connect(g); g.connect(lp); o.start(); }
      loop(noise(4,"pink")).connect(lp); }
    // the camp: one bus, panned toward the fire; under it the fire's own
    // roar and hiss, and the phone speaker's thin band for the music
    camp.pan=ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain(); camp.pan.connect(outLP);
    camp.g=ctx.createGain(); camp.g.gain.value=0; camp.g.connect(camp.pan);
    { const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=320;
      const g=ctx.createGain(); g.gain.value=0.55; loop(brown).connect(lp); lp.connect(g); g.connect(camp.g);
      const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=2800; bp.Q.value=0.6;
      const g2=ctx.createGain(); g2.gain.value=0.10; loop(pink).connect(bp); bp.connect(g2); g2.connect(camp.g); }
    camp.mus=ctx.createGain(); camp.mus.gain.value=0;
    { const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=320;
      const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=4800;
      camp.musIn=ctx.createGain(); camp.musIn.gain.value=1; camp.musIn.connect(hp); hp.connect(lp); lp.connect(camp.mus); camp.mus.connect(camp.pan); }
    camp.vox=ctx.createGain(); camp.vox.gain.value=0; camp.vox.connect(camp.pan);
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
    const inWoods=smoothstep(-4, 12, Terrain.siteDist(cam.x, cam.z));
    wind.g.gain.setTargetAtTime((0.015+Wind.gust*0.10)*(0.5+inWoods*0.8), t, 0.3);
    wind.bp.frequency.setTargetAtTime(500+Wind.gust*600, t, 0.4);
    // the insects come in at dusk; fewer in October
    night.g.gain.setTargetAtTime(smoothstep(0.35,0.8,dark)*(FOREST.isAutumn()?0.006:0.016), t, 0.8);
    hum.g.gain.setTargetAtTime(inside?0.010*GRID.bldg:0, t, 0.2);
    let gd=1e9; for(const p of GEN_POS) gd=Math.min(gd, Math.hypot(cam.x-p.x, cam.z-p.z));
    // the transformer's hum, and when the set is running, the set: loud close
    // to, and carrying across the site on a still night
    const rpm=Math.max(GRID.rpm, GRID.rpm2*0.8);
    gen.g.gain.setTargetAtTime(0.03*(1+rpm*2.5)/(1+gd*gd/300), t, 0.3);
    dsl.g.gain.setTargetAtTime(rpm*(GRID.rpm2>0.5?1.35:1)*0.30/(1+gd*gd/1600), t, 0.25);
    for(const q of dsl.osc) q.o.frequency.setTargetAtTime(q.f*(0.2+0.8*rpm), t, 0.4);
    dsl.lp.frequency.setTargetAtTime(220+rpm*260, t, 0.4);
    // the rain
    const rn=WEATHER.rain;
    rain.g.gain.setTargetAtTime(rn*(0.10+0.05*WEATHER.storm), t, 0.5);
    rain.roof.gain.setTargetAtTime(inside?rn*0.06:0, t, 0.4);
    // the halyard slapping the flagpole when the wind gets up
    const fd=Math.hypot(cam.x+17.4, cam.z-23.2);
    clankT-=dt*(0.3+Wind.gust*2.0);
    if(clankT<=0){ clankT=1.2+Math.random()*3.5;
      if(fd<70 && Wind.gust>0.25){ const v=0.05/(1+fd*fd/120), tt=ctx.currentTime+0.01;
        tone("sine", 1240, 1235, 0.5, v, tt, 0); tone("sine", 2930, 2925, 0.35, v*0.5, tt, 0);
        if(Math.random()<0.5){ tone("sine", 1240, 1235, 0.4, v*0.6, tt+0.14, 0); } } }
    // in the restrooms: somebody flushing, a dryer going
    const zn=zoneAt(cam.x, cam.z, cam.y);
    flushT-=dt;
    if(flushT<=0){ flushT=14+Math.random()*30;
      if(zn && /ROOM/.test(zn)) { if(Math.random()<0.6) flush(); else blip("dryer"); } }
    // out on the road, now and then, a truck on its engine brake for the exit
    jakeT-=dt;
    if(jakeT<=0){ jakeT=50+Math.random()*120; if(!inside) jake(); }
    // a dog in the pet area
    barkT-=dt;
    if(barkT<=0){ barkT=12+Math.random()*30;
      const w=(typeof PEOPLE!=="undefined") && PEOPLE.find(p=>p.dog && p.dog.g.visible);
      if(w){ const d=Math.hypot(cam.x-w.dx, cam.z-w.dz); if(d<90) bark(0.06/(1+d*d/200)); } }
    // the old house: it creaks, settling, when you are inside it
    if(typeof HOUSE!=="undefined" && HOUSE.zone){ const Z=HOUSE.zone;
      if(cam.x>Z.x0 && cam.x<Z.x1 && cam.z>Z.z0 && cam.z<Z.z1 && cam.y>Z.y0 && cam.y<Z.y1){
        creakT-=dt; if(creakT<=0){ creakT=4+Math.random()*9; creak(); } } }
    // the reefer units in the truck lot
    let rd=1e9; if(typeof REEFERS!=="undefined") for(const p of REEFERS) rd=Math.min(rd, Math.hypot(cam.x-p.x, cam.z-p.z));
    reefer.g.gain.setTargetAtTime(0.05/(1+rd*rd/90), t, 0.4);
    // the camp: louder as you come in, from where it is
    if(typeof CAMP!=="undefined") campSound(dt, cam, rx, rz);
    // birds: a call every second or two by day, more at the edge of the woods
    birdT-=dt;
    if(birdT<=0){
      const day=1-dark;
      birdT=(0.8+Math.random()*2.6)/Math.max(0.15, day*(0.6+inWoods));
      if(day>0.3 && !inside) bird(Math.random());
    }
  }
  /* ---- the camp ----------------------------------------------------------
     The fire is its roar and hiss, crackles (a few milliseconds of noise at
     a random pitch, a dozen a second) and now and then a pop. The music is
     a little four-chord loop on a phone speaker, scheduled a beat ahead.
     The voices are syllables: a buzz at a speaking pitch through two vowel
     formants, strung into phrases, never words; and when something is
     funny, everyone at once. */
  const SONGS=[{bpm:84, roots:[57,53,48,55], third:[60,57,52,59]},     // A minor, F, C, G
               {bpm:96, roots:[50,55,47,52], third:[53,59,50,55]}];    // D minor, G, B dim, E minor
  const hz=m=>440*Math.pow(2,(m-69)/12);
  function burst(at, dur, f, q, peak, dest){
    const s=ctx.createBufferSource(); s.buffer=_nb || (_nb=noise(0.5,"white"));
    const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=f; bp.Q.value=q;
    const g=ctx.createGain(); env(g, at, 0.001, peak, dur*0.3, dur);
    s.connect(bp); bp.connect(g); g.connect(dest||camp.g); s.start(at, Math.random()*0.4); s.stop(at+dur*2+0.05);
  }
  let _nb=null;
  function syllable(at, f0, dur, peak, vowel){
    const o=ctx.createOscillator(); o.type="sawtooth";
    o.frequency.setValueAtTime(f0, at); o.frequency.linearRampToValueAtTime(f0*(0.9+Math.random()*0.25), at+dur);
    const g=ctx.createGain(); env(g, at, 0.015, peak, dur*0.5, dur*0.6);
    const F=vowel||[[730,1090],[530,1840],[300,2290],[570,840],[440,1020],[660,1720]][(Math.random()*6)|0];
    for(const [fc,q,a] of [[F[0],5,1],[F[1],8,0.6]]){
      const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=fc; bp.Q.value=q;
      const ga=ctx.createGain(); ga.gain.value=a; o.connect(bp); bp.connect(ga); ga.connect(g);
    }
    g.connect(camp.vox); o.start(at); o.stop(at+dur*1.4+0.05);
  }
  const VOICES=[118, 205, 132, 222];
  function phrase(at){
    const v=VOICES[(Math.random()*VOICES.length)|0], n=3+((Math.random()*7)|0);
    let tt=at;
    for(let k=0;k<n;k++){ const d=0.08+Math.random()*0.13; syllable(tt, v*(1+(Math.random()-0.4)*0.18)*(k===n-1?0.88:1), d, 0.5); tt+=d+0.03+Math.random()*0.06; }
  }
  function campLaugh(){
    if(!ctx || !enabled || !camp.vox) return;
    const t0=ctx.currentTime+0.05;
    for(let w=0; w<3; w++){ const v=VOICES[(w+((Math.random()*2)|0))%4]*1.15; let tt=t0+w*0.11+Math.random()*0.1;
      for(let k=0;k<4+((Math.random()*3)|0);k++){ syllable(tt, v*(1.15-k*0.05), 0.085, 0.65, [760,1250]); burst(tt, 0.06, 1800, 0.8, 0.10, camp.vox); tt+=0.15+Math.random()*0.03; } }
  }
  function campPop(){
    if(!ctx || !enabled || !camp.g) return;
    const t0=ctx.currentTime+0.01;
    burst(t0, 0.025, 1400, 0.7, 1.6); burst(t0+0.03, 0.012, 3200, 1.5, 0.8); burst(t0+0.07, 0.01, 2500, 1.2, 0.6);
  }
  function campSound(dt, cam, rx, rz){
    const t=ctx.currentTime, dx=CAMP.x-cam.x, dz=CAMP.z-cam.z, d=Math.hypot(dx,dz);
    const near=1/(1+d*d/36);
    if(camp.pan.pan) camp.pan.pan.setTargetAtTime(clamp((dx*rx+dz*rz)/Math.max(d,1), -0.8, 0.8)*smoothstep(1,4,d), t, 0.2);
    const here=BACKWOODS.present?1:0, burn=BACKWOODS.burn===undefined?1:BACKWOODS.burn;   // nobody there: no music, no talk, a low fire
    camp.g.gain.setTargetAtTime(0.16*near*(0.35+0.65*burn), t, 0.3);
    camp.mus.gain.setTargetAtTime(here*0.05/(1+d*d/110), t, 0.4);
    camp.vox.gain.setTargetAtTime(here*0.045/(1+d*d/60), t, 0.4);
    if(d>110){ beat=null; return; }
    // crackle
    crackT-=dt;
    while(crackT<=0){ crackT+=0.02+Math.random()*0.12;
      burst(t+Math.random()*0.05, 0.004+Math.random()*0.016, 1200+Math.random()*5200, 1+Math.random()*3, 0.25+Math.random()*0.55); }
    // the music, scheduled ahead a sixteenth at a time
    const S=SONGS[song], st=60/S.bpm/4;
    if(!beat || beat.next<t) beat={next:t+0.05, i:0};
    while(beat.next<t+0.25){
      const at=beat.next, i=beat.i%64, bar=Math.floor(i/16), s=i%16, root=S.roots[bar], third=S.third[bar];
      if(s===0 || s===8 || s===11) { tone("sine", 110, 48, 0.16, 0.9, at, undefined, camp.musIn); }              // kick
      if(s===4 || s===12) burst(at, 0.09, 1900, 0.9, 0.8, camp.musIn);                                         // snare
      if(s%2===0) burst(at, 0.025, 7500, 2, 0.18, camp.musIn);                                                 // hat
      if(s===0 || s===6 || s===10) tone("triangle", hz(root-12), null, st*3, 0.55, at, undefined, camp.musIn);   // bass
      if(s===2 || s===10) for(const m of [root, third, root+7]) tone("square", hz(m+12), null, st*2.5, 0.07, at, undefined, camp.musIn);
      if(s%4===3) tone("sine", hz([root,third,root+7,third+12][(i>>2)%4]+12), null, st*1.5, 0.12, at, undefined, camp.musIn);
      beat.next+=st; beat.i++;
    }
    // talk
    voiceT-=dt;
    if(voiceT<=0){ voiceT=1.2+Math.random()*4.5; if(d<70 && BACKWOODS.present) phrase(t+0.05); }
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
  function flush(){
    const tt=ctx.currentTime+0.05, s=ctx.createBufferSource(); s.buffer=noise(4,"pink");
    const f=ctx.createBiquadFilter(); f.type="bandpass"; f.Q.value=0.8;
    f.frequency.setValueAtTime(600,tt); f.frequency.linearRampToValueAtTime(1600,tt+0.6); f.frequency.exponentialRampToValueAtTime(380,tt+3.6);
    const g=ctx.createGain(); env(g,tt,0.08,0.22,1.6,1.8); s.connect(f); f.connect(g); g.connect(master); s.start(tt);
    tone("sine", 70, 50, 0.3, 0.05, tt, 0, master);
  }
  // a board taking weight somewhere: a slow, rough, falling squeal
  function creak(){
    const tt=ctx.currentTime+0.05, dur=0.4+Math.random()*0.7, f=180+Math.random()*220;
    const o=ctx.createOscillator(); o.type="sawtooth"; o.frequency.setValueAtTime(f,tt); o.frequency.linearRampToValueAtTime(f*(0.7+Math.random()*0.2),tt+dur);
    const am=ctx.createGain(); am.gain.value=0.5; const lfo=ctx.createOscillator(); lfo.type="square"; lfo.frequency.value=18+Math.random()*30;
    const lg=ctx.createGain(); lg.gain.value=0.5; lfo.connect(lg); lg.connect(am.gain);
    const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=f*2.2; bp.Q.value=3;
    const g=ctx.createGain(); env(g,tt,0.05,0.025,dur*0.6,dur*0.4);
    let n=g; if(ctx.createStereoPanner){ const p=ctx.createStereoPanner(); p.pan.value=Math.random()*1.6-0.8; g.connect(p); n=p; }
    o.connect(am); am.connect(bp); bp.connect(g); n.connect(master);
    o.start(tt); lfo.start(tt); o.stop(tt+dur+0.1); lfo.stop(tt+dur+0.1);
  }
  function jake(){
    const tt=ctx.currentTime+0.05, dur=1.6+Math.random()*1.4;
    const o=ctx.createOscillator(); o.type="sawtooth"; o.frequency.setValueAtTime(48,tt); o.frequency.linearRampToValueAtTime(34,tt+dur);
    const am=ctx.createGain(); am.gain.value=0.5; const lfo=ctx.createOscillator(); lfo.type="square"; lfo.frequency.value=22;
    const lg=ctx.createGain(); lg.gain.value=0.5; lfo.connect(lg); lg.connect(am.gain);
    const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=420;
    const g=ctx.createGain(); env(g,tt,0.25,0.05,dur-0.5,0.6);
    let n=g; if(ctx.createStereoPanner){ const p=ctx.createStereoPanner(); p.pan.value=-0.6; g.connect(p); n=p; }
    o.connect(am); am.connect(lp); lp.connect(g); n.connect(outLP);
    o.start(tt); lfo.start(tt); o.stop(tt+dur+0.8); lfo.stop(tt+dur+0.8);
  }
  function bark(v){
    const tt=ctx.currentTime+0.02, n=1+((Math.random()*3)|0);
    for(let k=0;k<n;k++){ const at=tt+k*0.32;
      tone("sawtooth", 520, 360, 0.12, v*0.6, at, 0.3);
      const s=ctx.createBufferSource(); s.buffer=noise(0.15,"white"); const f=ctx.createBiquadFilter(); f.type="bandpass"; f.frequency.value=900; f.Q.value=2;
      const g=ctx.createGain(); env(g,at,0.005,v,0.04,0.08); s.connect(f); f.connect(g); g.connect(outLP); s.start(at); }
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
    }else if(kind==="door"){
      tone("sine", 95, 55, 0.18, 0.22*vol, t, 0);
      const s=ctx.createBufferSource(); s.buffer=noise(0.2,"white"); const f=ctx.createBiquadFilter();
      f.type="bandpass"; f.frequency.value=1800; f.Q.value=1.2; const g=ctx.createGain(); env(g,t,0.002,0.10*vol,0.01,0.08);
      s.connect(f); f.connect(g); g.connect(outLP); s.start(t);
    }else if(kind==="coin"){                       // a quarter going down the chute
      tone("sine", 2200, 2150, 0.12, 0.05*vol, t, 0, master); tone("sine", 3300, 3260, 0.10, 0.03*vol, t+0.05, 0, master);
      tone("sine", 1600, 1580, 0.08, 0.03*vol, t+0.16, 0, master);
    }else if(kind==="coins"){                      // change into the cup
      for(let k=0;k<4;k++) tone("sine", 2400+Math.random()*900, null, 0.09, 0.035*vol, t+k*0.07+Math.random()*0.03, 0, master);
    }else if(kind==="bill"||kind==="whirr"){       // a little motor: the bill acceptor, the coil
      const d2=kind==="bill"?0.8:1.2;
      tone("sawtooth", kind==="bill"?180:95, kind==="bill"?160:90, d2, 0.035*vol, t, 0, master);
      tone("square", kind==="bill"?360:190, null, d2, 0.010*vol, t, 0, master);
    }else if(kind==="thump"){                      // a shoulder into the cabinet
      tone("sine", 70, 40, 0.30, 0.28*vol, t, 0, master); tone("triangle", 180, 90, 0.18, 0.08*vol, t, 0, master);
      const s=ctx.createBufferSource(); s.buffer=noise(0.3,"white"); const f=ctx.createBiquadFilter();
      f.type="lowpass"; f.frequency.value=500; const g=ctx.createGain(); env(g,t,0.004,0.12*vol,0.04,0.2);
      s.connect(f); f.connect(g); g.connect(master); s.start(t);
    }else if(kind==="tick"){
      tone("square", 900, null, 0.03, 0.02*vol, t, 0, master);
    }else if(kind==="airhorn"){
      tone("sawtooth", 262, null, 1.1, 0.06*vol, t); tone("sawtooth", 330, null, 1.1, 0.05*vol, t);
    }
  }
  /* ---- weather and power ------------------------------------------------
     Thunder is a crack (close strikes only: a few ms of bright noise and
     a ripping tail) and then the rumble, brown noise through a low-pass
     that closes as it rolls, longer and lower the farther off it was. */
  function thunder(d, pan){
    if(!ctx || !enabled) return;
    const t0=ctx.currentTime+0.02, near=1/(1+d/900), inside=indoorsAt(camera.position.x, camera.position.z, camera.position.y);
    const pn=(g)=>{ if(ctx.createStereoPanner){ const p=ctx.createStereoPanner(); p.pan.value=pan*0.7; g.connect(p); return p; } return g; };
    if(d<900){
      const s=ctx.createBufferSource(); s.buffer=_nb || (_nb=noise(0.5,"white"));
      const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=900;
      const g=ctx.createGain(); env(g, t0, 0.003, 0.55*near, 0.05, 0.6);
      s.connect(hp); hp.connect(g); pn(g).connect(inside?outLP:master); s.start(t0); s.stop(t0+1.2);
    }
    const dur=2.5+Math.min(6, d/600)+Math.random()*2;
    const s=ctx.createBufferSource(); s.buffer=noise(Math.min(9, dur+1), "brown");
    const lp=ctx.createBiquadFilter(); lp.type="lowpass";
    lp.frequency.setValueAtTime(d<900?900:420, t0); lp.frequency.exponentialRampToValueAtTime(90, t0+dur);
    const g=ctx.createGain(); g.gain.setValueAtTime(0, t0);
    const pk=0.75*near+0.06;
    // the roll: two or three swells as the sound comes in from along the stroke
    g.gain.linearRampToValueAtTime(pk, t0+0.15+Math.random()*0.3);
    g.gain.linearRampToValueAtTime(pk*0.45, t0+dur*0.35);
    g.gain.linearRampToValueAtTime(pk*(0.6+Math.random()*0.3), t0+dur*0.5);
    g.gain.exponentialRampToValueAtTime(0.0005, t0+dur);
    s.connect(lp); lp.connect(g); pn(g).connect(outLP); s.start(t0); s.stop(t0+dur+0.2);
  }
  // the moment it goes: a heavy clunk somewhere in the walls, the hum gone
  function outage(){
    if(!ctx || !enabled) return;
    const t0=ctx.currentTime+0.05;
    tone("sine", 95, 38, 0.5, 0.22, t0, 0, master);
    tone("square", 120, 60, 0.08, 0.05, t0, 0, master);
  }
  function _genVol(){ let gd=1e9; for(const p of GEN_POS) gd=Math.min(gd, Math.hypot(camera.position.x-p.x, camera.position.z-p.z)); return 1/(1+gd*gd/1600); }
  // the starter: a grinding whine that rises, three goes of it
  function genCrank(){
    if(!ctx || !enabled) return;
    const v=_genVol()*0.35;
    for(let k=0;k<3;k++){ const at=ctx.currentTime+0.05+k*0.75;
      const o=ctx.createOscillator(); o.type="sawtooth"; o.frequency.setValueAtTime(14,at); o.frequency.linearRampToValueAtTime(19,at+0.6);
      const am=ctx.createGain(); am.gain.value=0.6; const lfo=ctx.createOscillator(); lfo.frequency.value=9; const lg=ctx.createGain(); lg.gain.value=0.4;
      lfo.connect(lg); lg.connect(am.gain);
      const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=700;
      const g=ctx.createGain(); env(g, at, 0.05, v, 0.45, 0.15);
      o.connect(am); am.connect(lp); lp.connect(g); g.connect(outLP);
      o.start(at); lfo.start(at); o.stop(at+0.75); lfo.stop(at+0.75);
      tone("square", 820, 760, 0.6, v*0.08, at, 0); }
  }
  function genCatch(){
    if(!ctx || !enabled) return;
    const v=_genVol(), at=ctx.currentTime+0.02;
    tone("sawtooth", 22, 55, 1.2, 0.30*v, at); tone("sine", 45, 90, 1.0, 0.25*v, at);
    burst(at, 0.25, 300, 0.6, 0.4*v, outLP);
  }
  function genStop(){
    if(!ctx || !enabled) return;
    const v=_genVol(), at=ctx.currentTime+0.02;
    tone("sawtooth", 30, 9, 3.0, 0.18*v, at);
  }
  // the transfer switch throwing: a bang and a ring in the gear
  function ats(){
    if(!ctx || !enabled) return;
    let d=Math.hypot(camera.position.x-80.8, camera.position.z+181);
    const v=1/(1+d*d/60), at=ctx.currentTime+0.02;
    tone("square", 140, 70, 0.10, 0.25*v, at); tone("sine", 2400, 2380, 0.4, 0.04*v, at+0.01);
    burst(at, 0.05, 1600, 0.8, 0.6*v, outLP);
    // and in the building, the tubes coming back with a tick and a buzz
    if(indoorsAt(camera.position.x, camera.position.z, camera.position.y)) tone("sawtooth", 120, 120, 0.4, 0.02, at+0.1, 0, master);
  }
  return { start:start, update:update, blip:blip, on:()=>enabled,
           thunder:thunder, outage:outage, genCrank:genCrank, genCatch:genCatch, genStop:genStop, ats:ats,
           campLaugh:campLaugh, campPop:campPop, campSong:()=>{ song=(song+1)%SONGS.length; beat=null; },
           toggle:()=>{ enabled=!enabled; if(!started && enabled) start();
                        if(master) master.gain.value=enabled?0.75:0; } };
})();
