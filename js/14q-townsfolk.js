"use strict";
/* REST AREA · 14q-townsfolk.js
   people out of doors on Lake Street and in its park (14n), and the way
   any crowd of them is kept and moved (the brewery's, 14r, too)
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14q · TOWNSFOLK
   A crowd is a group of people (14b's, one skinned mesh each) round a
   centre: shown and moved only while you are within its reach, hidden
   past it. Each person has a part to play:
     sit, stand     where they are put, looking about; with a glass, a
                    drink now and then (`drink`); phone, read as 14b's
     walk           round a path (`loop`) or back and forth along it,
                    stopping where a point says so, at their own pace
                    (a jogger's is a run); a dog may come along
     job            stand and do something with their hands, by its kind:
                    wash (a car), water (the flowers), fish, pour, tray,
                    mow (walking, the mower in front), kneel (weeding),
                    talk, watch, toss (cornhole)
   On Lake Street on a fine day: a man mowing his front lawn in stripes,
   a woman watering her beds and another on her knees weeding, two
   neighbours talking over the property line, one washing his car in the
   drive, somebody fetching the mail, a jogger up and down the street and
   a woman walking her dog the other way, a man in a lawn chair with a
   radio; in the park an old couple along the shore path, a man on a bench
   with the paper, a fisherman at the end of the dock, a kid round and
   round the slide while his mother watches. After dark the yards empty;
   the walkers and the fisherman stay out a while, under the lights.
   ---------------------------------------------------------------------- */
const CROWD={groups:[], t:0};
function crowdGroup(name, cx, cz, reach){ const g={name:name, cx:cx, cz:cz, r:reach||170, people:[], shown:true, day:true}; CROWD.groups.push(g); return g; }
// a glass, a can, a cup, a rod, a tray: something held, on a forearm's bone, the way 14b holds a cigarette
const _HELD={};
function _heldMat(c){ return _HELD[c]||(_HELD[c]=new T.MeshStandardMaterial({color:c, roughness:0.4, metalness:0.1})); }
function crowdHold(P, kind, right){
  const h=P.h, g=new T.Group(), bone=P.B[right===false ? P.j.elL : P.j.elR];
  const add=(geo, c, x, y, z, rx)=>{ const m=new T.Mesh(geo, _heldMat(c)); m.position.set(x,y,z); if(rx) m.rotation.x=rx; g.add(m); return m; };
  if(kind==="pint"){ add(new T.CylinderGeometry(0.036, 0.030, 0.15, 12), "#c88a2a", 0, 0.03, 0.02); add(new T.CylinderGeometry(0.037, 0.037, 0.025, 12), "#f4efe0", 0, 0.115, 0.02); }
  else if(kind==="can") add(new T.CylinderGeometry(0.033, 0.033, 0.12, 10), "#3a6aa8", 0, 0.03, 0.02);
  else if(kind==="cup") add(new T.CylinderGeometry(0.04, 0.032, 0.10, 10), "#f2efe6", 0, 0.03, 0.02);
  else if(kind==="tray"){
    // level on the flat of the hand: a frame turned back by the arm's own pose (the "tray" job's shoulder and elbow,
    // below), so up in it is up in the world whatever the forearm is doing
    const lv=new T.Group(); lv.quaternion.copy(new T.Quaternion().setFromEuler(new T.Euler(-0.35, 0, -0.25)).multiply(new T.Quaternion().setFromEuler(new T.Euler(-1.5, 0, 0))).invert());
    g.add(lv); const add2=(geo, c, x, y, z)=>{ const m=new T.Mesh(geo, _heldMat(c)); m.position.set(x,y,z); lv.add(m); };
    add2(new T.CylinderGeometry(0.20, 0.20, 0.015, 18), "#2a2a2c", 0, 0.03, 0.04);
    for(const [dx,dz] of [[-0.07,-0.04],[0.07,0.02],[0,0.10]]) add2(new T.CylinderGeometry(0.035, 0.030, 0.14, 10), "#d89a2e", dx, 0.03+0.0075+0.07, 0.04+dz); }
  else if(kind==="rod"){ const r=add(new T.CylinderGeometry(0.006, 0.012, 2.6, 6), "#2a2a2c", 0, 0.0, 1.25, Math.PI/2+0.5); r.position.y=0.62; }
  else if(kind==="can_w"){ add(new T.CylinderGeometry(0.09, 0.10, 0.22, 12), "#3a8a4a", 0, -0.12, 0.05); add(new T.CylinderGeometry(0.015, 0.015, 0.30, 6), "#3a8a4a", 0, -0.02, 0.22, 1.0); }
  else if(kind==="sponge") add(new T.BoxGeometry(0.12, 0.06, 0.08), "#e6c21c", 0, 0, 0.03);
  else if(kind==="paper") add(new T.BoxGeometry(0.30, 0.40, 0.01), "#e8e4d8", -0.12, 0.05, 0.12, -0.3);
  else if(kind==="nozzle"){ add(new T.BoxGeometry(0.05, 0.12, 0.10), "#1d1d1e", 0, 0.0, 0.03); add(new T.CylinderGeometry(0.012, 0.012, 0.22, 6), "#8a8d90", 0, 0.03, 0.15, Math.PI/2+0.4); }
  else if(kind==="flowers"){ add(new T.CylinderGeometry(0.035, 0.02, 0.26, 6), "#4a7a3a", 0, 0.02, 0.05);
    for(let k=0;k<7;k++){ const a=k*0.9; add(new T.SphereGeometry(0.035, 6, 4), ["#d83a5a","#f2d24a","#f4f2ec","#c86ab8"][k%4], Math.cos(a)*0.05, 0.16+(k%3)*0.02, 0.05+Math.sin(a)*0.05); } }
  else if(kind==="shirt") add(new T.BoxGeometry(0.42, 0.50, 0.01), "#e8e2c8", 0, 0.12, 0.10);
  g.position.set(0, -0.29*h, 0.02); bone.add(g); return g; }
