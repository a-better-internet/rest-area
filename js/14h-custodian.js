"use strict";
/* REST AREA · 14h-custodian.js
   the custodian: rounds of the building with the cart, the stalls and the
   cans; the mowing in summer and the leaves in autumn; the cot at night
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14h · THE CUSTODIAN
   Terry works for the contractor and lives, near enough, in the garage
   (14g). Three times a day, on the times on the whiteboard in the office,
   Terry pushes the cart over from the garage, in at the back door, parks
   it in the lobby and does each restroom: any stall somebody has left in
   a state (09's MESS: the door held open, the brush, two flushes), then
   the cans, a fresh liner in each, and the bags back to the cart. A second
   mess in the building between rounds brings Terry over early. The bags go
   in the dumpster on the way back. In between: the bench, the coffee, the
   folding chair and the radio; on summer mornings and afternoons the
   zero-turn, lane after lane across the lawn south of the yard; in
   autumn the backpack blower along the loop walk behind the building, the
   leaves going up in front of it. At night, the cot, with the radio low.
   Everything here is steps on a queue: walk somewhere (in the garage by
   fixed points, outside over a grid of the lawns and the yard, inside over
   14b's grid of the building), do something there for a while, or decide
   the next few steps when the time comes (which stalls need it is only
   known on arrival).
   ---------------------------------------------------------------------- */
const CUST_ROUNDS=[6, 12, 18];
const CUST_CHORES=[[9.0, 11.7], [14.6, 17.7]];
const CUST_WAKE=4.9, CUST_SLEEP=22.6;
const CUST_LOG={men:[], women:[], tex:{}};

/* ---- outdoors: a grid over the lawns behind the building and the yard -- */
const _OG={x0:3.0, z0:-28, x1:45, z1:58, cs:0.4, nx:0, nz:0, ok:null};
function _ogBuild(){
  const G=_OG; G.nx=Math.round((G.x1-G.x0)/G.cs)+1; G.nz=Math.round((G.z1-G.z0)/G.cs)+1;
  G.ok=new Uint8Array(G.nx*G.nz);
  // not through the buildings: their doors are only ever gone through on purpose
  const inBldg=(x,z)=>(x>-6.4 && x<6.2 && Math.abs(z)<5.7) || (x>-5.4 && x<7.25 && Math.abs(z)>=5.3 && Math.abs(z)<14.9) ||
                      (x>GARAGE.x0-0.15 && x<GARAGE.x1+0.15 && z>GARAGE.z0-0.15 && z<GARAGE.z1+0.15);
  for(let j=0;j<G.nz;j++) for(let i=0;i<G.nx;i++){
    const x=G.x0+i*G.cs, z=G.z0+j*G.cs;
    if(inBldg(x,z)) continue;
    const y=groundY(x,z);
    let ok=!_staticHit(x,z,y,0.48);
    if(ok) for(const k of KEEP_OFF) if(x>k.x0-0.4 && x<k.x1+0.4 && z>k.z0-0.4 && z<k.z1+0.4){ ok=false; break; }
    G.ok[j*G.nx+i]=ok?1:0;
  }
}
// A* over a grid of cells (8 ways, no cutting corners), pulled straight where a line is clear
function _gridPath(G, ax, az, bx, bz){
  if(!G.ok) return [{x:bx, z:bz}];
  const cell=(x,z)=>{ const i=Math.round((x-G.x0)/G.cs), j=Math.round((z-G.z0)/G.cs); return (i<0||j<0||i>=G.nx||j>=G.nz)?-1:j*G.nx+i; };
  const near=(x,z)=>{ const c=cell(x,z); if(c>=0 && G.ok[c]) return c;
    let best=-1, bd=1e9; const i0=Math.round((x-G.x0)/G.cs), j0=Math.round((z-G.z0)/G.cs);
    for(let dj=-8;dj<=8;dj++) for(let di=-8;di<=8;di++){ const i=i0+di, j=j0+dj;
      if(i<0||j<0||i>=G.nx||j>=G.nz || !G.ok[j*G.nx+i]) continue; const d=di*di+dj*dj; if(d<bd){ bd=d; best=j*G.nx+i; } }
    return best; };
  const los=(ax,az,bx,bz)=>{ const d=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.ceil(d/(G.cs*0.4)));
    for(let k=0;k<=n;k++){ const c=cell(ax+(bx-ax)*k/n, az+(bz-az)*k/n); if(c<0 || !G.ok[c]) return false; } return true; };
  const s=near(ax,az), g=near(bx,bz);
  if(s<0 || g<0) return [{x:bx, z:bz}];
  const N=G.nx*G.nz, gs=new Float32Array(N).fill(1e9), from=new Int32Array(N).fill(-1), shut=new Uint8Array(N);
  const gi=g%G.nx, gj=(g/G.nx)|0, h=c=>{ const di=Math.abs(c%G.nx-gi), dj=Math.abs(((c/G.nx)|0)-gj); return Math.max(di,dj)+0.414*Math.min(di,dj); };
  const hc=[], hf=[];
  const hpush=(c,f)=>{ let i=hc.length; hc.push(c); hf.push(f);
    while(i>0){ const q=(i-1)>>1; if(hf[q]<=hf[i]) break; [hc[q],hc[i]]=[hc[i],hc[q]]; [hf[q],hf[i]]=[hf[i],hf[q]]; i=q; } };
  const hpop=()=>{ const c=hc[0], lc=hc.pop(), lf=hf.pop();
    if(hc.length){ hc[0]=lc; hf[0]=lf; let i=0;
      for(;;){ const l=i*2+1, r=l+1; let m=i; if(l<hc.length && hf[l]<hf[m]) m=l; if(r<hc.length && hf[r]<hf[m]) m=r;
        if(m===i) break; [hc[m],hc[i]]=[hc[i],hc[m]]; [hf[m],hf[i]]=[hf[i],hf[m]]; i=m; } }
    return c; };
  gs[s]=0; hpush(s, h(s));
  while(hc.length){
    const c=hpop(); if(c===g) break; if(shut[c]) continue; shut[c]=1;
    const ci=c%G.nx, cj=(c/G.nx)|0;
    for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){
      if(!di && !dj) continue;
      const i=ci+di, j=cj+dj; if(i<0||j<0||i>=G.nx||j>=G.nz) continue;
      const n=j*G.nx+i; if(!G.ok[n] || shut[n]) continue;
      if(di && dj && (!G.ok[cj*G.nx+i] || !G.ok[j*G.nx+ci])) continue;
      const ng=gs[c]+(di&&dj?1.414:1);
      if(ng<gs[n]){ gs[n]=ng; from[n]=c; hpush(n, ng+h(n)); }
    }
  }
  if(from[g]<0 && g!==s) return [{x:bx, z:bz}];
  const cells=[]; for(let c=g; c>=0; c=from[c]){ cells.push(c); if(c===s) break; }
  cells.reverse();
  const pt=c=>({x:G.x0+(c%G.nx)*G.cs, z:G.z0+((c/G.nx)|0)*G.cs});
  const out=[]; let cur={x:ax, z:az}, k=0;
  while(k<cells.length-1){ let far=k+1;
    for(let m=k+2;m<cells.length;m++){ const q=pt(cells[m]); if(los(cur.x,cur.z,q.x,q.z)) far=m; else break; }
    cur=pt(cells[far]); out.push(cur); k=far; }
  if(out.length) out.pop();
  out.push({x:bx, z:bz});
  return out;
}

