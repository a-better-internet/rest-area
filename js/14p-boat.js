"use strict";
/* REST AREA · 14p-boat.js
   the pontoon at the end of dock A in the lake park (14n), which you can
   take out on Edinboro Lake: its outboard, how it goes, how you get on
   and off
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14p · THE BOAT
   The pontoon nearest the shore end of dock A's T isn't tied up. Walk out
   to it and E takes the helm: you pull the cord, the outboard catches, and
   the view goes out behind the boat as it does in a car (the mouse swings
   it round). W opens the throttle, S puts it in reverse, A and D swing the
   motor; E again, alongside a dock or the shore, steps you off onto it.
   How it goes, after the simulation the crew had on a laptop (a boat
   driven by an engine's thrust against the water's drag, turned by its
   rudder): the throttle comes up and down at a lever's pace; the thrust
   falls off as the speed comes up toward the top, and the drag goes as
   the square of the speed, so it settles at a top speed of its own and
   coasts down when you let go. The motor swung to one side turns the
   boat by its thrust at low speed and by the flow past it at speed, so
   in reverse the stern goes where the prop pushes it. The water's grip
   across the logs is much stronger than along them, but not total: the
   boat skids a little outward in a hard turn. Past half its top speed the
   bow comes up onto the plane and the stern squats; it leans out in a
   turn, and rocks on the chop at rest. It runs into what it runs into:
   the shore (Terrain.lakeSD), the docks' edges, the pilings and the
   other boats, and comes off them with a bump.
   ---------------------------------------------------------------------- */
const BOAT={on:false, g:null, x:0, z:0, yaw:0, u:0, v:0, r:0, thr:0, steer:0, rpm:0, speed:0, running:false, t:0,
            pitch:0, roll:0, bumpT:0, wakeT:0, wakeD:0, use:null, col:null, cap:null, prop:null, motor:null, told:false};
