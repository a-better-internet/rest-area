"use strict";
/* REST AREA · 15-bake.js
   materials for the glowing buckets, then plant the woods, merge everything
   and build the collider grid
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   15 · GLOW, THEN BAKE
   ---------------------------------------------------------------------- */
// circ: which of the rest area's circuits it is on ("bldg" or "site"), so a
// power cut can put it out (16b-weather); battery-backed ("always") are on none
function glowMat(opts, kind, circ){
  const m=new T.MeshStandardMaterial(Object.assign({roughness:0.5, metalness:0.0}, opts));
  GLOW.push({m:m, base:m.emissive?m.emissive.clone():new T.Color(0), kind:kind, baseInt:m.emissiveIntensity||1,
             circ:circ!==undefined ? circ : (kind==="always" ? null : "bldg")});
  return m;
}
/* A SURFACE THAT IS A LAMP: near-black diffuse, so the point light a few
   centimetres away cannot add its own light on top of the emissive and
   push the face past white. */
function emitMat(emissive, intensity, kind, circ){
  return glowMat({color:0x241f1a, emissive:emissive, emissiveIntensity:intensity,
                  roughness:0.9, metalness:0.0}, kind, circ);
}
function basicGlowMat(color, kind, blend){
  const m=new T.MeshBasicMaterial({color:color, transparent:true, opacity:0.0, toneMapped:false,
    depthWrite:false, blending:blend||T.NormalBlending});
  GLOW.push({m:m, kind:kind, basic:true, circ:kind==="always"?null:"bldg"});
  return m;
}
bucketOf("glass",  ()=>envOut(new T.MeshStandardMaterial({color:0xffffff, transparent:true, opacity:0.30,
                          roughness:0.05, metalness:0.35, side:T.DoubleSide, depthWrite:false}), 0.8));
// the dark tinted glass of the big gable window: from outside, by day,
// it reads as a dark reflective sheet with the sky in it, not as a hole
bucketOf("tint",   ()=>envOut(new T.MeshStandardMaterial({color:0xffffff, transparent:true, opacity:0.55,
                          roughness:0.04, metalness:0.50, side:T.DoubleSide, depthWrite:false}), 0.9));
bucketOf("mirror", ()=>new T.MeshStandardMaterial({color:0xffffff, metalness:0.62, roughness:0.06,
                          emissive:0x303a40, emissiveIntensity:0.35}));
bucketOf("ceilfix",()=>glowMat({color:0x9c968c, emissive:0xf4f2ea, emissiveIntensity:0.30}, "indoor"));
bucketOf("tube",   ()=>emitMat(0xeef2f0, 0.85, "indoor"));
bucketOf("vendglow",()=>glowMat({color:0xffffff, emissive:0xdfe9ff, emissiveIntensity:0.30}, "indoor"));
bucketOf("cctv", ()=>{
  const c=cvs(256,160), x=c.getContext("2d");
  const view=(ox,oy,draw)=>{ x.save(); x.beginPath(); x.rect(ox,oy,127,79); x.clip(); x.translate(ox,oy); draw(); x.restore(); };
  x.fillStyle="#0d0f10"; x.fillRect(0,0,256,160);
  view(0,0,()=>{ x.fillStyle="#6c7276"; x.fillRect(0,0,128,80); x.fillStyle="#9aa0a2"; x.fillRect(0,50,128,30);
    for(let i=0;i<6;i++){ x.fillStyle=["#3a3c40","#7a7e82","#2c2e30"][i%3]; x.fillRect(8+i*20,40,15,9); } });           // the lot
  view(128,0,()=>{ x.fillStyle="#8a6a58"; x.fillRect(0,0,128,80); x.fillStyle="#b5654a"; x.fillRect(0,45,128,35);
    x.fillStyle="#2a2a2c"; x.fillRect(90,20,16,40); x.fillRect(18,26,30,30); });                                         // the lobby
  view(0,80,()=>{ x.fillStyle="#7f8486"; x.fillRect(0,0,128,80); x.fillStyle="#5a5e60"; x.fillRect(0,30,128,14);
    x.fillStyle="#d8d8d4"; x.fillRect(30,28,26,10); });                                                                 // the ramp
  view(128,80,()=>{ x.fillStyle="#5d6a5a"; x.fillRect(0,0,128,80); x.fillStyle="#8a8e88"; x.fillRect(30,30,60,40); }); // the sub
  x.fillStyle="#e8e8e0"; x.font="9px monospace"; ["CAM 1 LOT","CAM 2 LOBBY","CAM 3 RAMP","CAM 4 SUBSTA"].forEach((s,i)=>x.fillText(s,4+(i%2)*128,11+((i/2)|0)*80));
  x.fillStyle="#0d0f10"; x.fillRect(127,0,2,160); x.fillRect(0,79,256,2);
  const tex=setSRGB(new T.CanvasTexture(c));
  return glowMat({color:0x111111, emissive:0xffffff, emissiveMap:tex, emissiveIntensity:0.55}, "indoor");
});
bucketOf("winglow",()=>glowMat({color:0xffffff, emissive:0xffe6b8, emissiveIntensity:0.18}, "warm"));
bucketOf("exitsign",()=>emitMat(0xff2a1a, 0.9, "always"));
bucketOf("ledgreen",()=>emitMat(0x3cff6a, 0.9, "always"));
bucketOf("ledamber",()=>emitMat(0xffaa22, 0.9, "always"));

// the woods are planted; now they become meshes, and their trunks colliders
FOREST.finish();
const BAKED=bakeBuckets(scene);
buildColGrid();                     // everything solid is in place by now
if(typeof _igBuild==="function") _igBuild();   // the building's floor grid for the people inside (14b), now, not at the first visitor
if(typeof _ogBuild==="function") _ogBuild();   // and the custodian's grid over the lawns and the yard (14h)
