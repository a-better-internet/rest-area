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
   After dark the lights come on when you take her out: two docking lights
   in the front of the deck throwing their beams out over the water ahead
   (the cars' two headlamp beams, 11, which are free while you are not
   driving), the red and green bow light on the front rail and the white
   all-round light on its pole at the stern. L at the helm puts them off,
   and on again.
   ---------------------------------------------------------------------- */
const BOAT={on:false, g:null, x:0, z:0, yaw:0, u:0, v:0, r:0, thr:0, steer:0, rpm:0, speed:0, running:false, t:0,
            pitch:0, roll:0, bumpT:0, wakeT:0, wakeD:0, use:null, col:null, cap:null, prop:null, motor:null, told:false,
            lights:true, lightK:0, lamps:null};
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
  /* the lights. Docking lights: a chrome bezel in the deck's front fascia either side, the lens in it. The bow light on
     the middle of the front rail: red to port, green to starboard. The stern light: white, all round, on a pole at the
     stern bench's corner, clear of the bimini. Their lenses glow as the lights come up (BOAT.lightK) */
  { const L2=L/2, FZ=L2+0.1+0.05, LE=[], le=(geo,x,y,z,c,rx,ry)=>LE.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
      new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
    for(const sd of [-1,1]){ le(new T.CylinderGeometry(0.075, 0.075, 0.035, 18), sd*0.82, 0.42, FZ+0.012, "#c8ccd0", Math.PI/2); }
    le(boxGeo(0.16, 0.06, 0.10), 0, 1.355, L2-0.15, "#c8ccd0"); le(boxGeo(0.02, 0.07, 0.11), 0, 1.36, L2-0.15, "#2a2a2c");
    le(new T.CylinderGeometry(0.014, 0.018, 1.75, 8), -1.02, 1.37, -L2+0.55, "#c8ccd0"); le(new T.CylinderGeometry(0.04, 0.04, 0.03, 12), -1.02, 2.26, -L2+0.55, "#2a2a2c");
    const fit=new T.Mesh(mergeEntries(LE), new T.MeshStandardMaterial({vertexColors:true, roughness:0.25, metalness:0.8})); G.add(fit);
    const lens=(c)=>new T.MeshBasicMaterial({color:c, transparent:true, opacity:0.25, toneMapped:false, depthWrite:false});
    const M={dock:lens(0xffe2a8), red:lens(0xff2a1a), grn:lens(0x2aff6a), wht:lens(0xfff4dc)};
    for(const sd of [-1,1]){ const d=new T.Mesh(new T.CircleGeometry(0.058, 18), M.dock); d.position.set(sd*0.82, 0.42, FZ+0.032); G.add(d); }
    for(const sd of [-1,1]){ const m=new T.Mesh(new T.BoxGeometry(0.004, 0.04, 0.085), sd<0 ? M.red : M.grn); m.position.set(sd*0.083, 1.36, L2-0.15); G.add(m); }
    const st=new T.Mesh(new T.SphereGeometry(0.035, 12, 8), M.wht); st.position.set(-1.02, 2.30, -L2+0.55); G.add(st);
    BOAT.lamps={M:M, beam:[V3(-0.82, 0.42, FZ+0.06), V3(0.82, 0.42, FZ+0.06)], aim:V3(0, -0.9, L2+28)}; }
  // getting on: E from the dock, the shore or the water's edge, anywhere along it
  BOAT.use=addUse(R.x, R.z, R.dy, "TAKE THE BOAT", ()=>BOAT.board(), 2.9, ()=>!BOAT.on);
  // and while nobody has it, it is a thing you walk round
  BOAT.col=addColOB(R.x, R.z, R.ry, 1.32, L/2+0.5, WY-1, WY+2.7, COL_DYN);
  BOAT.hull=R.m;
})();
/* ---- every boat at the docks can be taken, and every boat left at one is tied up to it ----
   14n gives the other pontoons the same hull, their outboard as a child of it and a collider that moves. Taking one
   swaps hulls: its hull goes into the rig (the outboard that runs, the lights, you at the helm) where it lies, and the
   rig's hull is left where the rig was with that boat's own outboard on its transom; so the boat you step aboard is the
   one you chose. A boat at a dock is tied to it by two lines, bow and stern, from its cleats to the dock's edge; stepping
   off at a dock brings the boat in alongside it first and makes them fast (BOAT.leave, updateBoat's tie) */
const _ROPE_MAT=new T.MeshStandardMaterial({color:0xe8e0c4, roughness:0.9});
function _ropeMesh(a, b, sag){ const pts=[]; for(let k=0;k<=8;k++){ const t=k/8; pts.push(new T.Vector3(lerp(a.x,b.x,t), lerp(a.y,b.y,t)-sag*4*t*(1-t), lerp(a.z,b.z,t))); }
  const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 16, 0.011, 5, false), _ROPE_MAT); m.castShadow=true; return m; }
