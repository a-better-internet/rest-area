"use strict";
/* REST AREA · 16b-weather.js
   the weather and the power: overcast, rain, fog banks, thunderstorms, and
   now and then the storm that takes the power out
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   16b · WEATHER
   Most of the time it is fair. Every few minutes the sky may change its
   mind: a grey afternoon, a shower, a fog bank sat in the woods, and once
   in a while a thunderstorm. Each is a handful of numbers the rest of the
   world reads — how much of the sky is cloud, how hard it is raining, how
   thick the fog is, how electric the air — eased toward the weather's
   own values so it comes on and clears the way weather does.
     cover   0 clear .. 1 overcast: a cloud deck painted on the sky,
             the sun's light diffused, stars and moon put out
     rain    streaks round the camera (never under a roof), splashes at
             your feet, the paving darkening as it gets wet
     fog     the haze pulled in to a hundred metres or so, and banks of it
             lying in the woods and over the lawn
     storm   lightning: a flash in the cloud, sometimes a bolt, and the
             thunder after it at the speed of sound
   R toggles rain and fog, T a thunderstorm, P a storm that knocks the
   power out (see 17-player).
   ---------------------------------------------------------------------- */
const WKINDS={
  clear:  {cover:0.06, rain:0,    fog:0,    storm:0, label:"CLEAR"},
  cloudy: {cover:0.80, rain:0,    fog:0.06, storm:0, label:"OVERCAST"},
  rain:   {cover:0.97, rain:0.55, fog:0.30, storm:0, label:"RAIN"},
  fog:    {cover:0.62, rain:0,    fog:1.00, storm:0, label:"FOG"},
  rainfog:{cover:0.98, rain:0.70, fog:0.95, storm:0, label:"RAIN · FOG"},
  storm:  {cover:1.00, rain:1.00, fog:0.22, storm:1, label:"T-STORMS"},
};
const WEATHER={kind:"clear", cover:0.06, rain:0, fog:0, storm:0, wet:0, flash:0, fast:0,
               next:420+Math.random()*360, hold:0, strikeT:4, thunders:[], pulses:[], lastOut:-1e9, clock:0,
               label:()=>WKINDS[WEATHER.kind].label};
// the temperature: Crawford County in late July or mid October, warmest at
// three in the afternoon, coolest before dawn, and a rain or a storm takes
// the edge off it
WEATHER.temp=function(){
  const h=DayNight.state.hour, aut=FOREST.isAutumn(), hi=aut?58:81, lo=aut?40:61;
  const u=0.5+0.5*Math.cos((h-15)/24*Math.PI*2);
  return Math.round(lo+(hi-lo)*u - this.rain*5 - this.storm*4 - this.cover*2 - this.fog*1.5);
};
WEATHER.set=function(kind, fast){
  this.kind=kind; this.fast=fast?1:0;
  const durs={clear:[420,840], cloudy:[240,480], rain:[180,360], fog:[200,420], rainfog:[200,400], storm:[200,320]}[kind];
  this.next=durs[0]+Math.random()*(durs[1]-durs[0]);
  if(fast) this.hold=600;                              // a test key holds it a while
  if(kind==="storm") this.strikeT=fast?1.2:6;
  this.after=_nextWeather(kind);                       // what the forecast says comes next
};
// what comes next: fair most often; fog by the early morning and late at
// night; thunderstorms on summer afternoons and evenings
function _nextWeather(from){
  const h=DayNight.state.hour, aut=FOREST.isAutumn();
  const morn=(h>4.5 && h<9.5) || h>21.5, aft=h>12.5 && h<21;
  const was=from||WEATHER.kind;
  const w={clear:was==="clear"?0.42:0.62, cloudy:0.20, rain:0.10+(aut?0.04:0), fog:morn?0.16:0.03,
           rainfog:0.03, storm:(aft&&!aut)?0.07:0.025};
  if(was!=="clear"){ w[was]*=0.35; }
  let tot=0; for(const k in w) tot+=w[k];
  let r=Math.random()*tot;
  for(const k in w){ r-=w[k]; if(r<=0) return k; }
  return "clear";
}

/* ---- the power ------------------------------------------------------------
   Everything on the rest area's own supply is on one of two circuits: the
   building (tubes, signs inside, the vending machines, the office monitor)
   and the site (lot poles, the walk's posts, the floods, the soffit lights
   outside). Battery-backed things — the exit signs, the gear's own lamps —
   are on neither. A cut drops both; the standby set starts, comes up to
   speed, and the transfer switch moves the building onto it ten seconds
   later. The site stays dark until the utility comes back; then the switch
   moves back, the poles' lamps restrike and warm up over half a minute, and
   the set runs unloaded to cool before it shuts down. */
const GRID={bldg:1, site:1, emerg:0, garage:0, phase:"normal", t:0, rpm:0, rpm2:0, ats:"N", nAvail:1, run:false,
            dur:120, siteWarm:1, flick:1, cool:0, smoke:0};