// add a person to a group: o.look (buildPerson's options) or o.seed (one at random); o.x, o.z, o.y, o.yaw where; o.mode
// the part; o.path [[x,z,y?,pause?],...] for a walker, o.loop round it or else back and forth, o.speed; o.held a thing in hand
function crowdAdd(G, o){
  const P=o.look ? buildPerson(o.look) : randomPerson(_trng(o.seed||((Math.random()*1e6)|0)));
  P.seed=o.seed ? (o.seed%97)/97*6.28 : Math.random()*6.28;
  const p=Object.assign({P:P, ph:Math.random(), i:0, dir:1, wait:0, yawS:o.yaw||0, t:Math.random()*10}, o);
  if(p.path){ const q=p.path[0]; p.x=q[0]; p.z=q[1]; p.y=p.yAt ? p.yAt(p.x, p.z) : q[2]!==undefined ? q[2] : Terrain.groundAt(q[0], q[1]); }
  if(p.y===undefined) p.y=p.yAt ? p.yAt(p.x, p.z) : Terrain.groundAt(p.x, p.z);
  if(p.held) p.heldG=crowdHold(P, p.held, p.heldL ? false : true);
  if(p.dog){ p.D=buildDog(p.dog); p.dx=p.x; p.dz=p.z; }
  if(p.prop){ p.prop.position.set(0,0,0); P.g.add(p.prop); }
  P.g.position.set(p.x, p.y, p.z); P.g.rotation.y=p.yaw||0;
  G.people.push(p); return p; }
// one step of a walker along its path; true while it is moving
function _crowdWalk(p, dt){
  if(p.wait>0){ p.wait-=dt; return false; }
  const P=p.path, n=P.length, q=P[p.i];
  const dx=q[0]-p.x, dz=q[1]-p.z, d=Math.hypot(dx,dz), sp=p.speed||1.25;
  if(d<0.05){
    if(q[3]) p.wait=q[3];
    if(p.loop) p.i=(p.i+1)%n;
    else { if(p.i+p.dir<0 || p.i+p.dir>=n) p.dir=-p.dir; p.i+=p.dir; }
    return false; }
  const s=Math.min(d, sp*dt); p.x+=dx/d*s; p.z+=dz/d*s;
  const want=Math.atan2(dx, dz); let dy=want-p.yawS; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2; p.yawS+=dy*Math.min(1, dt*6);
  p.y=p.yAt ? p.yAt(p.x, p.z) : q[2]!==undefined ? q[2] : Terrain.groundAt(p.x, p.z);          // (yAt: a crowd's own floors, a deck, a lawn)
  p.ph=(p.ph+dt*sp/(p.run ? 2.2 : 1.35))%1;
  return true; }
