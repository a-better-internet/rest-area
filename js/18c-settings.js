"use strict";
/* REST AREA · 18c-settings.js
   the graphics menu (G): resolution, a frame-rate cap, shadows, draw
   distance, how many real lights; a frame meter
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. The settings themselves (GFX) are read in
   03-scene, before the renderer is made. */
/* ----------------------------------------------------------------------
   18c · GRAPHICS SETTINGS
   ---------------------------------------------------------------------- */

/* --- the baked tiles past the draw distance are not drawn ----------------
   Four times a second is plenty: the haze has already closed over a tile by
   the time it goes. The back woods' tiles also answer to updateDeep. */
let _cullT=1e9;
function cullBaked(cam, dt, force){
  _cullT+=dt||0;
  if(!force && _cullT<0.25) return;
  _cullT=0;
  const lim=DRAW_LEVELS[GFX.draw].cull;
  for(const m of BAKED){
    const g=m.geometry;
    if(!g.boundingSphere) g.computeBoundingSphere();
    const bs=g.boundingSphere;
    const d=Math.hypot(bs.center.x-cam.x, bs.center.y-cam.y, bs.center.z-cam.z)-bs.radius;
    m.visible = d<lim && (!m.userData.deep || _deepShown);
  }
}

const GFX_PRESETS=[
  {name:"LOW",    res:0.75, shadows:0, draw:0, lights:4},
  {name:"MEDIUM", res:1,    shadows:1, draw:1, lights:8},
  {name:"HIGH",   res:0,    shadows:3, draw:2, lights:12},
  {name:"ULTRA",  res:0,    shadows:4, draw:3, lights:16}];
const _RES=[0.5, 0.75, 1, 1.5, 2, 0];
const _FPS=[30, 60, 0];
const _LIGHTS=[4, 6, 8, 12, 16, 24];
function _resName(r){
  const nat=Math.min(devicePixelRatio||1, 2);
  return r===0 ? "NATIVE · "+(+nat.toFixed(2))+"×" : (r+"×");
}
function _presetIndex(){
  for(let i=0;i<GFX_PRESETS.length;i++){
    const p=GFX_PRESETS[i];
    if(p.res===GFX.res && p.shadows===GFX.shadows && p.draw===GFX.draw && p.lights===GFX.lights) return i;
  }
  return -1;
}
// each row: what it is called, its choices, how to show one, a word on what it costs
const GFX_ROWS=[
  {k:"preset", label:"PRESET",
   get:()=>_presetIndex(), n:()=>GFX_PRESETS.length,
   show:i=>i<0 ? "CUSTOM" : GFX_PRESETS[i].name,
   set:i=>{ const p=GFX_PRESETS[i]; GFX.res=p.res; GFX.shadows=p.shadows; GFX.draw=p.draw; GFX.lights=p.lights; },
   note:()=>"Sets everything below at once. The frame cap is left as it is."},
  {k:"res", label:"RESOLUTION",
   get:()=>Math.max(0,_RES.indexOf(GFX.res)), n:()=>_RES.length,
   show:i=>_resName(_RES[i]),
   set:i=>{ GFX.res=_RES[i]; },
   note:()=>{ const pr=gfxPixelRatio(), w=Math.round(innerWidth*pr), h=Math.round(innerHeight*pr);
     return "Pixels drawn per screen point: "+w+"×"+h+" now. On a Retina Mac 1× draws a quarter of the pixels that 2× does, and is the single biggest saving."; }},
  {k:"fps", label:"FRAME-RATE CAP",
   get:()=>Math.max(0,_FPS.indexOf(GFX.fps)), n:()=>_FPS.length,
   show:i=>_FPS[i] ? _FPS[i]+" FPS" : "OFF",
   set:i=>{ GFX.fps=_FPS[i]; },
   note:()=>"A 120 Hz screen draws twice as many frames with the cap off. 60 is smooth; 30 halves the work again."},
  {k:"shadows", label:"SHADOWS",
   get:()=>GFX.shadows, n:()=>SHADOW_LEVELS.length,
   show:i=>i===0 ? "OFF" : SHADOW_LEVELS[i].name,
   set:i=>{ GFX.shadows=i; },
   note:()=>{ const L=SHADOW_LEVELS[GFX.shadows];
     return L ? "The sun's shadow map: "+L.map+"×"+L.map+" over "+(L.half*2)+" m around you"+(L.soft?", soft-edged.":", hard-edged.")
              : "No shadow map at all: the scene is drawn once a frame instead of twice."; }},
  {k:"draw", label:"DRAW DISTANCE",
   get:()=>GFX.draw, n:()=>DRAW_LEVELS.length,
   show:i=>DRAW_LEVELS[i].name,
   set:i=>{ GFX.draw=i; },
   note:()=>{ const D=DRAW_LEVELS[GFX.draw];
     return "Full trees to "+D.tree+" m"+(D.cull<1e8 ? ", nothing past "+D.cull+" m (the haze closes in to hide the edge)." : ", the whole valley to the horizon."); }},
  {k:"lights", label:"LIGHTS",
   get:()=>Math.max(0,_LIGHTS.indexOf(GFX.lights)), n:()=>_LIGHTS.length,
   show:i=>_LIGHTS[i]+" AT ONCE",
   set:i=>{ GFX.lights=_LIGHTS[i]; },
   note:()=>"Real lights on the nearest lamps; the rest only glow. Every lit pixel pays for each one, lit or not."},
  {k:"meter", label:"FRAME METER",
   get:()=>GFX.meter?1:0, n:()=>2,
   show:i=>i ? "ON" : "OFF",
   set:i=>{ GFX.meter=!!i; },
   note:()=>"Frames per second in the corner of the screen."}];