/* ---- the restroom logs: a clipboard inside each door, a line a round ---- */
function _logDraw(room){
  const L=CUST_LOG[room], T0=CUST_LOG.tex[room]; if(!T0) return;
  const c=T0.image, x=c.getContext("2d"), W=c.width, H=c.height;
  x.fillStyle="#7a5a3a"; x.fillRect(0,0,W,H); x.fillStyle="#f6f4ec"; x.fillRect(W*0.06,H*0.08,W*0.88,H*0.89);
  x.fillStyle="#9aa0a2"; x.fillRect(W*0.32,0,W*0.36,H*0.08);
  x.fillStyle="#1a1a1a"; fitText(x,"RESTROOM CHECKED",W*0.8,H*0.05,W/2,H*0.14,"700");
  fitText(x,"TIME        BY",W*0.7,H*0.035,W/2,H*0.21,"600");
  x.strokeStyle="#c9c6be"; x.lineWidth=1;
  for(let i=0;i<10;i++){ const y=H*(0.27+i*0.07); x.beginPath(); x.moveTo(W*0.1,y); x.lineTo(W*0.9,y); x.stroke(); }
  x.fillStyle="#1d3b8a";
  L.slice(-9).forEach((s,i)=>{ x.save(); x.translate(W*0.5, H*(0.255+i*0.07)); x.rotate((i%3-1)*0.02); fitText(x,s,W*0.74,H*0.045,0,0,"500","'Comic Sans MS', 'Segoe Print', cursive"); x.restore(); });
  T0.needsUpdate=true;
}
(function logs(){
  for(const [room,sg] of [["men",-1],["women",1]]){
    const c=cvs(256,384), t=setSRGB(new T.CanvasTexture(c)); CUST_LOG.tex[room]=t;
    signPanel(0.30, 0.45, t, 2.72, FL+1.48, sg*5.65+sg*0.016, sg<0?Math.PI:0);
    CUST_LOG[room]=["6:04 AM   T.K.","12:11 PM   T.K.","6:09 PM   T.K.","6:02 AM   T.K.","12:20 PM   T.K."].slice(0,2+((Math.random()*3)|0));
    _logDraw(room);
  }
})();
function _clock(h){ const hh=Math.floor(h), mm=Math.floor((h-hh)*60), ap=hh<12?"AM":"PM", h12=((hh+11)%12)+1;
  return h12+":"+(mm<10?"0":"")+mm+" "+ap; }

/* ---- Terry --------------------------------------------------------------- */
const CUST=(function(){
  const P=buildPerson({h:1.01, skin:SKINS[1], hair:HAIRS[4], shirt:"#4a5664", pants:"#5c5a52", shoes:"#3a2a1a", long:true, cap:"#2f5a35"});
  const sp=P.B[P.j.spine], E=[];
  // a vest in safety green, its silver stripes, and a name on the shirt
  for(const sd of [-1,1]){
    _ge(E, boxGeo(0.31, 0.40, 0.012, 0), 0, 0.28, sd*0.106, "#b8d43a");
    for(const y of [0.18, 0.30]) _ge(E, boxGeo(0.32, 0.035, 0.014, 0), 0, y, sd*0.108, "#d8dcdc"); }
  for(const sd of [-1,1]) _ge(E, boxGeo(0.012, 0.36, 0.20, 0), sd*0.165, 0.30, 0, "#b8d43a");
  const vest=new T.Mesh(mergeEntries(E), _GAR_MAT); vest.castShadow=true; sp.add(vest);
  const nt=signTex(128,48,(c,W,H)=>{ c.fillStyle="#f2f0ea"; c.fillRect(0,0,W,H); c.fillStyle="#b3151b"; fitText(c,"TERRY",W*0.8,H*0.6,W/2,H/2,"700"); });
  const tag=new T.Mesh(new T.PlaneGeometry(0.08,0.03), new T.MeshStandardMaterial({map:nt, roughness:0.7}));
  tag.position.set(0.07, 0.42, 0.115); sp.add(tag);
  // ear defenders, for the mower and the blower
  const ears=new T.Group();
  for(const sd of [-1,1]){ const m=new T.Mesh(new T.CylinderGeometry(0.045,0.045,0.04,12), new T.MeshStandardMaterial({color:0xd84a1a, roughness:0.6}));
    m.rotation.z=Math.PI/2; m.position.set(sd*0.115, 0.16, 0.0); ears.add(m); }
  const band=new T.Mesh(new T.TorusGeometry(0.12, 0.012, 5, 14, Math.PI), new T.MeshStandardMaterial({color:0x1d1d1e}));
  band.position.set(0, 0.17, 0); ears.add(band);
  ears.visible=false; P.B[P.j.head].add(ears);
  // what is in the hand: a bag, or the brush
  const bag=new T.Mesh(new T.IcosahedronGeometry(0.17, 1), new T.MeshStandardMaterial({color:0x1d1d1e, roughness:0.35, metalness:0.1}));
  bag.scale.set(1, 1.35, 1); bag.position.set(0, -0.40, 0.02); bag.visible=false; P.B[P.j.elR].add(bag);
  const brush=new T.Group();
  { const s=new T.Mesh(new T.CylinderGeometry(0.010,0.010,0.38,6), new T.MeshStandardMaterial({color:0xe9e6dc})); s.position.y=-0.40; brush.add(s);
    const b=new T.Mesh(new T.SphereGeometry(0.05,8,6), new T.MeshStandardMaterial({color:0xe9e6dc, roughness:0.9})); b.position.y=-0.60; brush.add(b); }
  brush.visible=false; P.B[P.j.elR].add(brush);
  const home=GARAGE_RT.cart.home;
  const mug=new T.Mesh(new T.CylinderGeometry(0.042,0.038,0.10,12), new T.MeshStandardMaterial({color:0x2a5d9a, roughness:0.4}));
  mug.position.set(0, -0.30, 0.05); mug.rotation.x=-1.2; mug.visible=false; P.B[P.j.elL].add(mug);
  const p={kind:"custom", cust:true, mug:mug, lit:true, doorsUp:true, radioLow:false, P:P, x:37.0, z:34.6, y:FL, yaw:Math.PI/2, ph:0, seed:4.2, v:{col:null},
           q:[], step:null, mode:"idle", act:null, t:0, pushing:false, riding:false, holdDoor:null, walking:false,
           ears:ears, bag:bag, brush:brush, day:0, lastH:-1, done:{}, lastRoundH:-99, talkN:0, msg:0};
  p.upd=_custUpdate;
  PEOPLE.push(p);
  // the cart's place: Terry pushes it from its handle, a metre behind its middle
  const C=GARAGE_RT.cart; C.home={x:38.4, z:33.7, yaw:Math.PI/2}; C.x=38.4; C.z=33.7; C.yaw=Math.PI/2; _cartPlace(C);
  // talk: a use that goes where Terry goes
  p.use=addUse(p.x, p.z, p.y, "TALK TO TERRY", ()=>_custTalk(p), 1.4, ()=>p.P.g.visible);
  p.use.pri=true;
  return p;
})();

/* ---- the cart and the mower follow ------------------------------------- */
function _cartPlace(C){
  C.g.position.set(C.x, C.y, C.z); C.g.rotation.y=C.yaw;
  const c=Math.cos(C.yaw), s=Math.sin(C.yaw);
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(const [lx,lz] of [[-0.30,-0.66],[0.30,-0.66],[-0.30,0.98],[0.30,0.98]]){
    const x=C.x+lx*c+lz*s, z=C.z-lx*s+lz*c; x0=Math.min(x0,x); x1=Math.max(x1,x); z0=Math.min(z0,z); z1=Math.max(z1,z); }
  Object.assign(C.col, {x0:x0, x1:x1, z0:z0, z1:z1, y0:C.y-0.5, y1:C.y+1.1});
  C.bag.visible=C.bags>0; C.bag.scale.setScalar(0.16+Math.min(4,C.bags)*0.035); C.bag.position.set(0.02, 0.92+Math.min(4,C.bags)*0.02, 0.32);
}
function _mowerPlace(M){
  M.g.position.set(M.x, M.y, M.z); M.g.rotation.y=M.yaw;
  Object.assign(M.col, {x0:M.x-0.95, x1:M.x+0.95, z0:M.z-0.95, z1:M.z+0.95, y0:M.y-0.5, y1:M.y+1.75});
}

