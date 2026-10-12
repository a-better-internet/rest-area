"use strict";
/* REST AREA · 15-bake.js
   materials for the glowing buckets, then plant the woods, merge everything
   and build the collider grid
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   15 · GLOW, THEN BAKE
   ---------------------------------------------------------------------- */
function glowMat(opts, kind){
  const m=new T.MeshStandardMaterial(Object.assign({roughness:0.5, metalness:0.0}, opts));
  GLOW.push({m:m, base:m.emissive?m.emissive.clone():new T.Color(0), kind:kind, baseInt:m.emissiveIntensity||1});
  return m;
}
/* A SURFACE THAT IS A LAMP: near-black diffuse, so the point light a few
   centimetres away cannot add its own light on top of the emissive and
   push the face past white. */
function emitMat(emissive, intensity, kind){
  return glowMat({color:0x241f1a, emissive:emissive, emissiveIntensity:intensity,
                  roughness:0.9, metalness:0.0}, kind);
}
function basicGlowMat(color, kind, blend){
  const m=new T.MeshBasicMaterial({color:color, transparent:true, opacity:0.0, toneMapped:false,
    depthWrite:false, blending:blend||T.NormalBlending});
  GLOW.push({m:m, kind:kind, basic:true});
  return m;
}
bucketOf("glass",  ()=>new T.MeshStandardMaterial({color:0xffffff, transparent:true, opacity:0.30,
                          roughness:0.05, metalness:0.35, side:T.DoubleSide, depthWrite:false}));
// the dark tinted glass of the big gable window: from outside, by day,
// it reads as a dark reflective sheet with the sky in it, not as a hole
bucketOf("tint",   ()=>new T.MeshStandardMaterial({color:0xffffff, transparent:true, opacity:0.62,
                          roughness:0.05, metalness:0.55, side:T.DoubleSide, depthWrite:false}));
bucketOf("mirror", ()=>new T.MeshStandardMaterial({color:0xffffff, metalness:0.62, roughness:0.06,
                          emissive:0x303a40, emissiveIntensity:0.35}));
bucketOf("ceilfix",()=>glowMat({color:0x9c968c, emissive:0xf4f2ea, emissiveIntensity:0.30}, "indoor"));
bucketOf("tube",   ()=>emitMat(0xeef2f0, 0.85, "indoor"));
bucketOf("vendglow",()=>glowMat({color:0xffffff, emissive:0xdfe9ff, emissiveIntensity:0.30}, "indoor"));
bucketOf("winglow",()=>glowMat({color:0xffffff, emissive:0xffe6b8, emissiveIntensity:0.18}, "warm"));
bucketOf("exitsign",()=>emitMat(0xff2a1a, 0.9, "always"));
bucketOf("ledgreen",()=>emitMat(0x3cff6a, 0.9, "always"));
bucketOf("ledamber",()=>emitMat(0xffaa22, 0.9, "always"));

// the woods are planted; now they become meshes, and their trunks colliders
FOREST.finish();
const BAKED=bakeBuckets(scene);
buildColGrid();                     // everything solid is in place by now