const _dZ=new T.Vector3();
function _crowdPose(p, now, moving){
  const P=p.P, B=P.B, J=P.j, t=p.t, m=p.mode;
  if(m==="walk") poseP(P, moving ? "walk" : "stand", p.ph, now);
  else if(m==="sit") poseP(P, "sit", 0, now);
  else if(m==="phone" || m==="read") poseP(P, m, 0, now);
  else poseP(P, "stand", 0, now);
  if(m==="walk" && moving && p.run){ B[J.spine].rotation.x=0.14; B[J.elL].rotation.x=B[J.elR].rotation.x=-1.4;
    B[J.knL].rotation.x*=1.4; B[J.knR].rotation.x*=1.4; B[J.root].position.y+=Math.abs(Math.cos(p.ph*Math.PI*2))*0.03; }
  if(p.sitY!==undefined && m==="sit") B[J.root].position.y=p.sitY;
  // a drink: up to the mouth for a moment every so often
  if(p.drink){ const c=(t*0.09+P.seed)%1, up=smoothstep(0,0.08,c)*(1-smoothstep(0.16,0.24,c));
    B[J.shR].rotation.set(-0.45-up*0.95, -up*0.55, 0.12-up*0.10); B[J.elR].rotation.set(-1.15-up*0.95, up*0.6, 0);
    B[J.head].rotation.x=-0.12*up; }
  const k=p.job;
  if(k==="wash"){ const a=t*2.6; B[J.shR].rotation.set(-1.15+Math.sin(a)*0.25, 0, 0.25+Math.cos(a)*0.25); B[J.elR].rotation.x=-0.5; B[J.spine].rotation.x=0.28; B[J.head].rotation.x=0.2; }
  else if(k==="water"){ B[J.shR].rotation.set(-0.85, 0.2, 0); B[J.elR].rotation.x=-0.25+Math.sin(t*0.7)*0.08; B[J.head].rotation.x=0.35; B[J.spine].rotation.y=Math.sin(t*0.4)*0.25; }
  else if(k==="kneel"){ B[J.root].position.y=0.34; B[J.hpL].rotation.x=B[J.hpR].rotation.x=-0.25; B[J.knL].rotation.x=B[J.knR].rotation.x=2.0;
    B[J.spine].rotation.x=0.55; B[J.shL].rotation.x=-0.9+Math.sin(t*2.1)*0.2; B[J.shR].rotation.x=-0.8+Math.sin(t*1.7+1)*0.25; B[J.elL].rotation.x=B[J.elR].rotation.x=-0.3; B[J.head].rotation.x=0.3; }
  else if(k==="fish"){ B[J.shL].rotation.set(-0.75, 0, -0.2); B[J.shR].rotation.set(-0.85, 0, 0.15); B[J.elL].rotation.x=B[J.elR].rotation.x=-0.8;
    const jig=Math.max(0, Math.sin(t*0.6))>0.97 ? 0.25 : 0; B[J.shR].rotation.x-=jig; }
  else if(k==="pour"){ const c=(t*0.12+P.seed)%1, up=smoothstep(0.0,0.1,c)*(1-smoothstep(0.35,0.45,c)); B[J.shR].rotation.set(-0.35-up*0.7, 0, 0.1); B[J.elR].rotation.x=-0.6-up*0.4; B[J.head].rotation.x=0.18*up; B[J.head].rotation.y*=1-up; }
  else if(k==="tray"){ B[J.shL].rotation.set(-0.35, 0, -0.25); B[J.elL].rotation.set(-1.5, 0, 0); }
  else if(k==="mow"){ B[J.shL].rotation.x=B[J.shR].rotation.x=-0.55; B[J.elL].rotation.x=B[J.elR].rotation.x=-0.55; B[J.spine].rotation.x=0.12; }
  else if(k==="talk"){ B[J.head].rotation.y=Math.sin(t*0.5+P.seed)*0.15; const g=Math.max(0, Math.sin(t*1.3+P.seed*3)); B[J.shR].rotation.set(-0.3-g*0.5, 0, 0.25); B[J.elR].rotation.x=-0.9-g*0.6; }
  else if(k==="toss"){ const c=(t*0.16+P.seed)%1, sw=smoothstep(0.0,0.25,c)*(1-smoothstep(0.3,0.42,c)); B[J.shR].rotation.set(0.6-sw*1.9, 0, 0.12); B[J.elR].rotation.x=-0.2-sw*0.2; B[J.spine].rotation.x=0.1*sw; B[J.knL].rotation.x=0.25*sw; }
  else if(k==="watch"){ B[J.shL].rotation.set(0.15, 0, -0.35); B[J.shR].rotation.set(0.15, 0, 0.35); B[J.elL].rotation.x=B[J.elR].rotation.x=-1.9; }
  else if(k==="pump"){ B[J.shR].rotation.set(-0.95, 0, 0.18); B[J.elR].rotation.x=-0.35; B[J.head].rotation.x=0.22; B[J.head].rotation.y=Math.sin(t*0.3+P.seed)*0.5;
    B[J.shL].rotation.set(0.05, 0, -0.12); }
  else if(k==="drive"){ const look=smoothstep(0.82, 0.95, Math.sin(t*0.21+P.seed)*0.5+0.5);    // (over the shoulder at the baler, now and then)
    B[J.shL].rotation.set(-1.05, 0, -0.15); B[J.shR].rotation.set(-1.05+look*0.6, 0, 0.15); B[J.elL].rotation.x=-0.75; B[J.elR].rotation.x=-0.75+look*0.5;
    B[J.head].rotation.y=look*1.35; B[J.spine].rotation.y=look*0.35; }
  else if(k==="mourn"){ B[J.head].rotation.x=0.42; B[J.shL].rotation.set(-0.35, 0, 0.35); B[J.shR].rotation.set(-0.35, 0, -0.35); B[J.elL].rotation.x=B[J.elR].rotation.x=-1.05; }
  else if(k==="hang"){ const c=(t*0.11+P.seed)%1, up=smoothstep(0.08, 0.22, c)*(1-smoothstep(0.62, 0.78, c)), dn=smoothstep(0.82, 0.9, c)*(1-smoothstep(0.94, 1.0, c));
    B[J.shL].rotation.set(-0.3-up*2.35, 0, -0.1); B[J.shR].rotation.set(-0.3-up*2.35, 0, 0.1); B[J.elL].rotation.x=B[J.elR].rotation.x=-0.4+up*0.25;
    B[J.head].rotation.x=-0.35*up+0.5*dn; B[J.spine].rotation.x=0.7*dn; if(p.heldG) p.heldG.visible=c<0.7; }
}
function _crowdDog(p, dt, moving){
  const D=p.D, ex=p.x+Math.sin(p.yawS+0.6)*1.4, ez=p.z+Math.cos(p.yawS+0.6)*1.4, dx=ex-p.dx, dz=ez-p.dz, d=Math.hypot(dx,dz);
  if(d>0.05){ const s=Math.min(d, Math.max(0.6, d*2.2)*dt); p.dx+=dx/d*s; p.dz+=dz/d*s; D.g.rotation.y=Math.atan2(dx,dz); }
  D.g.position.set(p.dx, Terrain.groundAt(p.dx, p.dz), p.dz);
  const a=CROWD.t*9; D.legs.forEach((b,k)=>{ D.B[b].rotation.x=moving ? Math.sin(a+(k===0||k===3 ? 0 : Math.PI))*0.5 : 0; });
  D.B[D.tail].rotation.z=Math.sin(CROWD.t*(moving?10:4))*0.4; }
