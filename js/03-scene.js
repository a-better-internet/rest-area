"use strict";
/* REST AREA · 03-scene.js
   renderer, scene, cameras, base lights, flashlight, the sun's shadow camera
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   3 · RENDERER / SCENE / CAMERAS
   ---------------------------------------------------------------------- */
const app=document.getElementById("app");
/* --- graphics settings ----------------------------------------------------
   Read here, before anything is built, so the renderer starts at the chosen
   resolution and shadow size; the menu that changes them is 18c-settings.
   res 0 is "native": the screen's own pixel density, up to 2x. */
const GFX=(function(){
  const D={res:0, fps:60, shadows:3, draw:2, lights:12, meter:false};
  let s=null;
  try{ s=JSON.parse(localStorage.getItem("restarea.gfx")||"null"); }catch(e){}
  const o=Object.assign({}, D, (s && typeof s==="object") ? s : {});
  for(const k in D) if(typeof o[k]!==typeof D[k]) o[k]=D[k];
  return o;
})();
// shadow levels: 0 is none at all; the map covers a square the player stands
// in the middle of, and a smaller map is spread over a smaller square
const SHADOW_LEVELS=[null,
  {name:"LOW",    map:1024, half:38, soft:false},
  {name:"MEDIUM", map:2048, half:48, soft:true},
  {name:"HIGH",   map:3072, half:54, soft:true},
  {name:"ULTRA",  map:4096, half:58, soft:true}];
// draw distance: how far the near trees reach, how far anything is drawn,
// and where the haze closes in so nothing is seen to vanish
const DRAW_LEVELS=[
  {name:"NEAR",   tree:54,  small:26, cull:620,  fog:600},
  {name:"MEDIUM", tree:70,  small:34, cull:1150, fog:1120},
  {name:"FAR",    tree:84,  small:40, cull:1e9,  fog:1e9},
  {name:"MAX",    tree:120, small:56, cull:1e9,  fog:1e9}];
function gfxPixelRatio(){ return GFX.res>0 ? GFX.res : Math.min(devicePixelRatio||1, 2); }
GFX.shadows=Math.max(0, Math.min(SHADOW_LEVELS.length-1, GFX.shadows|0));
GFX.draw=Math.max(0, Math.min(DRAW_LEVELS.length-1, GFX.draw|0));
const renderer=new T.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(gfxPixelRatio());
renderer.shadowMap.enabled=GFX.shadows>0;
renderer.shadowMap.type=(SHADOW_LEVELS[GFX.shadows]||SHADOW_LEVELS[3]).soft ? T.PCFSoftShadowMap : T.PCFShadowMap;
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
/* GROUND MIST, IN THE FOG ITSELF. Every lit surface already mixes in the
   haze by its distance; it now also mixes in a mist whose density is
   thickest at the ground and thins out over a metre or two above it,
   integrated along the line of sight. So it has no edges anywhere: the
   grass at your feet is clear, the far side of the lawn goes milky, posts
   and trunks fade into it at the bottom, and the crowns stand up out of
   it. Thinner and thicker in slow-drifting patches. Past a hundred
   metres or so it is held back from closing in completely, so the
   far side of the lake is softened by it, not whited out. 14c says how much
   there is; the two shared vec4s are plain objects, so every material's
   copy of the uniform is the same one.
     MIST_U: density per metre at the ground, the thinning height, the
             ground level, the drift clock
     MIST_C: its colour, and 0 to switch it off                          */
const MIST_U={x:0, y:1.7, z:0, w:0}, MIST_C={x:0.86, y:0.88, z:0.90, w:0};
/* AERIAL PERSPECTIVE. The haze a hill a kilometre off sits in is not the
   pale sky at the horizon but bluer and darker than it: hills go blue-grey
   with distance and lighten towards the sky only at the very end. So the
   colour the fog mixes in is the horizon's times a tint, HAZE_U.rgb at the
   middle distances easing to HAZE_F at the far end of the fog; w says how
   much of that tint there is (19-loop: less of it in weather fog and at
   night, when the haze is the weather's grey or the night's dark). */
const HAZE_U={x:0.64, y:0.72, z:0.86, w:1};
for(const k in T.ShaderLib){ const u=T.ShaderLib[k].uniforms; if(u && u.fogColor){ u.uMist={value:MIST_U}; u.uMistC={value:MIST_C}; u.uHaze={value:HAZE_U}; } }
T.UniformsLib.fog.uMist={value:MIST_U}; T.UniformsLib.fog.uMistC={value:MIST_C}; T.UniformsLib.fog.uHaze={value:HAZE_U};
T.ShaderChunk.fog_pars_vertex += "\n#ifdef USE_FOG\n\tvarying vec3 vFogWorld;\n#endif";
T.ShaderChunk.fog_vertex += "\n#ifdef USE_FOG\n\t{ mat3 vr=mat3(viewMatrix); vec3 v=mvPosition.xyz;"+
  " vFogWorld=cameraPosition+vec3(dot(vr[0],v),dot(vr[1],v),dot(vr[2],v)); }\n#endif";
