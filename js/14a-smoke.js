"use strict";
/* REST AREA · 14a-smoke.js
   smoke and sparks: every wisp in the world in one cloud of soft points,
   every spark in another, each a single draw
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14a · SMOKE AND SPARKS
   A puff is a point sprite whose size (in metres), alpha and tint are
   attributes, so a cigarette's thread of smoke and a campfire's column
   share one buffer and one draw. Puffs rise and slow, spread, lean with
   the wind and thin out; their colour follows the daylight, and those
   born in a fire carry its glow for the first part of their lives. Sparks
   are the same thing added rather than blended: small, bright, flung up,
   and gone in a second or two.
   ---------------------------------------------------------------------- */
const _SOFT_TEX=(function(){
  const c=cvs(64,64), x=c.getContext("2d"), g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,"rgba(255,255,255,0.85)"); g.addColorStop(0.45,"rgba(255,255,255,0.45)");
  g.addColorStop(1,"rgba(255,255,255,0)");
  x.fillStyle=g; x.fillRect(0,0,64,64);
  return new T.CanvasTexture(c);
})();
function _cloud(N, tex, additive){
  const g=new T.BufferGeometry();
  const A={pos:new Float32Array(N*3), size:new Float32Array(N), alpha:new Float32Array(N), tint:new Float32Array(N*3)};
  g.setAttribute("position", new T.BufferAttribute(A.pos,3).setUsage(T.DynamicDrawUsage));
  g.setAttribute("size",     new T.BufferAttribute(A.size,1).setUsage(T.DynamicDrawUsage));
  g.setAttribute("alpha",    new T.BufferAttribute(A.alpha,1).setUsage(T.DynamicDrawUsage));
  g.setAttribute("tint",     new T.BufferAttribute(A.tint,3).setUsage(T.DynamicDrawUsage));
  const mat=new T.ShaderMaterial({
    uniforms:T.UniformsUtils.merge([T.UniformsLib.fog, {map:{value:tex}, scale:{value:400}}]),
    vertexShader:
`attribute float size; attribute float alpha; attribute vec3 tint;
uniform float scale; varying float vA; varying vec3 vC;
#include <fog_pars_vertex>
void main(){
  vec4 mvPosition=modelViewMatrix*vec4(position,1.0);
  gl_Position=projectionMatrix*mvPosition;
  gl_PointSize=min(size*scale/max(0.05,-mvPosition.z), 640.0);
  vA=alpha; vC=tint;
  #include <fog_vertex>
}`,
    fragmentShader:
`uniform sampler2D map; varying float vA; varying vec3 vC;
#include <fog_pars_fragment>
void main(){
  vec4 t=texture2D(map, gl_PointCoord);
  gl_FragColor=vec4(vC*t.rgb, t.a*vA);
  if(gl_FragColor.a<0.003) discard;
  ${additive ? "" : "#include <fog_fragment>"}
  #include <encodings_fragment>
}`,
    transparent:true, depthWrite:false, fog:!additive, toneMapped:false,
    blending:additive ? T.AdditiveBlending : T.NormalBlending
  });
  const pts=new T.Points(g, mat); pts.frustumCulled=false; pts.renderOrder=3; scene.add(pts);
  return Object.assign(A, {pts:pts, N:N, next:0,
    v:new Float32Array(N*3), age:new Float32Array(N), life:new Float32Array(N),
    s0:new Float32Array(N), s1:new Float32Array(N), a0:new Float32Array(N), glow:new Float32Array(N), shade:new Float32Array(N)});
}
const PUFFS=_cloud(900, _SOFT_TEX, false);
const SPARKS=_cloud(260, GLOW_TEX, true);
// x,y,z where; vx,vy,vz how it sets off; s0→s1 its size in metres over a
// life of `life` seconds; a0 its alpha; shade its grey (0 black, 1 white);
// glow how much fire-light it carries at birth
PUFFS.emit=function(x,y,z, vx,vy,vz, s0,s1, life, a0, shade, glow){
  const i=this.next; this.next=(i+1)%this.N;
  this.pos[i*3]=x; this.pos[i*3+1]=y; this.pos[i*3+2]=z;
  this.v[i*3]=vx; this.v[i*3+1]=vy; this.v[i*3+2]=vz;
  this.age[i]=0; this.life[i]=life; this.s0[i]=s0; this.s1[i]=s1; this.a0[i]=a0;
  this.shade[i]=shade===undefined?0.8:shade; this.glow[i]=glow||0;
};
SPARKS.emit=function(x,y,z, vx,vy,vz, size, life){
  const i=this.next; this.next=(i+1)%this.N;
  this.pos[i*3]=x; this.pos[i*3+1]=y; this.pos[i*3+2]=z;
  this.v[i*3]=vx; this.v[i*3+1]=vy; this.v[i*3+2]=vz;
  this.age[i]=0; this.life[i]=life; this.s0[i]=size; this.s1[i]=size*0.4; this.a0[i]=1;
};
const _dbs=new T.Vector2();
function updatePuffs(dt, now, dark){
  renderer.getDrawingBufferSize(_dbs);
  const sc=_dbs.y/(2*Math.tan(camera.fov*Math.PI/360));
  PUFFS.pts.material.uniforms.scale.value=sc; SPARKS.pts.material.uniforms.scale.value=sc;
  const day=1-dark, lit=0.16+0.84*Math.pow(day,0.8);
  // the air moves a little, more in a gust, mostly toward the south-east
  const wx=(0.22+Wind.gust*0.9), wz=(0.12+Wind.gust*0.4);
  const P=PUFFS;
  for(let i=0;i<P.N;i++){
    if(P.life[i]<=0){ P.alpha[i]=0; continue; }
    P.age[i]+=dt; const u=P.age[i]/P.life[i];
    if(u>=1){ P.life[i]=0; P.alpha[i]=0; P.size[i]=0; continue; }
    // the rise slows as it cools; the wind takes it more the higher it gets
    const k=Math.min(1, 0.3+u*1.4);
    P.v[i*3]*=1-dt*0.6; P.v[i*3+2]*=1-dt*0.6; P.v[i*3+1]*=1-dt*0.35;
    P.pos[i*3]  +=(P.v[i*3]  +wx*k)*dt + Math.sin(now*0.9+i)*0.03*dt;
    P.pos[i*3+1]+= P.v[i*3+1]*dt;
    P.pos[i*3+2]+=(P.v[i*3+2]+wz*k)*dt + Math.cos(now*0.7+i*1.7)*0.03*dt;
    P.size[i]=P.s0[i]+(P.s1[i]-P.s0[i])*Math.sqrt(u);
    P.alpha[i]=P.a0[i]*smoothstep(0,0.08,u)*Math.pow(1-u,1.6);
    const g=P.glow[i]*Math.max(0,1-u*2.2), s=P.shade[i]*lit;
    P.tint[i*3]=s+g*0.95; P.tint[i*3+1]=s+g*0.48; P.tint[i*3+2]=s+g*0.20;
  }
  const S=SPARKS;
  for(let i=0;i<S.N;i++){
    if(S.life[i]<=0){ S.alpha[i]=0; continue; }
    S.age[i]+=dt; const u=S.age[i]/S.life[i];
    if(u>=1){ S.life[i]=0; S.alpha[i]=0; S.size[i]=0; continue; }
    S.v[i*3+1]-=dt*1.2;                                     // they arc over and come down
    S.pos[i*3]  +=(S.v[i*3]+wx*0.6)*dt + Math.sin(now*7+i)*0.15*dt;
    S.pos[i*3+1]+= S.v[i*3+1]*dt;
    S.pos[i*3+2]+=(S.v[i*3+2]+wz*0.6)*dt + Math.cos(now*6+i*1.3)*0.15*dt;
    S.size[i]=S.s0[i]*(1-u*0.6);
    const f=Math.pow(1-u,1.3)*(0.75+0.25*Math.sin(now*40+i*3.1));
    S.alpha[i]=f*(0.55+0.45*dark);
    S.tint[i*3]=1.0; S.tint[i*3+1]=0.55+0.25*(1-u); S.tint[i*3+2]=0.18*(1-u);
  }
  for(const C of [PUFFS, SPARKS]){
    const a=C.pts.geometry.attributes;
    a.position.needsUpdate=true; a.size.needsUpdate=true; a.alpha.needsUpdate=true; a.tint.needsUpdate=true;
  }
}