GRID.trip=function(test){
  if(this.phase!=="normal" && this.phase!=="cool") return false;
  this.phase="out"; this.t=0; this.dur=test?55:90+Math.random()*150;
  this.nAvail=0; this.cranked=0; this.caught=0; this.caught2=0;
  if(typeof AUDIO!=="undefined" && AUDIO.outage) AUDIO.outage();
  outageFlash();
  return true;
};
function updateGrid(dt){
  const G=GRID; G.t+=dt;
  const A=(typeof AUDIO!=="undefined") ? AUDIO : null;
  if(G.phase==="normal"){
    G.bldg=1; G.emerg=0; G.nAvail=1; G.ats="N";
    G.siteWarm=Math.min(1, G.siteWarm+dt/35);          // a sodium lamp takes a while to come up
    G.site=G.siteWarm;
  }else if(G.phase==="out"){
    // the strike: a stutter, then nothing; the batteries take the exit lights
    G.flick = G.t<0.5 ? (Math.random()<0.5?0.15:0.6) : 0;
    G.bldg=G.site=G.flick; G.siteWarm=0; G.ats="-";
    G.emerg = G.t>0.7 ? 1 : 0;
    if(G.t>2.2 && !G.cranked){ G.cranked=1; A && A.genCrank && A.genCrank(); }
    if(G.t>4.6 && !G.caught){ G.caught=1; G.run=true; G.smoke=1.0; A && A.genCatch && A.genCatch(); }
    if(G.t>7.4 && !G.caught2){ G.caught2=1; G.smoke=Math.max(G.smoke,0.8); }
    if(G.t>10.5){ G.phase="gen"; G.t=0; G.ats="E"; A && A.ats && A.ats(); }
  }else if(G.phase==="gen"){
    // on the set: the building's lights back, the site's not
    G.bldg = G.t<0.25 ? 0.3 : 0.92+0.08*Math.sin(G.t*9.0)*Math.sin(G.t*2.3)*0.4;
    G.site=0; G.emerg=0; G.ats="E"; G.nAvail=0;
    if(G.t>G.dur){ G.phase="retransfer"; G.t=0; G.nAvail=1; }
  }else if(G.phase==="retransfer"){
    // the utility is back: the switch waits it out, its NORMAL lamp blinking
    G.bldg=0.94; G.site=0; G.nAvail = (G.t*2.5)%1<0.55 ? 1 : 0;
    if(G.t>12){ G.phase="cool"; G.t=0; G.ats="N"; G.nAvail=1; G.siteWarm=0.04; A && A.ats && A.ats(); }
  }else if(G.phase==="cool"){
    G.bldg = G.t<0.2 ? 0 : 1;                           // an open transition: the lights blink once
    G.siteWarm=Math.min(1, G.siteWarm+dt/35); G.site=G.siteWarm; G.emerg=0;
    if(G.t>60 && G.run){ G.run=false; A && A.genStop && A.genStop(); }
    if(G.t>66){ G.phase="normal"; G.t=0; }
  }
  // the sets themselves: the lead one first, the second a few seconds after
  const want=G.run?1:0;
  G.rpm += (want-G.rpm)*Math.min(1, dt*(want?0.45:0.25));
  G.rpm2 += ((G.run && (G.phase!=="out" || G.t>7.4) ? 1 : 0)-G.rpm2)*Math.min(1, dt*(G.run?0.45:0.25));
  if(G.rpm<0.002) G.rpm=0; if(G.rpm2<0.002) G.rpm2=0;
  // the lamps on the gear
  const L=ATS.leds;
  if(L.nAvail){ L.nAvail.set(G.nAvail?1:0); L.eAvail.set(G.rpm>0.9?1:0); L.onN.set(G.ats==="N"?1:0); L.onE.set(G.ats==="E"?1:0); }
  if(ATS.gens[0]) ATS.gens[0].set(G.rpm>0.5?1:0);
  if(ATS.gens[1]) ATS.gens[1].set(G.rpm2>0.5?1:0);
  // the stacks: a black cough as each catches, then a thin haze
  G.smoke=Math.max(0, G.smoke-dt*0.35);
  if(typeof PUFFS!=="undefined") ATS.stacks.forEach((s,i)=>{
    const r=i===0?G.rpm:G.rpm2; if(r<0.05) return;
    s.acc=(s.acc||0)+dt;
    const every=G.smoke>0.2 ? 0.05 : 0.28;
    while(s.acc>every){ s.acc-=every;
      const dk=G.smoke>0.2 ? 0.18 : 0.62;
      PUFFS.emit(s.x+(Math.random()-0.5)*0.1, s.y, s.z+(Math.random()-0.5)*0.1, (Math.random()-0.5)*0.2, 1.2+r*1.2, (Math.random()-0.5)*0.2,
                 0.18, G.smoke>0.2?1.6:0.9, G.smoke>0.2?3.5:2.2, G.smoke>0.2?0.75:0.16, dk, 0); }
  });
}
// the screen when it goes: a hard black frame, then the words, blinking
const _outEl=(function(){
  const d=document.createElement("div"); d.id="outage";
  d.innerHTML='<div class="w">POWER OUTAGE</div><div class="s">UTILITY FEED LOST · STANDBY GENERATOR STARTING</div>';
  document.body.appendChild(d); return d;
})();
function outageFlash(){
  const d=_outEl; d.classList.remove("go"); void d.offsetWidth; d.classList.add("go");
  clearTimeout(d._t); d._t=setTimeout(()=>d.classList.remove("go"), 4600);
}