/* ---- planning: what to do next ------------------------------------------ */
const _G=()=>GARAGE_RT;
// the way between two places, by where they are
function _custPath(p, to){
  const inG=(x,z)=>x>GARAGE.x0 && x<GARAGE.x1 && z>GARAGE.z0 && z<GARAGE.z1;
  const inB=(x,z)=>x>-5.7 && x<5.75 && Math.abs(z)<14.2;
  const M=_G().man, BD={out:{x:6.75, z:1.69}, in:{x:5.0, z:1.69}};
  const legs=[]; let cx=p.x, cz=p.z;
  const add=pts=>{ for(const q of pts){ legs.push(q); cx=q.x; cz=q.z; } };
  // out of where you are
  if(inG(cx,cz) && !inG(to.x,to.z)){ add([{x:M.in.x+0.6, z:M.in.z}, M.in, M.out, {x:M.out.x-1.2, z:M.out.z}]); }
  else if(inB(cx,cz) && !inB(to.x,to.z)){ add(_igPath(cx,cz,BD.in.x-0.6,BD.in.z)); add([BD.in, BD.out, {x:BD.out.x+1.2, z:BD.out.z}]); }
  // across
  if(inG(to.x,to.z) && !inG(cx,cz)){ add(_gridPath(_OG, cx, cz, M.out.x-1.2, M.out.z)); add([M.out, M.in, {x:M.in.x+0.6, z:M.in.z}, to]); }
  else if(inB(to.x,to.z) && !inB(cx,cz)){ add(_gridPath(_OG, cx, cz, BD.out.x+1.2, BD.out.z)); add([BD.out, BD.in, {x:BD.in.x-0.6, z:BD.in.z}]); add(_igPath(BD.in.x-0.6, BD.in.z, to.x, to.z)); }
  else if(inB(to.x,to.z)) add(_igPath(cx, cz, to.x, to.z));
  else if(inG(to.x,to.z)) add([to]);
  else add(_gridPath(_OG, cx, cz, to.x, to.z));
  return legs;
}
const _fwd=(yaw,d)=>({x:Math.sin(yaw)*d, z:Math.cos(yaw)*d});
function _push(p, s){ p.q.push(s); }
// the round
function _planRound(p, why){
  const C=_G().cart, H=DayNight.state.hour;
  p.mode="round"; p.lastRoundH=H; p.why=why;
  const g=_fwd(C.yaw, -1.0);
  _push(p, {k:"go", to:{x:C.x+g.x, z:C.z+g.z}});
  _push(p, {k:"face", yaw:C.yaw});
  _push(p, {k:"grab"});
  _push(p, {k:"go", to:{x:1.6+1.0, z:-4.25}, cart:true});
  _push(p, {k:"face", yaw:-Math.PI/2});
  _push(p, {k:"leave"});
  _push(p, {k:"call", fn:()=>_planRoom(p, "men")});
  _push(p, {k:"call", fn:()=>{ const c=_G().cart, g2=_fwd(c.yaw,-1.0); p.q.unshift({k:"go", to:{x:c.x+g2.x, z:c.z+g2.z}}, {k:"face", yaw:c.yaw}, {k:"grab"},
      {k:"go", to:{x:3.0, z:-1.2}, cart:true}, {k:"go", to:{x:3.4, z:3.25}, cart:true}, {k:"face", yaw:-Math.PI/2}, {k:"leave"},
      {k:"call", fn:()=>_planRoom(p, "women")},
      {k:"call", fn:()=>{ const c2=_G().cart, g3=_fwd(c2.yaw,-1.0); p.q.unshift({k:"go", to:{x:c2.x+g3.x, z:c2.z+g3.z}}, {k:"face", yaw:c2.yaw}, {k:"grab"},
          {k:"go", to:{x:23.0, z:39.0}, cart:true}, {k:"face", yaw:Math.PI/2}, {k:"leave"},
          {k:"go", to:_G().dumpster.stand}, {k:"face", yaw:Math.PI/2}, {k:"do", act:"toss", dur:2.6},
          {k:"call", fn:()=>{ const c3=_G().cart, g4=_fwd(c3.yaw,-1.0); p.q.unshift({k:"go", to:{x:c3.x+g4.x, z:c3.z+g4.z}}, {k:"face", yaw:c3.yaw}, {k:"grab"},
              {k:"go", to:{x:C.home.x-1.0, z:C.home.z}, cart:true}, {k:"face", yaw:C.home.yaw}, {k:"leave"}, {k:"call", fn:()=>{ p.mode="idle"; }}); }}); }}); }});
}
// one restroom: its dirty stalls, then its cans, then the lobby's on that side
function _planRoom(p, room){
  const R=RESTROOMS[room], sg=room==="men"?-1:1, steps=[];
  for(const st of R.stalls) if(st.mess) steps.push({k:"stall", st:st});
  steps.push({k:"can", x:2.89, z:sg*8.3, at:{x:2.2, z:sg*8.3}, yaw:Math.PI/2});
  steps.push({k:"can", x:2.89, z:sg*10.25, at:{x:2.25, z:sg*10.25}, yaw:Math.PI/2});
  if(room==="men") steps.push({k:"can", x:-1.7, z:-4.9, at:{x:-1.7, z:-4.18}, yaw:Math.PI});
  else { steps.push({k:"can", x:0.9, z:4.85, at:{x:0.9, z:4.15}, yaw:0}); steps.push({k:"can", x:3.62, z:4.88, at:{x:3.62, z:4.18}, yaw:0}); }
  steps.push({k:"call", fn:()=>{ CUST_LOG[room].push(_clock(DayNight.state.hour)+"   T.K."); _logDraw(room); }});
  // the cans one after another, the bags carried, and all of them into the cart at the end
  const out=[], C=_G().cart;
  const a=0;                       // the cart's south side: in the men's lobby the open side, in the women's the side the cans are on
  for(const s of steps){
    if(s.k==="can") out.push({k:"go", to:s.at}, {k:"face", yaw:s.yaw}, {k:"do", act:"can", dur:4.0});
    else if(s.k==="call") out.push({k:"go", to:{x:C.x+Math.sin(a)*0.75, z:C.z+Math.cos(a)*0.75}}, {k:"face", yaw:a+Math.PI}, {k:"do", act:"drop", dur:1.4}, s);
    else out.push(s);
  }
  p.q.unshift(...out);
}
// the mowing: the lanes not yet done, from the mower and back to it
function _planMow(p){
  const M=_G().mower;
  p.mode="mow";
  _push(p, {k:"go", to:{x:M.home.x+0.2, z:M.home.z+1.25}});
  _push(p, {k:"mount"});
  _push(p, {k:"mow"});
  _push(p, {k:"dismount"});
  _push(p, {k:"call", fn:()=>{ p.mode="idle"; }});
}
function _planBlow(p){
  const B=_G().blower;
  p.mode="blow";
  _push(p, {k:"go", to:B.hook.stand});
  _push(p, {k:"face", yaw:B.hook.face});
  _push(p, {k:"takeBlower"});
  _push(p, {k:"blow"});
  _push(p, {k:"go", to:B.hook.stand});
  _push(p, {k:"face", yaw:B.hook.face});
  _push(p, {k:"hangBlower"});
  _push(p, {k:"call", fn:()=>{ p.mode="idle"; }});
}
// the bay doors' switch, inside by the second bay
const _DOOR_SW={x:33.25, z:32.45, yaw:-Math.PI/2};
function _planSleep(p){
  const c=_G().cot, onCot=typeof seated!=="undefined" && seated && Math.hypot(seated.x-c.x, seated.z-c.z)<1.2;
  p.mode="sleep";
  // the doors down first, then the lights, then the cot
  if(p.doorsUp){ _push(p, {k:"go", to:_DOOR_SW}); _push(p, {k:"face", yaw:_DOOR_SW.yaw}); _push(p, {k:"do", act:"switch", dur:1.6, doors:false}); }
  _push(p, {k:"call", fn:()=>{ p.lit=false; p.radioLow=true; }});
  if(onCot){ const ch=_G().chair; _push(p, {k:"go", to:{x:ch.x, z:ch.z-0.55}}); _push(p, {k:"face", yaw:Math.PI}); _push(p, {k:"do", act:"doze", dur:1e9, x:ch.x, z:ch.z}); }
  else { _push(p, {k:"go", to:c.stand}); _push(p, {k:"face", yaw:0}); _push(p, {k:"do", act:"sleep", dur:1e9}); }
}
/* the morning: up off the cot in the dark, face in the hands, the boots;
   up, the lights, a stretch; the coffee maker, and a wait for it, and a
   mug poured; the radio up, the doors up; and a while in the chair with
   the mug before the round */