// where a boat at (x, z, yaw) would lie alongside the nearest dock edge with open water off it: its pose, and the edge
function _dockBerth(x, z, yaw, maxD){
  const L=7.2, HW=1.52; let best=null;
  for(const d of (LAKESIDE.docks||[])){
    for(const [ax,az,bx,bz] of [[d.x0,d.z0,d.x1,d.z0],[d.x1,d.z0,d.x1,d.z1],[d.x1,d.z1,d.x0,d.z1],[d.x0,d.z1,d.x0,d.z0]]){
      const ex=bx-ax, ez=bz-az, el=Math.hypot(ex, ez); if(el<2.2) continue;
      const ux=ex/el, uz=ez/el, mx=(ax+bx)/2, mz=(az+bz)/2; let nx=uz, nz=-ux;
      const open=(px, pz)=>Terrain.lakeSD(px, pz)<-0.3 && !LAKESIDE.docks.some(o=>px>o.x0 && px<o.x1 && pz>o.z0 && pz<o.z1);
      if(!open(mx+nx*2, mz+nz*2)){ nx=-nx; nz=-nz; if(!open(mx+nx*2, mz+nz*2)) continue; }
      const s=clamp((x-ax)*ux+(z-az)*uz, Math.min(L/2-1.2, el/2), Math.max(el-L/2+1.2, el/2));
      const tx=ax+ux*s+nx*HW, tz=az+uz*s+nz*HW;
      let ty=Math.atan2(ux, uz); if(Math.cos(ty-yaw)<0) ty+=Math.PI;
      const dist=Math.hypot(tx-x, tz-z); if(dist>(maxD||7)) continue;
      const score=dist+2.0*(1-Math.abs(Math.cos(ty-yaw)));
      if(!best || score<best.score) best={x:tx, z:tz, yaw:ty, score:score, ax:ax, az:az, ux:ux, uz:uz, nx:nx, nz:nz, el:el, y:d.y}; } }
  return best; }
// the two lines from a boat at (x, z, yaw) to the edge b, or none (and away with any it had)
function _tieRopes(st, x, z, yaw, b, wy){
  if(st.ropes){ scene.remove(st.ropes); st.ropes.children.forEach(m=>m.geometry.dispose()); st.ropes=null; }
  if(!b) return;
  const G=new T.Group(), c=Math.cos(yaw), s=Math.sin(yaw), side=Math.sign(-(b.nx*c-b.nz*s))||1;
  for(const lz of [7.2/2-0.7, -(7.2/2-0.7)]){ const lx=side*1.15, px=x+lx*c+lz*s, pz=z-lx*s+lz*c;
    const along=Math.sign(lz)*Math.sign(b.ux*s+b.uz*c||1);
    let t=clamp((px-b.ax)*b.ux+(pz-b.az)*b.uz+along*0.9, 0.2, b.el-0.2);
    G.add(_ropeMesh(V3(px, wy+0.66, pz), V3(b.ax+b.ux*t, b.y+0.08, b.az+b.uz*t), 0.16)); }
  scene.add(G); st.ropes=G; }
(function moorAll(){
  const B=BOAT; if(!B.g) return;
  _tieRopes(B, B.x, B.z, B.yaw, _dockBerth(B.x, B.z, B.yaw, 4), B.wy);
  for(const S of LAKESIDE.boats){ if(!S.pont) continue;
    _tieRopes(S, S.x, S.z, S.ry, _dockBerth(S.x, S.z, S.ry, 4), S.y0);
    // take this one: E alongside it, anywhere down its length
    const u=addUse(S.x, S.z, S.y0+0.55, "TAKE THIS BOAT", ()=>BOAT.takeOver(S), 2.9, ()=>{ if(BOAT.on || BOAT.tie) return false;
      const c=Math.cos(S.ry), s=Math.sin(S.ry), lz=clamp((player.pos.x-S.x)*s+(player.pos.z-S.z)*c, -S.L/2+0.6, S.L/2-0.6); u.x=S.x+lz*s; u.z=S.z+lz*c; return true; }); } })();
BOAT.takeOver=function(S){
  const B=BOAT; if(B.on || !B.hull || !S.m) return;
  const Hb=B.hull, Hs=S.m;
  B.g.remove(Hb); scene.remove(Hs); Hs.remove(S.out);
  Hs.position.set(0, 0, 0); Hs.rotation.set(0, 0, 0); B.g.add(Hs); B.hull=Hs;
  const px=B.x, pz=B.z, py=B.yaw, sx=S.x, sz=S.z, sy=S.ry;
  Hb.position.set(px, S.y0, pz); Hb.rotation.set(0, py, 0); scene.add(Hb); Hb.add(S.out); S.m=Hb;
  S.x=px; S.z=pz; S.ry=py;
  B.x=sx; B.z=sz; B.yaw=sy; B.u=0; B.v=0; B.r=0; B.g.position.set(sx, B.wy, sz); B.g.rotation.set(0, sy, 0);
  { const o=_ob(S.x, S.z, S.ry, 1.3, S.L/2+0.5), c=S.col; c.ob=o; c.x0=S.x-o.ex; c.x1=S.x+o.ex; c.z0=S.z-o.ez; c.z1=S.z+o.ez; }
  _tieRopes(S, S.x, S.z, S.ry, _dockBerth(S.x, S.z, S.ry, 4), S.y0);
  B.place(); B.board(); };