/* ---- emergency lights: battery twin-heads by the exits ------------------ */
const EMERG_LENS=new T.MeshBasicMaterial({color:0x2a2a28, toneMapped:false});
const EMERG_HALO=[];
(function emergencyLights(){
  const body=new T.MeshStandardMaterial({color:0xe9e6dc, roughness:0.6});
  const unit=(x,y,z,ry,vol)=>{
    const g=new T.Group(); g.position.set(x,y,z); g.rotation.y=ry; scene.add(g);
    const b=new T.Mesh(new T.BoxGeometry(0.30,0.12,0.08), body); b.position.z=0.04; g.add(b);
    for(const s of [-1,1]){
      const hd=new T.Mesh(new T.SphereGeometry(0.045,10,8,0,Math.PI*2,0,Math.PI*0.6), body);
      hd.position.set(s*0.11,-0.08,0.10); hd.rotation.x=Math.PI*0.62; g.add(hd);
      const ln=new T.Mesh(new T.CircleGeometry(0.03,12), EMERG_LENS); ln.position.set(s*0.11,-0.105,0.125); ln.rotation.x=0.95; g.add(ln);
      const h=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, color:0xf4f6ff, transparent:true, opacity:0, depthWrite:false,
                                                 blending:T.AdditiveBlending, toneMapped:false}));
      h.scale.set(0.35,0.35,1); h.position.set(s*0.11,-0.11,0.14); g.add(h); EMERG_HALO.push(h);
    }
    const wp=new T.Vector3(0,-0.3,0.9).applyAxisAngle(V3(0,1,0), ry).add(V3(x,y,z));
    LAMPS.push({x:wp.x, y:wp.y, z:wp.z, color:0xf0f3ff, intensity:0.55, dist:8, decay:1.5, indoor:true, circ:"emerg", vol:vol});
  };
  const R=LOBBY, lv=[R.x0-0.4, R.x1+0.4, R.z0-0.4, R.z1+0.4, FL-1, 9];
  unit(R.x0+0.03, FL+2.55, -1.3, Math.PI/2, lv);
  unit(R.x1-0.03, FL+2.55, 0.6, -Math.PI/2, lv);
  for(const sg of [-1,1]) unit(3.17, FL+2.45, sg*9.6, -Math.PI/2, [-4.7, 3.2, Math.min(sg*5.65,sg*14.2), Math.max(sg*5.65,sg*14.2), FL-0.5, CEIL+0.3]);
  unit(79.2, SUB_G+0.15+2.5, -176.31, Math.PI, [77, 87, -182, -176, SUB_G-1, SUB_G+4]);
})();

/* ---- the cloud deck ---------------------------------------------------------
   One dome over everything, its underside painted from a tiling noise field
   projected onto a flat ceiling a long way up, so it has perspective: big
   soft masses overhead closing up into a grey line at the horizon. Cover
   sets how much of the field is cloud: a few broken rafts, then a ragged
   deck, then a lid. */