function _planMorning(p, fromChair){
  const G=_G(), c=G.cot, ch=G.chair, R=G.radio;
  p.mode="morning";
  if(!fromChair){ _push(p, {k:"do", act:"situp", dur:5.5}); _push(p, {k:"do", act:"boots", dur:7}); }
  _push(p, {k:"call", fn:()=>{ p.x=c.stand.x; p.z=c.stand.z; p.yaw=0; p.lit=true; }});
  _push(p, {k:"do", act:"stretch", dur:3.4});
  _push(p, {k:"go", to:G.coffee}); _push(p, {k:"face", yaw:0});
  _push(p, {k:"do", act:"brew", dur:9, sound:true});
  _push(p, {k:"do", act:"pour", dur:3.2});
  _push(p, {k:"go", to:{x:R.x-0.85, z:R.z}}); _push(p, {k:"face", yaw:Math.PI/2});
  _push(p, {k:"do", act:"radio", dur:1.8});
  _push(p, {k:"go", to:_DOOR_SW}); _push(p, {k:"face", yaw:_DOOR_SW.yaw});
  _push(p, {k:"do", act:"switch", dur:1.6, doors:true});
  _push(p, {k:"go", to:{x:ch.x, z:ch.z-0.55}}); _push(p, {k:"face", yaw:Math.PI});
  _push(p, {k:"do", act:"chair", dur:26+Math.random()*10, x:ch.x, z:ch.z});
  _push(p, {k:"call", fn:()=>{ p.mode="idle"; }});
}
// awake, at the garage, nothing due: one of the small things
function _planIdle(p){
  const r=Math.random(), G=_G();
  if(r<0.35){ _push(p, {k:"go", to:{x:39.85, z:34.3}}); _push(p, {k:"face", yaw:Math.PI/2}); _push(p, {k:"do", act:"bench", dur:18+Math.random()*20}); }
  else if(r<0.6){ _push(p, {k:"go", to:G.coffee}); _push(p, {k:"face", yaw:0}); _push(p, {k:"do", act:"coffee", dur:8+Math.random()*6}); }
  else if(r<0.85){ const ch=G.chair; _push(p, {k:"go", to:{x:ch.x, z:ch.z-0.55}}); _push(p, {k:"face", yaw:Math.PI}); _push(p, {k:"do", act:"chair", dur:20+Math.random()*25, x:ch.x, z:ch.z}); }
  else { _push(p, {k:"go", to:{x:32.0, z:30.3}}); _push(p, {k:"face", yaw:-Math.PI/2}); _push(p, {k:"do", act:"look", dur:10+Math.random()*10}); }
}
// is anything due? (only asked between things, at the garage)
function _custDecide(p, dark){
  const H=DayNight.state.hour, G=_G(), awake=!(H>=CUST_SLEEP || H<CUST_WAKE);
  if(!awake){ _planSleep(p); return; }
  for(const R of CUST_ROUNDS) if(H>=R && H<R+1.5 && !p.done[R]){ p.done[R]=1; _planRound(p, "rounds"); return; }
  // called over: two messes waiting, and the next round not close
  let n=0; for(const k of ["men","women"]) for(const st of RESTROOMS[k].stalls) if(st.mess) n++;
  const next=CUST_ROUNDS.find(R=>R>H)||30;
  if(n>=2 && next-H>1.2 && H-p.lastRoundH>1.2){ _planRound(p, "called"); return; }
  for(const [a,b] of CUST_CHORES) if(H>=a && H<b-0.25 && !p.done["c"+a]){
    p.done["c"+a]=1;
    if(typeof WEATHER!=="undefined" && WEATHER.rain>0.25) break;                 // not in the rain
    if(FOREST.isAutumn()) _planBlow(p); else _planMow(p);
    return; }
  _planIdle(p);
}

/* ---- never stuck, never round in circles ----------------------------------
   Every walk Terry takes goes through _walk, which watches the distance
   still to go. Held up by you is not stuck. Six seconds with no headway and
   the way is found again from where Terry is; twice more and the point in
   the way is given up for the next; and if a walk has taken far longer than
   it should, and nobody is near enough to see, Terry is simply there. */
function _pathLeft(p){
  let d=0, x=p.x, z=p.z;
  for(let i=p.pi;i<p.path.length;i++){ const q=p.path[i]; d+=Math.hypot(q.x-x, q.z-z); x=q.x; z=q.z; }
  return d;
}
function _walk(p, dt, speed){
  let W=p.guard;
  if(!W || W.path!==p.path){ W=p.guard={path:p.path, best:1e9, t:0, tries:0, total:0, budget:14+_pathLeft(p)/speed*2.5}; }
  if(_stepWalker(p, dt, speed)){ p.guard=null; return true; }
  const left=_pathLeft(p), you=!driving && !droneMode && Math.hypot(player.pos.x-p.x, player.pos.z-p.z)<2.0;
  W.total+=dt;
  if(left<W.best-0.35){ W.best=left; W.t=0; } else if(!you) W.t+=dt;
  const end=p.path[p.path.length-1];
  if(W.t>6){
    W.t=0; W.tries++; W.best=1e9;
    CUST_STATS.log.push((W.tries<2?"replan":"skip")+" @"+p.x.toFixed(1)+","+p.z.toFixed(1)+" to "+end.x.toFixed(1)+","+end.z.toFixed(1)+" pi"+p.pi+"/"+p.path.length+" "+(p.step?p.step.k:"")+(p.pushing?" PUSH":""));
    if(CUST_STATS.log.length>40) CUST_STATS.log.shift();
    if(W.tries<=2){ const P=_custPath(p, end); CUST_STATS.replans++; if(P.length){ p.path=P; p.pi=0; p.wpT=0; p.stuck=0; W.path=p.path; } }
    else if(p.pi<p.path.length-1){ p.pi++; p.wpT=0; p.stuck=0; }
    else W.total=W.budget+1;
  }
  if(W.total>W.budget && (p.cd>16 || W.total>W.budget*2)){
    p.x=end.x; p.z=end.z; p.y=surfaceY(p.x, p.z, p.y+0.4); p.pi=p.path.length; p.guard=null;
    CUST_STATS.snaps++; CUST_STATS.log.push("SNAP to "+end.x.toFixed(1)+","+end.z.toFixed(1)); return true; }
  return false;
}
const CUST_STATS={snaps:0, replans:0, log:[]};