// what E says at the helm: alongside a dock it ties up, elsewhere it steps you off
BOAT.prompt=function(){ const B=BOAT; if(B.tie) return "TYING UP";
  return Math.abs(B.u)<3.2 && _dockBerth(B.x, B.z, B.yaw, 6) ? "E  ·  TIE UP AT THE DOCK" : "E  ·  STEP OFF"; };
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
  if(B.ropes) toast("YOU CAST OFF", "#8fd6ff"); _tieRopes(B, 0, 0, 0, null);
  carCamYaw=0; carCamPitch=0.30; _carLook.set(0,0,0);
  if(typeof AUDIO!=="undefined") AUDIO.blip("pull", B.x, B.z);
  B.running=false; B.startT=0.7;
  const nite=DayNight.state.dark>0.12 ? "   L · LIGHTS" : "";
  toast(B.told ? "W · THROTTLE   S · REVERSE   A D · STEER   E · STEP OFF"+nite :
                 "YOU PULL THE CORD. IT CATCHES.   W · THROTTLE   S · REVERSE   A D · STEER   E · STEP OFF AT A DOCK"+nite, "#8fd6ff");
  B.told=true; };
// L at the helm: the lights off, or on again
BOAT.toggleLights=function(){ BOAT.lights=!BOAT.lights; toast(BOAT.lights ? "BOAT LIGHTS ON" : "BOAT LIGHTS OFF", "#8fd6ff"); };
// each frame (11's updateCarLights, while you are not driving a car): the lenses, and the two beams out over the water
const _blP=new T.Vector3(), _blT=new T.Vector3();
BOAT.beams=function(dark, delta, beams){
  const B=BOAT, Lp=B.lamps; if(!Lp) return false;
  const want=B.on && B.lights && dark>0.12 ? Math.min(1, (dark-0.12)*3) : 0;
  B.lightK+=(want-B.lightK)*Math.min(1, delta*6);
  const k=B.lightK<0.01 ? 0 : B.lightK;
  Lp.M.dock.opacity=0.25+0.62*k; Lp.M.red.opacity=Lp.M.grn.opacity=0.30+0.65*k; Lp.M.wht.opacity=0.30+0.62*k;
  if(k<=0 || !B.on) return false;
  // they reach further and spread wider than a car's, not brighter: each aimed a little out to its own side and well
  // ahead, a wide soft cone that falls off slowly, so between them they light a broad swath of water and the shore ahead
  B.g.updateMatrixWorld();
  for(let i=0;i<2;i++){ const L=beams[i];
    _blP.copy(Lp.beam[i]); B.g.localToWorld(_blP); L.position.copy(_blP);
    _blT.copy(Lp.aim); _blT.x+=(i ? 1 : -1)*7; _blT.z+=14; B.g.localToWorld(_blT); L.target.position.copy(_blT);
    L.angle=0.74; L.penumbra=0.85; L.distance=170; L.decay=1.0; L.intensity=1.45*k; }
  return true; };
// stepping off: the nearest place alongside to stand, on a dock or on the shore, and clear of everything
BOAT.leave=function(){
  const B=BOAT; if(!B.on || B.tie) return;
  // alongside a dock, slow: she is brought in to lie along it, then made fast, then you step off (updateBoat)
  if(Math.abs(B.u)<3.2){ const b=_dockBerth(B.x, B.z, B.yaw, 6);
    if(b && !_boatHits(b.x, b.z, b.yaw)){ B.tie={t:0, x0:B.x, z0:B.z, y0:B.yaw, b:b}; B.thr=0; toast("BRINGING HER IN ALONGSIDE", "#8fd6ff"); return; } }
  B.stepOff(); };
BOAT.stepOff=function(tied){
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
  toast(tied ? "MADE FAST, BOW AND STERN. YOU STEP ONTO THE DOCK" : "YOU STEP ASHORE", "#8fd6ff"); };
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
  if(B.tie){ const Q=B.tie; Q.t+=dt; const k=smoothstep(0, 1, Math.min(1, Q.t/1.4));
    let dyaw=Q.b.yaw-Q.y0; while(dyaw>Math.PI) dyaw-=Math.PI*2; while(dyaw<-Math.PI) dyaw+=Math.PI*2;
    B.x=lerp(Q.x0, Q.b.x, k); B.z=lerp(Q.z0, Q.b.z, k); B.yaw=Q.y0+dyaw*k; B.u=0; B.v=0; B.r=0; B.thr=0; B.rpm*=0.95;
    B.pitch*=0.9; B.roll*=0.9;
    B.g.position.set(B.x, B.wy+Math.sin(B.t*1.1)*0.025, B.z); B.g.rotation.set(B.pitch, B.yaw, B.roll);
    if(Q.t>=1.4){ B.tie=null; _tieRopes(B, B.x, B.z, B.yaw, Q.b, B.wy); B.stepOff(true); }
    return; }
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
