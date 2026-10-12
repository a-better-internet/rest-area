"use strict";
/* REST AREA · 03-scene.js
   renderer, scene, cameras, base lights, flashlight, the sun's shadow camera
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   3 · RENDERER / SCENE / CAMERAS
   ---------------------------------------------------------------------- */
const app=document.getElementById("app");
const renderer=new T.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;
try{ renderer.outputColorSpace=T.SRGBColorSpace; }catch(e){ renderer.outputEncoding=T.sRGBEncoding; }
/* A SHOULDER, NOT A CURVE. Below 0.76 the output is the input to the last
   bit, so every painted hex arrives as painted; above it each channel rolls
   off towards 1.0 without reaching it, so a white picnic pad in full sun
   keeps its edges and a sodium lamp keeps its colour. Per channel, so a
   warm highlight stays warm. */
T.ShaderChunk.tonemapping_pars_fragment =
  T.ShaderChunk.tonemapping_pars_fragment.replace(
    "vec3 CustomToneMapping( vec3 color ) { return color; }",
    [ "vec3 CustomToneMapping( vec3 color ) {",
      "  color *= toneMappingExposure;",
      "  const float K = 0.76;",
      "  vec3 lo = min( color, vec3( K ) );",
      "  vec3 hi = max( color - vec3( K ), vec3( 0.0 ) );",
      "  return lo + ( 1.0 - K ) * ( vec3( 1.0 ) - exp( -hi / ( 1.0 - K ) ) );",
      "}" ].join("\n"));
renderer.toneMapping=T.CustomToneMapping;
renderer.toneMappingExposure=1.0;
app.appendChild(renderer.domElement);
const MAXANISO=Math.min(8, renderer.capabilities.getMaxAnisotropy());
for(const k in TEX){ if(TEX[k] && TEX[k].isTexture) TEX[k].anisotropy=MAXANISO; }

const scene=new T.Scene();
/* A field of view that does not stretch: about 88 degrees across on any
   screen, held between 50 and 66 vertically; the wheel only offsets it. */
const FOV_ACROSS=88, FOV_MIN=50, FOV_MAX=66;
function baseFov(aspect){
  const h=FOV_ACROSS*Math.PI/180;
  const v=2*Math.atan(Math.tan(h/2)/Math.max(aspect,0.2))*180/Math.PI;
  return Math.max(FOV_MIN, Math.min(FOV_MAX, v));
}
let fovZoom=0;
// near 0.24: depth precision is set by the near plane, and the player can
// never be closer than the collision radius to anything anyway
const camera=new T.PerspectiveCamera(baseFov(innerWidth/innerHeight), innerWidth/innerHeight, 0.24, 4200);
const ortho=new T.OrthographicCamera(-60,60,45,-45,0.1,700);
let view="fp", fov=camera.fov;
function applyFov(){
  fov=Math.max(30, Math.min(72, baseFov(camera.aspect)+fovZoom));
  camera.fov=fov; camera.updateProjectionMatrix();
}

/* --- Layer 1 · base fill: a humid sky and green bounce ------------------ */
const hemi=new T.HemisphereLight(0xdfe8f0, 0x3f4a2c, 0.72); scene.add(hemi);
const amb =new T.AmbientLight(0xf2f2ea, 0.12); scene.add(amb);

/* --- the flashlight: one spot moved onto the camera every frame ---------- */
const torch=new T.SpotLight(0xfff0d0, 0.0, 34, 0.40, 0.55, 1.35);
torch.castShadow=false;
const torchTarget=new T.Object3D();
scene.add(torch); scene.add(torchTarget);
torch.target=torchTarget;
const torchSpill=new T.PointLight(0xffe9c0, 0.0, 6.0, 1.7);
scene.add(torchSpill);
let torchOn=false, torchLvl=0;
const _torchDir=new T.Vector3();

/* --- Layer 2 · the one shadow-casting key (sun, becomes moon at night) --
   The frustum follows the player in whole texels, and the light stands
   KEY_D out along the sun from a target at the player, so the depth map
   spans ±100 m and the bias can be tiny. 108 m across rather than the
   motel's 92: a treeline thirty metres off has to throw its shade onto the
   lawn you are standing on, and 3072 texels still make it 3.5 cm each. */
const key=new T.DirectionalLight(0xfff3df, 1.10);
key.position.set(70,110,50); key.castShadow=true;
key.shadow.mapSize.set(3072,3072);
const ksc=key.shadow.camera;
const KEY_D=120;
ksc.near=KEY_D-110; ksc.far=KEY_D+110; ksc.left=-54; ksc.right=54; ksc.top=54; ksc.bottom=-54;
/* AND THEN TELL IT. An OrthographicCamera builds its projection once; change
   its bounds without this and the world is shadowed through the stock 10 m
   box. */
ksc.updateProjectionMatrix();
key.shadow.bias=-0.00005; key.shadow.normalBias=0.014;
const SHADOW_SNAP=(ksc.right-ksc.left)/key.shadow.mapSize.x*2;
scene.add(key); scene.add(key.target);