T.ShaderChunk.fog_pars_fragment += "\n#ifdef USE_FOG\n\tvarying vec3 vFogWorld;\n\tuniform vec4 uMist;\n\tuniform vec4 uMistC;\n\tuniform vec4 uHaze;\n#endif";
T.ShaderChunk.fog_fragment = [
  "#ifdef USE_FOG",
  "if(uMistC.w>0.001){",
  "  float mH=uMist.y, h0=max(cameraPosition.y-uMist.z,0.0), h1=max(vFogWorld.y-uMist.z,0.0);",
  "  float ea=exp(-h0/mH), eb=exp(-h1/mH), dy=h1-h0;",
  "  float avg=abs(dy)>0.02 ? mH*(ea-eb)/dy : ea;",
  "  vec2 q=vFogWorld.xz*0.019+vec2(uMist.w*0.011, uMist.w*0.006);",
  "  vec2 qi=floor(q), qf=fract(q); qf=qf*qf*(3.0-2.0*qf);",
  "  float n00=fract(sin(dot(qi,vec2(127.1,311.7)))*43758.5453), n10=fract(sin(dot(qi+vec2(1.0,0.0),vec2(127.1,311.7)))*43758.5453);",
  "  float n01=fract(sin(dot(qi+vec2(0.0,1.0),vec2(127.1,311.7)))*43758.5453), n11=fract(sin(dot(qi+vec2(1.0,1.0),vec2(127.1,311.7)))*43758.5453);",
  "  float nn=mix(mix(n00,n10,qf.x),mix(n01,n11,qf.x),qf.y);",
  "  float md=distance(vFogWorld,cameraPosition);",
  "  float mf=1.0-exp(-uMist.x*avg*md*(0.45+1.1*nn));",
  // (a long way off it never closes in completely: across a field or the lake the far side shows through
  // it, softened, where it would otherwise go one flat white band; in a wood no sight line is that long)
  "  mf=min(mf, mix(1.0, 0.42, smoothstep(100.0, 520.0, md)));",
  "  gl_FragColor.rgb=mix(gl_FragColor.rgb, uMistC.rgb, mf*uMistC.w);",
  "}",
  "#endif",
  T.ShaderChunk.fog_fragment.replace("gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );",
    // (on a clear day a long way off is never all haze: the far hills keep a fifth of their own light and shade,
    // which is what tells a ridge from a flat cut-out; but the world's last couple of hundred metres go wholly into
    // it, so its edge is never seen)
    "float edgeK = smoothstep(2270.0, 2395.0, max(abs(vFogWorld.x+30.0), abs(vFogWorld.z+20.0)));\n"+
    "fogFactor = min(fogFactor, mix(1.0-0.34*uHaze.w, 1.0, edgeK));\n"+
    // (and a long way off the haze is a blue-grey a shade under the sky's, the colour far ridges are, easing to the
    // sky's own only at the world's very edge)
    "vec3 hazeC = fogColor*mix(vec3(1.0), mix(uHaze.rgb, vec3(0.74,0.81,0.93), fogFactor*fogFactor), uHaze.w*(1.0-edgeK));\n"+
    "\tgl_FragColor.rgb = mix( gl_FragColor.rgb, hazeC, fogFactor );")].join("\n");
if(T.ShaderChunk.fog_fragment.indexOf("hazeC")<0) console.warn("fog: the haze tint did not take");
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
key.position.set(70,110,50); key.castShadow=GFX.shadows>0;
const ksc=key.shadow.camera;
const KEY_D=120;
let SHADOW_SNAP=0.07;
// the map's size and the square it covers, from the settings; the frustum
// still follows the player in whole texels, so the step is recomputed too
function setShadowLevel(lv){
  const L=SHADOW_LEVELS[lv]||SHADOW_LEVELS[3];
  key.shadow.mapSize.set(L.map, L.map);
  if(key.shadow.map){ key.shadow.map.dispose(); key.shadow.map=null; }
  ksc.left=-L.half; ksc.right=L.half; ksc.top=L.half; ksc.bottom=-L.half;
  ksc.updateProjectionMatrix();
  SHADOW_SNAP=(ksc.right-ksc.left)/L.map*2;
}
ksc.near=KEY_D-110; ksc.far=KEY_D+110;
setShadowLevel(GFX.shadows);
/* AND THEN TELL IT. An OrthographicCamera builds its projection once; change
   its bounds without this and the world is shadowed through the stock 10 m
   box (setShadowLevel does). */
key.shadow.bias=-0.00005; key.shadow.normalBias=0.014;
scene.add(key); scene.add(key.target);
