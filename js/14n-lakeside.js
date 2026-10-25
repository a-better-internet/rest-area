"use strict";
/* REST AREA · 14n-lakeside.js
   the end of the road east: a street of houses along the lake, the
   township's park on the shore with its docks, and the lake itself
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14n · LAKE STREET, LAKESIDE PARK, AND EDINBORO LAKE

   THE STREET (EAST.town). Where the woods give out, US 6N runs on between
   two rows of houses set back on mown lots, the lake behind the ones on
   the north side. The four the street is built from, in their colours:
   a cape cod with two dormers, a little deck at its door and a gravel
   drive; a red brick ranch with its garage at one end, a picnic table and
   a kettle grill out back; a bungalow with its gable to the road, a porch
   across the front, shutters and a barn star; and a two-storey house in
   grey with green trim and a carport over a concrete drive. Each with its
   mailbox at the road, its drive and its car (you can drive them), its
   trees and shrubs, a porch light, and the windows lit at night behind the
   curtains. In the yards what people keep in yards: a swing set, a shed,
   kayaks on a rack, a boat on a trailer, a fire ring with chairs round it
   looking at the water, a basketball hoop over a garage door.

   THE PARK (EAST.park). Off the road, a lot with its stalls angled toward
   the water; the lawn going down to the shore under a few big trees; a
   paved path along the water with benches on it; a pavilion with picnic
   tables; swings and a slide; and two docks out into the lake with the
   pontoon boats tied up at them. You can walk out on the docks.

   THE LAKE. From the shore it opens out north and east most of a mile to
   the far woods, a few cottages over there along the edge, a sailboat out
   in the middle, a fisherman sitting still. Geese on the lawn and on the
   water. Nobody swims: there's a sign.
   ---------------------------------------------------------------------- */