function updateCrowd(dt, now, dark){
  CROWD.t+=dt; const c=camera.position;
  for(const G of CROWD.groups){
    const d=Math.hypot(c.x-G.cx, c.z-G.cz), show=d<G.r;
    if(show!==G.shown){ G.shown=show; for(const p of G.people){ p.P.g.visible=show && (!p.dayOnly || dark<0.6); if(p.D) p.D.g.visible=p.P.g.visible; if(p.onShow) p.onShow(p, p.P.g.visible); } }
    if(!show) continue;
    for(const p of G.people){
      // the yards empty after dark: those who are only out by day go in
      const out=!p.dayOnly || dark<0.6; if(p.P.g.visible!==out){ p.P.g.visible=out; if(p.D) p.D.g.visible=out; if(p.onShow) p.onShow(p, out); }
      if(!out) continue;
      p.t+=dt; let moving=false;
      if(p.path && !(p.yield && p.yield(p))) moving=_crowdWalk(p, dt);          // (yield: something that drives stops for you)
      if(d<70 || (CROWD.t*7+p.P.seed)%1<0.34){                 // (past seventy metres, a third of the frames)
        p.P.g.position.set(p.x, p.y, p.z); p.P.g.rotation.y=p.path ? p.yawS : (p.yaw||0)+(p.sway ? Math.sin(p.t*0.3)*p.sway : 0);
        _crowdPose(p, now, moving);
        if(p.D) _crowdDog(p, dt, moving); }
      if(p.tick) p.tick(p, dt, moving); } }
}
// a thing to carry about or ride, built of boxes and cylinders as one vertex-coloured mesh: a mower, a chair, a tractor
function crowdProp(build){
  const ME=[], ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  build(ent, (w,h,d,x,y,z,c,rx,ry)=>ent(boxGeo(w,h,d),x,y,z,c,rx,ry), (r,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r,r,h,seg||12),x,y,z,c,rx,ry,rz));
  const m=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.55, metalness:0.2})); m.castShadow=true; return m; }
// a path's corners rounded off at radius R (less where a leg is short), so that whatever drives it turns and does
// not pivot; a point straight on between its neighbours is kept as it is, its pause with it
function crowdRound(pts, R, closed){
  const out=[], n=pts.length;
  for(let i=0;i<n;i++){ const p=pts[i];
    if(!closed && (i===0 || i===n-1)){ out.push(p); continue; }
    const a=pts[(i-1+n)%n], b=pts[(i+1)%n], ax=p[0]-a[0], az=p[1]-a[1], la=Math.hypot(ax,az), bx=b[0]-p[0], bz=b[1]-p[1], lb=Math.hypot(bx,bz);
    if(Math.abs(ax*bz-az*bx)<1e-6*la*lb){ out.push(p); continue; }
    const r=Math.min(R, la/2, lb/2), s0=[p[0]-ax/la*r, p[1]-az/la*r], e=[p[0]+bx/lb*r, p[1]+bz/lb*r];
    for(let k=0;k<=8;k++){ const t=k/8, u=1-t; out.push([u*u*s0[0]+2*u*t*p[0]+t*t*e[0], u*u*s0[1]+2*u*t*p[1]+t*t*e[1]]); } }
  return out; }

