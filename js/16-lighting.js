"use strict";
/* REST AREA · 16-lighting.js
   the pool of twelve real lights that follows the camera
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   16 · NIGHT LIGHTING — twelve point lights moved every frame onto the
   twelve registered lamps nearest the camera; everything else glows.
   ---------------------------------------------------------------------- */
const LIGHT_POOL=[];
for(let i=0;i<12;i++){
  const L=new T.PointLight(0xffe9c4, 0, 10, 1.4); L.castShadow=false;
  scene.add(L); LIGHT_POOL.push(L);
}
const _lampSort=[];
// one tube in the men's room has a bad ballast, as one always does
const FLICKER={v:1, t:0};
function tickFlicker(dt){
  FLICKER.t+=dt;
  const n=Math.sin(FLICKER.t*37.1)*Math.sin(FLICKER.t*11.3)*Math.sin(FLICKER.t*2.7);
  FLICKER.v = n>0.34 ? 0.18+Math.random()*0.25 : (n>0.18 ? 0.72 : 1.0);
}
function updateLights(dark, camPos){
  _lampSort.length=0;
  for(const l of LAMPS){
    // a lamp with a volume is behind a wall unless you are inside that volume
    if(l.vol && !(camPos.x>l.vol[0] && camPos.x<l.vol[1] &&
                  camPos.z>l.vol[2] && camPos.z<l.vol[3] &&
                  camPos.y>l.vol[4] && camPos.y<l.vol[5])) continue;
    const d2=(l.x-camPos.x)*(l.x-camPos.x)+(l.y-camPos.y)*(l.y-camPos.y)+(l.z-camPos.z)*(l.z-camPos.z);
    if(d2 < 52*52) _lampSort.push({l:l, d2:d2*(l.indoor?0.5:1)});
  }
  _lampSort.sort((a,b)=>a.d2-b.d2);
  for(let i=0;i<LIGHT_POOL.length;i++){
    const L=LIGHT_POOL[i], e=_lampSort[i];
    // indoors the tubes are on all day; the lot lights only after dusk
    const mult=e ? (e.l.indoor ? Math.max(dark,0.80) : dark) : 0;
    if(!e || mult<0.02){ L.intensity=0; continue; }
    L.position.set(e.l.x, e.l.y, e.l.z);
    L.color.setHex(e.l.color);
    L.distance=e.l.dist;
    L.decay=e.l.decay||1.5;
    L.intensity=e.l.intensity*mult;
    L.userData.mothy=!!e.l.mothy;
    if(e.l.flicker) L.intensity *= FLICKER.v;
  }
}