const LAKESIDE={water:null, boats:[], geese:[], t:0};
(function lakeside(){
  const E=EDIN, A=EAST, Z=E.z, Y=E.y, HW=E.hw, TW=A.town, PK=A.park, SH=A.shore, WY=A.wy, r=_trng(8181);
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,rx,rz)=>ent(boxGeo(w,h,d),x,y,z,c,rx,ry,rz);
  const RB=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03, Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0);
  const C=(rad,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||roundSegs(rad)),x,y,z,c,rx,ry,rz);
  const tubeE=(a,b,rad,c)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,10), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(x,s,cx,cy,w,h,col,weight,family)=>{ x.fillStyle=col; fitText(x,s,w,h,cx,cy,weight||"700",family); };
  const sizeAll=(x, L, maxW, size, weight, family)=>{ let s=Math.min(size, x.canvas.height*0.62);
    for(const t of L){ for(;;){ x.font=weight+" "+s+"px "+family; if(x.measureText(t).width<=Math.min(maxW, x.canvas.width*0.84) || s<=7) break; s-=1; } }
    return s; };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*400), Math.round((cw||w*400)*h/w), draw), px,py,pz,ry,lit);
  const gy=(x,z)=>Terrain.groundAt(x,z);
  const tree=(sp, x, z, s)=>{ FOREST.plant(sp, x, z, {scale:s}); const rr=0.24*s, g=gy(x,z); addCol(x-rr, x+rr, z-rr, z+rr, g-0.5, g+6); };
  const shrub=(x, z, s)=>FOREST.plant("shrub", x, z, {scale:s, solid:false});
  const flat=(bk, x0,x1,z0,z1, y, color, uv)=>{ const w=x1-x0, d=z1-z0, g=new T.PlaneGeometry(w,d), U=g.attributes.uv, s=uv||0.5, ou=r()*50, ov=r()*50;
    for(let i=0;i<U.count;i++) U.setXY(i, ou+U.getX(i)*w*s, ov+U.getY(i)*d*s);
    push(bk, g, (x0+x1)/2, y, (z0+z1)/2, 0, color, -Math.PI/2, 0); };
  const W=(x0,x1,z0,z1)=>addCol(Math.min(x0,x1), Math.max(x0,x1), Math.min(z0,z1), Math.max(z0,z1), -40, 300);

  /* ---- the textures and the windows -------------------------------------------------------------------------- */
  const tileT=(w,h,draw)=>{ const t=signTex(w,h,draw); t.wrapS=t.wrapT=T.RepeatWrapping; return t; };
  // vinyl lap siding, eight courses to the tile, each with its shadow line; white, tinted per house
  bucketOf("lk_lap", ()=>new T.MeshStandardMaterial({roughness:0.62, map:tileT(128, 128, (c,Wc,H)=>{ const q=_trng(4711);
    c.fillStyle="#f4f2ee"; c.fillRect(0,0,Wc,H);
    for(let k=0;k<8;k++){ const y=k*16; const g=c.createLinearGradient(0,y,0,y+16); g.addColorStop(0,"rgba(0,0,0,0.20)"); g.addColorStop(0.18,"rgba(0,0,0,0.02)"); g.addColorStop(1,"rgba(255,255,255,0.06)");
      c.fillStyle=g; c.fillRect(0,y,Wc,16); c.fillStyle="rgba(0,0,0,0.28)"; c.fillRect(0,y,Wc,1.5); }
    for(let k=0;k<120;k++){ c.fillStyle="rgba(120,110,95,0.07)"; c.fillRect(q()*Wc, q()*H, 6+q()*14, 1); } })}));
  // the curtains behind the glass and a lamp on somewhere in the room: what the window shows, lit or not
  const winTex=(lit)=>signTex(64, 64, (c,Wc,H)=>{ const g=c.createRadialGradient(Wc/2,H*0.6,4,Wc/2,H*0.6,Wc*0.7);
    if(lit){ g.addColorStop(0,"#ffe2b0"); g.addColorStop(1,"#a8743e"); } else { g.addColorStop(0,"#3a4448"); g.addColorStop(1,"#1a2024"); }
    c.fillStyle=g; c.fillRect(0,0,Wc,H);
    c.fillStyle=lit ? "rgba(255,246,230,0.75)" : "rgba(200,196,186,0.55)"; c.fillRect(0,0,Wc*0.22,H); c.fillRect(Wc*0.78,0,Wc*0.22,H);
    c.fillStyle="rgba(0,0,0,0.18)"; for(let k=0;k<4;k++){ c.fillRect(k*3.5+2,0,1,H); c.fillRect(Wc-k*3.5-3,0,1,H); }
    c.fillStyle=lit ? "rgba(255,246,230,0.6)" : "rgba(200,196,186,0.45)"; c.fillRect(0,0,Wc,H*0.12); });
  bucketOf("lk_win", ()=>{ const t=winTex(true); return envOut(glowMat({color:0x9aa4a8, map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:0.26, roughness:0.12, metalness:0.30}, "night", null), 0.75); });
  bucketOf("lk_wind", ()=>envOut(new T.MeshStandardMaterial({color:0x9aa4a8, map:winTex(false), roughness:0.10, metalness:0.35}), 0.85));
  bucketOf("lk_porch", ()=>emitMat(0xffd9a0, 0.9, "night", null));
  // the docks' boards: pressure-treated pine gone grey, the grain and the nail lines in it
  bucketOf("lk_deck", ()=>new T.MeshStandardMaterial({roughness:0.85, map:tileT(128, 128, (c,Wc,H)=>{ const q=_trng(2468);
    c.fillStyle="#b4ada0"; c.fillRect(0,0,Wc,H);
    for(let k=0;k<60;k++){ c.strokeStyle="rgba(70,62,52,"+(0.08+q()*0.14).toFixed(2)+")"; c.lineWidth=1+q()*1.5; const y=q()*H; c.beginPath(); c.moveTo(0,y); c.lineTo(Wc,y+(q()-0.5)*5); c.stroke(); }
    for(let k=0;k<30;k++){ c.fillStyle="rgba(60,52,44,0.35)"; c.fillRect(q()*Wc, q()*H, 2, 2); }
    for(let k=0;k<8;k++){ c.fillStyle="rgba(255,250,240,"+(0.04+q()*0.08).toFixed(2)+")"; c.fillRect(0, q()*H, Wc, 2+q()*5); } })}));

  /* ---- a house ------------------------------------------------------------------------------------------------
     Built in world terms, square to the street: footprint x0..x1 along it, the front wall's face at zf, the house
     going back D metres away from the road (f is the way the front faces: +1 to +z, -1 to -z). A face is named
     F, K (the back), L (the low-x end) or R; a point on one is (u along it, y, d out from it). */
  function house(o){
    const f=o.f, x0=o.x-o.W/2, x1=o.x+o.W/2, zf=o.zf, zb=zf-f*o.D, z0=Math.min(zf,zb), z1=Math.max(zf,zb), zm=(z0+z1)/2;
    const T0=0.2, FF=Y+(o.ff||0.55), EAV=FF+o.eave, along=o.ridge||"x", pitch=o.pitch;
    const SID=o.siding, TRIM=o.trim||"#f4f2ec", bk=o.brick ? "brick" : "lk_lap", uv=o.brick ? 0.83 : 1/1.28;
    const RID=along==="x" ? EAV+pitch*o.D/2 : EAV+pitch*o.W/2;
    const fp=(face, u, d)=>face==="F" ? [u, zf+f*d, f>0?0:Math.PI] : face==="K" ? [u, zb-f*d, f>0?Math.PI:0]
                          : face==="L" ? [x0-d, u, -Math.PI/2] : [x1+d, u, Math.PI/2];
    // every window and door is an opening in its wall: the walls themselves, round them, and the rooms behind, are 14o's
    const ops={F:[], K:[], L:[], R:[]};
    // the foundation, a course of block showing, its top 7 cm under the floor (clear of the decks and stoops at the
    // doors, 3 and 4 under it); under a garage, under its slab
    if(o.garage){ const [ga, gb]=o.garage, top=FF-0.07, gt=Y-0.02;
      for(const [a, b, t] of [[x0-0.02, ga, top],[ga, gb, gt],[gb, x1+0.02, top]]) if(b-a>0.01) bx("block", b-a, t-(Y-0.4), o.D+0.04, (a+b)/2, (t+Y-0.4)/2, zm, 0.5, 0, "#a29e94"); }
    else bx("block", o.W+0.04, FF-0.07-(Y-0.4), o.D+0.04, o.x, (FF-0.07+Y-0.4)/2, zm, 0.5, 0, "#a29e94");
    if(!o.brick) for(const cx of [x0, x1]) for(const cz of [z0, z1]) B(0.15, EAV-FF+0.06, 0.15, cx, (EAV+FF-0.08)/2, cz, TRIM);
    // dormers on the front slope (a cape's): each a hole in the main roof, cut along its cheeks and up its valleys,
    // that its own walls and roof close; d is depth from the front wall's face
    const dorm=(o.dormers||[]).map(dx=>{ const wd=1.8, setb=0.7, yr=EAV+pitch*setb, yde=yr+1.30, ydr=yde+wd/2*0.9;
      const dv=ax=>(ydr-0.9*Math.abs(ax)-EAV)/pitch;                       // where its slope at ax off its middle meets the main roof
      return {xc:o.x+dx, wd:wd, setb:setb, zd:zf-f*setb, yr:yr, yde:yde, ydr:ydr, dv:dv, hw:wd/2-0.02, d0:setb+0.02, d1:dv(wd/2-0.02), dA:dv(0)}; });
    // the roof: two slabs of shingle, overhanging; the fascia along the eaves, the rake boards up the gables
    const ov=0.38, rk=0.26, e=0.012, ROOF=o.roof||"#4e5256";
    // (the front slope as convex pieces round the dormers' holes, in plan: x along the street, d back from the front face)
    const frontSlope=(xa, xb)=>{ const Pt=(x, d)=>V3(x, EAV+pitch*d, zf-f*d), dA=dorm.length ? dorm[0].dA : 0;
      const quad=(P)=>push("shingle", new FaceGeo().slab(P.map(([x,d])=>Pt(x,d)), 0.14, 0.5).geo(), 0,0,0, 0, ROOF);
      if(!dorm.length){ quad([[xa,-ov],[xb,-ov],[xb,o.D/2],[xa,o.D/2]]); return; }
      const H2=dorm.slice().sort((p,q)=>p.xc-q.xc), d0=H2[0].d0, d1=H2[0].d1;
      quad([[xa,-ov],[xb,-ov],[xb,d0],[xa,d0]]); quad([[xa,dA],[xb,dA],[xb,o.D/2],[xa,o.D/2]]);
      let x=xa; for(const q of H2){ quad([[x,d0],[q.xc-q.hw,d0],[q.xc-q.hw,d1],[x,d1]]); x=q.xc+q.hw; } quad([[x,d0],[xb,d0],[xb,d1],[x,d1]]);
      quad([[xa,d1],[H2[0].xc-H2[0].hw,d1],[H2[0].xc,dA],[xa,dA]]);
      for(let i=0;i<H2.length-1;i++) quad([[H2[i].xc,dA],[H2[i].xc+H2[i].hw,d1],[H2[i+1].xc-H2[i+1].hw,d1],[H2[i+1].xc,dA]]);
      const L=H2[H2.length-1]; quad([[L.xc,dA],[L.xc+L.hw,d1],[xb,d1],[xb,dA]]); };
    if(along==="x"){ const yo=EAV-pitch*ov, za=z0-ov, zb2=z1+ov, xa=x0-rk, xb=x1+rk;
      if(f>0) frontSlope(xa, xb); else push("shingle", new FaceGeo().slab([V3(xa, yo, zb2), V3(xb, yo, zb2), V3(xb, RID, zm), V3(xa, RID, zm)], 0.14, 0.5).geo(), 0,0,0, 0, ROOF);
      if(f<0) frontSlope(xa-e, xb+e); else push("shingle", new FaceGeo().slab([V3(xb+e, yo, za), V3(xa-e, yo, za), V3(xa-e, RID, zm), V3(xb+e, RID, zm)], 0.14, 0.5).geo(), 0,0,0, 0, ROOF);
      B(xb-xa+0.06, 0.08, 0.20, o.x, RID+0.02, zm, "#3e4246");
      for(const z of [za-0.02, zb2+0.02]) B(xb-xa, 0.17, 0.035, o.x, yo-0.075, z, TRIM);
      const L=Math.hypot(zm-za, RID-yo), th=Math.atan2(RID-yo, zm-za);
      for(const x of [xa-0.02, xb+0.02]) for(const sd of [-1,1]) B(0.035+(sd>0?0.006:0), 0.18, L, x, (RID+yo)/2-0.09, zm+sd*(zm-za)/2, TRIM, 0, sd*th, 0); }
    else { const yo=EAV-pitch*ov, xa=x0-ov, xb=x1+ov, za=z0-rk, zb2=z1+rk;
      push("shingle", new FaceGeo().slab([V3(xa, yo, za), V3(xa, yo, zb2), V3(o.x, RID, zb2), V3(o.x, RID, za)], 0.14, 0.5).geo(), 0,0,0, 0, ROOF);
      push("shingle", new FaceGeo().slab([V3(xb, yo, zb2+e), V3(xb, yo, za-e), V3(o.x, RID, za-e), V3(o.x, RID, zb2+e)], 0.14, 0.5).geo(), 0,0,0, 0, ROOF);
      B(0.20, 0.08, zb2-za+0.06, o.x, RID+0.02, zm, "#3e4246");
      for(const x of [xa-0.02, xb+0.02]) B(0.035, 0.17, zb2-za, x, yo-0.075, zm, TRIM);
      const L=Math.hypot(o.x-xa, RID-yo), th=Math.atan2(RID-yo, o.x-xa);
      for(const z of [za-0.02, zb2+0.02]) for(const sd of [-1,1]) B(L, 0.18, 0.035+(sd>0?0.006:0), o.x+sd*(o.x-xa)/2, (RID+yo)/2-0.09, z, TRIM, 0, 0, -sd*th); }
    // a window: casing, sill, muntins, and shutters if the house has them; the glass and the room behind it are 14o's
    const win=(face, u, ys, w, h, lit, sh)=>{
      const [gx, gz, ry]=fp(face, u, 0.016), c=Math.cos(ry), s=Math.sin(ry), at=(du, d)=>[gx+c*du+s*(d-0.016), gz-s*du+c*(d-0.016)];
      ops[face].push({a:u-w/2, b:u+w/2, sill:ys, head:ys+h, lit:(lit===undefined ? r()<0.45 : lit)});
      const p=(du, y, d, bw, bh, bd, col)=>{ const [px,pz]=at(du, d); B(bw, bh, bd, px, y, pz, col, ry); };
      p(0, ys+h+0.06, 0.03, w+0.26, 0.12, 0.05, TRIM); p(0, ys-0.03, 0.045, w+0.22, 0.05, 0.09, TRIM);
      for(const sd of [-1,1]) p(sd*(w/2+0.055), ys+h/2, 0.03, 0.11, h, 0.05, TRIM);
      p(0, ys+h/2, 0.034, 0.03, h, 0.012, TRIM); p(0, ys+h/2, 0.035, w, 0.03, 0.012, TRIM);
      if(sh && o.shutter) for(const sd of [-1,1]){ p(sd*(w/2+0.12+w*0.24), ys+h/2, 0.04, w*0.46, h+0.04, 0.03, o.shutter);
        for(let k=1;k<6;k++) p(sd*(w/2+0.12+w*0.24), ys+k*(h/6), 0.058, w*0.40, 0.012, 0.006, o.shutter); } };
    // a door: an opening 0.92 wide for a leaf (14o hangs it), its casing and a storm door's head over it, the light
    // by it, and on the front one the number
    const door=(face, u, col, side)=>{ const [gx, gz, ry]=fp(face, u, 0.03), c=Math.cos(ry), s=Math.sin(ry), at=(du, d)=>[gx+c*du+s*(d-0.03), gz-s*du+c*(d-0.03)];
      const p=(du, y, d, bw, bh, bd, cl)=>{ const [px,pz]=at(du, d); B(bw, bh, bd, px, y, pz, cl, ry); };
      ops[face].push({a:u-0.46, b:u+0.46, sill:FF-0.09, head:FF+2.08, door:true, col:col||o.door||"#7a2a1e", label:side ? "THE SIDE DOOR" : "No. "+o.no});
      p(0, FF+2.14, 0.035, 1.24, 0.12, 0.07, TRIM); for(const sd of [-1,1]) p(sd*0.515, FF+1.03, 0.035, 0.11, 2.08, 0.07, TRIM);
      const [lx, lz]=at(0.82, 0.10); B(0.12, 0.22, 0.10, lx, FF+1.85, lz, "#2a2a2c", ry);
      const [gx2, gz2]=at(0.82, 0.16); push("lk_porch", new T.CylinderGeometry(0.045, 0.045, 0.14, 10), gx2, FF+1.82, gz2, 0, "#ffffff");
      const [qx, qz]=at(0, 1.2); LAMPS.push({x:qx, y:FF+2.0, z:qz, color:0xffd9a0, intensity:0.42, dist:6.5, decay:1.6, mothy:true});
      if(side) return;
      const [nx, nz]=at(-0.80, 0.045); B(0.30, 0.12, 0.012, nx, FF+1.6, nz, "#2a2a2c", ry);
      sign(0.28, 0.10, (c2,Wc,H)=>{ c2.fillStyle="#2a2a2c"; c2.fillRect(0,0,Wc,H); say(c2, String(o.no), Wc/2, H/2, Wc*0.72, H*0.58, "#e8d8a8", "700", "Georgia, serif"); },
        ...(()=>{ const [sx, sz]=at(-0.80, 0.058); return [sx, FF+1.6, sz]; })(), ry, false, 160); };
    return {x:o.x, W:o.W, D:o.D, x0, x1, z0, z1, zm, zf, zb, T0, FF, EAV, RID, f, pitch, along, win, door, fp, ops, dormers:dorm,
            bk, uv, siding:SID, trim:TRIM, gable:o.gable||SID, no:o.no, garage:o.garage};
  }
  // steps up to a door, or to a deck: n risers from the ground at the face's foot; their flats
  const steps=(x, zEdge, f, w, top, n)=>{ const rs=(top-Y)/n, run=0.28;
    for(let k=1;k<n;k++){ const y=top-k*rs, za=zEdge+f*(k-1)*run, zb=zEdge+f*k*run;
      B(w, y-Y+0.12, run+0.01, x, (y+Y-0.12)/2, (za+zb)/2, k%2 ? "#a8a49a" : "#b0aca2"); addFlat(x-w/2, x+w/2, Math.min(za,zb), Math.max(za,zb), y); } };
  const rail=(a, b, h, posts, col)=>{ tubeE(V3(a.x, a.y+h, a.z), V3(b.x, b.y+h, b.z), 0.03, col); tubeE(V3(a.x, a.y+0.12, a.z), V3(b.x, b.y+0.12, b.z), 0.025, col);
    const L=Math.hypot(b.x-a.x, b.z-a.z), n=Math.max(1, Math.round(L/0.13));
    for(let k=0;k<=n;k++){ const t=k/n, x=lerp(a.x,b.x,t), y=lerp(a.y,b.y,t), z=lerp(a.z,b.z,t);
      if(posts && (k===0 || k===n)) B(0.09, h+0.06, 0.09, x, y+(h+0.06)/2, z, col); else B(0.03, h-0.12, 0.03, x, y+0.12+(h-0.12)/2, z, col); } };

  /* ---- the things in the yards ---- */
  const mailbox=(x, z, f, col)=>{ const g=Y; B(0.09, 1.05, 0.09, x, g+0.52, z, "#6a5a46");
    RB(0.22, 0.24, 0.48, x, g+1.15, z, col||"#2a2a2c", 0, 0.08); B(0.02, 0.16, 0.05, x+0.12, g+1.22, z+f*0.12, "#c42a1a");
    addCol(x-0.12, x+0.12, z-0.26, z+0.26, g-0.5, g+1.3); };
  const car=(kind, paint, x, z, yaw, y)=>parked(kind, paint, x, z, yaw, (y===undefined ? Y+0.03 : y)-PAVE_T);
  const drive=(x0, x1, z0, z1, gravel)=>{ flat(gravel ? "gravelbed" : "lotpave", x0, x1, z0, z1, Y+0.03, gravel ? "#a8a296" : "#c4c2bc", gravel ? 0.5 : 0.62);
    addPaveRect(x0, x1, z0, z1, Y); A.noPole.push([x0-1.5, x1+1.5]); };
  const swingSet=(x, z, ry)=>{ const f=XF(x, z, ry), g=gy(x,z), P=(lx,ly,lz)=>V3(f.x(lx,lz), g+ly, f.z(lx,lz));
    for(const sd of [-1.5, 1.5]){ tubeE(P(sd, 0, -0.8), P(sd, 2.2, 0), 0.04, "#2a6a3a"); tubeE(P(sd, 0, 0.8), P(sd, 2.2, 0), 0.04, "#2a6a3a"); }
    tubeE(P(-1.6, 2.22, 0), P(1.6, 2.22, 0), 0.045, "#2a6a3a");
    for(const sx of [-0.7, 0.7]){ tubeE(P(sx-0.2, 2.2, 0), P(sx-0.2, 0.48, 0), 0.006, "#8a8a84"); tubeE(P(sx+0.2, 2.2, 0), P(sx+0.2, 0.48, 0), 0.006, "#8a8a84");
      const q=P(sx, 0.46, 0); B(0.46, 0.03, 0.18, q.x, q.y, q.z, "#c42a1a", ry); }
    const hx=Math.abs(Math.cos(ry))*1.7+Math.abs(Math.sin(ry))*0.9, hz=Math.abs(Math.sin(ry))*1.7+Math.abs(Math.cos(ry))*0.9;
    addCol(x-hx, x+hx, z-hz, z+hz, g-0.5, g+2.3); };
  const picnic=(x, z, ry, col, y0)=>{ const f=XF(x, z, ry), g=y0===undefined ? gy(x,z) : y0, q=(w,h,d,lx,ly,lz,c,rx)=>{ ent(boxGeo(w,h,d), f.x(lx,lz), g+ly, f.z(lx,lz), c, rx||0, ry, 0); };
    q(1.8, 0.05, 0.75, 0, 0.74, 0, col||"#8a6a44"); for(const sd of [-1,1]) q(1.8, 0.05, 0.28, 0, 0.44, sd*0.62, col||"#8a6a44");
    for(const sx of [-0.7, 0.7]) for(const sd of [-1,1]) q(0.06, 0.92, 0.06, sx, 0.40, sd*0.38, "#6a5034", sd*0.62);
    const hx=Math.abs(Math.cos(ry))*0.95+Math.abs(Math.sin(ry))*0.78, hz=Math.abs(Math.sin(ry))*0.95+Math.abs(Math.cos(ry))*0.78;
    addCol(x-hx, x+hx, z-hz, z+hz, g-0.5, g+0.8); };
  const grill=(x, z)=>{ const g=gy(x,z); ent(new T.SphereGeometry(0.30, 16, 10, 0, Math.PI*2, Math.PI/2, Math.PI/2), x, g+0.78, z, "#1a1a1a");
    ent(new T.SphereGeometry(0.30, 16, 8, 0, Math.PI*2, 0, Math.PI/2), x, g+0.80, z, "#1e1e1e"); C(0.02, 0.06, x, g+1.12, z, "#8a8a84", 8);
    for(let k=0;k<3;k++){ const a=k*2.094; tubeE(V3(x+Math.cos(a)*0.08, g+0.62, z+Math.sin(a)*0.08), V3(x+Math.cos(a)*0.28, g+0.0, z+Math.sin(a)*0.28), 0.012, "#2a2a2a"); }
    addCol(x-0.32, x+0.32, z-0.32, z+0.32, g-0.5, g+1.1); };
  const adir=(x, z, ry, col)=>{ const f=XF(x, z, ry), g=gy(x,z), q=(w,h,d,lx,ly,lz,c,rx)=>{ ent(boxGeo(w,h,d), f.x(lx,lz), g+ly, f.z(lx,lz), c, rx||0, ry, 0); };
    q(0.62, 0.04, 0.62, 0, 0.36, 0.05, col, -0.18); q(0.62, 0.80, 0.04, 0, 0.72, -0.30, col, -0.45); for(const sd of [-1,1]){ q(0.07, 0.04, 0.74, sd*0.34, 0.60, 0.04, col); q(0.05, 0.60, 0.05, sd*0.32, 0.30, 0.36, col); q(0.05, 0.40, 0.05, sd*0.32, 0.20, -0.24, col); }
    addCol(x-0.42, x+0.42, z-0.42, z+0.42, g-0.5, g+0.9); };
  const kayaks=(x, z, ry)=>{ const f=XF(x, z, ry), g=gy(x,z);
    for(const sd of [-1.1, 1.1]){ ent(boxGeo(0.06, 1.2, 0.06), f.x(sd,0), g+0.6, f.z(sd,0), "#6a5a46", 0, ry, 0); ent(boxGeo(0.06, 0.06, 0.9), f.x(sd,0), g+0.55, f.z(sd,0), "#6a5a46", 0, ry, 0); ent(boxGeo(0.06, 0.06, 0.9), f.x(sd,0), g+1.0, f.z(sd,0), "#6a5a46", 0, ry, 0); }
    [["#e6531c", 0.66],["#2a8ac8", 1.11],["#e6c21c", 0.66]].forEach(([col, y], i)=>{ const lz=i===2 ? 0.25 : -0.2+i*0.0;
      ent(new T.SphereGeometry(1, 14, 8).scale(1.9, 0.16, 0.33), f.x(0, lz), g+y+0.08, f.z(0, lz), col, 0, ry, 0); });
    const hx=Math.abs(Math.cos(ry))*2.0+Math.abs(Math.sin(ry))*0.5, hz=Math.abs(Math.sin(ry))*2.0+Math.abs(Math.cos(ry))*0.5;
    addCol(x-hx, x+hx, z-hz, z+hz, g-0.5, g+1.3); };
  const shed=(x, z, ry, col, roof)=>{ const f=XF(x, z, ry), g=gy(x,z), w=2.6, d=2.0, h=2.0;
    ent(boxGeo(w, h, d), f.x(0,0), g+h/2, f.z(0,0), col, 0, ry, 0);
    for(const sd of [-1,1]) ent(boxGeo(w+0.3, 0.06, d/2+0.3), f.x(0, sd*(d/4+0.06)), g+h+0.32, f.z(0, sd*(d/4+0.06)), roof||"#4e5256", sd*0.62, ry, 0);
    for(const zz of [d/2, -d/2+0.03]) ent(new FaceGeo().slab([V3(-w/2+0.01,h,zz), V3(w/2-0.01,h,zz), V3(0,h+0.60,zz)], 0.03, 0.5).geo().applyMatrix4(new T.Matrix4().makeRotationY(ry).setPosition(f.x(0,0), g, f.z(0,0))), 0,0,0, col);
    ent(boxGeo(1.0, 1.7, 0.03), f.x(0, d/2+0.02), g+0.86, f.z(0, d/2+0.02), "#f4f2ec", 0, ry, 0);
    const hx=Math.abs(Math.cos(ry))*w/2+Math.abs(Math.sin(ry))*d/2, hz=Math.abs(Math.sin(ry))*w/2+Math.abs(Math.cos(ry))*d/2;
    addCol(x-hx, x+hx, z-hz, z+hz, g-0.5, g+2.6); };
  const ac=(x, z)=>{ RB(0.72, 0.70, 0.72, x, Y+0.40, z, "#b8bab6", 0, 0.04); C(0.28, 0.02, x, Y+0.76, z, "#2a2a2a", 20); addCol(x-0.38, x+0.38, z-0.38, z+0.38, Y-0.5, Y+0.8); };
  const propane=(x, z)=>{ C(0.38, 1.35, x, Y+0.80, z, "#e8e8e4", 20, 0, 0, Math.PI/2); for(const sd of [-1,1]) B(0.12, 0.12, 0.5, x+sd*0.45, Y+0.06+0.06, z, "#8a8a84"); C(0.05, 0.12, x, Y+1.22, z, "#7a7a74", 10);
    addCol(x-0.72, x+0.72, z-0.42, z+0.42, Y-0.5, Y+1.2); };
  const cans=(x, z)=>{ for(const [dx,col] of [[0,"#2a3a2a"],[0.62,"#2a4a8a"]]){ RB(0.56, 1.0, 0.62, x+dx, Y+0.5, z, col, 0, 0.05); B(0.60, 0.05, 0.66, x+dx, Y+1.02, z, col); }
    addCol(x-0.32, x+0.94, z-0.34, z+0.34, Y-0.5, Y+1.1); };
  const hoop=(x, z, f)=>{ C(0.06, 3.3, x, Y+1.65, z, "#5a5e60", 12); B(1.2, 0.8, 0.04, x, Y+3.25, z+f*0.15, "#f4f2ec"); B(0.5, 0.36, 0.045, x, Y+3.1, z+f*0.15, "#c42a1a");
    ent(new T.TorusGeometry(0.23, 0.012, 6, 18), x, Y+3.05, z+f*0.42, "#e6531c", Math.PI/2); addCol(x-0.1, x+0.1, z-0.1, z+0.1, Y-0.5, Y+3.4); };
  const fire=(x, z)=>{ const g=gy(x,z);                          // (north of the road: the chairs on its landward side, looking past it at the water) for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; ent(new T.DodecahedronGeometry(0.15, 0), x+Math.cos(a)*0.62, g+0.08, z+Math.sin(a)*0.62, ["#7a7468","#8a847a","#6a665e"][k%3], k, k*2); }
    C(0.5, 0.02, x, g+0.012, z, "#2a2420", 20); for(let k=0;k<3;k++){ const a=k*2.1; ent(new T.CylinderGeometry(0.05, 0.05, 0.55, 8), x+Math.cos(a)*0.12, g+0.07, z+Math.sin(a)*0.12, "#3a2a1e", Math.PI/2, a, 0); }
    addCol(x-0.75, x+0.75, z-0.75, z+0.75, g-0.5, g+0.3);
    for(const [a, col] of [[-0.75, "#c42a1a"],[0, "#2a6a8a"],[0.75, "#e6c21c"]]) adir(x+Math.sin(a)*1.7, z+Math.cos(a)*1.7, a+Math.PI, col); };
  const garden=(x0, x1, z0, z1)=>{ flat("mulch", x0, x1, z0, z1, gy((x0+x1)/2,(z0+z1)/2)+0.02, "#4a3020", 0.5);
    for(let x=x0+0.4; x<x1-0.2; x+=0.7) for(let z=z0+0.4; z<z1-0.2; z+=0.8){ const g=gy(x,z);
      for(let k=0;k<3;k++) tubeE(V3(x+Math.cos(k*2.1)*0.18, g, z+Math.sin(k*2.1)*0.18), V3(x+Math.cos(k*2.1)*0.12, g+0.85, z+Math.sin(k*2.1)*0.12), 0.006, "#8a8a84");
      ent(new T.SphereGeometry(0.22, 8, 6).scale(1, 1.5, 1), x, g+0.45, z, "#3a6a2a"); for(let k=0;k<3;k++) ent(new T.SphereGeometry(0.035, 6, 4), x+(k-1)*0.1, g+0.35+k*0.12, z+0.18, "#c42a1a"); }
    addCol(x0, x1, z0, z1, Y-0.5, Y+1.0); };
  const flowers=(x0, x1, z, y)=>{ flat("mulch", x0, x1, z-0.45, z+0.45, y+0.02, "#4a3020", 0.5);
    for(let x=x0+0.25; x<x1-0.1; x+=0.32){ const zz=z+(r()-0.5)*0.5; ent(new T.SphereGeometry(0.14, 8, 6), x, y+0.12, zz, "#3e6a2e");
      for(let k=0;k<3;k++) ent(new T.SphereGeometry(0.035, 6, 4), x+(r()-0.5)*0.18, y+0.22, zz+(r()-0.5)*0.18, ["#e6c21c","#c42a6a","#f4f2ec","#7a3ab8","#e6531c"][(r()*5)|0]); } };
  const boat=(x, z, ry)=>{ const f=XF(x, z, ry);                                // a bass boat on its trailer
    for(const sd of [-0.8, 0.8]) C(0.30, 0.18, f.x(sd, 1.6), Y+0.30, f.z(sd, 1.6), "#1a1a1a", 16, 0, ry, Math.PI/2);
    ent(boxGeo(1.7, 0.10, 5.6), f.x(0,0.6), Y+0.48, f.z(0,0.6), "#7a7a74", 0, ry, 0); ent(boxGeo(0.10, 0.10, 2.0), f.x(0,-3.0), Y+0.48, f.z(0,-3.0), "#7a7a74", 0, ry, 0);
    ent(new T.SphereGeometry(1, 18, 10, 0, Math.PI*2, Math.PI/2, Math.PI/2).scale(1.05, 0.55, 2.9), f.x(0,0.6), Y+1.08, f.z(0,0.6), "#c42a1a", 0, ry, 0);
    ent(new T.CylinderGeometry(1.05, 1.05, 0.06, 18, 1, false).scale(1, 1, 2.75), f.x(0,0.6), Y+1.10, f.z(0,0.6), "#d8d4c8", 0, ry, 0);
    ent(boxGeo(0.5, 0.7, 0.4), f.x(0,3.2), Y+1.30, f.z(0,3.2), "#1a1a1a", 0, ry, 0);
    const hx=Math.abs(Math.cos(ry))*1.1+Math.abs(Math.sin(ry))*3.6, hz=Math.abs(Math.sin(ry))*1.1+Math.abs(Math.cos(ry))*3.6, cx=f.x(0,0.6), cz=f.z(0,0.6);
    addCol(cx-hx, cx+hx, cz-hz, cz+hz, Y-0.5, Y+1.6); };
  const flagpole=(x, z)=>{ C(0.05, 7.0, x, Y+3.5, z, "#c8ccd0", 12); ent(new T.SphereGeometry(0.08, 10, 8), x, Y+7.05, z, "#c9a34a");
    sign(1.5, 0.9, (c,Wc,H)=>{ for(let k=0;k<13;k++){ c.fillStyle=k%2 ? "#f4f2ec" : "#b22234"; c.fillRect(0, k*H/13, Wc, H/13+1); }
        c.fillStyle="#2a3a6a"; c.fillRect(0,0,Wc*0.42,H*0.54); c.fillStyle="#f4f2ec"; for(let i=0;i<6;i++) for(let j=0;j<5;j++) c.fillRect(Wc*0.03+i*Wc*0.065, H*0.05+j*H*0.10, 3, 3); },
      x+0.78, Y+6.4, z, Math.PI/2, false, 240);
    sign(1.5, 0.9, (c,Wc,H)=>{ for(let k=0;k<13;k++){ c.fillStyle=k%2 ? "#f4f2ec" : "#b22234"; c.fillRect(0, k*H/13, Wc, H/13+1); }
        c.fillStyle="#2a3a6a"; c.fillRect(Wc*0.58,0,Wc*0.42,H*0.54); }, x+0.78, Y+6.4, z-0.004, -Math.PI/2, false, 240);
    addCol(x-0.08, x+0.08, z-0.08, z+0.08, Y-0.5, Y+7); };
  // a five-pointed star, a thin plate of it, standing in a vertical plane facing (sin ry, cos ry)
  const starGeo=(rad)=>{ const sh=new T.Shape(); for(let i=0;i<10;i++){ const a=i*Math.PI/5+Math.PI/2, rr=i%2 ? rad*0.42 : rad; i ? sh.lineTo(Math.cos(a)*rr, Math.sin(a)*rr) : sh.moveTo(Math.cos(a)*rr, Math.sin(a)*rr); }
    return new T.ExtrudeGeometry(sh, {depth:0.03, bevelEnabled:false}); };

  /* ======================================================================
     THE HOUSES
     ====================================================================== */
  // the four kinds; each gets its lot's x, its side of the road (f), and colours
  const capeCod=(x, f, no, col)=>{                                 // a storey and a half, two dormers, a little deck at the door, gravel drive
    const zf=Z+f*(-(HW+14)), h=house({x:x, f:f, zf:zf, W:10.8, D:8.4, eave:2.75, pitch:1.0, siding:col.s, trim:col.t, roof:col.r, shutter:col.sh, door:col.d, no:no, dormers:[-2.9, 2.9]});
    h.kind="cape";
    const F="F";
    h.win(F, x-3.6, h.FF+0.85, 0.9, 1.4, undefined, true); h.win(F, x-2.2, h.FF+0.85, 0.9, 1.4, undefined, true);
    h.win(F, x+2.2, h.FF+0.85, 0.9, 1.4, undefined, true); h.win(F, x+3.6, h.FF+0.85, 0.9, 1.4, undefined, true);
    h.door(F, x);
    for(const face of ["L","R"]){ h.win(face, h.zm, h.FF+0.85, 0.9, 1.4); h.win(face, h.zm-1.0, h.EAV+0.6, 0.75, 1.1); h.win(face, h.zm+1.0, h.EAV+0.6, 0.75, 1.1); }
    for(const u of [x-2.6, x, x+2.6]) h.win("K", u, h.FF+0.95, 0.9, 1.2);
    // the dormers on the front slope: their walls (the cheeks, the front with its window, and the alcove they make
    // inside) are 14o's; here their little gable roofs, cut off along the valleys where they run into the main roof,
    // and the window's trim
    for(const q of h.dormers){ const ov=0.22, xc=q.xc, dF=q.setb-ov, Pt=(xx, d)=>V3(xx, q.ydr-0.9*Math.abs(xx-xc), zf-f*d);
      const xa=xc-q.wd/2-ov, xb=xc+q.wd/2+ov, back=ax=>q.dv(ax)+0.06;      // (each runs 6 cm on, under the main roof's shingles)
      push("shingle", new FaceGeo().slab([Pt(xa, dF), Pt(xc, dF), Pt(xc, back(0)), Pt(xa, back(xc-xa))], 0.10, 0.5).geo(), 0,0,0, 0, col.r);
      push("shingle", new FaceGeo().slab([Pt(xc, dF-0.01), Pt(xb, dF-0.01), Pt(xb, back(xb-xc)+0.01), Pt(xc, back(0)+0.01)], 0.10, 0.5).geo(), 0,0,0, 0, col.r);
      const [gx, gz, ry]=[xc, q.zd+f*0.016, f>0?0:Math.PI], yr=q.yr;
      q.win={a:gx-0.4, b:gx+0.4, sill:yr+0.25, head:yr+1.16, lit:r()<0.5};
      B(1.04, 0.10, 0.05, gx, yr+0.25+0.96, gz+f*0.014, col.t, ry); B(1.0, 0.05, 0.08, gx, yr+0.22, gz+f*0.03, col.t, ry);
      for(const sd of [-1,1]) B(0.10, 0.92, 0.05, gx+sd*0.46, yr+0.70, gz+f*0.014, col.t, ry);
      B(0.03, 0.9, 0.012, gx, yr+0.70, gz+f*0.018, col.t, ry); B(0.8, 0.03, 0.012, gx, yr+0.70, gz+f*0.019, col.t, ry); }
    // the chimney up the low end, brick
    bx("brick", 0.9, h.RID+0.9-(Y+0.2), 0.7, x-5.4-0.35, (h.RID+0.9+Y+0.2)/2, h.zm-f*1.8, 0.83, 0, "#8a4a36");
    B(1.0, 0.08, 0.8, x-5.75, h.RID+0.94, h.zm-f*1.8, "#7a7a74");
    addCol(x-6.2, x-5.3, h.zm-f*1.8-0.35, h.zm-f*1.8+0.35, Y-0.5, h.RID);
    // the deck at the door: boards on joists, a rail round it, steps down the front
    const dz0=zf, dz1=zf+f*2.2, dx0=x-1.6, dx1=x+1.6, dy=h.FF-0.04;
    bx("wood", dx1-dx0, 0.06, 2.2, x, dy-0.03, (dz0+dz1)/2, 0.6, 0, "#9a7a54");
    for(const sx of [dx0+0.08, dx1-0.08]) for(const t of [0.15, 2.05]) B(0.10, dy-Y+0.1, 0.10, sx, (dy+Y-0.1)/2, zf+f*t, "#8a6a44");
    addFlat(dx0, dx1, Math.min(dz0,dz1), Math.max(dz0,dz1), dy);
    rail(V3(dx0+0.05, dy, zf+f*0.05), V3(dx0+0.05, dy, dz1-f*0.05), 0.92, true, "#f4f2ec");
    rail(V3(dx1-0.05, dy, zf+f*0.05), V3(dx1-0.05, dy, dz1-f*0.05), 0.92, true, "#f4f2ec");
    rail(V3(dx0+0.05, dy, dz1-f*0.05), V3(x-0.65, dy, dz1-f*0.05), 0.92, true, "#f4f2ec");
    rail(V3(x+0.65, dy, dz1-f*0.05), V3(dx1-0.05, dy, dz1-f*0.05), 0.92, true, "#f4f2ec");
    for(const [a,b] of [[dx0, dx0+0.12],[dx1-0.12, dx1]]) addCol(a, b, Math.min(dz0,dz1), Math.max(dz0,dz1), dy-0.5, dy+0.95);
    addCol(dx0, x-0.6, Math.min(dz1-f*0.12, dz1), Math.max(dz1-f*0.12, dz1), dy-0.5, dy+0.95); addCol(x+0.6, dx1, Math.min(dz1-f*0.12, dz1), Math.max(dz1-f*0.12, dz1), dy-0.5, dy+0.95);
    steps(x, dz1, f, 1.2, dy, 3);
    flowers(x-5.2, x-2.0, zf+f*0.7, Y); flowers(x+2.0, x+5.2, zf+f*0.7, Y);
    return h; };
  const ranch=(x, f, no, col, gSide)=>{                            // one storey of brick, the garage at one end, a stoop and a little roof over the door
    // (the garage: from its wall to the house, at 2.2 off the middle, out to the end; its floor is the drive's, down a step)
    const zf=Z+f*(-(HW+13)), gw=[x+gSide*2.2, x+gSide*8.02];
    const h=house({x:x, f:f, zf:zf, W:16.0, D:9.0, eave:2.6, pitch:0.42, siding:col.s, brick:true, trim:col.t, roof:col.r, door:col.d, no:no, ff:0.35, gable:col.g,
                   garage:[Math.min(...gw), Math.max(...gw)]});
    const gx=x+gSide*5.0;                                          // the garage's middle
    h.kind="ranch"; h.gSide=gSide; h.gx=gx;
    h.ops.F.push({a:gx-2.45, b:gx+2.45, sill:Y-0.03, head:Y+2.27, garage:true});
    // the garage door: white panels in its opening, the light over it
    { const [px, pz, ry]=h.fp("F", gx, 0.03); B(4.9, 2.25, 0.06, px, Y+1.125+0.02, pz, "#f4f2ec", ry);
      for(let k=1;k<4;k++) B(4.9, 0.02, 0.012, px, Y+0.02+k*0.5625, pz+f*0.035, "#d8d6d0", ry);
      for(let i=0;i<4;i++) for(let j=0;j<4;j++) B(1.08, 0.42, 0.012, px-1.83+i*1.22, Y+0.30+j*0.5625, pz+f*0.036, "#ecebe6", ry);
      B(5.2, 0.12, 0.08, px, Y+2.33, pz+f*0.02, col.t, ry); }
    const lx=x-gSide*1.0;
    h.win("F", lx-gSide*0.2+(-gSide)*2.6, h.FF+0.75, 2.6, 1.5, undefined, false);          // the picture window
    h.win("F", lx+(-gSide)*5.4, h.FF+0.95, 1.0, 1.2); h.win("F", gx+(gSide>0?-3.6:3.6), h.FF+0.95, 0.8, 1.0);
    h.door("F", lx+gSide*0.4);
    for(const face of ["L","R"]) if((face==="R")!==(gSide>0)) { h.win(face, h.zm-1.8, h.FF+0.95, 1.0, 1.2); h.win(face, h.zm+1.8, h.FF+0.95, 1.0, 1.2); }
    for(const p of [-5.5, -2.0, 1.5, 5.0]) h.win("K", x+gSide*p, h.FF+0.95, 1.0, 1.2);          // (the last in the garage)
    // the stoop, two steps, a pipe rail, and a little gabled hood on brackets over the door
    const sx=lx+gSide*0.4, sz0=zf, sz1=zf+f*1.4, sy=h.FF-0.03;
    bx("concrete", 1.8, sy-(Y-0.2), 1.4, sx, (sy+Y-0.2)/2, (sz0+sz1)/2, 0.5, 0, "#b8b4aa"); addFlat(sx-0.9, sx+0.9, Math.min(sz0,sz1), Math.max(sz0,sz1), sy);
    steps(sx, sz1, f, 1.4, sy, 2);
    { const [px, pz, ry]=h.fp("F", sx, 0.55); B(1.6, 0.06, 1.1, px, h.FF+2.45, pz, "#4e5256", ry, 0.25); B(1.5, 0.12, 0.03, px, h.FF+2.30, pz+f*0.52, col.t, ry); }
    // the drive to the garage, concrete; a hoop over it; the cans by the door
    drive(gx-2.8, gx+2.8, Math.min(zf, Z-f*HW), Math.max(zf, Z-f*HW));
    hoop(gx+gSide*2.9, zf+f*0.6, f);
    cans(gx+gSide*3.4-(gSide>0?0:0.62), zf+f*1.1);
    flowers(lx-gSide*0.4-3.6, lx-gSide*0.4-0.8, zf+f*0.6, Y);
    return h; };
  const bungalow=(x, f, no, col)=>{                                // gable to the road, a porch across the front, shutters, a barn star
    const zf=Z+f*(-(HW+15)), h=house({x:x, f:f, zf:zf, W:9.0, D:11.0, eave:2.8, pitch:0.95, ridge:"z", siding:col.s, trim:col.t, roof:col.r, shutter:col.sh, door:col.d, no:no});
    h.kind="bungalow";
    h.win("F", x-2.6, h.FF+0.85, 0.95, 1.45, undefined, true); h.win("F", x+2.6, h.FF+0.85, 0.95, 1.45, undefined, true); h.door("F", x);
    h.win("F", x, h.EAV+0.55, 0.85, 1.15, undefined, true);
    for(const face of ["L","R"]) for(const u of [-3.4, 0, 3.4]) h.win(face, h.zm+u, h.FF+0.9, 0.9, 1.3, undefined, true);
    h.win("K", x-2.0, h.FF+0.95, 0.9, 1.2); h.win("K", x+2.0, h.FF+0.95, 0.9, 1.2);
    // the barn star up in the gable, over the porch roof
    { const [px, pz, ry]=h.fp("F", x, 0.012); ent(starGeo(0.46), px, h.EAV+2.25, pz, col.st, 0, ry, 0); }
    // the porch: floor boards across the front, four posts, a rail, steps in the middle, a shed roof over
    const pz0=zf, pz1=zf+f*2.4, px0=h.x0-0.2, px1=h.x1+0.2, py=h.FF-0.04;
    bx("wood", px1-px0, 0.08, 2.4, x, py-0.04, (pz0+pz1)/2, 0.6, 0, "#8a7458");
    B(px1-px0, py-Y+0.04, 0.04, x, (py+Y-0.04)/2, pz1-f*0.06, col.t);
    addFlat(px0, px1, Math.min(pz0,pz1), Math.max(pz0,pz1), py);
    for(const xx of [px0+0.12, x-1.0, x+1.0, px1-0.12]) B(0.16, 2.45, 0.16, xx, py+1.225, pz1-f*0.12, col.t);
    rail(V3(px0+0.2, py, pz1-f*0.12), V3(x-1.08, py, pz1-f*0.12), 0.85, false, col.t); rail(V3(x+1.08, py, pz1-f*0.12), V3(px1-0.2, py, pz1-f*0.12), 0.85, false, col.t);
    for(const xx of [px0+0.12, px1-0.12]) rail(V3(xx, py, zf+f*0.1), V3(xx, py, pz1-f*0.2), 0.85, false, col.t);
    addCol(px0, x-1.0, Math.min(pz1-f*0.2, pz1), Math.max(pz1-f*0.2, pz1), py-0.5, py+0.9); addCol(x+1.0, px1, Math.min(pz1-f*0.2, pz1), Math.max(pz1-f*0.2, pz1), py-0.5, py+0.9);
    for(const xx of [px0, px1-0.2]) addCol(xx, xx+0.2, Math.min(pz0,pz1), Math.max(pz0,pz1), py-0.5, py+0.9);
    { const yT=h.EAV-0.15, yL=py+2.45+0.08, z_lo=Math.min(zf, pz1+f*0.3), z_hi=Math.max(zf, pz1+f*0.3), lo=f>0 ? z_hi : z_lo, hi=f>0 ? z_lo : z_hi;
      push("shingle", new FaceGeo().slab(f>0 ? [V3(px0-0.15, yL, lo), V3(px1+0.15, yL, lo), V3(px1+0.15, yT, hi), V3(px0-0.15, yT, hi)]
                                             : [V3(px1+0.15, yL, lo), V3(px0-0.15, yL, lo), V3(px0-0.15, yT, hi), V3(px1+0.15, yT, hi)], 0.12, 0.5).geo(), 0,0,0, 0, col.r);
      B(px1-px0+0.3, 0.16, 0.035, x, yL-0.10, lo+f*0.02, col.t);
      addRoof(px0, px1, z_lo, z_hi, yL-0.1); }
    steps(x, pz1, f, 1.9, py, 3);
    // a pair of rockers and a fern in a pot on it
    for(const dx of [-2.6, 2.6]){ const cx=x+dx, cz=zf+f*1.2, ry=f>0 ? 0 : Math.PI; RB(0.5, 0.06, 0.5, cx, py+0.42, cz, "#f4f2ec", ry); RB(0.5, 0.60, 0.06, cx, py+0.78, cz-f*0.24, "#f4f2ec", ry);
      for(const sd of [-1,1]){ ent(new T.TorusGeometry(0.55, 0.02, 4, 16, 1.0), cx+sd*0.22, py+0.56, cz, "#f4f2ec", 0, Math.PI/2, Math.PI*1.5-0.5); B(0.04, 0.42, 0.04, cx+sd*0.22, py+0.22, cz+f*0.18, "#f4f2ec"); B(0.04, 0.42, 0.04, cx+sd*0.22, py+0.22, cz-f*0.18, "#f4f2ec"); }
      addCol(cx-0.32, cx+0.32, cz-0.36, cz+0.36, py-0.5, py+1.0); }
    flowers(h.x0+0.2, h.x1-0.2, pz1+f*0.8, Y);
    return h; };
  const twoStorey=(x, f, no, col, cSide)=>{                        // two storeys, plain, trim picked out; a carport on posts over a concrete drive
    const zf=Z+f*(-(HW+13.5)), h=house({x:x, f:f, zf:zf, W:9.4, D:8.2, eave:5.3, pitch:0.55, siding:col.s, trim:col.t, roof:col.r, shutter:col.sh, door:col.d, no:no});
    h.kind="twoStorey"; h.cSide=cSide;
    for(const u of [x-2.9, x+2.9]){ h.win("F", u, h.FF+0.9, 0.95, 1.4, undefined, true); h.win("F", u, h.FF+3.45, 0.95, 1.3, undefined, true); }
    h.win("F", x, h.FF+3.55, 0.7, 1.0); h.door("F", x);
    for(const face of ["L","R"]) for(const [u, y] of [[-1.6, 0.9],[1.6, 0.9],[-1.6, 3.45],[1.6, 3.45]]) h.win(face, h.zm+u, h.FF+y, 0.9, 1.25);
    for(const u of [x-2.4, x+2.4]){ h.win("K", u, h.FF+1.0, 0.9, 1.2); h.win("K", u, h.FF+3.5, 0.9, 1.2); }
    // a hood over the door on brackets, a concrete stoop
    { const [px, pz, ry]=h.fp("F", x, 0.5); B(1.8, 0.10, 0.9, px, h.FF+2.55, pz, col.t, ry); for(const sd of [-0.75, 0.75]){ const [qx,qz]=[px+Math.cos(ry)*sd, pz-Math.sin(ry)*sd]; B(0.08, 0.40, 0.70, qx, h.FF+2.30, qz-f*0.05, col.t, ry); } }
    bx("concrete", 2.0, h.FF-0.03-(Y-0.2), 1.3, x, (h.FF-0.03+Y-0.2)/2, zf+f*0.65, 0.5, 0, "#b8b4aa"); addFlat(x-1.0, x+1.0, Math.min(zf, zf+f*1.3), Math.max(zf, zf+f*1.3), h.FF-0.03);
    steps(x, zf+f*1.3, f, 1.4, h.FF-0.03, 3);
    // the kitchen's side door, out under the carport: a landing and three steps down along the wall, beside the car
    { const zc=zf-f*4.36, wx=cSide>0 ? h.x1 : h.x0, sy=h.FF-0.03, lx0=Math.min(wx-cSide*0.02, wx+cSide*0.9), lx1=Math.max(wx-cSide*0.02, wx+cSide*0.9);
      h.door(cSide>0 ? "R" : "L", zc, col.d, true);
      bx("concrete", 0.92, sy-(Y-0.2), 1.2, (lx0+lx1)/2, (sy+Y-0.2)/2, zc, 0.5, 0, "#b8b4aa"); addFlat(lx0, lx1, zc-0.6, zc+0.6, sy);
      steps(wx+cSide*0.45, zc+f*0.6, f, 0.88, sy, 3); }                          // (the landing 2 cm into the wall, the steps against it)
    // the carport: four posts, a low-pitched metal roof, the drive under it to the road
    const cx0=cSide>0 ? h.x1+0.05 : h.x0-3.65, cx1=cx0+3.6, cz0=Math.min(zf+f*0.4, zf-f*6.4), cz1=Math.max(zf+f*0.4, zf-f*6.4), cy=Y+2.55;
    for(const xx of [cx0+0.1, cx1-0.1]) for(const zz of [cz0+0.1, cz1-0.1]) B(0.10, cy-Y, 0.10, xx, (cy+Y)/2, zz, "#f4f2ec");
    B(3.9, 0.08, cz1-cz0+0.5, (cx0+cx1)/2, cy+0.06, (cz0+cz1)/2, "#b8bcc0", 0, 0, cSide*0.05);
    B(3.9, 0.14, 0.04, (cx0+cx1)/2, cy-0.02, f>0 ? cz1+0.26 : cz0-0.26, col.t);
    addRoof(cx0, cx1, cz0, cz1, cy);
    for(const xx of [cx0+0.1, cx1-0.1]) for(const zz of [cz0+0.1, cz1-0.1]) addCol(xx-0.06, xx+0.06, zz-0.06, zz+0.06, Y-0.5, cy);
    drive(cx0+0.1, cx1-0.1, Math.min(cz0, Z-f*HW, cz1), Math.max(cz1, Z-f*HW, cz0));
    return h; };

  // the lots, west to east; north of the road the lake is behind them
  const COL={tan:{s:"#d8c8a4", t:"#f4f2ec", r:"#5a4a3e", sh:"#5a3a2a", d:"#7a2a1e"}, white:{s:"#eeeee8", t:"#f4f2ec", r:"#3e4246", sh:"#2a4a7a", d:"#2a4a7a"},
             blue:{s:"#a8bccc", t:"#f4f2ec", r:"#4e5256", sh:"#2a3a4a", d:"#c42a1a"}, yellow:{s:"#e8d070", t:"#f4f2ec", r:"#4e5256", sh:"#2e4a32", d:"#2e4a32", st:"#8a2418"},
             sage:{s:"#a8b494", t:"#f4f2ec", r:"#3e4246", sh:"#5a3a2a", d:"#5a3a2a", st:"#2a3a4a"}, whiteC:{s:"#eeeee8", t:"#f4f2ec", r:"#3e4246", sh:"#8a2418", d:"#8a2418", st:"#2a3a5a"},
             gray:{s:"#8e9496", t:"#2e5a3a", r:"#3e4246", sh:"#2e5a3a", d:"#2e5a3a"}, slate:{s:"#7a8a9a", t:"#f4f2ec", r:"#3e4246", sh:"#2a3442", d:"#2a3442"},
             tanD:{s:"#c8b48e", t:"#6a4a2e", r:"#4a3e36", sh:"#6a4a2e", d:"#6a4a2e"},
             brick:{s:"#b05a44", t:"#f4f2ec", r:"#3e4246", d:"#f4f2ec", g:"#f4f2ec"}, brickT:{s:"#c49a74", t:"#f4f2ec", r:"#4a3e36", d:"#3a5a3a", g:"#e8dcc4"}, cream:{s:"#efe6cc", t:"#f4f2ec", r:"#5a4a3e", sh:"#2e4a32", d:"#2e4a32"}};
  const N=+1, S=-1;                                                // north of the road a house faces south (+z); south of it, north
  const H={};
  H.n1=capeCod(1084, N, 1084, COL.tan);
  H.n2=twoStorey(1129, N, 1130, COL.gray, -1);
  H.n3=bungalow(1173, N, 1172, COL.yellow);
  H.n4=ranch(1214, N, 1214, COL.brick, -1);
  H.n5=capeCod(1396, N, 1396, COL.white);
  H.s1=ranch(1088, S, 1087, COL.brickT, 1);
  H.s2=bungalow(1133, S, 1131, COL.sage);
  H.s3=twoStorey(1176, S, 1177, COL.slate, 1);
  H.s4=capeCod(1222, S, 1221, COL.blue);
  H.s5=ranch(1272, S, 1271, COL.brick, -1);
  H.s6=bungalow(1318, S, 1317, COL.whiteC);
  H.s7=capeCod(1360, S, 1361, COL.cream);
  H.s8=twoStorey(1402, S, 1403, COL.tanD, -1);
  LAKESIDE.houses=[H.n1, H.n2, H.n3, H.n4, H.n5, H.s1, H.s2, H.s3, H.s4, H.s5, H.s6, H.s7, H.s8];
  // the rest of each lot: mailbox, drive, car, the trees and the yard
  const lot=(h, mx, opts)=>{ const f=h.f, zr=Z-f*(HW+0.7);
    mailbox(mx, zr, f, opts.mb);
    if(opts.gravel){ const [a,b]=opts.gravel; drive(a, b, Math.min(Z-f*HW, Z-f*(HW+20)), Math.max(Z-f*HW, Z-f*(HW+20)), true); }
    if(opts.car){ const [k, p, cx, cz, yaw]=opts.car; car(k, p, cx, cz, yaw); }
    for(const [sp, tx, tz, s] of opts.trees||[]) tree(sp, tx, tz, s);
    for(const [sx, sz, s] of opts.shrubs||[]) shrub(sx, sz, s); };
  // (north side: z decreasing away from the road; the yards run back to the shore at SH)
  { const zN=Z-HW, zr=v=>Z-HW-v;
    lot(H.n1, 1089.6, {gravel:[1090.6, 1093.8], car:[3, "#7a8a96", 1092.2, zr(10.5), Math.PI], trees:[["hard", 1074, zr(4), 1.25],["hemlock", 1064.5, zr(36), 1.1]]});
    lot(H.n2, 1119.6, {car:[1, "#2a3a2a", H.n2.x0-2.2, zr(16.0), Math.PI], trees:[["hard", 1137.5, zr(6), 1.2],["pine", 1144, zr(40), 1.15]], mb:"#2e5a3a"});
    lot(H.n3, 1178.2, {gravel:[1178.8, 1182.0], car:[0, "#8a2418", 1180.4, zr(11), Math.PI], trees:[["hard", 1160, zr(5), 1.3]]});
    lot(H.n4, 1205.4, {car:[2, "#e8e4da", 1209.0, zr(9.5), Math.PI], trees:[["hard", 1199, zr(52), 1.35],["hemlock", 1233, zr(5), 1.05]]});
    lot(H.n5, 1402.0, {gravel:[1402.6, 1405.8], car:[0, "#3a5a8a", 1404.2, zr(10), Math.PI], trees:[["hard", 1385, zr(5), 1.2],["pine", 1416, zr(42), 1.1]]});
    // out back, toward the water: a fire ring with chairs round it, kayaks, a picnic table and the grill, a shed
    fire(1084, zr(66)); kayaks(1072, zr(70), Math.PI/2);
    shed(1122, zr(45), Math.PI, "#8a2418", "#3e4246"); swingSet(1134, zr(52), 0.3);
    fire(1175, zr(70)); kayaks(1185, zr(76), Math.PI/2+0.2);
    picnic(1212, zr(48), 0.1, "#8a6a44"); picnic(1218, zr(53), -0.2, "#c42a1a"); grill(1222.5, zr(46.5)); flagpole(1227, zr(42));
    fire(1398, zr(68)); adir(1406, zr(78), Math.PI+0.3, "#2a6a8a"); }
  // (south side: z increasing away from the road)
  { const zs=v=>Z+HW+v;
    lot(H.s1, 1089.4, {car:[3, "#a8a8a2", 1093.0, zs(8.5), 0], trees:[["hard", 1072, zs(6), 1.25],["hemlock", 1104, zs(48), 1.1]]});
    lot(H.s2, 1123.4, {gravel:[1124.0, 1127.2], car:[2, "#2a4a7a", 1125.6, zs(10), 0], trees:[["hard", 1142, zs(5), 1.3],["pine", 1126, zs(44), 1.15]]});
    lot(H.s3, 1185.0, {car:[0, "#d8d4c8", H.s3.x1+2.2, zs(12), 0], trees:[["hard", 1164, zs(5), 1.2]], mb:"#2a3442"});
    lot(H.s4, 1228.0, {gravel:[1228.6, 1231.8], car:[1, "#5a2a2a", 1230.2, zs(11), 0], trees:[["hard", 1212, zs(4), 1.25],["hemlock", 1238, zs(40), 1.1]]});
    lot(H.s5, 1263.6, {car:[3, "#1e2a3a", 1267.0, zs(8.5), 0], trees:[["hard", 1286.5, zs(5), 1.3],["hard", 1258, zs(46), 1.35]]});
    lot(H.s6, 1323.0, {gravel:[1323.6, 1326.8], car:[0, "#c8a040", 1325.2, zs(11), 0], trees:[["hard", 1306, zs(5), 1.25],["pine", 1330, zs(44), 1.1]]});
    lot(H.s7, 1349.8, {gravel:[1350.4, 1353.6], car:[2, "#6a6a62", 1352.0, zs(10.5), 0], trees:[["hard", 1368, zs(6), 1.2]]});
    lot(H.s8, 1392.8, {car:[1, "#8a2418", H.s8.x0-2.2, zs(12), 0], trees:[["hard", 1414, zs(30), 1.2]], mb:"#6a4a2e"});
    swingSet(1088, zs(36), 0.0); garden(1096, 1103, zs(40), zs(45));
    shed(1140, zs(40), 0.2, "#e8e4da", "#4e5256"); boat(1171.6+6.2, zs(30), 0.0);
    swingSet(1226, zs(40), -0.2); picnic(1274, zs(36), 0.3); grill(1268, zs(33));
    shed(1322, zs(42), -0.1, "#5a6a4a", "#3e4246"); garden(1350, 1357, zs(38), zs(44)); flagpole(1308.4, zs(7.0)); hoop(1350.0, zs(14), -1); }
  // more trees in the yards, front and back, the big old ones a street like this grows up under
  for(const [sp, x, z, sc] of [["hard", 1080, Z+HW+55, 1.3],["hemlock", 1112, Z+HW+57, 1.1],["hard", 1150, Z+HW+54, 1.35],["pine", 1166, Z+HW+58, 1.15],
      ["hard", 1196, Z+HW+52, 1.3],["hemlock", 1210, Z+HW+58, 1.1],["hard", 1246, Z+HW+56, 1.4],["hard", 1290, Z+HW+54, 1.3],["pine", 1302, Z+HW+58, 1.15],
      ["hard", 1340, Z+HW+55, 1.35],["hemlock", 1372, Z+HW+52, 1.1],["hard", 1392, Z+HW+56, 1.3],
      ["hard", 1110, Z+HW+8, 1.2],["hard", 1157, Z+HW+9, 1.25],["hard", 1248, Z+HW+8, 1.2],["hard", 1294, Z+HW+9, 1.2],["hard", 1338, Z+HW+8, 1.25],
      ["hard", 1100, Z-HW-7, 1.2],["hard", 1152, Z-HW-8, 1.25],["hemlock", 1194, Z-HW-9, 1.05],
      ["hard", 1100, Z-HW-58, 1.35],["hard", 1150, Z-HW-64, 1.3],["hard", 1196, Z-HW-70, 1.35],["pine", 1232, Z-HW-66, 1.15],["hard", 1386, Z-HW-56, 1.3]]) tree(sp, x, z, sc);
  // and the woods round the back of the lots and both ends of the street: a ragged edge of real trees, shrubs at their feet
  { const edge=(x, z, row)=>{ const q=hash2(x*0.9, z*1.1);
      FOREST.plant(row<2 ? (q<0.2 ? "hemlock" : "edge") : (q<0.25 ? "hemlock" : q<0.33 ? "pine" : "hard"), x, z, {scale:0.85+hash2(x*3,z)*0.35});
      if(row<2 && q<0.5) shrub(x+(hash2(z,x)-0.5)*2, z+(hash2(x,z*2)-0.5)*2, 0.9+q); };
    for(let x=TW.x0-12; x<TW.x1+12; x+=5.2) for(const row of [1.5, 6.0, 11.0]) edge(x+(hash2(x,row)-0.5)*3.4, TW.z1+row+(hash2(row,x)-0.5)*2.4, row);
    for(let z=TW.z0+6; z<TW.z1; z+=5.2) for(const row of [1.5, 6.0, 11.0]) edge(TW.x1+row+(hash2(z,row)-0.5)*2.4, z+(hash2(row,z)-0.5)*3.4, row);
    for(let z=TW.z0+6; z<TW.z1; z+=5.2){ if(z>Z-30 && z<Z+28) continue; for(const row of [1.5, 6.0, 11.0]) edge(TW.x0-row+(hash2(z,row)-0.5)*2.4, z+(hash2(row,z)-0.5)*3.4, row); } }
  // a few more cars on the street's shoulder, as there are on any street with a cookout on it
  car(0, "#4a6a5a", 1300, Z+HW-0.9, -Math.PI/2+0.01, Y+0.03); car(1, "#e8e4da", 1309, Z+HW-0.9, -Math.PI/2-0.01, Y+0.03);
  // ACs, propane, the odd lawn ornament
  ac(H.n1.x1+0.7, H.n1.zm); ac(H.s2.x1+0.7, H.s2.zm); ac(H.s4.x0-0.7, H.s4.zm+1.0); ac(H.n3.x0-0.7, H.n3.zm+2.0);
  propane(H.n2.x1+1.0, H.n2.zm-1.5); propane(H.s7.x0-1.0, H.s7.zm);
  for(const [x, z, col] of [[1180.5, Z+HW+8.0, "#ff5aa8"],[1181.2, Z+HW+8.4, "#ff5aa8"]]){ tubeE(V3(x, Y, z), V3(x, Y+0.55, z), 0.008, "#2a2a2a");
    ent(new T.SphereGeometry(0.11, 10, 8).scale(1.4, 0.8, 0.8), x, Y+0.62, z, col); tubeE(V3(x+0.1, Y+0.66, z), V3(x+0.12, Y+0.88, z), 0.018, col); }

  /* ======================================================================
     LAKESIDE PARK
     ====================================================================== */
  // (zones: the last one added that holds you names where you are, so the general ones go in first)
  addZone(TW.x0, TW.x1, TW.z0, TW.z1, Y-4, Y+14, "LAKE STREET");
  addZone(A.lake.x0, A.lake.x1, A.lake.z0, A.lake.z1, WY-8, WY+30, "EDINBORO LAKE");
  const LZ0=Z-HW-8.0, LZ1=Z-HW-0.05, LX0=1244.0, LX1=1366.0;          // the lot: an aisle along the road, the stalls on its north side
  const SZ0=Z-HW-14.5;                                             // the stalls' far end, where the curb is
  flat("lotpave", LX0, LX1, SZ0, LZ1, Y+0.045, "#a2a2a0", 0.62); addPaveRect(LX0, LX1, SZ0, LZ1, Y+0.015);
  A.noPole.push([LX0-2, LX1+2]);
  // the curb along the lot's lake side, wheel stops, the stall lines angled sixty degrees toward the water
  bx("concrete", LX1-LX0, 0.30, 0.25, (LX0+LX1)/2, Y+0.06, SZ0-0.125, 0.5, 0, "#bab6ac");
  addFlat(LX0, LX1, SZ0-0.25, SZ0, Y+0.21);
  { const ang=Math.PI/3, len=6.2, dz=len*Math.sin(ang), ddx=len*Math.cos(ang);
    for(let x=LX0+5.0; x<LX1-3; x+=3.18){ const xa=x, za=SZ0+dz+0.05, xb=x+ddx, zb=SZ0+0.05;
      push("paint", planeGeo(0.11, len, 0), (xa+xb)/2, Y+0.054, (za+zb)/2, Math.atan2(xb-xa, zb-za), "#eceae2", -Math.PI/2, 0);
      if(x<LX1-6) B(1.8, 0.12, 0.18, x+1.59+ddx*0.9, Y+0.10, SZ0+0.6, "#bab6ac", 0); } }
  car(1, "#2a3a5a", 1290.3, SZ0+2.7, Math.PI-0.5236, Y+0.045); car(0, "#b8b4a8", 1306.2, SZ0+2.7, Math.PI-0.5236, Y+0.045); car(2, "#5a2a2a", 1325.3, SZ0+2.7, Math.PI-0.5236, Y+0.045);
  // the park's sign at the road, routed wood on posts; the rules by the water
  { const sx=LX0-4.5, sz=Z-HW-3.0;
    for(const dx of [-1.4, 1.4]){ bx("wood", 0.18, 2.3, 0.18, sx+dx, Y+1.15, sz, 0.4, 0, "#5a4430"); addCol(sx+dx-0.1, sx+dx+0.1, sz-0.1, sz+0.1, Y-0.5, Y+2.3); }
    B(3.0, 1.1, 0.10, sx, Y+1.55, sz, "#5a4430");
    for(const sd of [-1,1]) sign(2.8, 0.92, (c,Wc,H)=>{ c.fillStyle="#3a4a32"; c.fillRect(0,0,Wc,H); c.strokeStyle="#e8d8a8"; c.lineWidth=5; c.strokeRect(8,8,Wc-16,H-16);
        const L=["LAKESIDE PARK","TOWNSHIP OF WASHINGTON"], s1=sizeAll(c, [L[0]], Wc*0.78, H*0.36, "700", "Georgia, serif");
        say(c, L[0], Wc/2, H*0.40, Wc*0.78, s1, "#e8d8a8", "700", "Georgia, serif"); say(c, L[1], Wc/2, H*0.73, Wc*0.70, H*0.14, "#e8d8a8", "700", "Georgia, serif"); },
      sx, Y+1.55, sz+sd*0.062, sd>0 ? 0 : Math.PI, false, 900);
    flowers(sx-1.8, sx+1.8, sz+0.9, Y); }
  // the path: down off the lot through the lawn, and along the shore the length of the park; asphalt, on the ground
  const PR=addPaveRaster(PK.x0-6, SH-4, PK.x1+6, Z-HW+2);
  const path=(pts, w)=>{ const P=smoothPath(pts.map(([x,z])=>({x:x, z:z})), 1.0); for(const p of P) p.y=gy(p.x,p.z);
    layRibbon("asphalt", P, -w/2, w/2, 0.03, 0.4, "#9a9a96"); addPaveRibbon(P, -w/2, w/2); return P; };
  const SPZ=SH+5.5;                                                // the shore path's line
  path([[PK.x0+4, SPZ+0.4],[1270, SPZ],[1300, SPZ-0.3],[1330, SPZ],[PK.x1-4, SPZ+0.5]], 2.2);
  path([[1300, SZ0-0.3],[1300.5, SZ0-12],[1301, SZ0-30],[1300, SPZ+1.0]], 2.0);
  path([[1252, SZ0-0.3],[1253, SZ0-14],[1258, SZ0-34],[1262, SPZ+0.8]], 1.8);
  // the benches along it, facing the water; a can by every other
  for(const bxp of [1256, 1276, 1314, 1346, 1362]){ const bz=SPZ-1.9, g=gy(bxp, bz);
    for(let k=0;k<3;k++){ B(1.7, 0.035, 0.12, bxp, g+0.45, bz-0.15+k*0.14, "#7a5a3a"); B(1.7, 0.10, 0.035, bxp, g+0.62+k*0.12, bz+0.23, "#7a5a3a"); }
    for(const sd of [-0.75, 0.75]){ B(0.06, 0.45, 0.50, bxp+sd, g+0.225, bz, "#2a2a2c"); B(0.06, 0.45, 0.06, bxp+sd, g+0.72, bz+0.22, "#2a2a2c"); }
    addCol(bxp-0.9, bxp+0.9, bz-0.30, bz+0.28, g-0.5, g+0.95); addSeat(bxp, bz, g, Math.PI*0, "A BENCH BY THE WATER"); }
  for(const bxp of [1266, 1324]){ const bz=SPZ-1.6, g=gy(bxp, bz); C(0.28, 0.85, bxp, g+0.425, bz, "#2a4a3a", 16); C(0.30, 0.05, bxp, g+0.86, bz, "#1e3a2e", 16); addCol(bxp-0.3, bxp+0.3, bz-0.3, bz+0.3, g-0.5, g+0.9); }
  // the trees: a big willow and oaks and maples on the lawn; none on the path
  for(const [sp, x, z, s] of [["hard", 1249, Z-HW-30, 1.5],["hard", 1284, Z-HW-42, 1.45],["hard", 1340, Z-HW-36, 1.5],["hemlock", 1364, Z-HW-24, 1.2],["hard", 1318, Z-HW-62, 1.3],["hard", 1270, Z-HW-66, 1.35],["pine", 1356, Z-HW-60, 1.2]]) tree(sp, x, z, s);
  // the pavilion: a hip roof of shingles on six posts over a slab, three picnic tables under it
  { const cx=1266, cz=Z-HW-26.0, w=9.0, d=6.4, g=gy(cx,cz), yP=g+2.6, yR=yP+1.9, ov=0.6;
    bx("concrete", w+0.6, 0.20, d+0.6, cx, g+0.02, cz, 0.5, 0, "#b8b4aa"); addFlat(cx-w/2-0.3, cx+w/2+0.3, cz-d/2-0.3, cz+d/2+0.3, g+0.12);
    for(const dx of [-w/2+0.2, 0, w/2-0.2]) for(const dz of [-d/2+0.2, d/2-0.2]){ B(0.22, yP-g, 0.22, cx+dx, (yP+g)/2+0.06, cz+dz, "#6a4a2c"); addCol(cx+dx-0.12, cx+dx+0.12, cz+dz-0.12, cz+dz+0.12, g-0.5, yP); }
    for(const dz of [-d/2+0.2, d/2-0.2]) B(w, 0.28, 0.18, cx, yP-0.08, cz+dz, "#6a4a2c");
    for(const dx of [-w/2+0.2, w/2-0.2]) B(0.18, 0.28, d-0.2, cx+dx, yP-0.08, cz, "#6a4a2c");
    const xa=cx-w/2-ov, xb=cx+w/2+ov, za=cz-d/2-ov, zb=cz+d/2+ov, xr0=cx-1.2, xr1=cx+1.2, yo=yP+0.06;
    push("shingle", new FaceGeo().slab([V3(xa, yo, zb), V3(xb, yo, zb), V3(xr1, yR, cz), V3(xr0, yR, cz)], 0.14, 0.5).geo(), 0,0,0, 0, "#4a3e36");
    push("shingle", new FaceGeo().slab([V3(xb+0.01, yo, za), V3(xa-0.01, yo, za), V3(xr0, yR-0.005, cz), V3(xr1, yR-0.005, cz)], 0.14, 0.5).geo(), 0,0,0, 0, "#4a3e36");
    push("shingle", new FaceGeo().slab([V3(xa, yo+0.004, za+0.02), V3(xa, yo+0.004, zb-0.02), V3(xr0, yR-0.01, cz)], 0.14, 0.5).geo(), 0,0,0, 0, "#4a3e36");
    push("shingle", new FaceGeo().slab([V3(xb, yo+0.004, zb-0.02), V3(xb, yo+0.004, za+0.02), V3(xr1, yR-0.01, cz)], 0.14, 0.5).geo(), 0,0,0, 0, "#4a3e36");
    B(2.6, 0.08, 0.2, cx, yR+0.02, cz, "#3e3630");
    addRoof(cx-w/2-0.3, cx+w/2+0.3, cz-d/2-0.3, cz+d/2+0.3, yP-0.2);
    for(const dx of [-3.0, 0, 3.0]) picnic(cx+dx, cz, Math.PI/2, "#8a6a44", g+0.12);
    LAMPS.push({x:cx, y:yP-0.3, z:cz, color:0xffe2b8, intensity:0.5, dist:9, decay:1.6, mothy:true}); B(0.3, 0.1, 0.3, cx, yP+0.1, cz, "#2a2a2c"); push("lk_porch", new T.SphereGeometry(0.10, 10, 8), cx, yP-0.02, cz, 0, "#ffffff");
    addZone(cx-w/2, cx+w/2, cz-d/2, cz+d/2, g-1, yP, "THE PAVILION"); }
  // swings and a slide for the kids, on wood chips
  { const cx=1348, cz=Z-HW-27, g=gy(cx,cz);
    flat("mulch", cx-6, cx+6, cz-4.5, cz+4.5, g+0.02, "#7a5a3a", 0.5); swingSet(cx-2.6, cz, 0);
    const sx=cx+3.2, sz=cz; for(const [dx,dz] of [[-0.5,-0.5],[0.5,-0.5],[-0.5,0.5],[0.5,0.5]]) B(0.08, 1.9, 0.08, sx+dx, g+0.95, sz+dz, "#c42a1a");
    B(1.1, 0.06, 1.1, sx, g+1.6, sz, "#e6c21c"); for(let k=0;k<6;k++) B(0.6, 0.04, 0.06, sx, g+0.25+k*0.25, sz-0.55, "#c42a1a");
    const a=V3(sx, g+1.6, sz+0.55), b=V3(sx, g+0.25, sz+3.2), d=new T.Vector3().subVectors(b,a), L=d.length();
    ent(boxGeo(0.62, 0.05, L), (a.x+b.x)/2, (a.y+b.y)/2, (a.z+b.z)/2, "#2a7ac8", Math.atan2(d.y, Math.hypot(d.x,d.z))*-1, 0, 0);
    for(const sd of [-1,1]) ent(boxGeo(0.04, 0.18, L), (a.x+b.x)/2+sd*0.31, (a.y+b.y)/2+0.08, (a.z+b.z)/2, "#2a7ac8", -Math.atan2(d.y, Math.hypot(d.x,d.z)), 0, 0);
    addCol(sx-0.6, sx+0.6, sz-0.7, sz+3.3, g-0.5, g+1.9); }

  /* ---- the docks: boards on a pipe frame out over the water, posts at the corners; the boats at them ---------- */
  const DY=WY+0.55;                                                // the decks
  const dockRect=(x0, x1, z0, z1)=>{ const L=Math.abs(z1-z0)>Math.abs(x1-x0), w=x1-x0, d=z1-z0;
    bx("lk_deck", w, 0.07, d, (x0+x1)/2, DY-0.035, (z0+z1)/2, 0.7, 0, "#c8c2b6");             // (pressure-treated, gone grey)
    // the boards' gaps, the edge boards, the frame under
    const n=Math.floor((L ? d : w)/0.16);
    for(let k=1;k<n;k++){ const t=k/n; if(L) B(w-0.02, 0.006, 0.012, (x0+x1)/2, DY+0.004, lerp(z0,z1,t), "#4a443c"); else B(0.012, 0.006, d-0.02, lerp(x0,x1,t), DY+0.004, (z0+z1)/2, "#4a443c"); }      // (clear of the deck's top however much the bake grows it)
    for(const [ex0, ex1, ez0, ez1] of L ? [[x0-0.04, x0+0.02, z0, z1],[x1-0.02, x1+0.04, z0, z1]] : [[x0, x1, z0-0.04, z0+0.02],[x0, x1, z1-0.02, z1+0.04]])
      B(ex1-ex0, 0.22, ez1-ez0, (ex0+ex1)/2, DY-0.12, (ez0+ez1)/2, "#6e6658");
    addFlat(x0, x1, z0, z1, DY); };
  const piling=(x, z)=>{ const bed=Math.min(gy(x,z), WY-0.5); C(0.11, DY+0.55-bed, x, (DY+0.55+bed)/2, z, "#6a5a44", 12); C(0.12, 0.04, x, DY+0.57, z, "#5a4a36", 12);
    addCol(x-0.12, x+0.12, z-0.12, z+0.12, DY-1, DY+0.6); };
  const cleat=(x, z, ry)=>{ B(0.30, 0.04, 0.06, x, DY+0.06, z, "#8a8d90", ry); for(const sd of [-1,1]) B(0.05, 0.05, 0.05, x+Math.cos(ry)*sd*0.08, DY+0.025, z-Math.sin(ry)*sd*0.08, "#8a8d90", ry); };
  // the pontoon boats: two aluminium logs, a deck, the fence round it, the seats, the helm, a bimini top, the motor
  const pontoon=(x, z, ry, seat)=>{ const BM=[], be=(geo,lx,ly,lz,c,rx,rz)=>BM.push({geo:geo, matrix:new T.Matrix4().compose(V3(lx,ly,lz), new T.Quaternion().setFromEuler(new T.Euler(rx||0,0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
    const bb=(w,h,d,lx,ly,lz,c,rx,rz)=>be(boxGeo(w,h,d),lx,ly,lz,c,rx,rz), rb=(w,h,d,lx,ly,lz,c)=>be(rboxGeo(w,h,d,0.05,2),lx,ly,lz,c), L=7.2;
    for(const sd of [-0.85, 0.85]){ be(new T.CylinderGeometry(0.30, 0.30, L-0.8, 18), sd, 0.02, 0, "#c8ccd0", Math.PI/2); be(new T.ConeGeometry(0.30, 0.8, 18), sd, 0.02, L/2, "#c8ccd0", Math.PI/2);
      be(new T.SphereGeometry(0.30, 14, 8, 0, Math.PI*2, 0, Math.PI/2), sd, 0.02, -(L-0.8)/2, "#c8ccd0", -Math.PI/2); }
    bb(2.5, 0.14, L, 0, 0.42, 0.1, "#5a5e62"); bb(2.44, 0.02, L-0.1, 0, 0.50, 0.1, "#3a3e44");
    // the fence: panels down each side and round the bow, a gate either side forward, the stern open to the motor
    for(const sd of [-1,1]){ bb(0.04, 0.78, L-2.2, sd*1.22, 0.90, -0.6, "#d8dade"); bb(0.06, 0.05, L-2.1, sd*1.22, 1.30, -0.6, "#b8bcc0");
      bb(0.04, 0.78, 0.9, sd*1.22, 0.90, L/2-0.75, "#d8dade"); bb(0.06, 0.05, 0.9, sd*1.22, 1.30, L/2-0.75, "#b8bcc0"); }
    bb(2.40, 0.78, 0.04, 0, 0.90, L/2-0.25+0.1, "#d8dade"); bb(2.44, 0.05, 0.06, 0, 1.30, L/2-0.25+0.1, "#b8bcc0");
    for(const sd of [-1,1]) bb(2.38, 0.05, 0.012, 0, 0.62+(sd>0?0.38:0), 0, "#2a4a8a");
    // the seats: a bench along each side and across the stern, vinyl; the helm console forward on the right
    for(const sd of [-1,1]){ rb(0.6, 0.42, 2.6, sd*0.86, 0.72, -1.4, seat); rb(0.16, 0.5, 2.6, sd*1.12, 1.0, -1.4, seat); }
    bb(0.7, 0.9, 0.6, 0.72, 0.96, 1.4, "#e8e8e4"); bb(0.5, 0.3, 0.04, 0.72, 1.48, 1.62, "#1a2a3a", -0.5); be(new T.TorusGeometry(0.17, 0.02, 6, 16), 0.72, 1.45, 1.22, "#1a1a1a", -0.9);
    rb(0.6, 0.45, 0.6, 0.72, 0.74, 0.6, seat);
    // the bimini: four poles and the canvas over the middle
    for(const sd of [-1,1]) for(const dz of [-1.6, 0.4]) be(new T.CylinderGeometry(0.015, 0.015, 1.3, 6), sd*1.18, 1.95, dz, "#c8ccd0");
    bb(2.5, 0.05, 2.3, 0, 2.6, -0.6, "#2a4a6a");
    // the outboard on its transom
    bb(0.40, 0.55, 0.45, 0, 0.95, -L/2-0.15, "#1a1a1a"); bb(0.14, 0.75, 0.18, 0, 0.30, -L/2-0.22, "#2a2a2a"); bb(0.30, 0.10, 0.12, 0, -0.08, -L/2-0.20, "#2a2a2a");
    const m=new T.Mesh(mergeEntries(BM), new T.MeshStandardMaterial({vertexColors:true, roughness:0.45, metalness:0.35}));
    m.position.set(x, WY, z); m.rotation.y=ry; m.castShadow=true; m.receiveShadow=true; scene.add(m);
    LAKESIDE.boats.push({m:m, y0:WY, ph:r()*6.28, ry:ry});
    const hx=Math.abs(Math.cos(ry))*1.3+Math.abs(Math.sin(ry))*(L/2+0.5), hz=Math.abs(Math.sin(ry))*1.3+Math.abs(Math.cos(ry))*(L/2+0.5);
    addCol(x-hx, x+hx, z-hz, z+hz, WY-1, WY+2.7); };
  // dock A: straight out, a T at the end; dock B: out, then a finger to the east; a ladder, a life ring, a bench
  const docks=[{x0:1288.8, x1:1290.8, z0:SH-20.0, z1:SH+2.2, T:[1284.0, 1295.6, SH-22.4, SH-20.0],
                edges:[[1288.68, 1288.82, SH-20.0, SH+0.4],[1290.78, 1290.92, SH-20.0, SH+0.4],[1283.88, 1295.72, SH-22.52, SH-22.38],
                       [1283.88, 1284.02, SH-22.4, SH-20.0],[1295.58, 1295.72, SH-22.4, SH-20.0],[1284.0, 1288.8, SH-20.02, SH-19.88],[1290.8, 1295.6, SH-20.02, SH-19.88]]},
               {x0:1334.8, x1:1336.8, z0:SH-17.0, z1:SH+2.2, T:[1336.8, 1346.0, SH-17.0, SH-15.0],
                edges:[[1334.68, 1334.82, SH-17.0, SH+0.4],[1334.68, 1346.12, SH-17.12, SH-16.98],[1336.78, 1336.92, SH-15.0, SH+0.4],
                       [1336.8, 1346.0, SH-15.02, SH-14.88],[1345.98, 1346.12, SH-17.0, SH-15.0]]}];
  for(const d of docks){ dockRect(d.x0, d.x1, d.z0, d.z1); const [tx0, tx1, tz0, tz1]=d.T; dockRect(tx0, tx1, tz0, tz1);
    for(const z of [SH-0.4, SH-6, SH-12, d.z0+0.15]) if(z>=d.z0) for(const x of [d.x0+0.06, d.x1-0.06]) piling(x, z);
    for(const [x,z] of [[tx0+0.1, tz0+0.1],[tx1-0.1, tz0+0.1],[tx0+0.1, tz1-0.1],[tx1-0.1, tz1-0.1]]) piling(x, z);
    cleat(tx0+0.6, tz1-0.15, 0); cleat(tx1-0.6, tz1-0.15, 0);
    // where you cannot step off: every edge over the water but where the walk and its T or finger join
    for(const [x0,x1,z0,z1] of d.edges) addCol(x0, x1, z0, z1, DY-1.2, DY+0.9);
    addZone(Math.min(d.x0, tx0), Math.max(d.x1, tx1), Math.min(tz0, d.z0), SH, WY-2, DY+3, "THE DOCK"); }
  // a ladder down off dock A's end; a life ring on a post; a bench at the end of dock B's finger
  { const lx=1290.0, lz=SH-22.4; for(const sd of [-0.22, 0.22]) tubeE(V3(lx+sd, WY-1.0, lz-0.12), V3(lx+sd, DY+0.8, lz-0.12), 0.02, "#c8ccd0");
    for(let k=0;k<5;k++) tubeE(V3(lx-0.22, WY-0.7+k*0.3, lz-0.12), V3(lx+0.22, WY-0.7+k*0.3, lz-0.12), 0.015, "#c8ccd0");
    B(0.08, 1.4, 0.08, 1295.3, DY+0.7, SH-21.2, "#f4f2ec"); ent(new T.TorusGeometry(0.30, 0.07, 8, 20), 1295.3, DY+1.05, SH-21.12, "#e6531c");
    addCol(1295.24, 1295.36, SH-21.26, SH-21.14, DY-0.5, DY+1.4);
    const bx2=1343.5, bz2=SH-16.4; for(let k=0;k<3;k++) B(1.6, 0.035, 0.11, bx2, DY+0.45, bz2-0.13+k*0.13, "#7a5a3a");
    for(const sd of [-0.7, 0.7]) B(0.08, 0.45, 0.40, bx2+sd, DY+0.225, bz2, "#5a4a36"); addCol(bx2-0.82, bx2+0.82, bz2-0.24, bz2+0.24, DY-0.5, DY+0.5);
    addSeat(bx2, bz2, DY, Math.PI, "THE BENCH ON THE DOCK"); }
  // the boats: two at dock A's T, one along dock B
  pontoon(1286.0, SH-26.4, 0.0, "#e8e2d2"); pontoon(1293.6, SH-26.4, 0.04, "#d8e2ec");
  pontoon(1333.0, SH-9.0, Math.PI, "#e8e2d2");
  for(const [x,z] of [[1286.0, SH-22.6],[1293.6, SH-22.6]]) tubeE(V3(x, DY+0.06, z), V3(x, WY+0.6, z-0.8), 0.012, "#e8e2c8");
  // the shore along the park: big stones at the water's edge, both sides of each dock
  for(let x=PK.x0+1.0; x<PK.x1-1.0; x+=0.85){ if(docks.some(d=>x>d.x0-0.6 && x<d.x1+0.6)) continue;
    const s=0.28+r()*0.25; ent(new T.DodecahedronGeometry(s, 0), x+(r()-0.5)*0.3, WY+0.16+s*0.2, SH+0.2+(r()-0.5)*0.5, ["#8a847a","#7a7468","#9a948a","#6a665e"][(r()*4)|0], r()*3, r()*3); }
  // a sign: no lifeguard; and a buoy out past the docks
  { const sx=1305.0, sz=SH+3.0, g=gy(sx, sz); B(0.08, 2.0, 0.08, sx, g+1.0, sz, "#5a4430"); addCol(sx-0.06, sx+0.06, sz-0.06, sz+0.06, g-0.5, g+2.0);
    B(0.92, 0.66, 0.04, sx, g+1.62, sz-0.06, "#f4f2ec");
    sign(0.86, 0.60, (c,Wc,H)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0,0,Wc,H); c.fillStyle="#c42a1a"; c.fillRect(0,0,Wc,H*0.28);
        say(c, "NO LIFEGUARD", Wc/2, H*0.15, Wc*0.80, H*0.16, "#f4f2ec", "800", "Arial");
        const L=["SWIM AT YOUR OWN RISK","NO DIVING FROM DOCKS","PARK CLOSES AT DUSK"], s=sizeAll(c, L, Wc*0.80, H*0.11, "700", "Arial");
        L.forEach((t,k)=>say(c, t, Wc/2, H*(0.44+k*0.19), Wc*0.80, s, "#1a1a1a", "700", "Arial")); }, sx, g+1.62, sz-0.083, Math.PI, false, 300); }
  { const bx2=1316, bz2=SH-46; C(0.20, 1.1, bx2, WY+0.35, bz2, "#f4f2ec", 16); C(0.205, 0.22, bx2, WY+0.62, bz2, "#e6531c", 16);
    LAKESIDE.boats.push({m:null, buoy:true}); }
  // the park's lamps along the path, and the walls: the street's ends, the backs of the lots, the shore
  for(const lx of [1250, 1286, 1322, 1358]){ const lz=SPZ+1.6, g=gy(lx, lz); C(0.06, 3.6, lx, g+1.8, lz, "#2a2a2c", 10); C(0.16, 0.30, lx, g+3.75, lz, "#2a2a2c", 12);
    push("lk_porch", new T.SphereGeometry(0.16, 12, 8), lx, g+3.52, lz, 0, "#ffffff"); addCol(lx-0.08, lx+0.08, lz-0.08, lz+0.08, g-0.5, g+3.6);
    LAMPS.push({x:lx, y:g+3.3, z:lz, color:0xffe2b8, intensity:0.55, dist:12, decay:1.5, mothy:true}); }
  addZone(PK.x0, PK.x1, PK.z0, PK.z1, WY-2, Y+12, "LAKESIDE PARK");
  addZone(TW.x0, TW.x1, Z-HW-1, Z+HW+1, Y-2, Y+12, "LAKE STREET · US 6N");
  { const C0=A.corr;
    W(TW.x0-0.4, TW.x0+0.4, TW.z0, C0.z0); W(TW.x0-0.4, TW.x0+0.4, C0.z1, TW.z1);
    W(TW.x0, TW.x1, TW.z1-0.4, TW.z1+0.4); W(TW.x1-0.4, TW.x1+0.4, TW.z0, TW.z1);
    // the shore: a step short of the water, open where a dock goes out
    let x=TW.x0;
    for(const d of docks.slice().sort((p,q)=>p.x0-q.x0)){ W(x, d.x0, SH+0.35, SH+0.75); x=d.x1; }
    W(x, TW.x1, SH+0.35, SH+0.75); }

  /* ======================================================================
     THE LAKE
     ====================================================================== */
  // the water: one sheet over the whole basin, dark, the sky in it, ripples drifting across it
  { const L=A.lake, nrm=(()=>{ const c=cvs(256,256), x=c.getContext("2d"), q=_trng(1357), img=x.createImageData(256,256), H=new Float32Array(256*256);
      for(let k=0;k<70;k++){ const cx=q()*256, cy=q()*256, rad=8+q()*40, a=0.4+q()*0.6;
        for(let j=0;j<256;j++) for(let i=0;i<256;i++){ let dx=Math.abs(i-cx), dy=Math.abs(j-cy); dx=Math.min(dx, 256-dx); dy=Math.min(dy, 256-dy); const d=Math.hypot(dx*1.6, dy)/rad; if(d<1) H[j*256+i]+=a*Math.cos(d*Math.PI/2)*Math.sin(d*9+k); } }
      for(let j=0;j<256;j++) for(let i=0;i<256;i++){ const hx=H[j*256+((i+1)&255)]-H[j*256+((i+255)&255)], hy=H[((j+1)&255)*256+i]-H[((j+255)&255)*256+i];
        const n=Math.hypot(hx, hy, 1), o=(j*256+i)*4; img.data[o]=128+(-hx/n)*127; img.data[o+1]=128+(-hy/n)*127; img.data[o+2]=128+(1/n)*127; img.data[o+3]=255; }
      x.putImageData(img,0,0); const t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(160, 100); return t; })();
    const w=L.x1-L.x0+80, d=L.z1-L.z0+40, g=new T.PlaneGeometry(w, d, 1, 1);
    const m=envOut(new T.MeshStandardMaterial({color:0x34505c, roughness:0.10, metalness:0.55, normalMap:nrm, normalScale:new T.Vector2(0.35, 0.35)}), 1.0);
    const mesh=new T.Mesh(g, m); mesh.rotation.x=-Math.PI/2; mesh.position.set((L.x0+L.x1)/2, WY, (L.z0+L.z1)/2-10); mesh.receiveShadow=true; mesh.name="lake";
    scene.add(mesh); LAKESIDE.water=mesh; }
  // across the water: cottages along the far shore, white and red and grey, their windows lit at night
  for(let k=0;k<26;k++){ const x=1260+k*34+(r()-0.5)*14, zz=A.lake.z0-14-r()*20;
    if(Terrain.lakeSD(x, zz)<6) continue;
    const g=gy(x, zz), w=6+r()*4, d=5+r()*3, h=3+r()*2.5, col=["#eeeee8","#c8a070","#a03a2a","#8a9096","#e8d070"][(r()*5)|0];
    B(w, h, d, x, g+h/2, zz, col); ent(new FaceGeo().slab([V3(-w/2-0.3, h, d/2+0.3), V3(w/2+0.3, h, d/2+0.3), V3(w/2+0.3, h+1.8, 0), V3(-w/2-0.3, h+1.8, 0)], 0.2, 0.5).geo().translate(x, g, zz), 0,0,0, "#3e4246");
    ent(new FaceGeo().slab([V3(w/2+0.3, h, -d/2-0.3), V3(-w/2-0.3, h, -d/2-0.3), V3(-w/2-0.3, h+1.8, 0), V3(w/2+0.3, h+1.8, 0)], 0.2, 0.5).geo().translate(x, g, zz), 0,0,0, "#3e4246");
    for(let i=0;i<2;i++) push(r()<0.6 ? "lk_win" : "lk_wind", planeGeo(1.2, 1.1, 0), x-w/4+i*w/2, g+h*0.5, zz+d/2+0.02, 0, "#ffffff"); }
  // a sailboat out in the middle, a fisherman in a jon boat nearer, sitting very still
  { const sb=new T.Group(), SM=[]; const se=(geo,lx,ly,lz,c,rx,ry,rz)=>SM.push({geo:geo, matrix:new T.Matrix4().compose(V3(lx,ly,lz), new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
    se(new T.SphereGeometry(1, 16, 8, 0, Math.PI*2, Math.PI/2, Math.PI/2).scale(1.1, 0.7, 3.6), 0, 0.35, 0, "#f4f2ec"); se(new T.CylinderGeometry(1.1, 1.1, 0.06, 16).scale(1, 1, 3.4), 0, 0.36, 0, "#d8d4c8");
    se(new T.CylinderGeometry(0.06, 0.06, 9.0, 8), 0, 4.8, 0.4, "#c8ccd0");
    se(new FaceGeo().poly([V3(0, 1.2, 0.5), V3(0, 9.0, 0.45), V3(0, 1.2, -3.4)]).poly([V3(0, 1.2, -3.4), V3(0, 9.0, 0.45), V3(0, 1.2, 0.5)]).geo(), 0.03, 0, 0, "#f4f2ec");
    se(new FaceGeo().poly([V3(0, 1.0, 0.7), V3(0, 7.6, 0.6), V3(0, 1.0, 3.4)]).poly([V3(0, 1.0, 3.4), V3(0, 7.6, 0.6), V3(0, 1.0, 0.7)]).geo(), 0.03, 0, 0, "#e8e4d8");
    const m=new T.Mesh(mergeEntries(SM), new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, side:T.DoubleSide})); sb.add(m);
    sb.position.set(1520, WY, -1610); sb.rotation.y=0.9; scene.add(sb); LAKESIDE.boats.push({m:sb, y0:WY, ph:1.3, ry:0.9, drift:true});
    const jb=new T.Group(), JM=[]; const je=(geo,lx,ly,lz,c,rx,ry,rz)=>JM.push({geo:geo, matrix:new T.Matrix4().compose(V3(lx,ly,lz), new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
    je(boxGeo(1.4, 0.4, 4.0), 0, 0.15, 0, "#5a6a4a"); je(boxGeo(1.3, 0.05, 3.9), 0, 0.33, 0, "#4a5a3a"); je(boxGeo(1.3, 0.06, 0.3), 0, 0.42, 0.6, "#6a5a44");
    je(boxGeo(0.42, 0.5, 0.32), 0, 0.72, 0.6, "#c45a1a"); je(new T.SphereGeometry(0.12, 10, 8), 0, 1.06, 0.6, "#d8a888"); je(new T.CylinderGeometry(0.16, 0.18, 0.08, 12), 0, 1.16, 0.6, "#2a4a2a");
    je(new T.CylinderGeometry(0.008, 0.008, 2.6, 6), 0.4, 1.4, -0.4, "#2a2a2a", 0.9, 0, 0.3);
    je(boxGeo(0.3, 0.45, 0.3), 0, 0.5, -2.05, "#1a1a1a");
    const jm=new T.Mesh(mergeEntries(JM), new T.MeshStandardMaterial({vertexColors:true, roughness:0.7})); jb.add(jm);
    jb.position.set(1356, WY, -1420); jb.rotation.y=-0.6; scene.add(jb); LAKESIDE.boats.push({m:jb, y0:WY, ph:4.1, ry:-0.6}); }
  // the geese: on the lawn by the water, and a few out swimming
  { const gm=new T.MeshStandardMaterial({vertexColors:true, roughness:0.7});
    const goose=(x, z, ry, swim)=>{ const GM=[], ge=(geo,lx,ly,lz,c,rx,ry2,rz)=>GM.push({geo:geo, matrix:new T.Matrix4().compose(V3(lx,ly,lz), new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry2||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
      ge(new T.SphereGeometry(1, 12, 8).scale(0.16, 0.13, 0.30), 0, swim ? 0.06 : 0.42, 0, "#7a6a58"); ge(new T.SphereGeometry(1, 10, 6).scale(0.13, 0.08, 0.20), 0, swim ? 0.10 : 0.47, -0.04, "#5a4a3a");
      ge(new T.CylinderGeometry(0.035, 0.045, 0.34, 8), 0, swim ? 0.26 : 0.62, 0.26, "#1a1a1a", -0.35); ge(new T.SphereGeometry(0.055, 10, 8).scale(1, 0.9, 1.4), 0, swim ? 0.42 : 0.78, 0.33, "#1a1a1a");
      ge(new T.BoxGeometry(0.06, 0.03, 0.04), 0, swim ? 0.41 : 0.77, 0.30, "#f4f2ec"); ge(new T.ConeGeometry(0.02, 0.07, 6), 0, swim ? 0.41 : 0.77, 0.42, "#1a1a1a", Math.PI/2);
      ge(new T.SphereGeometry(1, 8, 6).scale(0.1, 0.06, 0.08), 0, swim ? 0.03 : 0.34, 0.12, "#e8e4da");
      if(!swim) for(const sd of [-0.06, 0.06]) ge(new T.CylinderGeometry(0.012, 0.012, 0.30, 6), sd, 0.15, 0.02, "#1a1a1a");
      const m=new T.Mesh(mergeEntries(GM), gm); m.position.set(x, swim ? WY : gy(x,z), z); m.rotation.y=ry; m.castShadow=true; scene.add(m);
      LAKESIDE.geese.push({m:m, x:x, z:z, ry:ry, swim:swim, ph:r()*6.28, t:r()*4}); };
    for(const [x, z, ry] of [[1256, SH+7.5, 0.4],[1258.5, SH+8.6, -0.2],[1254.2, SH+9.4, 1.2],[1260.4, SH+6.4, 2.6],[1257.6, SH+11.0, 0.9]]) goose(x, z, ry, false);
    for(const [x, z, ry] of [[1310, SH-12, -1.2],[1312.5, SH-13.5, -1.3],[1308.8, SH-15.2, -1.0],[1314.2, SH-16, -1.4]]) goose(x, z, ry, true); }

  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.7, metalness:0.08}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
})();
// the water's ripples drift, the boats ride a little, the geese on the lawn graze and the ones on the water paddle
function updateLakeside(dt){
  const L=LAKESIDE; if(!L.water) return;
  L.t+=dt;
  const c=camera.position; if(c.x<900 || c.z>-1000) return;
  const n=L.water.material.normalMap; if(n){ n.offset.x=(n.offset.x+dt*0.0021)%1; n.offset.y=(n.offset.y+dt*0.0013)%1; }
  for(const b of L.boats){ if(!b.m) continue; b.m.position.y=b.y0+Math.sin(L.t*1.1+b.ph)*0.025; b.m.rotation.z=Math.sin(L.t*0.8+b.ph)*0.012; b.m.rotation.x=Math.sin(L.t*0.6+b.ph*1.3)*0.008;
    if(b.drift) b.m.rotation.y=b.ry+Math.sin(L.t*0.05+b.ph)*0.08; }
  for(const g of L.geese){
    if(g.swim){ g.m.position.x=g.x+Math.sin(L.t*0.05+g.ph)*3.0; g.m.position.z=g.z+Math.cos(L.t*0.04+g.ph)*1.5; g.m.rotation.y=g.ry+Math.sin(L.t*0.05+g.ph)*0.4; g.m.position.y=EAST.wy+Math.sin(L.t*1.3+g.ph)*0.01; }
    else { g.t-=dt; g.m.rotation.x=Math.max(0, Math.sin(L.t*0.7+g.ph))>0.6 ? 0.35 : 0; if(g.t<0){ g.t=3+Math.random()*5; g.m.rotation.y=g.ry+(Math.random()-0.5)*1.6; } } }
}