/* ---- the steps ------------------------------------------------------------ */
function _custStart(p, s){
  p.t=0; p.act=null;
  if(s.k==="go"){ p.path=_custPath(p, s.to); p.pi=0; p.wpT=0; p.walking=true; p.stuck=0; }
  else if(s.k==="grab"){ const C=_G().cart; p.pushing=true; p.v.col=C.col; }
  else if(s.k==="leave"){ p.pushing=false; p.v.col=null; }
  else if(s.k==="stall"){
    const st=s.st;
    if(!st.mess || (st.busy && st.busy!==p) || _youAt(st.inside.x, st.inside.z, 0.7)){ s.skip=true; return; }
    st.busy=p; st.door.occ=true; st.door.occBy=p; p.holdDoor=st.door;
    p.path=_igPath(p.x, p.z, st.front.x, st.front.z).concat([st.mouth, st.inside]); p.pi=0; p.wpT=0; p.walking=true; s.ph=0;
  }
  else if(s.k==="mount"){ const M=_G().mower; p.riding=true; p.v.col=M.col; p.ears.visible=true; }
  else if(s.k==="dismount"){ const M=_G().mower, f=_fwd(M.yaw+Math.PI/2, 1.05); p.riding=false; p.v.col=null; p.ears.visible=false;
    p.x=M.x+f.x; p.z=M.z+f.z; p.y=surfaceY(p.x, p.z, M.y+0.4); }
  else if(s.k==="takeBlower"){ const B=_G().blower; B.g.userData.tube.rotation.x=0; p.P.g.add(B.g); B.g.position.set(0, 1.18, -0.17); B.g.rotation.set(0,0,0); p.ears.visible=true; }
  else if(s.k==="hangBlower"){ const B=_G().blower, h=B.hook; p.P.g.remove(B.g); scene.add(B.g); B.g.position.set(h.x, h.y, h.z); B.g.rotation.set(0, h.yaw, 0);
    B.g.userData.tube.rotation.x=1.5; p.ears.visible=false; _G().engine=null; }
  else if(s.k==="mow") _mowStart(p, s);
  else if(s.k==="blow") _blowStart(p, s);
  else if(s.k==="do"){ p.act=s.act; p.x0=p.x; p.z0=p.z; }
}
// a step's work; true when it is done
function _custStep(p, s, dt, now){
  p.t+=dt;
  if(s.k==="go"){
    if(!p.path.length) return true;
    if(p.pushing && !driving && !droneMode){ const C=_G().cart, f=_fwd(p.yaw, 0.9);
      if(Math.hypot(player.pos.x-(C.x+f.x), player.pos.z-(C.z+f.z))<1.0 && Math.abs(player.feetY-p.y)<1.2){ p.moving=false; return false; } }
    return _walk(p, dt, p.pushing?1.15:1.4);
  }
  if(s.k==="face"){ let d=s.yaw-p.yaw; while(d>Math.PI) d-=Math.PI*2; while(d<-Math.PI) d+=Math.PI*2;
    p.yaw+=d*Math.min(1, dt*5); return Math.abs(d)<0.05 || p.t>1.5; }
  if(s.k==="call"){ s.fn(); return true; }
  if(s.k==="grab"||s.k==="leave"||s.k==="mount"||s.k==="dismount"||s.k==="takeBlower"||s.k==="hangBlower") return p.t>0.6;
  if(s.k==="stall") return _stallStep(p, s, dt);
  if(s.k==="mow") return _mowStep(p, s, dt, now);
  if(s.k==="blow") return _blowStep(p, s, dt, now);
  if(s.k==="do"){
    const a=s.act;
    if(a==="can"){ if(p.t>2.6 && !s.got){ s.got=1; p.bag.visible=true; p.carry=(p.carry||0)+1; } }
    if(a==="drop"){ if(p.t>0.8 && p.bag.visible){ p.bag.visible=false; const C=_G().cart; C.bags+=p.carry||1; p.carry=0; _cartPlace(C); } }
    if(a==="toss"){ if(p.t>1.4 && _G().cart.bags>0){ const C=_G().cart; C.bags=0; _cartPlace(C);
      if(typeof AUDIO!=="undefined") AUDIO.blip("thump", _G().dumpster.x, _G().dumpster.z); } }
    if(a==="sleep"||a==="doze"){
      const H=DayNight.state.hour;
      if(H>=CUST_WAKE && H<CUST_SLEEP){ p.done={}; p.q.length=0; _planMorning(p, a==="doze"); return true; }   // morning: a new day's list
      return false; }
    if(a==="brew" && !s.gurgle && p.t>2.2){ s.gurgle=1; if(typeof AUDIO!=="undefined") AUDIO.blip("gurgle", p.x, p.z); }
    if(a==="pour" && !s.poured && p.t>0.6){ s.poured=1; p.poured=true; p.mug.visible=true; if(typeof AUDIO!=="undefined") AUDIO.blip("pour", p.x, p.z); }
    if(a==="radio" && p.t>0.9) p.radioLow=false;
    if(a==="switch" && p.t>0.8 && p.doorsUp!==s.doors){ p.doorsUp=s.doors; if(typeof AUDIO!=="undefined") AUDIO.blip("tick", p.x, p.z); }
    if(a==="chair" && p.t>s.dur-0.5){ p.mug.visible=false; p.poured=false; }
    return p.t>s.dur;
  }
  return true;
}
// a stall: in through the held door, at it with the brush, two flushes, out
function _stallStep(p, s, dt){
  const st=s.st;
  if(s.skip) return true;
  if(s.ph===0){ if(_walk(p, dt, 1.15)){ s.ph=1; p.t=0; p.act="scrub"; p.brush.visible=true; p.walking=false; } return false; }
  if(s.ph===1){
    let d=(st.yaw+Math.PI)-p.yaw; while(d>Math.PI) d-=Math.PI*2; while(d<-Math.PI) d+=Math.PI*2; p.yaw+=d*Math.min(1,dt*5);
    p.x+=(st.inside.x-p.x)*Math.min(1,dt*3); p.z+=(st.inside.z-p.z)*Math.min(1,dt*3);
    if(p.t>3.0 && !s.f1){ s.f1=1; if(typeof AUDIO!=="undefined" && AUDIO.flush) AUDIO.flush(st.tx, st.dz); }
    if(p.t>9.0 && !s.f2){ s.f2=1; st.mess=false; st.messMesh.visible=false; if(typeof AUDIO!=="undefined" && AUDIO.flush) AUDIO.flush(st.tx, st.dz); }
    if(p.t>11.0){ s.ph=2; p.act=null; p.brush.visible=false; p.path=[st.mouth, st.front]; p.pi=0; p.wpT=0; p.walking=true; }
    return false; }
  if(_walk(p, dt, 1.0)){ st.busy=null; st.door.occ=false; st.door.occBy=null; p.holdDoor=null; return true; }
  return false;
}
// when a step is dropped (a new plan) whatever it held is let go
function _custAbandon(p){
  const s=p.step; if(!s) return;
  if(s.k==="stall" && !s.skip){ const st=s.st; if(st.busy===p) st.busy=null; if(st.door.occBy===p){ st.door.occ=false; st.door.occBy=null; } p.holdDoor=null; p.brush.visible=false; }
}