const GFXMENU=window.GFXMENU={open:false, sel:0};
const _gfxEl=(function(){
  const d=document.createElement("div"); d.id="gfx";
  d.innerHTML='<div class="hd"><span class="t">GRAPHICS</span><span class="now"></span></div>'+
    '<div class="rows"></div><div class="note"></div>'+
    '<div class="ft"><span><b>↑↓</b> choose · <b>←→</b> change</span><button class="done">DONE · G</button></div>';
  document.body.appendChild(d);
  d.querySelector(".done").addEventListener("click", ()=>GFXMENU.close());
  // the mouse works too: a row's arrows, or the row itself to choose it
  d.querySelector(".rows").addEventListener("click", e=>{
    const r=e.target.closest(".row"); if(!r) return;
    GFXMENU.sel=+r.dataset.i;
    if(e.target.classList.contains("l")) _gfxStep(-1);
    else if(e.target.classList.contains("r")) _gfxStep(1);
    _gfxDraw();
  });
  return d;
})();
const _fpsEl=(function(){ const d=document.createElement("div"); d.id="fps"; document.body.appendChild(d); return d; })();
function _gfxDraw(){
  let h="";
  GFX_ROWS.forEach((r,i)=>{
    h+='<div class="row'+(i===GFXMENU.sel?' on':'')+'" data-i="'+i+'"><span class="k">'+r.label+'</span>'+
       '<span class="v"><span class="l">◀</span><span class="c">'+r.show(r.get())+'</span><span class="r">▶</span></span></div>';
  });
  _gfxEl.querySelector(".rows").innerHTML=h;
  _gfxEl.querySelector(".note").textContent=GFX_ROWS[GFXMENU.sel].note();
}
function _gfxStep(d){
  const r=GFX_ROWS[GFXMENU.sel], n=r.n();
  let i=r.get();
  i = i<0 ? (d>0?0:n-1) : (i+d+n)%n;
  r.set(i);
  applyGraphics();
}
GFXMENU.toggle=()=>GFXMENU.open ? GFXMENU.close() : GFXMENU.show();
GFXMENU.show=function(){
  GFXMENU.open=true;
  for(const k in keys) keys[k]=false;                       // stop walking
  if(document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
  _gfxEl.classList.add("show"); _gfxDraw();
};
GFXMENU.close=function(){ GFXMENU.open=false; _gfxEl.classList.remove("show"); };
GFXMENU.key=function(e){
  const c=e.code;
  if(c==="Escape"||c==="KeyG"||c==="Enter"||c==="Tab"||c==="Backspace"){ GFXMENU.close(); return; }
  if(c==="ArrowDown"||c==="KeyS") GFXMENU.sel=(GFXMENU.sel+1)%GFX_ROWS.length;
  else if(c==="ArrowUp"||c==="KeyW") GFXMENU.sel=(GFXMENU.sel+GFX_ROWS.length-1)%GFX_ROWS.length;
  else if(c==="ArrowRight"||c==="KeyD") _gfxStep(1);
  else if(c==="ArrowLeft"||c==="KeyA") _gfxStep(-1);
  else return;
  _gfxDraw();
};

/* --- putting a setting into effect --------------------------------------
   Resolution and the light count act at once. Shadows switched on or off,
   or between hard and soft, change every shader, so they are all rebuilt
   once: a short hitch, then nothing. */
let _gfxApplied={res:null, shadows:null, lights:null};
function _rebuildMaterials(){
  scene.traverse(o=>{
    if(!o.material) return;
    for(const m of (Array.isArray(o.material)?o.material:[o.material])) m.needsUpdate=true;
  });
}
function applyGraphics(){
  const A=_gfxApplied;
  if(A.res!==GFX.res){ renderer.setPixelRatio(gfxPixelRatio()); renderer.setSize(innerWidth, innerHeight); A.res=GFX.res; }
  if(A.shadows!==GFX.shadows){
    const was=A.shadows===null ? null : SHADOW_LEVELS[A.shadows], now=SHADOW_LEVELS[GFX.shadows];
    renderer.shadowMap.enabled=!!now;
    if(now){ setShadowLevel(GFX.shadows); renderer.shadowMap.type=now.soft ? T.PCFSoftShadowMap : T.PCFShadowMap; }
    else key.castShadow=false;
    if(A.shadows!==null && (!was!==!now || (was && now && was.soft!==now.soft))) _rebuildMaterials();
    A.shadows=GFX.shadows;
  }
  if(A.lights!==GFX.lights){ setLightCount(GFX.lights); A.lights=GFX.lights; }
  _fpsEl.style.display=GFX.meter ? "block" : "none";
  cullBaked(camera.position, 0, true);
  try{ localStorage.setItem("restarea.gfx", JSON.stringify({res:GFX.res, fps:GFX.fps, shadows:GFX.shadows,
         draw:GFX.draw, lights:GFX.lights, meter:GFX.meter})); }catch(e){}
}
// what the renderer was built with is already in effect
_gfxApplied={res:GFX.res, shadows:GFX.shadows, lights:GFX.lights};
_fpsEl.style.display=GFX.meter ? "block" : "none";

/* --- the meter: frames actually drawn, over half a second ---------------- */
const _meter={n:0, t0:performance.now(), fps:0, ms:0};
function updateSettings(dt){
  const M=_meter, t=performance.now();
  M.n++;
  if(t-M.t0>=500){
    M.fps=M.n*1000/(t-M.t0); M.ms=(t-M.t0)/M.n; M.n=0; M.t0=t;
    const I=renderer.info.render;
    const line=M.fps.toFixed(0)+" FPS · "+M.ms.toFixed(1)+" ms";
    if(GFX.meter) _fpsEl.textContent=line+" · "+I.calls+" draws";
    if(GFXMENU.open){
      const pr=gfxPixelRatio();
      _gfxEl.querySelector(".now").textContent=line+" · "+Math.round(innerWidth*pr)+"×"+Math.round(innerHeight*pr)+" · "+I.calls+" draw calls";
    }
  }
}