(function boat(){
  const R=LAKESIDE.ride; if(!R) return;
  const WY=R.wy, L=R.L;
  // the hull as 14n built it, into a group that moves, pitches and rolls
  const G=new T.Group(); G.position.set(R.x, WY, R.z); G.rotation.order="YXZ"; G.rotation.y=R.ry; scene.add(G);
  scene.remove(R.m); R.m.position.set(0,0,0); R.m.rotation.set(0,0,0); G.add(R.m);
  Object.assign(BOAT, {g:G, x:R.x, z:R.z, yaw:R.ry, wy:WY, dy:R.dy, L:L});
  // the outboard: a clamp bracket on the transom, the motor on its swivel; cowling, midsection, lower unit, skeg, prop
  const OB=new T.Group(); OB.position.set(0, 0.62, -L/2-0.02); G.add(OB);
  const ME=[], me=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  me(boxGeo(0.30, 0.22, 0.10), 0, 0.02, -0.05, "#2a2a2c");                                 // the bracket
  me(rboxGeo(0.44, 0.52, 0.62, 0.09, 2), 0, 0.44, -0.36, "#1c1c1e");                       // the cowling
  me(rboxGeo(0.45, 0.07, 0.63, 0.03, 2), 0, 0.22, -0.36, "#8a8d90");                       // its band
  me(boxGeo(0.16, 0.62, 0.22), 0, -0.10, -0.34, "#202022");                                // the midsection
  me(boxGeo(0.40, 0.02, 0.34), 0, -0.40, -0.36, "#2a2a2c");                                // the cavitation plate
  me(rboxGeo(0.13, 0.30, 0.40, 0.05, 2), 0, -0.56, -0.38, "#202022");                      // the lower unit
  me(boxGeo(0.03, 0.22, 0.16), 0, -0.80, -0.40, "#202022");                                // the skeg
  me(new T.CylinderGeometry(0.06, 0.05, 0.16, 12).rotateX(Math.PI/2), 0, -0.58, -0.62, "#2a2a2c");
  const motor=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.35, metalness:0.3}));
  motor.castShadow=true; OB.add(motor);
  // the decal on the cowling's sides
  const dec=signTex(256, 64, (c,W,H)=>{ c.fillStyle="#1c1c1e"; c.fillRect(0,0,W,H); c.fillStyle="#d8dade"; fitText(c, "115 FOUR STROKE", W*0.84, H*0.62, W/2, H/2, "800", "Arial"); });
  for(const sd of [-1,1]){ const m=new T.Mesh(new T.PlaneGeometry(0.42, 0.10), new T.MeshStandardMaterial({map:dec, roughness:0.4, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    m.position.set(sd*0.226, 0.48, -0.36); m.rotation.y=sd*Math.PI/2; OB.add(m); }
  const prop=new T.Group(); prop.position.set(0, -0.58, -0.72); OB.add(prop);
  { const PE=[]; for(let k=0;k<3;k++) PE.push({geo:boxGeo(0.30, 0.10, 0.012), matrix:new T.Matrix4().compose(V3(0,0,0), new T.Quaternion().setFromEuler(new T.Euler(0.35, 0, k*Math.PI*2/3)), V3(1,1,1)), color:new T.Color("#9a9ea2")});
    prop.add(new T.Mesh(mergeEntries(PE), new T.MeshStandardMaterial({vertexColors:true, roughness:0.3, metalness:0.7}))); }
  BOAT.motor=OB; BOAT.prop=prop;
  // you, at the helm when you have the boat: hands on the wheel
  const cap=buildPerson({h:1.0, skin:SKINS[0], hair:HAIRS[2], shirt:"#3a6a8a", pants:"#c8b890", shoes:"#f2f0ea", shorts:true, cap:"#1f3b6e", shades:true});
  scene.remove(cap.g); cap.g.position.set(0.72, 0.51, 0.60); G.add(cap.g); cap.g.visible=false; cap.seed=0.3; BOAT.cap=cap;
  // (the wake is the water's own (14n): the boat drops a point behind its stern as it goes, below, and the lake's
  // surface spreads a ring of waves from each)
  // getting on: E from the dock, the shore or the water's edge, anywhere along it
  BOAT.use=addUse(R.x, R.z, R.dy, "TAKE THE BOAT", ()=>BOAT.board(), 2.9, ()=>!BOAT.on);
  // and while nobody has it, it is a thing you walk round
  BOAT.col=addColOB(R.x, R.z, R.ry, 1.32, L/2+0.5, WY-1, WY+2.7, COL_DYN);
})();
// where the boat is, in everything else's terms: its collider, the place to board it
BOAT.place=function(){
  const B=BOAT, o=_ob(B.x, B.z, B.yaw, 1.32, B.L/2+0.5), c=B.col;
  c.ob=o; c.x0=B.x-o.ex; c.x1=B.x+o.ex; c.z0=B.z-o.ez; c.z1=B.z+o.ez;
  B.reach(); };
// the place to board it from: the point on its centre line nearest you, so that you can step on anywhere alongside
BOAT.reach=function(){
  const B=BOAT, c=Math.cos(B.yaw), s=Math.sin(B.yaw), dx=player.pos.x-B.x, dz=player.pos.z-B.z;
  const lz=clamp(dx*s+dz*c, -B.L/2+0.6, B.L/2-0.6); B.use.x=B.x+lz*s; B.use.z=B.z+lz*c; };
// a point on the hull, from its own frame (lx across to its left, lz forward) into the world's
BOAT.at=function(lx, lz){ const c=Math.cos(BOAT.yaw), s=Math.sin(BOAT.yaw); return [BOAT.x+lx*c+lz*s, BOAT.z-lx*s+lz*c]; };
BOAT.board=function(){
  const B=BOAT; if(B.on || !B.g) return;
  if(seated) standUp();
  B.on=true; B.thr=0; B.steer=0; B.col.y1=B.col.y0-1; B.cap.g.visible=true;
  carCamYaw=0; carCamPitch=0.30; _carLook.set(0,0,0);
  if(typeof AUDIO!=="undefined") AUDIO.blip("pull", B.x, B.z);
  B.running=false; B.startT=0.7;
  toast(B.told ? "W · THROTTLE   S · REVERSE   A D · STEER   E · STEP OFF" :
                 "YOU PULL THE CORD. IT CATCHES.   W · THROTTLE   S · REVERSE   A D · STEER   E · STEP OFF AT A DOCK", "#8fd6ff");
  B.told=true; };
// stepping off: the nearest place alongside to stand, on a dock or on the shore, and clear of everything
BOAT.leave=function(){
  const B=BOAT; if(!B.on) return;
  let best=null, bd=1e9;
  const hx=player.pos.x, hz=player.pos.z;
  const cand=[]; for(let lz=-B.L/2-0.6; lz<=B.L/2+1.8; lz+=0.6) for(const lx of [-2.9,-2.4,-1.9,1.9,2.4,2.9]) cand.push([lx,lz]);
  for(const lx of [-1.2,-0.6,0,0.6,1.2]) for(const lz of [B.L/2+0.9, B.L/2+1.5, B.L/2+2.1, -B.L/2-1.0, -B.L/2-1.6]) cand.push([lx,lz]);
  for(const [lx,lz] of cand){
    const [x,z]=B.at(lx, lz), y=surfaceY(x, z, B.dy+0.7);
    if(y<B.wy+0.25 || Terrain.lakeSD(x,z)<-0.2 && y<B.wy+0.4) continue;            // (water, or the lake's own bed)
    if(blocked(x, z, y)) continue;
    const d=Math.hypot(x-hx, z-hz); if(d<bd){ bd=d; best=[x,z,y]; } }
  if(!best){ toast("NOTHING TO STEP OFF ONTO · BRING HER ALONGSIDE A DOCK OR THE SHORE", "#8fd6ff"); return; }
  B.on=false; B.running=false; B.thr=0; B.rpm=0; B.cap.g.visible=false; B.u*=0.3; B.v=0; B.r=0;
  B.col.y1=B.col.y0+3.7; B.place();
  player.pos.set(best[0], 0, best[1]); player.feetY=best[2]; player.yaw=B.yaw+Math.PI; player.pitch=-0.1;
  if(typeof AUDIO!=="undefined") AUDIO.blip("clunk", B.x, B.z);
  toast("YOU TIE HER OFF AND STEP ASHORE", "#8fd6ff"); };
// does the hull at this pose touch the shore or anything solid at the water? (the points round its outline)
const _BOAT_PTS=[[-1.25,3.4],[1.25,3.4],[0,3.95],[-1.3,1.2],[1.3,1.2],[-1.3,-1.2],[1.3,-1.2],[-1.2,-3.5],[1.2,-3.5],[0,-4.25]];
function _boatHits(x, z, yaw){
  const c=Math.cos(yaw), s=Math.sin(yaw), y0=BOAT.wy-0.3, y1=BOAT.wy+1.2;
  for(const [lx,lz] of _BOAT_PTS){ const px=x+lx*c+lz*s, pz=z-lx*s+lz*c;
    if(Terrain.lakeSD(px,pz)>-0.35) return true;
    for(const list of [colsNear(px,pz), COL_DYN]) for(const q of list){
      if(q===BOAT.col || px<=q.x0 || px>=q.x1 || pz<=q.z0 || pz>=q.z1 || y1<=q.y0 || y0>=q.y1) continue;
      if(q.ob && !obIn(q.ob, px, pz)) continue;
      return true; } }
  return false; }
// one fixed step of the boat, driven or adrift
function updateBoat(dt){
  const B=BOAT; if(!B.g) return;
  B.t+=dt;
  const on=B.on, K=keys;
  if(on && !B.running){ B.startT-=dt; if(B.startT<=0) B.running=true; }
  const tT=on && B.running ? (K.KeyW||K.ArrowUp ? 1 : 0)-(K.KeyS||K.ArrowDown ? 0.55 : 0) : 0;
  const sT=on ? (K.KeyA||K.ArrowLeft ? 1 : 0)-(K.KeyD||K.ArrowRight ? 1 : 0) : 0;
  B.thr+=clamp(tT-B.thr, -dt*0.9, dt*0.9);
  B.steer+=(sT-B.steer)*Math.min(1, dt*3.5);
  // thrust and drag along the logs, the much stronger grip across them, the turn
  const VMAX=10.5, M=1300, T0=2860, u=B.u;
  const thrust=B.thr>=0 ? B.thr*T0*(1-0.35*Math.min(1,(u/VMAX)*(u/VMAX))) : B.thr*T0*0.55;
  const drag=30*u+14*u*Math.abs(u);
  B.u+=((thrust*Math.cos(B.steer*0.5)-drag)/M)*dt;
  const rT=clamp(B.steer*(0.055*B.u+0.30*B.thr), -0.75, 0.75);
  B.r+=(rT-B.r)*Math.min(1, dt*1.8);
  B.v+=(-B.v*3.0-B.r*B.u*0.22)*dt;
  // where that puts it; and if that is into something, back to where it was, and off it with a bump
  const nyaw=B.yaw+B.r*dt, c=Math.cos(nyaw), s=Math.sin(nyaw);
  const nx=B.x+(s*B.u+c*B.v)*dt, nz=B.z+(c*B.u-s*B.v)*dt;
  if(Math.abs(B.u)+Math.abs(B.v)+Math.abs(B.r)>0.002){
    if(_boatHits(nx, nz, nyaw)){
      if(Math.abs(B.u)>1.2 && B.bumpT<=0){ B.bumpT=0.8; if(typeof AUDIO!=="undefined") AUDIO.blip("thump", B.x, B.z); }
      B.u*=-0.25; B.v*=-0.25; B.r*=-0.3; }
    else { B.x=nx; B.z=nz; B.yaw=nyaw; if(!on) B.place(); } }
  B.bumpT=Math.max(0, B.bumpT-dt);
  B.speed=Math.hypot(B.u, B.v); B.rpm+=(((B.running ? 0.18 : 0)+Math.abs(B.thr)*0.82)-B.rpm)*Math.min(1, dt*3);
  // the hull: on the plane past half its speed, squatting under throttle, leaning out in a turn, and the chop
  const f=B.u/VMAX, plane=smoothstep(0.30, 0.75, f);
  B.pitch+=((-0.075*plane-0.02*Math.max(0,B.thr)*(1-plane)+0.02*Math.max(0,-B.thr))-B.pitch)*Math.min(1, dt*1.5);
  B.roll+=((B.r*B.u*0.018)-B.roll)*Math.min(1, dt*2.0);
  const g=B.g, t=B.t;
  g.position.set(B.x, B.wy+Math.sin(t*1.1)*0.025+plane*0.06, B.z);
  g.rotation.set(B.pitch+Math.sin(t*0.6)*0.008, B.yaw, B.roll+Math.sin(t*0.8)*0.012);
  B.motor.rotation.y=-B.steer*0.5; B.motor.rotation.x=0.05*plane;
  B.prop.rotation.z+=(B.running ? 4+B.rpm*60 : 0)*Math.sign(B.thr||1)*dt;
  // the wake: a point behind the stern every few metres of way made (or every half second slower), as strong as the speed
  if(typeof LAKESIDE!=="undefined" && LAKESIDE.wakeDrop && Math.abs(B.u)>0.6){ B.wakeD-=Math.abs(B.u)*dt;
    if(B.wakeD<=0){ B.wakeD=clamp(Math.abs(B.u)*0.12, 0.35, 1.2); const [wx, wz]=B.at(0, B.u>0 ? -B.L/2-0.25 : B.L/2+0.25);
      LAKESIDE.wakeDrop(wx, wz, Math.min(1, Math.abs(B.u)/8.5)); } }
  // and spray off the stern and the bows at speed
  if(Math.abs(B.u)>1.5 && typeof PUFFS!=="undefined"){ B.wakeT-=dt*Math.min(1, Math.abs(B.u)/6);
    while(B.wakeT<=0){ B.wakeT+=0.06; const k=Math.random()<0.5 ? -1 : 1, [px,pz]=B.at(k*(0.6+Math.random()*0.6), -B.L/2-0.6);
      PUFFS.emit(px, B.wy+0.12, pz, -s*B.u*0.15+(Math.random()-0.5)*0.6, 0.35+Math.random()*0.4, -c*B.u*0.15+(Math.random()-0.5)*0.6, 0.18, 1.1, 1.2+Math.random()*0.6, 0.22, 1.0, 0); } }
  if(!on){ B.reach(); return; }
  // you, at the helm
  { const [hx,hz]=B.at(0.72, 0.6); player.pos.set(hx, 0, hz); player.feetY=B.wy+0.51; player.yaw=B.yaw+Math.PI;
    const P=B.cap; poseP(P, "sit", 0, t); const Bn=P.B, J=P.j;
    Bn[J.root].position.y=0.47; Bn[J.shL].rotation.x=Bn[J.shR].rotation.x=-1.05; Bn[J.elL].rotation.x=Bn[J.elR].rotation.x=-0.55;
    Bn[J.shL].rotation.z=0.15-B.steer*0.25; Bn[J.shR].rotation.z=-0.15-B.steer*0.25; Bn[J.head].rotation.y=B.steer*0.25; }
}
// the view while you have it: out behind and above, swung by the mouse (carCamYaw / carCamPitch, as in a car)
const _boatCam=new T.Vector3(), _boatLook=new T.Vector3();
function boatCamera(delta){
  const B=BOAT, a=B.yaw+Math.PI+carCamYaw, sp=Math.min(1, Math.abs(B.u)/10.5), horiz=(10.5+sp*3.0)*Math.cos(carCamPitch);
  _boatCam.set(B.x+Math.sin(a)*horiz, B.wy+2.4+(4.0+sp*1.2)*Math.sin(carCamPitch), B.z+Math.cos(a)*horiz);
  const gy=surfaceY(_boatCam.x, _boatCam.z, _boatCam.y)+0.9; if(_boatCam.y<gy) _boatCam.y=gy;
  if(_boatLook.lengthSq()===0){ _boatLook.set(B.x, B.wy, B.z); camera.position.copy(_boatCam); }
  camera.position.lerp(_boatCam, 1-Math.exp(-8*delta));
  _boatLook.lerp(V3(B.x, B.wy, B.z), 1-Math.exp(-14*delta));
  camera.up.set(0,1,0); camera.lookAt(_boatLook.x, _boatLook.y+1.3, _boatLook.z); }