/* ---- mowing: lanes north and south across the lawn below the yard -------- */
const CUST_MOW={x0:8.6, x1:21.6, z0:25.0, z1:56.5, lane:1.1, next:0, lanes:null};
function _mowLanes(){
  const L=[], M=CUST_MOW;
  const free=(x,z)=>!_staticHit(x,z,groundY(x,z),1.0) && !KEEP_OFF.some(k=>x>k.x0-0.8 && x<k.x1+0.8 && z>k.z0-0.8 && z<k.z1+0.8);
  for(let x=M.x0; x<=M.x1+0.01; x+=M.lane){
    // the longest clear run of the lane
    let best=null, cur=null;
    for(let z=M.z0; z<=M.z1+0.01; z+=0.5){ if(free(x,z)){ if(!cur) cur={a:z, b:z}; else cur.b=z; } else { if(cur && (!best || cur.b-cur.a>best.b-best.a)) best=cur; cur=null; } }
    if(cur && (!best || cur.b-cur.a>best.b-best.a)) best=cur;
    if(best && best.b-best.a>4) L.push({x:x, a:best.a+0.4, b:best.b-0.4});
  }
  return L;
}
function _mowStart(p, s){
  const M=_G().mower;
  if(!CUST_MOW.lanes) CUST_MOW.lanes=_mowLanes();
  // out of the bay, round to the first lane not yet cut, along it and the ones after
  const pts=[{x:M.home.x-3.2, z:M.home.z}, {x:29.6, z:M.home.z}];
  s.route=pts; s.ri=0; s.lane=CUST_MOW.next; s.ph="out"; s.end=false;
  _G().engine={kind:"mower", x:M.x, z:M.z, on:true};
}
function _mowTarget(s){
  const L=CUST_MOW.lanes;
  if(s.ph==="out"){ if(s.ri<s.route.length) return s.route[s.ri]; s.ph="go"; s.gpath=null; }
  if(s.ph==="go"){ const ln=L[s.lane % L.length], up=(s.lane%2)===0;
    if(!s.gpath){ const M=_G().mower; s.gpath=_gridPath(_OG, M.x, M.z, ln.x, up?ln.a:ln.b); s.gi=0; }
    if(s.gi<s.gpath.length) return s.gpath[s.gi];
    s.ph="lane"; s.li=0; }
  if(s.ph==="lane"){ const ln=L[s.lane % L.length], up=(s.lane%2)===0;
    const P=up ? [{x:ln.x, z:ln.a}, {x:ln.x, z:ln.b}] : [{x:ln.x, z:ln.b}, {x:ln.x, z:ln.a}];
    if(s.li<P.length) return P[s.li];
    s.lane++; CUST_MOW.next=s.lane; s.li=0;
    if(s.end){ s.ph="home"; s.gpath=null; }
    else { const n=L[s.lane % L.length], u2=(s.lane%2)===0;           // over to the next: pivot and go
      s.ph="lane"; return {x:n.x, z:u2?n.a:n.b}; } }
  if(s.ph==="home"){ const M=_G().mower;
    if(!s.gpath){ s.gpath=_gridPath(_OG, M.x, M.z, 29.6, M.home.z).concat([{x:M.home.x-0.6, z:M.home.z}]); s.gi=0; }
    if(s.gi<s.gpath.length) return s.gpath[s.gi];
    s.ph="park"; }
  return null;
}
function _mowStep(p, s, dt, now){
  const M=_G().mower, H=DayNight.state.hour;
  // the window shuts, or rain, or a round is due: finish the lane and go in
  const due=CUST_ROUNDS.some(R=>H>=R && H<R+1.5 && !p.done[R]);
  if(!s.end && (!CUST_CHORES.some(([a,b])=>H>=a && H<b) || due || (typeof WEATHER!=="undefined" && WEATHER.rain>0.3))) s.end=true;
  if(s.end && (s.ph==="out"||s.ph==="go")){ s.ph="home"; s.gpath=null; }
  let tgt=_mowTarget(s);
  if(s.ph==="park"){
    // pivot to face out of the bay, and stop
    let d=M.home.yaw-M.yaw; while(d>Math.PI) d-=Math.PI*2; while(d<-Math.PI) d+=Math.PI*2;
    M.yaw+=Math.sign(d)*Math.min(Math.abs(d), dt*1.6); M.x+=(M.home.x-M.x)*Math.min(1,dt*2); M.z+=(M.home.z-M.z)*Math.min(1,dt*2);
    _mowerPlace(M); _custOnMower(p, M);
    if(Math.abs(d)<0.03){ _G().engine=null; return true; }
    return false; }
  if(!tgt) return true;
  const dx=tgt.x-M.x, dz=tgt.z-M.z, d=Math.hypot(dx,dz);
  const key=tgt.x.toFixed(1)+","+tgt.z.toFixed(1);
  if(s.tg!==key){ s.tg=key; s.tgT=0; } else s.tgT+=dt;
  if(d<0.35 || s.tgT>Math.max(20, d/1.2+12)){ if(s.ph==="out") s.ri++; else if(s.ph==="go"||s.ph==="home") s.gi++; else s.li++; return false; }
  // stop for anybody in front of it
  const ahead=(q)=>{ const ax=q.x-M.x, az=q.z-M.z, ad=Math.hypot(ax,az); return ad<3.2 && (ax*Math.sin(M.yaw)+az*Math.cos(M.yaw))>-0.3; };
  let hold=!driving && !droneMode && ahead(player.pos);
  if(!hold) for(const q of PEOPLE) if(q!==p && q.P && q.P.g.visible && Math.abs(q.y-M.y)<1.5 && ahead(q)){ hold=true; break; }
  let want=Math.atan2(dx,dz), dy=want-M.yaw; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2;
  const turn=Math.sign(dy)*Math.min(Math.abs(dy), dt*(s.ph==="lane"?2.2:1.8));
  M.yaw+=turn;
  const sp=hold ? 0 : (Math.abs(dy)>0.35 ? 0 : (s.ph==="lane"?2.2:2.6))*Math.min(1, d/1.2+0.3);
  M.x+=Math.sin(M.yaw)*sp*dt; M.z+=Math.cos(M.yaw)*sp*dt;
  M.y=surfaceY(M.x, M.z, M.y+0.4);
  for(const t of M.tyres) t.rotation.x+=sp*dt/0.29;
  _mowerPlace(M); _custOnMower(p, M);
  const E=_G().engine; if(E){ E.x=M.x; E.z=M.z; E.load=sp>0.2 && s.ph==="lane" ? 1 : 0.4; }
  // the clippings, out of the chute on the right
  if(sp>0.5 && s.ph==="lane" && Math.random()<dt*14){
    const cx=M.x+Math.sin(M.yaw-Math.PI/2)*0.85, cz=M.z+Math.cos(M.yaw-Math.PI/2)*0.85;
    PUFFS.emit(cx, M.y+0.2, cz, Math.sin(M.yaw-Math.PI/2)*1.2+(Math.random()-0.5)*0.3, 0.15, Math.cos(M.yaw-Math.PI/2)*1.2+(Math.random()-0.5)*0.3,
               0.12, 0.6, 1.2, 0.20, 0.5, 0); }
  return false;
}
function _custOnMower(p, M){
  const f=_fwd(M.yaw, -0.18);
  p.x=M.x+f.x; p.z=M.z+f.z; p.y=M.y+0.24; p.yaw=M.yaw;
}

/* ---- the leaves: up and down the loop walk behind the building ------------ */
const CUST_BLOW=[{x:12.2,z:19.6},{x:15.6,z:10},{x:16.8,z:0},{x:15.8,z:-10},{x:12.2,z:-19.6},{x:4,z:-20.8},{x:-3.5,z:-19.4}];
const BLOWN=(function(){
  const N=70, g=new T.PlaneGeometry(0.07, 0.05);
  const m=new T.MeshStandardMaterial({color:0xffffff, side:T.DoubleSide, roughness:0.9, vertexColors:false});
  const im=new T.InstancedMesh(g, m, N); im.instanceMatrix.setUsage(T.DynamicDrawUsage); im.frustumCulled=false;
  const cols=["#b5651d","#c9a02a","#8a3a1a","#d8b040","#a0521c","#6a4a2a"];
  for(let i=0;i<N;i++) im.setColorAt(i, new T.Color(cols[i%cols.length]));
  const L=[]; for(let i=0;i<N;i++) L.push({x:0,y:-9,z:0, vx:0,vy:0,vz:0, rx:0,ry:0,rz:0, w:0, life:0});
  scene.add(im);
  im.visible=false;
  return {im:im, L:L, next:0, d:new T.Object3D(), live:false};
})();
function _leafKick(x, y, z, vx, vz){
  const A=BLOWN, l=A.L[A.next]; A.next=(A.next+1)%A.L.length;
  l.x=x; l.y=y; l.z=z; l.vx=vx; l.vy=1.2+Math.random()*1.8; l.vz=vz; l.rx=Math.random()*6; l.ry=Math.random()*6; l.rz=Math.random()*6;
  l.w=(Math.random()-0.5)*14; l.life=2.5+Math.random()*2.5; A.live=true;
}
function _leavesUpdate(dt){
  const A=BLOWN; let any=false;
  if(!A.live) return;
  for(let i=0;i<A.L.length;i++){ const l=A.L[i];
    if(l.life>0){ any=true; l.life-=dt;
      const gy=groundY(l.x,l.z)+0.01;
      l.vy-=dt*3.2; l.vx*=1-dt*1.2; l.vz*=1-dt*1.2; l.vy=Math.max(l.vy,-0.9);
      l.x+=l.vx*dt; l.y+=l.vy*dt; l.z+=l.vz*dt;
      if(l.y<gy){ l.y=gy; l.vx*=0.5; l.vz*=0.5; l.w*=0.6; l.vy=0; }
      l.rx+=l.w*dt; l.rz+=l.w*0.6*dt; }
    A.d.position.set(l.x, l.life>0?l.y:-50, l.z); A.d.rotation.set(l.rx, l.ry, l.rz); A.d.updateMatrix();
    A.im.setMatrixAt(i, A.d.matrix); }
  A.im.visible=any; A.im.instanceMatrix.needsUpdate=true; A.live=any;
}
function _blowStart(p, s){
  // out to the walk and along it, slowly, there and back
  const pts=CUST_BLOW.slice(); s.pts=pts.concat(pts.slice(0,-1).reverse()); s.i=0; s.ph="to"; s.path=null;
  _G().engine={kind:"blower", x:p.x, z:p.z, on:false};
}
function _blowStep(p, s, dt, now){
  const H=DayNight.state.hour, E=_G().engine;
  const due=CUST_ROUNDS.some(R=>H>=R && H<R+1.5 && !p.done[R]);
  if(s.ph==="to"){
    if(!s.path){ p.path=_custPath(p, s.pts[0]); p.pi=0; p.wpT=0; s.path=true; p.walking=true; }
    if(_walk(p, dt, 1.4)){ s.ph="blow"; s.i=1; p.path=[s.pts[1]]; p.pi=0; }
    return false; }
  if(s.ph==="blow"){
    if(!CUST_CHORES.some(([a,b])=>H>=a && H<b) || due || s.i>=s.pts.length){ if(E) E.on=false; return true; }
    if(E){ E.on=true; E.x=p.x; E.z=p.z; }
    if(_walk(p, dt, 0.55)){ s.i++; if(s.i<s.pts.length){ p.path=[s.pts[s.i]]; p.pi=0; } }
    // the nozzle sweeps; the leaves and the dust go up ahead of it
    const sw=Math.sin(now*1.3+p.seed)*0.6, a=p.yaw+sw, nx=p.x+Math.sin(a)*1.0, nz=p.z+Math.cos(a)*1.0;
    p.sweep=sw;
    if(Math.random()<dt*9){ const gy=groundY(nx,nz);
      _leafKick(nx+(Math.random()-0.5)*0.6, gy+0.05, nz+(Math.random()-0.5)*0.6, Math.sin(a)*(2+Math.random()*2.5)+(Math.random()-0.5), Math.cos(a)*(2+Math.random()*2.5)+(Math.random()-0.5)); }
    if(Math.random()<dt*6){ const gy=groundY(nx,nz);
      PUFFS.emit(nx, gy+0.15, nz, Math.sin(a)*1.4, 0.18, Math.cos(a)*1.4, 0.25, 1.4, 1.8, 0.16, 0.55, 0); }
    return false; }
  return true;
}