/* ---- Lake Street, a fine day ------------------------------------------------- */
(function lakeStreetFolk(){
  if(!LAKESIDE.houses || !LAKESIDE.houses.length) return;
  const Y=EDIN.y, Z=EDIN.z, HW=EDIN.hw, SH=EAST.shore, WY=EAST.wy, H=LAKESIDE.houses;
  const W=crowdGroup("Lake Street west", 1150, -1200, 150), Ea=crowdGroup("Lake Street east", 1380, -1200, 150), PK=crowdGroup("the park", 1300, -1260, 140);
  const look=(o)=>Object.assign({h:1.0, skin:SKINS[1], hair:HAIRS[1], shirt:"#4a6a8a", pants:"#3b4a66", shoes:"#f2f0ea"}, o);
  const ME=[], ent=(geo,x,y,z,c)=>ME.push({geo:geo, matrix:new T.Matrix4().makeTranslation(x,y,z), color:new T.Color(c)});
  const propMesh=(build)=>{ ME.length=0; build(); const m=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.55, metalness:0.2})); m.castShadow=true; return m; };
  // the man mowing his front lawn (No. 2 across the street's, the two-storey), up and back in stripes
  { const h=H[7], x0=h.x0+0.8, x1=h.x1-0.8, zs=[]; for(let z=Z+HW+2.0; z<h.zf-1.0; z+=0.9) zs.push(z);
    const path=[]; zs.forEach((z,k)=>{ path.push(k%2 ? [x1, z] : [x0, z]); path.push(k%2 ? [x0, z] : [x1, z]); });
    const mower=propMesh(()=>{ ent(new T.BoxGeometry(0.52, 0.26, 0.62), 0, 0.22, 0.75, "#c42a1a"); ent(new T.BoxGeometry(0.30, 0.20, 0.30), 0, 0.42, 0.72, "#2a2a2c");
      for(const [dx,dz] of [[-0.26,0.50],[0.26,0.50],[-0.26,1.00],[0.26,1.00]]) ent(new T.CylinderGeometry(0.09, 0.09, 0.05, 12).rotateZ(Math.PI/2), dx, 0.09, dz, "#1a1a1a");
      ent(new T.CylinderGeometry(0.015, 0.015, 1.0, 6).rotateX(-0.95), 0, 0.68, 0.25, "#8a8d90"); ent(new T.CylinderGeometry(0.015, 0.015, 0.5, 6).rotateZ(Math.PI/2), 0, 0.98, -0.06, "#2a2a2c"); });
    crowdAdd(W, {look:look({skin:SKINS[0], shirt:"#d8d4c8", pants:"#5c5a52", cap:"#2f5a35", shorts:true}), mode:"walk", job:"mow", path:path, loop:true, speed:0.85, prop:mower, dayOnly:true}); }
  // watering the beds in front of the bungalow across the way; and weeding in front of No. 3's
  // (a house's yard is on the side of its front face, h.f, toward the street; facing it is facing back the other way)
  const yard=(h, along, out)=>({x:h.x+along, z:h.zf+h.f*out, yaw:h.f>0 ? Math.PI : 0});
  crowdAdd(W, Object.assign({look:look({female:true, h:0.96, skin:SKINS[2], hair:HAIRS[0], shirt:"#c86a8a", pants:"#2c3446"}), mode:"stand", job:"water", held:"can_w", dayOnly:true}, yard(H[6], -2.6, 1.3)));
  crowdAdd(W, Object.assign({look:look({female:true, h:0.97, skin:SKINS[0], hair:HAIRS[3], shirt:"#8aa86a", pants:"#5c5a52", cap:"#c8b890"}), mode:"stand", job:"kneel", dayOnly:true}, yard(H[2], 3.2, 0.9)));
  // two neighbours over the line between the first two houses' front yards
  { const x=(H[0].x1+H[1].x0)/2, z=Z-HW-7.0;
    crowdAdd(W, {look:look({skin:SKINS[3], hair:HAIRS[5], shirt:"#2f5f8f", pants:"#b9a27a", long:true}), x:x-0.62, z:z, yaw:Math.PI/2, mode:"stand", job:"talk", held:"cup", dayOnly:true});
    crowdAdd(W, {look:look({female:true, h:0.95, skin:SKINS[1], hair:HAIRS[2], shirt:"#e8e4d8", pants:"#3b4a66"}), x:x+0.62, z:z+0.15, yaw:-Math.PI/2, mode:"stand", job:"talk", dayOnly:true}); }
  // washing his car in the drive of the ranch down from the park (its car, 14n, is in the drive by the house)
  { const cx=1267.0, cz=Z+HW+8.5;                                 // (14n's: the ranch's car in its drive, nose to the house)
    crowdAdd(Ea, {look:look({skin:SKINS[1], hair:HAIRS[4], shirt:"#b33a3a", pants:"#3b4a66", shorts:true}), x:cx+1.4, z:cz+0.4, yaw:-Math.PI/2, mode:"stand", job:"wash", held:"sponge", dayOnly:true});
    const bucket=propMesh(()=>{ ent(new T.CylinderGeometry(0.16, 0.13, 0.30, 14), 0, 0.15, 0, "#e6c21c"); }); bucket.position.set(cx+1.9, Y, cz+1.6); scene.add(bucket); }
  // the mail: from the cape at the end down its walk to the box and back
  { const h=H[4]; crowdAdd(Ea, {look:look({skin:SKINS[2], hair:HAIRS[4], shirt:"#6d7277", pants:"#24272c", long:true}), mode:"walk", path:[[h.x, h.zf+1.2, undefined, 6],[h.x+5.6, Z-HW-1.6, undefined, 4]], speed:1.0, dayOnly:true}); }
  // a jogger along the street's north side, and a woman walking her dog along the south, the other way
  crowdAdd(W, {look:look({h:1.03, skin:SKINS[4], hair:HAIRS[0], shirt:"#e6531c", pants:"#1d1f22", shorts:true, shoes:"#f2f0ea"}), mode:"walk", run:true, path:[[1070, Z-HW-0.9],[1462, Z-HW-0.9]], speed:2.9});
  crowdAdd(Ea, {look:look({female:true, h:0.96, skin:SKINS[0], hair:HAIRS[3], shirt:"#3d6e44", pants:"#2c3446", long:true}), mode:"walk", path:[[1440, Z+HW+0.9],[1080, Z+HW+0.9]], speed:1.15, dog:"#c8a060"});
  // a man in a lawn chair at the side of the ranch, a radio on the grass by him
  { const h=H[3], x=h.x1+2.0, z=h.zf+2.5;
    const chair=propMesh(()=>{ ent(new T.BoxGeometry(0.56, 0.04, 0.50), 0, 0.40, 0, "#3a7a5a"); ent(new T.BoxGeometry(0.56, 0.60, 0.04), 0, 0.70, -0.26, "#3a7a5a");
      for(const dx of [-0.27, 0.27]) for(const dz of [-0.22, 0.22]) ent(new T.CylinderGeometry(0.012, 0.012, 0.40, 5), dx, 0.20, dz, "#b8bcc0");
      ent(new T.BoxGeometry(0.28, 0.16, 0.10), 0.62, 0.08, 0.10, "#2a2a2c"); });
    crowdAdd(W, {look:look({skin:SKINS[1], hair:HAIRS[4], beard:"#8d8a86", shirt:"#e8e4d8", pants:"#6f7b86", cap:"#1f3b6e", belly:true}), x:x, z:z, yaw:Math.PI*0.85, mode:"sit", held:"can", drink:true, prop:chair, dayOnly:true, sway:0.3}); }
  // the park: an old couple along the shore path, a man on a bench with the paper, a fisherman off dock B,
  // a kid round the slide and his mother watching
  { const SPZ=SH+5.5;
    crowdAdd(PK, {look:look({h:0.98, skin:SKINS[0], hair:HAIRS[4], shirt:"#8a7a6a", pants:"#5c5a52", long:true}), mode:"walk", path:[[1246, SPZ+0.35],[1366, SPZ+0.35]], speed:0.8});
    crowdAdd(PK, {look:look({female:true, h:0.92, skin:SKINS[0], hair:HAIRS[4], shirt:"#9a6a8a", pants:"#6f7b86", long:true}), mode:"walk", path:[[1246, SPZ-0.35],[1366, SPZ-0.35]], speed:0.8});
    crowdAdd(PK, {look:look({skin:SKINS[3], hair:HAIRS[5], shirt:"#5d6a73", pants:"#24272c", long:true}), x:1276, z:SPZ-1.9+0.02, y:Terrain.groundAt(1276, SPZ-1.9), yaw:Math.PI, mode:"sit", sitY:0.47, held:"paper", heldL:true});
    crowdAdd(PK, {look:look({skin:SKINS[1], hair:HAIRS[2], shirt:"#7a8a5a", pants:"#5c5a52", long:true, cap:"#7a6a3a", beard:"#6b4a2b"}), x:1341.2, z:SH-16.7, y:WY+0.55, yaw:Math.PI, mode:"stand", job:"fish", held:"rod"});
    const sx=1348+3.2, sz=Z-HW-27, kid={h:0.62, skin:SKINS[2], hair:HAIRS[0], shirt:"#e6c21c", pants:"#2b3d63", shorts:true, shoes:"#c42a1a"};
    crowdAdd(PK, {look:look(kid), mode:"walk", run:true, loop:true, path:[[sx-1.0, sz-1.2],[sx+1.2, sz-1.0],[sx+1.2, sz+3.8],[sx-1.2, sz+3.8, undefined, 1.5],[sx-1.4, sz+0.4]], speed:1.9, dayOnly:true});
    crowdAdd(PK, {look:look({female:true, h:0.96, skin:SKINS[2], hair:HAIRS[0], shirt:"#2f5f8f", pants:"#3b4a66"}), x:sx-4.0, z:sz+5.5, yaw:Math.PI*0.75, mode:"stand", job:"watch", dayOnly:true}); }
})();