const _DECK_NOISE=(function(){
  const N=256, c=cvs(N,N), x=c.getContext("2d"), img=x.createImageData(N,N);
  const h=(i,j)=>{ const k=Math.sin(i*127.1+j*311.7)*43758.5453; return k-Math.floor(k); };
  const oct=(u,v,f)=>{ const uu=u*f, vv=v*f, i0=Math.floor(uu), j0=Math.floor(vv), fu=uu-i0, fv=vv-j0;
    const su=fu*fu*(3-2*fu), sv=fv*fv*(3-2*fv), w=a=>((a%f)+f)%f;
    const a=h(w(i0),w(j0)), b=h(w(i0+1),w(j0)), cc=h(w(i0),w(j0+1)), d=h(w(i0+1),w(j0+1));
    return (a+(b-a)*su)+((cc+(d-cc)*su)-(a+(b-a)*su))*sv; };
  for(let j=0;j<N;j++) for(let i=0;i<N;i++){
    const u=i/N, v=j/N, n=oct(u,v,4)*0.48+oct(u,v,8)*0.26+oct(u,v,16)*0.15+oct(u,v,32)*0.11;
    const o=(j*N+i)*4; img.data[o]=img.data[o+1]=img.data[o+2]=Math.round(n*255); img.data[o+3]=255;
  }
  x.putImageData(img,0,0);
  const t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; return t;
})();
const DECK=(function(){
  const m=new T.ShaderMaterial({
    uniforms:{tN:{value:_DECK_NOISE}, uCover:{value:0}, uOp:{value:0}, uOff:{value:new T.Vector2()},
              uLo:{value:new T.Color()}, uHi:{value:new T.Color()}, uHz:{value:new T.Color()}, uFlash:{value:0}},
    vertexShader:`varying vec3 vDir; void main(){ vDir=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader:`uniform sampler2D tN; uniform float uCover, uOp, uFlash; uniform vec2 uOff; uniform vec3 uLo, uHi, uHz;
varying vec3 vDir;
void main(){
  vec3 d=normalize(vDir);
  float h=max(d.y,0.0);
  vec2 uv=d.xz/(h+0.10)*0.16+uOff;
  float n=texture2D(tN,uv).r*0.64+texture2D(tN,uv*2.9+vec2(0.31,0.17)).r*0.36;
  float thr=1.0-uCover*1.12;
  float a=smoothstep(thr-0.06, thr+0.26, n)*smoothstep(-0.015,0.09,d.y);
  vec3 col=mix(uHi, uLo, smoothstep(0.35,0.95,n));
  col=mix(uHz, col, smoothstep(0.0,0.32,d.y));
  col+=uFlash*vec3(0.62,0.64,0.80)*(0.45+0.55*n);
  gl_FragColor=vec4(col, a*uOp);
  #include <encodings_fragment>
}`,
    transparent:true, depthWrite:false, side:T.BackSide, fog:false, toneMapped:false});
  const d=new T.Mesh(new T.SphereGeometry(2150, 40, 20, 0, Math.PI*2, 0, Math.PI*0.56), m);
  d.renderOrder=-1; d.frustumCulled=false; d.visible=false; scene.add(d);
  return d;
})();
// the sky behind it, greyed (called by DayNight.paint before it draws)
const _OC={dTop:new T.Color(0x6f777f), dMid:new T.Color(0x8d949a), dLow:new T.Color(0xa3a9ad), dHz:new T.Color(0xb3b7b9),
           sTop:new T.Color(0x3c3a44), sMid:new T.Color(0x5e5459), sLow:new T.Color(0x7d6c69), sHz:new T.Color(0x8a7a74),
           nTop:new T.Color(0x0a0b0e), nMid:new T.Color(0x101115), nLow:new T.Color(0x16161a), nHz:new T.Color(0x1c1b1e),
           flash:new T.Color(0xb8c0dc), fogD:new T.Color(0xb9bdbf), fogN:new T.Color(0x1a1d22)};
const _oc=new T.Color(), _ocF=new T.Color();
function skyWeather(img, day, set, night){
  const W=WEATHER, tot=day+set+night||1, a=day/tot, b=set/tot, c=night/tot;
  const k=Math.min(1, W.cover*0.95), f=W.fog;
  _ocF.copy(_OC.fogD).multiplyScalar(a+b*0.6).add(_oc.copy(_OC.fogN).multiplyScalar(c+b*0.4));
  for(const [key,D,S,N,fk] of [["top","dTop","sTop","nTop",0.55],["mid","dMid","sMid","nMid",0.75],["low","dLow","sLow","nLow",0.9],["hz","dHz","sHz","nHz",0.95]]){
    _oc.setRGB(_OC[D].r*a+_OC[S].r*b+_OC[N].r*c, _OC[D].g*a+_OC[S].g*b+_OC[N].g*c, _OC[D].b*a+_OC[S].b*b+_OC[N].b*c);
    img[key].lerp(_oc, k);
    if(f>0) img[key].lerp(_ocF, f*fk);
    if(W.flash>0) img[key].lerp(_OC.flash, Math.min(0.8, W.flash*0.6));
  }
}

/* ---- rain ---------------------------------------------------------------
   Six thousand streaks in a box round the camera, each pinned to the world
   in x and z (so they do not swim when you turn) and falling in y on the
   GPU from a clock. How many show is how hard it rains. A streak inside a
   roofed volume is thrown away in the fragment shader, so it does not rain
   in the lobby, under the picnic shelter, in the garage, in a trailer or
   in the car you are driving. The roofs are every indoor zone, gathered
   once everything is built (so the buildings that come after this file are
   in it too); the first slot is kept for the car. */
const ROOFS=[], ROOF_N=24;
function _roofs(){
  ROOFS.length=0;
  ROOFS.push([0,0,0,0,-99]);                                     // the car you are in, if you are
  ROOFS.push([-7.4,-15.6,8.1,15.6, 9.5]);                       // the pavilion and its eaves
  for(const q of ZONES) if(q.indoor && !q.ob && ROOFS.length<ROOF_N && !(q.x0>-7.4 && q.x1<8.1 && q.z0>-15.6 && q.z1<15.6))
    ROOFS.push([q.x0-0.3, q.z0-0.3, q.x1+0.3, q.z1+0.3, q.y1+0.5]);
  while(ROOFS.length<ROOF_N) ROOFS.push([0,0,0,0,-99]);
  if(_roofs.mat){ const u=_roofs.mat.uniforms;                  // (RAIN itself is not declared yet the first time)
    for(let i=0;i<ROOF_N;i++){ const r=ROOFS[i]; u.uRoof.value[i].set(r[0],r[1],r[2],r[3]); u.uRoofY.value[i]=r[4]; } }
}
_roofs();
const RAIN=(function(){
  const N=6000, BOX=18, H=20;
  const pos=new Float32Array(N*2*3), sd=new Float32Array(N*2*4);
  for(let i=0;i<N;i++){
    const sx=Math.random()*BOX*2, sz=Math.random()*BOX*2, ph=Math.random(), k=Math.random();
    for(let e=0;e<2;e++){ const o=i*2+e; pos[o*3+1]=e; sd[o*4]=sx; sd[o*4+1]=sz; sd[o*4+2]=ph; sd[o*4+3]=k; }
  }
  const g=new T.BufferGeometry();
  g.setAttribute("position", new T.BufferAttribute(pos,3));
  g.setAttribute("aSeed", new T.BufferAttribute(sd,4));
  const roofV=[], roofY=[];
  for(let i=0;i<ROOF_N;i++){ roofV.push(new T.Vector4()); roofY.push(-99); }
  const m=new T.ShaderMaterial({
    uniforms:T.UniformsUtils.merge([T.UniformsLib.fog, {uCam:{value:new T.Vector3()}, uTime:{value:0}, uAmt:{value:0},
      uWind:{value:new T.Vector2()}, uCol:{value:new T.Color(0xc8d0d8)}, uA:{value:0.35}, uBox:{value:BOX}, uH:{value:H},
      uRoof:{value:roofV}, uRoofY:{value:roofY},
      // and one roof at an angle: the trailer whose doors open (10b), centre and turn, half-sizes and top
      uOB:{value:new T.Vector4(0,0,1,0)}, uOBh:{value:new T.Vector4(0,0,-99,0)}}]),
    vertexShader:`attribute vec4 aSeed; uniform vec3 uCam; uniform float uTime, uAmt, uBox, uH; uniform vec2 uWind;
varying float vE; varying float vOn; varying vec3 vW;
#include <fog_pars_vertex>
void main(){
  float ox=mod(aSeed.x-uCam.x, 2.0*uBox)-uBox, oz=mod(aSeed.y-uCam.z, 2.0*uBox)-uBox;
  float fall=uTime*(8.5+aSeed.w*2.5)+aSeed.z*uH;
  float y=uCam.y+uH*0.62-mod(fall, uH);
  float len=0.70+aSeed.w*0.45;
  vec3 p=vec3(uCam.x+ox, y, uCam.z+oz);
  p.xz+=uWind*(y-uCam.y)*0.10;
  p+=vec3(-uWind.x*0.06, 1.0, -uWind.y*0.06)*len*position.y;
  vE=position.y; vOn=step(aSeed.w, uAmt); vW=p;
  vec4 mvPosition=viewMatrix*vec4(p,1.0);
  gl_Position=projectionMatrix*mvPosition;
  #include <fog_vertex>
}`,
    fragmentShader:`uniform vec3 uCol; uniform float uA; uniform vec4 uRoof[24]; uniform float uRoofY[24]; uniform vec4 uOB, uOBh;
varying float vE; varying float vOn; varying vec3 vW;
#include <fog_pars_fragment>
void main(){
  if(vOn<0.5) discard;
  for(int i=0;i<24;i++){ vec4 r=uRoof[i];
    if(vW.x>r.x && vW.x<r.z && vW.z>r.y && vW.z<r.w && vW.y<uRoofY[i]) discard; }
  vec2 d=vW.xz-uOB.xy;
  if(abs(d.x*uOB.z-d.y*uOB.w)<uOBh.x && abs(d.x*uOB.w+d.y*uOB.z)<uOBh.y && vW.y<uOBh.z) discard;
  gl_FragColor=vec4(uCol, uA*(1.0-vE*0.85));
  #include <fog_fragment>
}`,
    transparent:true, depthWrite:false, fog:true});
  // (merge() copied the uniforms: the material's own copies are the ones to write)
  _roofs.mat=m; _roofs();
  if(typeof WALKIN!=="undefined" && WALKIN.ob){ const o=WALKIN.ob;
    m.uniforms.uOB.value.set(o.cx, o.cz, o.c, o.s); m.uniforms.uOBh.value.set(o.hx, o.hz, WALKIN.top, 0); }
  const L=new T.LineSegments(g, m); L.frustumCulled=false; L.renderOrder=2; L.visible=false; scene.add(L);
  return L;
})();
// splashes where it lands near you: a short-lived soft grain at the surface
const SPLASH=(typeof _cloud==="function") ? _cloud(360, _SOFT_TEX, false) : null;
function _underRoof(x,z,y){
  for(const r of ROOFS) if(x>r[0] && x<r[2] && z>r[1] && z<r[3] && y<r[4]) return true;
  if(WALKIN.ob && y<WALKIN.top && obIn(WALKIN.ob,x,z)) return true;
  return false;
}
function updateSplash(dt, amt, lit){
  const S=SPLASH; if(!S) return;
  S.pts.material.uniforms.scale.value=PUFFS.pts.material.uniforms.scale.value;
  const cam=camera.position, feet=(typeof player!=="undefined" && !droneMode && !driving) ? player.feetY : cam.y-1.6;
  let spawn=amt*dt*420;
  while(spawn>0 && Math.random()<spawn){ spawn-=1;
    const a=Math.random()*Math.PI*2, r=1.2+Math.sqrt(Math.random())*11;
    const x=cam.x+Math.cos(a)*r, z=cam.z+Math.sin(a)*r, y=surfaceY(x,z,feet+1.0);
    if(_underRoof(x,z,y+0.2) || Math.abs(y-feet)>3) continue;
    const i=S.next; S.next=(i+1)%S.N;
    S.pos[i*3]=x; S.pos[i*3+1]=y+0.03; S.pos[i*3+2]=z;
    S.age[i]=0; S.life[i]=0.16+Math.random()*0.12; S.s0[i]=0.02; S.s1[i]=0.10+Math.random()*0.08; S.a0[i]=0.5;
  }
  for(let i=0;i<S.N;i++){
    if(S.life[i]<=0){ S.alpha[i]=0; continue; }
    S.age[i]+=dt; const u=S.age[i]/S.life[i];
    if(u>=1){ S.life[i]=0; S.alpha[i]=0; S.size[i]=0; continue; }
    S.size[i]=S.s0[i]+(S.s1[i]-S.s0[i])*u; S.alpha[i]=S.a0[i]*(1-u);
    S.tint[i*3]=S.tint[i*3+1]=S.tint[i*3+2]=0.55+0.4*lit;
  }
  const a2=S.pts.geometry.attributes;
  a2.position.needsUpdate=true; a2.size.needsUpdate=true; a2.alpha.needsUpdate=true; a2.tint.needsUpdate=true;
}

/* ---- fog banks ------------------------------------------------------------
   Big soft sprites lying low in the open and among the trees, drifting with
   the air, coming and going with the fog. Each is pinned to the world and
   re-seated when you leave it far enough behind. */
const FOGBANKS=[];
(function fogBanks(){
  for(let i=0;i<30;i++){
    const sp=new T.Sprite(new T.SpriteMaterial({map:_SOFT_TEX, color:0xdde2e6, transparent:true, opacity:0,
                                                depthWrite:false, fog:true}));
    sp.renderOrder=1; sp.visible=false; scene.add(sp);
    FOGBANKS.push({s:sp, x:0, z:0, w:40+Math.random()*70, h:9+Math.random()*12, lift:2+Math.random()*5, a:0.5+Math.random()*0.5, seated:false});
  }
})();
function _seatBank(b, cam, near){
  const a=Math.random()*Math.PI*2, r=near ? 30+Math.random()*260 : 230+Math.random()*90;
  b.x=cam.x+Math.cos(a)*r; b.z=cam.z+Math.sin(a)*r; b.seated=true;
}

/* ---- lightning ---------------------------------------------------------- */
const BOLT=(function(){
  const texs=[];
  for(let k=0;k<4;k++){
    const W=256, H=512, c=cvs(W,H), x=c.getContext("2d");
    const branch=(x0,y0,ang,len,w,depth)=>{
      let px=x0, py=y0; const n=Math.max(4, len/14|0);
      x.lineCap="round"; x.lineJoin="round";
      const pts=[[px,py]];
      for(let i=0;i<n;i++){ ang+=(Math.random()-0.5)*0.9; px+=Math.sin(ang)*len/n; py+=Math.cos(ang)*len/n; pts.push([px,py]);
        if(depth<2 && Math.random()<0.14) branch(px,py,ang+(Math.random()<0.5?-1:1)*(0.5+Math.random()*0.6), len*(0.25+Math.random()*0.3), w*0.5, depth+1); }
      for(const [lw,col] of [[w*7,"rgba(150,160,255,0.10)"],[w*3,"rgba(200,210,255,0.35)"],[w,"rgba(255,255,255,1)"]]){
        x.strokeStyle=col; x.lineWidth=lw; x.beginPath(); x.moveTo(pts[0][0],pts[0][1]);
        for(const p of pts) x.lineTo(p[0],p[1]); x.stroke(); }
    };
    branch(W/2+(Math.random()-0.5)*40, 0, (Math.random()-0.5)*0.4, H*0.98, 2.4, 0);
    texs.push(setSRGB(new T.CanvasTexture(c)));
  }
  const sp=new T.Sprite(new T.SpriteMaterial({map:texs[0], transparent:true, opacity:0, depthWrite:false, fog:false,
                                              blending:T.AdditiveBlending, toneMapped:false}));
  sp.center.set(0.5,0); sp.visible=false; sp.renderOrder=1; scene.add(sp);      // after the cloud deck, which it is under
  return {s:sp, texs:texs, life:0};
})();
const _toCam=new T.Vector3(), _camR=new T.Vector3();
function strike(close, test){
  const W=WEATHER, cam=camera.position;
  const d=close ? 220+Math.random()*280 : 600+Math.pow(Math.random(),0.7)*3400;
  const a=Math.random()*Math.PI*2, br=Math.max(0.12, 1/(1+d/1300));
  // two or three pulses, the way a stroke re-strikes down the same channel
  const n=2+((Math.random()*2)|0); let t=0;
  for(let i=0;i<n;i++){ W.pulses.push({t:t, a:br*(i===0?1:0.55+Math.random()*0.45)}); t+=0.06+Math.random()*0.12; }
  if(d<4200 && Math.random()<(close?1:0.55)){
    const B=BOLT, D=Math.min(d, 1900), H=Math.min(1600, 720*D/d)*(0.85+Math.random()*0.3);
    B.s.material.map=B.texs[(Math.random()*B.texs.length)|0];
    B.s.position.set(cam.x+Math.sin(a)*D, Terrain.groundAt(cam.x+Math.sin(a)*D, cam.z+Math.cos(a)*D)-2, cam.z+Math.cos(a)*D);
    B.s.scale.set(H*0.5, H, 1); B.life=t+0.12; B.s.visible=true; B.br=Math.min(1, 0.5+br);
  }
  camera.getWorldDirection(_toCam); _camR.set(-_toCam.z, 0, _toCam.x).normalize();
  const pan=clamp(Math.sin(a)*_camR.x+Math.cos(a)*_camR.z, -0.9, 0.9);
  W.thunders.push({at:W.clock+d/343, d:d, pan:pan});
  if(close && (test || (GRID.phase==="normal" && W.clock-W.lastOut>900 && Math.random()<0.15))){
    W.lastOut=W.clock; setTimeout(()=>GRID.trip(test), 90);
  }
}

/* ---- every frame: before the sky is painted ----------------------------- */
const _deckLo=new T.Color(), _deckHi=new T.Color(), _wc=new T.Color();
function updateWeather(dt, now, dn){
  const W=WEATHER; W.clock+=dt;
  // the scheduler
  W.hold=Math.max(0, W.hold-dt); if(!DayNight.state.paused) W.next-=dt;      // a stopped clock (the tools) keeps the weather it has
  if(W.next<=0 && W.hold<=0) W.set(W.after||_nextWeather(), false);
  if(W.hold<=0) W.fast=0;
  const K=WKINDS[W.kind], sp=W.fast ? 6 : 1;
  const ease=(v,t,r)=>v+clamp(t-v, -r*dt*sp, r*dt*sp);
  W.cover=ease(W.cover, K.cover, 1/45);
  W.rain =ease(W.rain,  W.cover>0.7 ? K.rain : 0, 1/18);
  W.fog  =ease(W.fog,   K.fog, 1/35);
  W.storm=ease(W.storm, K.storm, 1/15);
  W.wet=clamp(W.wet + (W.rain>0.05 ? W.rain*dt/50 : -dt/300), 0, 1);
  // the air in a storm: gusty, and the gusts come together
  if(W.storm>0.05 || W.rain>0.3) Wind.gust=Math.max(Wind.gust, 0.35*W.rain+0.45*W.storm*(0.6+0.4*Math.sin(now*0.4)));
  // lightning
  if(W.storm>0.5){
    W.strikeT-=dt;
    if(W.strikeT<=0){ W.strikeT=(5+Math.random()*16)/W.storm; strike(Math.random()<0.12, false); }
  }
  let fl=0;
  for(let i=W.pulses.length-1;i>=0;i--){
    const p=W.pulses[i]; p.t-=dt;
    if(p.t<=0){ const u=-p.t; fl=Math.max(fl, p.a*Math.exp(-u*14)); if(u>0.4) W.pulses.splice(i,1); }
  }
  W.flash=fl;
  if(BOLT.life>0){ BOLT.life-=dt; BOLT.s.material.opacity=BOLT.life>0 ? Math.min(1, fl*3)*BOLT.br : 0;
    if(BOLT.life<=0) BOLT.s.visible=false; }
  for(let i=W.thunders.length-1;i>=0;i--){
    const th=W.thunders[i];
    if(W.clock>=th.at){ W.thunders.splice(i,1); if(typeof AUDIO!=="undefined" && AUDIO.thunder) AUDIO.thunder(th.d, th.pan); }
  }
  updateGrid(dt);
}
/* ---- every frame: after the loop has set the lights and the haze ------- */
function applyWeather(dt, now, dn, dark){
  const W=WEATHER, cam=camera.position, night=dn.nightAmount;
  // the light: diffused under cloud, flashed by lightning
  key.intensity*=1-0.82*W.cover;
  if(W.cover>0.82) key.castShadow=false;
  hemi.intensity=hemi.intensity*(1-0.18*W.cover)+W.flash*2.2;
  amb.intensity+=W.flash*0.7;
  // the haze: in fog, a hundred metres or so; less in heavy rain
  const near0=scene.fog.near, far0=scene.fog.far;
  const fogFar=lerp(far0, 115+40*(1-night), W.fog), rainFar=lerp(far0, 520, W.rain*(1-W.fog));
  scene.fog.far=Math.min(fogFar, rainFar);
  scene.fog.near=lerp(near0, 3, Math.max(W.fog, W.rain*0.6));
  // the deck
  const dc=W.cover;
  DECK.visible=dc>0.08;
  if(DECK.visible){
    DECK.position.copy(cam);
    const u=DECK.material.uniforms;
    u.uCover.value=dc; u.uOp.value=smoothstep(0.08,0.5,dc);
    u.uOff.value.x+=dt*(0.0016+Wind.gust*0.003); u.uOff.value.y+=dt*0.0007;
    const lum=0.10+0.90*Math.pow(1-dark,1.2);
    _deckLo.setRGB(0.40,0.43,0.47).multiplyScalar(lum);
    _deckHi.setRGB(0.70,0.73,0.76).multiplyScalar(lum);
    if(dn.sunsetAmount>0.05){ _wc.setRGB(0.80,0.55,0.48).multiplyScalar(lum); _deckHi.lerp(_wc, dn.sunsetAmount*0.4); }
    // at night the underside carries a little of the towns' light
    _wc.setRGB(0.10,0.085,0.075); _deckLo.lerp(_wc, night*0.5); _deckHi.lerp(_wc, night*0.6);
    u.uLo.value.copy(_deckLo); u.uHi.value.copy(_deckHi); u.uHz.value.copy(skyImg.hz);
    u.uFlash.value=W.flash*0.9;
  }
  // rain
  RAIN.visible=W.rain>0.01;
  if(RAIN.visible){
    const u=RAIN.material.uniforms;
    if(!_roofs.done){ _roofs.done=true; _roofs(); }               // every building is up by the first rain
    // the car you are driving: its footprint, under its roof
    if(typeof driving!=="undefined" && driving && driving.g){ const g=driving.g, c=Math.abs(Math.cos(g.rotation.y)), sn=Math.abs(Math.sin(g.rotation.y));
      const hx=0.95*c+2.45*sn, hz=0.95*sn+2.45*c, y=g.position.y+1.9;
      u.uRoof.value[0].set(g.position.x-hx, g.position.z-hz, g.position.x+hx, g.position.z+hz); u.uRoofY.value[0]=y; ROOFS[0]=[g.position.x-hx, g.position.z-hz, g.position.x+hx, g.position.z+hz, y]; }
    else if(ROOFS[0][4]>-90){ u.uRoofY.value[0]=-99; ROOFS[0]=[0,0,0,0,-99]; }
    u.uCam.value.copy(cam); u.uTime.value=now; u.uAmt.value=W.rain;
    u.uWind.value.set(0.9+Wind.gust*2.6, 0.5+Wind.gust*1.2);
    const lit=0.12+0.88*Math.pow(1-dark,1.1)+W.flash*0.8;
    u.uCol.value.setRGB(0.78,0.82,0.88).multiplyScalar(Math.min(1.2,lit));
    u.uA.value=0.30+0.30*W.rain;
  }
  updateSplash(dt, W.rain, 1-dark);
  // fog banks
  const fb=W.fog;
  for(const b of FOGBANKS){
    if(fb<0.02){ b.s.visible=false; b.seated=false; continue; }
    if(!b.seated) _seatBank(b, cam, true);
    b.x+=dt*(0.4+Wind.gust*0.9); b.z+=dt*0.2;
    const dx=b.x-cam.x, dz=b.z-cam.z, d=Math.hypot(dx,dz);
    if(d>340) _seatBank(b, cam, false);
    const gy=Terrain.groundAt(b.x, b.z);
    b.s.position.set(b.x, gy+b.lift+b.h*0.25, b.z); b.s.scale.set(b.w, b.h, 1);
    b.s.material.color.copy(scene.fog.color).lerp(WHITE_C, 0.12*(1-night));
    b.s.material.opacity=fb*0.30*b.a*smoothstep(18,60,d);
    b.s.visible=true;
  }
  // the paving darkens and shines as it gets wet
  for(const e of WET_MATS){ e.m.roughness=e.r*(1-0.55*W.wet); e.m.color.copy(e.c).multiplyScalar(1-0.30*W.wet); }
}
// the things that get wet: asphalt, concrete, paving
const WET_MATS=[];
(function wetMats(){
  for(const n of ["asphalt","lotpave","road","walkflat","padflat","concrete","paint"]){
    const b=BUCKETS.get(n);
    if(b && b.mat && b.mat.color) WET_MATS.push({m:b.mat, r:b.mat.roughness, c:b.mat.color.clone()});
  }
})();