/* ---- each frame ----------------------------------------------------------- */
function _custUpdate(p, dt0, now, dark, cd){
  const P=p.P, G=_G(), H=DayNight.state.hour;
  p.cd=cd;
  const dt=dt0*(cd>75 && !(p.step && p.step.k==="stall") ? 3 : 1);
  if(p.lastH>=0 && H<p.lastH-12){ p.day++; p.done={}; }                       // past midnight: today's list is new
  p.lastH=H;
  // next step, when the last is done; something to do, when there is nothing
  if(!p.step){
    p.step=p.q.shift()||null;
    if(!p.step && p.mode==="idle"){ _custDecide(p, dark); p.step=p.q.shift()||null; }
    if(p.step) _custStart(p, p.step);
  }
  if(p.step){
    // a round due cuts an idle step short (not one under way: those finish)
    if(p.mode==="idle" && p.step.k==="do" && p.t>2 && (CUST_ROUNDS.some(R=>H>=R && H<R+1.5 && !p.done[R]) || H>=CUST_SLEEP || H<CUST_WAKE)){
      p.step=null; p.q.length=0; p.act=null; }
    else if(_custStep(p, p.step, dt, now)){ p.step=null; p.walking=false; p.act=null; }
  }
  // the cart, pushed from its handle
  const C=G.cart;
  if(p.pushing){ C.yaw=p.yaw; const f=_fwd(p.yaw, 1.0); C.x=p.x+f.x; C.z=p.z+f.z; C.y=surfaceY(C.x, C.z, p.y+0.3); _cartPlace(C); }
  // the garage: doors up while Terry is up, lights on while there or dark out
  const inG=p.x>GARAGE.x0 && p.x<GARAGE.x1 && p.z>GARAGE.z0 && p.z<GARAGE.z1;
  for(const D of G.doors){ if(D.userT>0){ D.userT-=dt; continue; } D.want = p.doorsUp ? 0.14 : D.top-FL; }
  G.lightsWant = p.lit && (inG || dark>0.4);
  if(G.radio) G.radio.low = !!p.radioLow;
  _leavesUpdate(dt);
  // the talk prompt follows
  p.use.x=p.x; p.use.z=p.z; p.use.y=p.y-(p.riding?0.24:0);
  // and the body
  P.g.visible=true;
  if(cd<70) _custPose(p, now);
  P.g.position.set(p.x, p.y, p.z); P.g.rotation.order="YXZ"; P.g.rotation.y=p.yaw;
  if(p.act==="sleep"){ const c=G.cot; P.g.position.set(c.x0+1.86, c.y+0.10, c.z); P.g.rotation.y=Math.PI/2; P.g.rotation.x=-Math.PI/2; }
  else if(p.act==="situp"||p.act==="boots"){ const c=G.cot; P.g.position.set(c.x-0.25, FL, c.z-0.16); P.g.rotation.y=Math.PI; P.g.rotation.x=0; }
  else P.g.rotation.x=0;
  if(p.act!=="chair" && p.act!=="coffee" && p.act!=="pour" && !(p.mode==="morning" && p.poured)) p.mug.visible=false;
}
function _custPose(p, now){
  const P=p.P, B=P.B, J=P.j, a=p.act, t=p.t;
  if(p.riding){ poseP(P, "sit", 0, now); B[J.root].position.y=0.50;
    B[J.knL].rotation.x=B[J.knR].rotation.x=1.1;
    B[J.shL].rotation.set(-0.75, 0, 0.12); B[J.shR].rotation.set(-0.75, 0, -0.12); B[J.elL].rotation.x=B[J.elR].rotation.x=-0.55;
    B[J.head].rotation.y=Math.sin(now*0.4+p.seed)*0.35; return; }
  const st=p.step, onFoot=st && (st.k==="go" || st.k==="blow" || (st.k==="stall" && st.ph!==1 && !st.skip));
  if(onFoot){
    poseP(P, p.moving?"walk":"stand", p.ph, now);
    if(p.pushing){ B[J.shL].rotation.set(-0.85, 0, 0.10); B[J.shR].rotation.set(-0.85, 0, -0.10); B[J.elL].rotation.x=B[J.elR].rotation.x=-0.42; B[J.spine].rotation.x=0.10; }
    if(p.step && p.step.k==="blow" && p.step.ph==="blow"){
      // the tube in the hand on that side, swinging; the other hand at the strap
      B[J.shL].rotation.set(-0.30, -(p.sweep||0)*0.6, 0.25); B[J.elL].rotation.x=-0.85;
      B[J.shR].rotation.set(-0.5, 0, -0.1); B[J.elR].rotation.x=-1.9; B[J.head].rotation.y=(p.sweep||0)*0.5; B[J.head].rotation.x=0.18; }
    if(p.bag.visible){ B[J.shR].rotation.set(0.05, 0, -0.12); B[J.elR].rotation.x=-0.1; }
    return; }
  if(a==="sleep"){ poseP(P, "stand", 0, now); B[J.head].rotation.set(-0.15, 0.45, 0); B[J.spine].rotation.y=0;
    B[J.shL].rotation.set(0.05, 0, -0.10); B[J.shR].rotation.set(0.05, 0, 0.10); B[J.elL].rotation.x=B[J.elR].rotation.x=-0.25;
    B[J.knL].rotation.x=0.25; B[J.hpL].rotation.x=-0.15; return; }
  if(a==="doze"||a==="chair"){ const st=p.step; p.x+=(st.x-p.x)*0.2; p.z+=(st.z-p.z)*0.2; p.y=FL;
    poseP(P, "sit", 0, now); B[J.root].position.y=0.47;
    if(a==="doze"){ B[J.head].rotation.set(0.55, 0.2, 0); B[J.shL].rotation.x=B[J.shR].rotation.x=-0.3; B[J.elL].rotation.x=B[J.elR].rotation.x=-1.2; }
    else { p.mug.visible=true; const sip=smoothstep(0.75,0.95,Math.sin(now*0.35+p.seed));    // the mug: a sip now and then
      B[J.shL].rotation.set(-0.55-sip*0.35, 0, 0.12); B[J.elL].rotation.x=-1.25-sip*0.75; B[J.head].rotation.x=0.08-sip*0.25; }
    return; }
  // the morning, on the edge of the cot: face in the hands, then the boots
  if(a==="situp"||a==="boots"){ poseP(P, "sit", 0, now); B[J.root].position.y=0.47; B[J.head].rotation.y=0;
    if(a==="situp"){ const k=1-smoothstep(2.4,3.4,t);
      B[J.shL].rotation.set(-0.45-k*1.05, 0, 0.12+k*0.18); B[J.shR].rotation.set(-0.45-k*1.05, 0, -0.12-k*0.18);
      B[J.elL].rotation.x=B[J.elR].rotation.x=-0.6-k*1.5; B[J.head].rotation.x=0.15+k*0.3+Math.sin(now*1.7)*0.04*k; B[J.spine].rotation.x=0.18+k*0.12; }
    else { const w=Math.sin(t*5.5), side=Math.floor(t/3.5)%2;
      B[J.spine].rotation.x=0.78; B[J.head].rotation.x=0.35;
      B[J.shL].rotation.set(-0.95+(side?0:w*0.18), 0, 0.10); B[J.shR].rotation.set(-0.95+(side?w*0.18:0), 0, -0.10);
      B[J.elL].rotation.x=B[J.elR].rotation.x=-0.25;
      (side?B[J.knR]:B[J.knL]).rotation.x=1.15; }
    return; }
  poseP(P, "stand", 0, now);
  if(a==="scrub"){ const s=Math.sin(now*7)*0.22;
    B[J.spine].rotation.x=0.62; B[J.head].rotation.x=0.35; B[J.hpL].rotation.x=B[J.hpR].rotation.x=-0.35; B[J.knL].rotation.x=B[J.knR].rotation.x=0.42;
    B[J.root].position.y=P.HIP-0.06; B[J.shR].rotation.set(-0.95+s, 0, -0.05); B[J.elR].rotation.x=-0.35-s*0.5;
    B[J.shL].rotation.set(-0.25, 0, 0.2); B[J.elL].rotation.x=-0.9; return; }
  if(a==="can"||a==="drop"||a==="toss"){ const u=t/(p.step?p.step.dur:1), bend=Math.sin(Math.min(1,u)*Math.PI);
    B[J.spine].rotation.x=0.75*bend; B[J.head].rotation.x=0.3*bend; B[J.hpL].rotation.x=B[J.hpR].rotation.x=-0.3*bend; B[J.knL].rotation.x=B[J.knR].rotation.x=0.45*bend;
    B[J.root].position.y=P.HIP-0.08*bend;
    if(a==="toss"){ B[J.shR].rotation.set(-1.4*bend-0.2, 0, -0.1); B[J.elR].rotation.x=-0.6; B[J.spine].rotation.x=0.2*bend; B[J.root].position.y=P.HIP; }
    else { B[J.shR].rotation.set(-0.85*bend, 0, -0.08); B[J.shL].rotation.set(-0.85*bend, 0, 0.08); B[J.elL].rotation.x=B[J.elR].rotation.x=-0.3*bend; }
    return; }
  if(a==="bench"){ B[J.spine].rotation.x=0.22; B[J.head].rotation.x=0.40; const s=Math.sin(now*2.2)*0.12;
    B[J.shR].rotation.set(-0.7+s, 0, -0.1); B[J.elR].rotation.x=-0.9; B[J.shL].rotation.set(-0.6, 0, 0.1); B[J.elL].rotation.x=-0.8; return; }
  if(a==="coffee"){ p.mug.visible=true; const sip=smoothstep(0.7,0.95,Math.sin(now*0.5+p.seed));
    B[J.shL].rotation.set(-0.55-sip*0.35, 0, 0.12); B[J.elL].rotation.x=-1.25-sip*0.75; B[J.head].rotation.y*=0.4; B[J.head].rotation.x=-sip*0.25; return; }
  if(a==="stretch"){ const k=Math.sin(Math.min(1,t/3.2)*Math.PI);
    B[J.shL].rotation.set(-2.85*k, 0, 0.35*k); B[J.shR].rotation.set(-2.85*k, 0, -0.35*k); B[J.elL].rotation.x=B[J.elR].rotation.x=-0.2*k;
    B[J.spine].rotation.x=-0.14*k; B[J.head].rotation.set(-0.32*k, 0, 0); return; }
  if(a==="brew"){ const reach=1-smoothstep(1.2,1.9,t);      // the switch on, then arms folded, watching it drip
    B[J.shR].rotation.set(-1.15*reach-0.45*(1-reach), 0, -0.4*(1-reach)); B[J.elR].rotation.x=-0.3*reach-1.65*(1-reach);
    B[J.shL].rotation.set(-0.45*(1-reach), 0, 0.4*(1-reach)); B[J.elL].rotation.x=-1.65*(1-reach);
    B[J.head].rotation.set(0.22, Math.sin(now*0.3)*0.15*(1-reach), 0); return; }
  if(a==="pour"){ const tip=smoothstep(0.6,1.2,t)*(1-smoothstep(2.4,2.9,t));
    B[J.shR].rotation.set(-1.05, 0, -0.15); B[J.elR].rotation.set(-0.55, 0, 0); B[J.shR].rotation.z=-0.15-tip*0.5;
    B[J.shL].rotation.set(-0.95, 0, 0.25); B[J.elL].rotation.x=-0.75; B[J.head].rotation.x=0.3; B[J.spine].rotation.x=0.06; return; }
  if(a==="radio"||a==="switch"){ const k=Math.sin(Math.min(1,t/(p.step?p.step.dur:1.5))*Math.PI);
    B[J.shR].rotation.set(-1.25*k, 0, -0.05); B[J.elR].rotation.x=-0.25*k; B[J.spine].rotation.x=0.10*k; B[J.head].rotation.x=0.1*k; return; }
  if(a==="look"){ B[J.shL].rotation.z=-0.25; B[J.shR].rotation.z=0.25; B[J.elL].rotation.x=B[J.elR].rotation.x=-1.6; B[J.shL].rotation.x=B[J.shR].rotation.x=-0.25; return; }
}