/* ---- Edinboro, at the exit ----------------------------------------------------
   At the fuel stop a man filling up at the pumps, a woman back out to her
   pickup with a coffee, another on his phone out front; at the Weir place
   Mrs Weir hanging out the wash. Out in the hay
   field north of the road a tractor and a round baler go up and down the
   windrows, stopping every so often to open the gate and drop a bale. */
(function edinboroFolk(){
  const E=EDIN, Y=E.y, Z=E.z;
  const look=(o)=>Object.assign({h:1.0, skin:SKINS[1], hair:HAIRS[1], shirt:"#4a6a8a", pants:"#3b4a66", shoes:"#2a2622"}, o);
  // the fuel stop: the car at the pumps (14k's), the man with the nozzle in its filler and the hose back to the pump
  { const G=crowdGroup("the fuel stop", -20, Z-35, 170);
    crowdAdd(G, {look:look({skin:SKINS[2], hair:HAIRS[5], shirt:"#6a7a4a", pants:"#3b4a66", cap:"#8a2418", long:true, beard:"#5a4a3a"}), x:-27.4, z:Z-28.45, yaw:Math.PI, mode:"stand", job:"pump", held:"nozzle"});
    const hose=new T.CatmullRomCurve3([V3(-27.78, Y+1.16, Z-26.80), V3(-27.70, Y+0.55, Z-27.30), V3(-27.45, Y+0.62, Z-28.20), V3(-27.22, Y+1.00, Z-28.95)]);
    const hm=new T.Mesh(new T.TubeGeometry(hose, 16, 0.016, 6, false), new T.MeshStandardMaterial({color:0x141414, roughness:0.6})); hm.castShadow=true; scene.add(hm);
    crowdAdd(G, {look:look({female:true, h:0.95, skin:SKINS[0], hair:HAIRS[3], shirt:"#c8a2b8", pants:"#2c3446", long:true}), mode:"walk", held:"cup",
                 path:[[-26.0, Z-48.5, undefined, 6],[-11.6, Z-48.2],[-8.4, Z-56.6, undefined, 12]], speed:1.05});
    crowdAdd(G, {look:look({skin:SKINS[3], hair:HAIRS[4], shirt:"#2a2a2c", pants:"#5c5a52", cap:"#1f3b6e"}), x:-17.6, z:Z-48.7, yaw:0.25, mode:"phone", sway:0.4}); }
  // the wash: at the clothesline behind the farmhouse (14k's), her basket at her feet
  { const G=crowdGroup("the Weir place", 140, Z+50, 170);
    crowdAdd(G, {look:look({female:true, h:0.95, skin:SKINS[0], hair:HAIRS[4], shirt:"#7a9ac8", pants:"#5c5a52", long:true}), x:124.8, z:Z+53.05, yaw:Math.PI, mode:"stand", job:"hang", held:"shirt", dayOnly:true});
    const basket=crowdProp((ent, B, C)=>{ B(0.56, 0.26, 0.40, 0, 0.13, 0, "#c8b08a"); B(0.50, 0.04, 0.34, 0, 0.27, 0, "#f2f0ea"); B(0.20, 0.06, 0.30, 0.08, 0.30, 0.02, "#3a5a8a"); });
    basket.position.set(125.65, Y+0.002, Z+53.45); basket.rotation.y=0.3; scene.add(basket); }

  /* the hay field (EDIN.fields[2]): its windrows run east and west, 5.5 m apart (08b's texture, from the field's south
     edge); the baler takes those clear of the bales already lying in the field, turning on the headlands */
  { const F=E.fields[2], G=crowdGroup("the hay field", (F.x0+F.x1)/2, (F.z0+F.z1)/2, 340), XA=F.x0+8, XB=F.x1-8;
    const rows=[];
    for(let n=1; n<40 && rows.length<14; n++){ const zr=F.z1-2.75-5.5*n; if(zr<F.z0+6) break;
      if(!COL.some(c=>c.x1>XA-6 && c.x0<XB+6 && c.z1>zr-1.9 && c.z0<zr+1.9 && c.y1>Y && c.y0<Y+2)) rows.push(zr); }
    if(rows.length%2) rows.pop();
    const pts=[];
    rows.forEach((zr,i)=>{ const e=i%2 ? -1 : 1, a=e>0 ? XA : XB, b=e>0 ? XB : XA;
      pts.push([a, zr], [a+e*(XB-XA)*0.36, zr, undefined, 7], [a+e*(XB-XA)*0.72, zr, undefined, 7], [b, zr]); });
    pts.push([XA-4, rows[rows.length-1]], [XA-4, rows[0]]);
    const path=crowdRound(pts, 2.75, true);
    // the tractor, its seat over the origin (the driver sits there) and its nose to +z; red, its wheels cream
    const RED="#a8261c", DK="#1d1d1e", CRM="#e8e2d0", GRN="#2f6a2a", YEL="#f2c418";
    const tractor=crowdProp((ent, B, C)=>{
      for(const sd of [-1,1]){ C(0.80, 0.42, sd*0.88, 0.80, 0.15, DK, 22, 0, 0, Math.PI/2); C(0.46, 0.44, sd*0.88, 0.80, 0.15, CRM, 16, 0, 0, Math.PI/2); C(0.12, 0.48, sd*0.88, 0.80, 0.15, "#3a3a3c", 8, 0, 0, Math.PI/2);
        B(0.52, 0.06, 1.25, sd*0.88, 1.66, 0.15, RED); B(0.04, 0.52, 1.25, sd*0.60, 1.38, 0.15, RED);
        C(0.40, 0.24, sd*0.66, 0.40, 2.25, DK, 18, 0, 0, Math.PI/2); C(0.22, 0.26, sd*0.66, 0.40, 2.25, CRM, 12, 0, 0, Math.PI/2);
        C(0.07, 0.06, sd*0.28, 1.45, 2.66, "#f4f2ec", 10, Math.PI/2); B(0.06, 0.06, 0.70, sd*0.40, 0.60, -0.60, DK); }
      C(0.11, 1.50, 0, 0.80, 0.15, DK, 10, 0, 0, Math.PI/2);
      B(0.76, 0.56, 1.10, 0, 0.67, 0.10, RED); B(1.16, 0.05, 1.00, 0, 0.955, -0.05, DK); B(0.12, 0.36, 0.12, 0, 1.14, 0.0, DK);
      B(0.46, 0.10, 0.42, 0, 1.33, 0.0, DK); B(0.46, 0.40, 0.08, 0, 1.58, -0.25, DK);
      B(0.62, 0.45, 1.80, 0, 0.62, 1.60, "#3a3a3c"); B(0.80, 0.78, 2.10, 0, 1.22, 1.55, RED); C(0.40, 2.10, 0, 1.58, 1.55, RED, 14, Math.PI/2);
      B(0.81, 0.06, 2.00, 0, 1.45, 1.55, CRM); B(0.74, 0.70, 0.04, 0, 1.20, 2.62, "#c8c4b8"); B(1.36, 0.12, 0.16, 0, 0.42, 2.25, DK);
      C(0.025, 0.65, 0, 1.535, 0.60, DK, 6, -0.484); ent(new T.TorusGeometry(0.19, 0.018, 6, 18), 0, 1.84, 0.44, DK, -1.086);
      for(const sd of [-1,1]) B(0.08, 1.50, 0.08, sd*0.62, 1.85, -0.42, DK);
      B(1.32, 0.08, 0.08, 0, 2.60, -0.42, DK); B(1.50, 0.05, 1.50, 0, 2.66, 0.20, CRM); C(0.06, 0.10, 0.60, 2.74, -0.40, "#f2a018", 10);
      C(0.05, 1.05, 0.32, 2.05, 2.25, DK, 8); C(0.06, 0.60, -0.30, 1.90, 2.20, DK, 8);
      B(0.12, 0.10, 1.00, 0, 0.52, -0.75, DK);
      // the baler behind, on its tongue: the pickup low at the front, the chamber, the gate (its own, below)
      B(0.14, 0.14, 1.16, 0, 0.71, -1.80, GRN, 0.332);
      B(2.30, 1.85, 1.05, 0, 1.30, -2.85, GRN); B(2.31, 0.10, 1.00, 0, 1.95, -2.85, YEL); B(2.10, 0.30, 0.55, 0, 0.32, -2.10, "#3a3a3c");
      for(let k=0;k<9;k++) B(0.02, 0.16, 0.10, -0.96+k*0.24, 0.16, -1.86, YEL);
      for(const sd of [-1,1]){ C(0.42, 0.30, sd*1.30, 0.42, -3.00, DK, 16, 0, 0, Math.PI/2); C(0.24, 0.32, sd*1.30, 0.42, -3.00, YEL, 10, 0, 0, Math.PI/2); } });
    const gate=new T.Group(); gate.position.set(0, 2.225, -3.375); tractor.add(gate);
    gate.add(crowdProp((ent, B, C)=>{ B(2.30, 1.85, 0.30, 0, -0.925, -0.15, GRN);
      ent(new T.CylinderGeometry(0.925, 0.925, 2.30, 18, 1, false, Math.PI/2, Math.PI), 0, -0.925, -0.30, GRN, 0, 0, Math.PI/2);
      B(2.31, 0.10, 0.28, 0, -0.30, -0.15, YEL);
      ent(new T.CircleGeometry(0.20, 3, Math.PI/2), 0, -0.925, -1.236, "#f26a1a", 0, Math.PI, 0); }));
    // the bales it drops: a few kept, the oldest taken up for the next; each solid where it lies
    const endTex=signTex(128, 128, (c,W,H)=>{ c.fillStyle="#b29a5a"; c.fillRect(0,0,W,H);
      c.strokeStyle="#8a7442"; c.lineWidth=3; for(let r=4;r<62;r+=5){ c.beginPath(); c.arc(W/2,H/2,r,0,7); c.stroke(); } });
    const sideM=new T.MeshStandardMaterial({color:0xb9a463, roughness:0.95}), endM=new T.MeshStandardMaterial({map:endTex, roughness:0.95});
    const BR=0.78, BL=1.25, side=new T.CylinderGeometry(BR, BR, BL, 18, 1, true), cap=new T.CircleGeometry(BR-0.004, 18);
    const bales=[];
    for(let k=0;k<16;k++){ const g=new T.Group(); g.add(new T.Mesh(side, sideM));
      for(const e of [-1,1]){ const m=new T.Mesh(cap, endM); m.position.y=e*BL/2; m.rotation.x=-e*Math.PI/2; g.add(m); }
      g.children.forEach(m=>{ m.castShadow=true; }); g.visible=false; scene.add(g);
      const col={x0:0, x1:0, z0:0, z1:0, y0:Y-0.3, y1:-9999}; COL_DYN.push(col); bales.push({g:g, col:col}); }
    let nb=0;
    const rig=addColOB(0, 0, 0, 1.40, 3.65, Y-0.3, Y+2.8, COL_DYN);
    const placeRig=(p)=>{ const s=Math.sin(p.yawS), c=Math.cos(p.yawS), cx=p.x-s*0.73, cz=p.z-c*0.73, o=_ob(cx, cz, p.yawS, 1.40, 3.65);
      rig.ob=o; rig.x0=cx-o.ex; rig.x1=cx+o.ex; rig.z0=cz-o.ez; rig.z1=cz+o.ez; };
    let smokeT=0;
    crowdAdd(G, {look:look({skin:SKINS[1], hair:HAIRS[4], shirt:"#8a3a2a", pants:"#3b4a66", cap:"#2f5a35", long:true, belly:true}), mode:"sit", job:"drive", sitY:1.40,
      path:path, loop:true, speed:2.8, prop:tractor, dayOnly:true, yAt:()=>Y+0.005,
      // he stops for anybody who walks up to the rig, and goes on when they have stepped back
      yield:(p)=>{ const s=Math.sin(p.yawS), c=Math.cos(p.yawS); return Math.hypot(player.pos.x-(p.x-s*0.73), player.pos.z-(p.z-c*0.73))<7.0; },
      onShow:(p, on)=>{ rig.y1=on ? Y+2.8 : -9999; },
      tick:(p, dt, moving)=>{
        placeRig(p); const s=Math.sin(p.yawS), c=Math.cos(p.yawS);
        // stopped on the row, the gate up and a bale rolled out the back
        const e=p.wait>0 ? 7-p.wait : 99;
        gate.rotation.x=1.25*smoothstep(0.5, 1.8, e)*(1-smoothstep(3.6, 5.0, e));
        if(e<99 && e>=2.0 && !p.bale){ p.bale=bales[nb%bales.length]; nb++; p.bale.g.visible=true; p.bale.col.y1=-9999; }
        if(p.bale){ const u=smoothstep(2.0, 3.0, e), lz=-3.35-1.40*u, ly=lerp(1.30, BR, u)+0.03*Math.sin(Math.PI*u);
          p.bale.g.position.set(p.x+s*lz, Y+ly, p.z+c*lz); p.bale.g.rotation.set(0, p.yawS, Math.PI/2);
          if(e>=3.0 || e>=99){ const ax=Math.abs(c)*BL/2+Math.abs(s)*BR, az=Math.abs(s)*BL/2+Math.abs(c)*BR, bx=p.bale.g.position.x, bz=p.bale.g.position.z;
            Object.assign(p.bale.col, {x0:bx-ax, x1:bx+ax, z0:bz-az, z1:bz+az, y1:Y+2*BR}); p.bale=null; } }
        // the stack's smoke, harder pulling away
        smokeT-=dt;
        if(smokeT<=0 && Math.hypot(camera.position.x-p.x, camera.position.z-p.z)<140){ smokeT=moving ? 0.12 : 0.35;
          const x=p.x+c*0.32+s*2.25, z=p.z-s*0.32+c*2.25;
          PUFFS.emit(x, Y+2.62, z, (Math.random()-0.5)*0.1, 0.55+Math.random()*0.2, (Math.random()-0.5)*0.1, 0.10, 0.8, 2.0, moving ? 0.22 : 0.12, 0.32, 0); } } }); }
})();