/* ---- what Terry has to say ------------------------------------------------ */
function _custTalk(p){
  const s=p.step, a=p.act, n=p.talkN++, H=DayNight.state.hour;
  const pick=L=>L[n%L.length];
  let line;
  if(a==="sleep") line=pick(["TERRY IS ASLEEP ON THE COT WITH THEIR BOOTS ON. THE RADIO IS STILL GOING, LOW",
                             "A SNORE. TERRY ROLLS OVER TO FACE THE WALL. YOU LET THEM BE"]);
  else if(a==="doze") line="TERRY IS ASLEEP IN THE FOLDING CHAIR, SINCE SOMEBODY IS ON THE COT";
  else if(p.riding) line=pick(["TERRY WAVES FROM THE MOWER AND TAPS THE EAR DEFENDERS. CAN'T HEAR A THING",
                               "TERRY THROTTLES DOWN. “TWICE A WEEK IN JUNE. IT GROWS WHILE YOU WATCH.” AND BACK UP AGAIN"]);
  else if(s && s.k==="blow") line=pick(["THE BLOWER DROPS TO AN IDLE. “THEY JUST COME RIGHT BACK DOWN, YOU KNOW.” IT REVS UP AGAIN",
                                        "“OAKS HOLD ON TILL NOVEMBER. THEN IT'S EVERY DAY.”"]);
  else if(a==="scrub") line=pick(["“DON'T COME IN HERE. TRUST ME.”","“SOMEBODY ATE SOMETHING AT THE SHEETZ THEY SHOULDN'T HAVE.”"]);
  else if(a==="can"||a==="drop") line=pick(["“FOUR BAGS A ROUND IN SUMMER. TWO IN WINTER. PEOPLE EAT IN THE CAR WHEN IT'S COLD.”",
                                            "“YOU WOULDN'T BELIEVE WHAT GOES IN THESE. A WHOLE TURKEY, ONCE. CHRISTMAS EVE.”"]);
  else if(p.mode==="round") line=pick([p.why==="called" ? "“GOT A CALL. TWO OF THEM, ALREADY. THIS PLACE.”" : "“CAN'T STOP, I'M ON MY ROUND.”",
                                       "“WOMEN'S IS WORSE THAN THE MEN'S, IF YOU CAN BELIEVE IT.”",
                                       MESS.cleaned>0 ? "“SOMEBODY CLEANED UP A STALL BEFORE I GOT TO IT. WAS THAT YOU? HUH. THANKS.”" : "“MIND THE FLOOR, IT'S WET.”"]);
  else if(a==="coffee"||a==="chair") line=pick(["“COFFEE'S OLD BUT IT'S HOT. HELP YOURSELF.”","“THIRTY-ONE YEARS AT THIS STOP. THEY KEEP CHANGING THE CONTRACTOR. NOT ME.”",
                                               "“YOU WALK OUT TO THAT OLD PLACE IN THE WOODS? DON'T GO UPSTAIRS. THE FLOOR'S GONE.”"]);
  else if(a==="bench") line=pick(["“MOWER BLADE. HIT A ROCK BY THE DOG AREA AGAIN.”","“HAND ME THAT NINE-SIXTEENTHS? NO, THE OTHER ONE.”"]);
  else line=pick([H<12 ? "“MORNING.” A NOD, AND ON." : H<18 ? "“AFTERNOON.” A NOD, AND ON." : "“EVENING. DRIVE SAFE.”",
                  "“THE KIDS OUT AT THE FIRE AGAIN? TROOPER ASKS ME EVERY WEEK.”"]);
  toast(line, "#cfe0d4");
}
