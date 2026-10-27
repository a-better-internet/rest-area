"use strict";
/* REST AREA · 18i-discgolf.js
   a disc golf course along the lakeshore in Lakeside Park (14n): six holes,
   their tee pads and baskets, the sign and the loaner box; and the game,
   the throw, the disc's flight, the chains, the card
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18i · LAKESIDE PARK DISC GOLF
   Six holes laid out over the park's lawn between the lot and the shore,
   par 19: concrete tee pads, each with its sign (the hole, the par, the
   distance), and steel baskets with chains, the number on the band. The
   course sign by the first tee has the map on it; `E` there starts a round
   (and ends one), and a disc comes out of the loaner box.
   On a tee, or standing by your disc where it lies, the disc is in your
   hand. Look where you want it to go (up is higher) and hold Space, or the
   mouse button, to wind up: the meter climbs and falls back, and you let
   go at the power you want. A drive goes fifty-odd metres and a putt a
   few. It flies as a disc does: lift with its speed and the angle it meets
   the air at, drag the square of it, a little turn to the right fast and
   a fade to the left as it slows; it skips and slides when it comes down,
   and comes off a tree or a pole. Into the chains slowly enough and it is
   in; too hard and it clangs off. In the lake it is a stroke, and you
   throw again from where it went in. Walk up to it to pick it up. The card
   at the top keeps the hole, the throws and the round.
   ---------------------------------------------------------------------- */
const DGOLF={on:false, hole:0, throws:0, card:[], state:"hand", lie:null, at:null, disc:null, hand:null,
             p:null, v:null, th:0, spin:0, bounce:0, slide:false, ft:0, charge:-1, power:0, lastLand:null,
             holes:[], panel:null, best:null, wait:0, sign:null,
             // the camera that goes after the disc (k: how far the view has gone from your eyes to it), and the sight's zoom
             cam:{k:0, hold:0, seen:false, skip:false, init:false, dir:[0,-1], tgt:new T.Vector3(), pos:new T.Vector3()}, zoomHeld:false, zk:0};
(function discGolf(){
  const Y=EDIN.y, gy=(x,z)=>Terrain.groundAt(x,z);
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const C=(rad,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||12),x,y,z,c,rx,ry,rz);
  const tubeE=(a,b,rad,c)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,5), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(x,s,cx,cy,w,h,col,weight,family)=>{ x.fillStyle=col; fitText(x,s,w,h,cx,cy,weight||"700",family); };
  const sign=(w,h,draw,px,py,pz,ry,cw)=>signPanel(w,h, signTex(cw||Math.round(w*400), Math.round((cw||w*400)*h/w), draw), px,py,pz,ry,false);
  // the holes: the tee, the basket, the par (the lake to the north, the lot along the road to the south)
  // (the first plays past the pavilion's west end, clear of its roof)
  const H=[{t:[1247.0,-1226.0], b:[1274.0,-1253.0], par:3},
           {t:[1290.0,-1232.0], b:[1312.0,-1260.0], par:3},
           {t:[1302.0,-1272.0], b:[1350.0,-1281.0], par:3},
           {t:[1364.0,-1270.0], b:[1360.0,-1236.0], par:3},
           {t:[1346.0,-1226.0], b:[1305.0,-1232.0], par:3},
           {t:[1304.0,-1266.0], b:[1252.0,-1264.0], par:4}];        // (the last along the low lawn, well clear of the first's basket)
  const COL="#f2c418", STEEL="#9aa0a4";
  H.forEach((h, i)=>{
    const [tx, tz]=h.t, [bxx, bzz]=h.b, dx=bxx-tx, dz=bzz-tz, L=Math.hypot(dx, dz), ry=Math.atan2(dx, dz), ty=gy(tx, tz), byy=gy(bxx, bzz);
    h.len=Math.round(L); h.ry=ry; h.ty=ty+0.06; h.by=byy; h.n=i+1;
    // the pad: concrete, its long side toward the basket, six centimetres up off the grass
    bx("concrete", 1.4, 0.16, 3.0, tx, ty-0.02, tz, 0.5, ry, "#b8b4aa"); addFlatOB(tx, tz, ry, 0.7, 1.5, ty+0.06);
    // its sign, off the front corner of the pad, facing you as you stand on it
    const fx=Math.sin(ry), fz=Math.cos(ry), sx=tx+Math.cos(ry)*(-1.1)+fx*1.75, sz=tz-Math.sin(ry)*(-1.1)+fz*1.75, sg=gy(sx, sz);
    B(0.08, 1.15, 0.08, sx, sg+0.575, sz, "#5a4430", ry); addCol(sx-0.08, sx+0.08, sz-0.08, sz+0.08, sg-0.5, sg+1.2);
    B(0.62, 0.46, 0.04, sx-fx*0.06, sg+1.18, sz-fz*0.06, "#5a4430", ry);
    sign(0.56, 0.40, (c,W,Hh)=>{ c.fillStyle="#2a4a32"; c.fillRect(0,0,W,Hh); c.strokeStyle="#f2efe6"; c.lineWidth=4; c.strokeRect(6,6,W-12,Hh-12);
        say(c, "HOLE "+(i+1), W/2, Hh*0.24, W*0.78, Hh*0.22, "#f2c418", "900", "Arial");
        say(c, "PAR "+h.par+" · "+h.len+" M", W/2, Hh*0.50, W*0.78, Hh*0.16, "#f2efe6", "800", "Arial");
        // the shape of it: tee to basket, the way you are facing
        c.strokeStyle="#f2efe6"; c.lineWidth=3; c.beginPath(); c.moveTo(W/2, Hh*0.86); c.lineTo(W/2, Hh*0.66); c.stroke();
        c.fillStyle="#f2c418"; c.beginPath(); c.arc(W/2, Hh*0.66, 5, 0, 7); c.fill(); c.fillStyle="#b8b4aa"; c.fillRect(W/2-5, Hh*0.84, 10, 6); },
      sx-fx*0.092, sg+1.18, sz-fz*0.092, ry+Math.PI, 224);
    // the basket: the pole, the tray, the band and the chains hanging from it to the collar on the pole
    const g0=byy, P=(a,y,r)=>V3(bxx+Math.cos(a)*r, g0+y, bzz+Math.sin(a)*r);
    C(0.028, 1.56, bxx, g0+0.78, bzz, STEEL, 10); C(0.05, 0.05, bxx, g0+1.58, bzz, COL, 12);
    ent(new T.CylinderGeometry(0.31, 0.29, 0.20, 24, 1, true), bxx, g0+0.73, bzz, STEEL); C(0.29, 0.012, bxx, g0+0.635, bzz, STEEL, 24);
    ent(new T.TorusGeometry(0.31, 0.012, 6, 28), bxx, g0+0.83, bzz, STEEL, Math.PI/2);
    ent(new T.CylinderGeometry(0.31, 0.31, 0.08, 24, 1, true), bxx, g0+1.44, bzz, COL); ent(new T.TorusGeometry(0.31, 0.01, 6, 28), bxx, g0+1.48, bzz, COL, Math.PI/2);
    for(let k=0;k<12;k++){ const a=k*Math.PI/6; tubeE(P(a, 1.40, 0.29), P(a+0.15, 0.90, 0.16), 0.004, "#c8ccd0"); }
    for(let k=0;k<8;k++){ const a=k*Math.PI/4+0.2; tubeE(P(a, 1.40, 0.13), P(a, 0.92, 0.035), 0.004, "#c8ccd0"); }
    C(0.05, 0.04, bxx, g0+0.92, bzz, STEEL, 10);
    addCol(bxx-0.30, bxx+0.30, bzz-0.30, bzz+0.30, g0-0.5, g0+1.55);
  });
  DGOLF.holes=H;
  // the course sign by the first tee, the map of it on the board; the box of loaners beside it
  { const sx=1243.2, sz=-1222.6, sg=gy(sx, sz), ry=Math.PI*0.80;
    for(const d of [-0.89, 0.89]){ const x=sx+Math.cos(ry)*d, z=sz-Math.sin(ry)*d; B(0.12, 2.0, 0.12, x, sg+1.0, z, "#5a4430", ry); addCol(x-0.1, x+0.1, z-0.1, z+0.1, sg-0.5, sg+2.0); }
    B(1.66, 1.10, 0.06, sx, sg+1.35, sz, "#5a4430", ry);
    const draw=(c,W,Hh)=>{ c.fillStyle="#f2efe6"; c.fillRect(0,0,W,Hh); c.fillStyle="#2a4a32"; c.fillRect(0,0,W,Hh*0.24);
      say(c, "LAKESIDE PARK DISC GOLF", W/2, Hh*0.12, W*0.80, Hh*0.12, "#f2efe6", "900", "Arial");
      // the map: the lake along the top, the lot along the bottom, each hole tee to basket
      const mx=(x)=>W*0.10+(x-1238)/(1372-1238)*W*0.80, mz=(z)=>Hh*0.30+(z+1294)/(1294-1218)*Hh*0.50;
      c.fillStyle="#8ab0d0"; c.fillRect(W*0.10, Hh*0.27, W*0.80, Hh*0.05); c.fillStyle="#c8c4b8"; c.fillRect(W*0.10, Hh*0.79, W*0.80, Hh*0.04);
      H.forEach((h,i)=>{ c.strokeStyle="#2a4a32"; c.lineWidth=3; c.beginPath(); c.moveTo(mx(h.t[0]), mz(h.t[1])); c.lineTo(mx(h.b[0]), mz(h.b[1])); c.stroke();
        c.fillStyle="#f2c418"; c.beginPath(); c.arc(mx(h.b[0]), mz(h.b[1]), 6, 0, 7); c.fill();
        c.fillStyle="#2a4a32"; c.font="bold 15px Arial"; c.textAlign="center"; c.textBaseline="middle"; c.fillText(String(i+1), mx(h.t[0]), mz(h.t[1])-11); });
      say(c, "6 HOLES · PAR 19 · LOANER DISCS IN THE BOX", W/2, Hh*0.91, W*0.80, Hh*0.08, "#2a4a32", "700", "Arial"); };
    for(const sd of [1,-1]) sign(1.56, 1.00, draw, sx+Math.sin(ry)*sd*0.045, sg+1.35, sz+Math.cos(ry)*sd*0.045, sd>0 ? ry : ry+Math.PI, 624);
    const kx=sx+Math.cos(ry)*1.3, kz=sz-Math.sin(ry)*1.3, kg=gy(kx, kz);
    B(0.60, 0.70, 0.45, kx, kg+0.35, kz, "#2a6a3a", ry); B(0.64, 0.05, 0.49, kx, kg+0.725, kz, "#1e5a2e", ry);
    for(let k=0;k<4;k++) C(0.105, 0.02, kx+(k-1.5)*0.12*Math.cos(ry), kg+0.76+k*0.004, kz-(k-1.5)*0.12*Math.sin(ry), ["#f2701a","#e6c21c","#2a8ad8","#d83a8a"][k], 18, 0.6, ry, 0);
    addCol(kx-0.36, kx+0.36, kz-0.36, kz+0.36, kg-0.5, kg+0.8);
    DGOLF.sign={x:sx, z:sz};
    addUse(sx+Math.sin(ry)*1.2, sz+Math.cos(ry)*1.2, sg, "PLAY DISC GOLF", ()=>DGOLF.start(), 2.2, ()=>!DGOLF.on);
    addUse(sx+Math.sin(ry)*1.2, sz+Math.cos(ry)*1.2, sg, "END YOUR ROUND", ()=>DGOLF.end(true), 2.2, ()=>DGOLF.on); }
  addZone(1238, 1372, -1288, -1220, Y-4, Y+12, "LAKESIDE PARK DISC GOLF");
  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.5, metalness:0.35}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
  // the disc: a lathe of the profile (the flat top, the rounded rim, the dished underside), orange; and one in your hand
  const prof=[[0,0.008],[0.06,0.010],[0.095,0.006],[0.105,-0.002],[0.104,-0.008],[0.095,-0.012],[0.088,-0.006],[0,-0.004]].map(([r,y])=>new T.Vector2(r,y));
  const dg=new T.LatheGeometry(prof, 24), dm=new T.MeshStandardMaterial({color:0xf2701a, roughness:0.45, side:T.DoubleSide});
  DGOLF.disc=new T.Mesh(dg, dm); DGOLF.disc.castShadow=true; DGOLF.disc.visible=false; scene.add(DGOLF.disc);
  DGOLF.hand=new T.Mesh(dg, dm); DGOLF.hand.visible=false; scene.add(DGOLF.hand);
  // the card and the meter, up top while you play
  const st=document.createElement("style");
  st.textContent="#dgolf{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:14;display:none;min-width:min(480px,92vw);"+
    "background:rgba(14,18,16,0.86);border:1px solid #3a4a40;border-radius:6px;padding:9px 14px;font-family:'JetBrains Mono',monospace;color:#e8ece6;"+
    "box-shadow:0 6px 24px rgba(0,0,0,0.5)}#dgolf.show{display:block}#dgolf .hd{display:flex;justify-content:space-between;gap:12px;align-items:baseline}"+
    "#dgolf .t{font-family:'Oswald',sans-serif;font-size:17px;letter-spacing:.12em}#dgolf .sc{font-size:14px}#dgolf .sc b{color:#f4c430}"+
    "#dgolf .card{display:flex;gap:4px;margin-top:6px;font-size:12px}#dgolf .card span{min-width:26px;text-align:center;padding:2px 0;border-radius:3px;background:#2a302c}"+
    "#dgolf .card span.now{outline:1px solid #f4c430}#dgolf .card span.u{color:#7aff9a}#dgolf .card span.o{color:#ff9a7a}"+
    "#dgolf .msg{margin-top:6px;font-size:13px;color:#cfe0d4;min-height:18px}#dgolf .bar{margin-top:6px;height:8px;background:#2a302c;border-radius:4px;overflow:hidden}"+
    "#dgolf .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#7aff9a,#f4c430,#ff6a4a)}"+
    "#dgolf .keys{margin-top:6px;font-size:10px;color:#9aa1ab}#dgolf .keys b{color:#f4c430;font-weight:500}";
  document.head.appendChild(st);
  const d=document.createElement("div"); d.id="dgolf";
  d.innerHTML='<div class="hd"><span class="t">DISC GOLF</span><span class="sc"></span></div><div class="card"></div><div class="msg"></div><div class="bar"><i></i></div>'+
    '<div class="keys"><b>LOOK</b> aim (up is higher) · hold <b>Z</b> or the <b>RIGHT</b> button to zoom · hold <b>SPACE</b> or the <b>MOUSE</b>, let go to throw · the view goes after the disc (<b>SPACE</b> brings it back) · walk to your disc · <b>E</b> at the sign ends the round</div>';
  document.body.appendChild(d); DGOLF.panel=d;
  try{ const b=localStorage.getItem("restarea.discgolf.best"); if(b) DGOLF.best=+b; }catch(e){}
})();

DGOLF.start=function(){
  const G=DGOLF; G.on=true; G.hole=0; G.card=[]; G.throws=0; G.toTee(); G.panel.classList.add("show");
  if(typeof AUDIO!=="undefined") AUDIO.blip("jingle", player.pos.x, player.pos.z);
  toast("A DISC OUT OF THE LOANER BOX. HOLE 1 IS RIGHT HERE", "#cfe0d4"); G.draw(); };
DGOLF.end=function(early){
  const G=DGOLF, tot=G.card.reduce((a,b)=>a+b, 0), par=G.holes.slice(0, G.card.length).reduce((a,h)=>a+h.par, 0);
  G.on=false; G.state="hand"; G.disc.visible=false; G.hand.visible=false; G.charge=-1; G.panel.classList.remove("show");
  if(!early && G.card.length===G.holes.length){
    const rel=tot-par, txt=rel===0 ? "EVEN" : rel>0 ? "+"+rel : String(rel);
    if(G.best===null || tot<G.best){ G.best=tot; try{ localStorage.setItem("restarea.discgolf.best", String(tot)); }catch(e){} }
    toast("ROUND OVER · "+tot+" ("+txt+") · BEST "+G.best, "#f4c430"); if(typeof AUDIO!=="undefined") AUDIO.blip("jingle", player.pos.x, player.pos.z); }
  else toast(G.card.length ? "YOU PUT THE DISC BACK IN THE BOX. "+G.card.length+" HOLES, "+tot : "YOU PUT THE DISC BACK IN THE BOX", "#cfe0d4"); };
// to the tee of the hole you are on: the disc in your hand, to be thrown from the pad
DGOLF.toTee=function(){ const G=DGOLF, h=G.holes[G.hole]; G.throws=0; G.state="hand"; G.lie={x:h.t[0], z:h.t[1], y:h.ty, tee:true}; G.disc.visible=false; };
DGOLF.ready=function(){ const G=DGOLF; if(!G.on || G.state!=="hand" || G.wait>0 || seated || driving) return false;
  return Math.hypot(player.pos.x-G.lie.x, player.pos.z-G.lie.z)<(G.lie.tee ? 1.9 : 2.2); };
// Space (or the mouse) held: winding up; let go: the throw. Returns true when the key was the game's
DGOLF.key=function(e){ const G=DGOLF; if(!G.on) return false;
  if(e.code==="KeyZ"){ G.zoomHeld=true; return true; }
  if(e.code==="Space" && G.cam.k>0 && G.state!=="fly"){ G.cam.skip=true; return true; }
  if(e.code==="Space" && G.ready()){ if(!e.repeat && G.charge<0) G.charge=0; return true; }
  return false; };
DGOLF.keyup=function(e){ const G=DGOLF; if(e.code==="KeyZ") G.zoomHeld=false; if(e.code==="Space" && G.charge>=0) G.release(); };
// the right button is the sight, too (and in a round brings up no menu)
renderer.domElement.addEventListener("mousedown", e=>{ if(DGOLF.on && e.button===2) DGOLF.zoomHeld=true; });
addEventListener("mouseup", e=>{ if(e.button===2) DGOLF.zoomHeld=false; });
renderer.domElement.addEventListener("contextmenu", e=>{ if(DGOLF.on) e.preventDefault(); });
// how much slower the mouse turns you while the sight is closed in (17-player's look)
DGOLF.lookScale=function(){ return DGOLF.zk>0.01 ? camera.fov/fov : 1; };
renderer.domElement.addEventListener("mousedown", e=>{ const G=DGOLF; if(G.on && e.button===0 && G.ready() && G.charge<0 && document.pointerLockElement===renderer.domElement) G.charge=0; });
addEventListener("mouseup", e=>{ const G=DGOLF; if(e.button===0 && G.charge>=0) G.release(); });
DGOLF.release=function(){
  const G=DGOLF, pw=G.power; G.charge=-1; if(!G.ready()) return;
  const yaw=player.yaw, pitch=clamp(player.pitch+0.06, -0.12, 0.55), v0=3+23*pw;          // (from a tap-in at walking pace to a drive)
  // out of the hand from in front of you at chest height, along your look, the disc's nose a little up
  const fx=-Math.sin(yaw), fz=-Math.cos(yaw);
  G.p=V3(player.pos.x+fx*0.5, player.feetY+1.25, player.pos.z+fz*0.5);
  G.v=V3(fx*Math.cos(pitch)*v0, Math.sin(pitch)*v0, fz*Math.cos(pitch)*v0);
  G.th=pitch+0.05; G.state="fly"; G.ft=0; G.lastIn={x:G.lie.x, z:G.lie.z}; G.bounce=0; G.slide=false; G.throws++; G.lastLand={x:G.lie.x, z:G.lie.z};
  G.cam.seen=true; G.cam.skip=false; G.cam.hold=0; G.cam.tgt.copy(G.p);
  G.disc.visible=true; G.hand.visible=false;
  if(typeof AUDIO!=="undefined") AUDIO.blip("whoosh", player.pos.x, player.pos.z); G.draw(); };
// one step of the flight: lift and drag with the angle the disc meets the air at, the turn and the fade; then the
// ground, the water, the trees and poles, the chains
const _dgUp=new T.Vector3();
DGOLF.step=function(h){
  const G=DGOLF, p=G.p, v=G.v, H=G.holes[G.hole];
  if(!G.slide){
    const hz=Math.hypot(v.x, v.z)||1e-6, sp=Math.hypot(hz, v.y), gam=Math.atan2(v.y, hz), a=G.th-gam;
    const CL=clamp(0.15+1.4*a, -0.3, 1.0), CD=0.08+2.72*(a+0.04)*(a+0.04), k=0.195, Lf=k*CL*sp*sp, Df=k*CD*sp*sp;
    const ux=v.x/hz, uz=v.z/hz;                                                   // along, flat
    const side=1.8*(1-smoothstep(5, 14, sp))-0.5*smoothstep(19, 26, sp);         // fade left slow, turn right fast
    v.x+=(-Df*Math.cos(gam)*ux-Lf*Math.sin(gam)*ux+side*uz)*h;
    v.z+=(-Df*Math.cos(gam)*uz-Lf*Math.sin(gam)*uz-side*ux)*h;
    v.y+=(-Df*Math.sin(gam)+Lf*Math.cos(gam)-9.8)*h;
    G.th+=(-0.10-G.th)*h*0.25;                                                   // (the nose comes down a little as it goes)
  }
  const ox=p.x, oz=p.z, oy=p.y; p.x+=v.x*h; p.y+=v.y*h; p.z+=v.z*h; G.ft+=h;
  // the basket you are playing: in through the chains, or off the band and the pole
  { const bx2=H.b[0], bz2=H.b[1], r=Math.hypot(p.x-bx2, p.z-bz2), y=p.y-H.by;
    // (how near the middle it comes is how near its line passes the pole: where it crosses into the chains is always their edge)
    if(r<0.30 && y>0.84 && y<1.40 && !G.slide){ const sp=Math.hypot(v.x, v.y, v.z), hz=Math.hypot(v.x, v.z)||1e-6, off=Math.min(0.30, Math.abs(((bx2-p.x)*v.z-(bz2-p.z)*v.x)/hz));
      const pc=clamp(1.3-sp/12, 0, 1)*(1-0.5*(off/0.30)*(off/0.30));
      if(Math.random()<pc){ G.holed(); return; }
      if(typeof AUDIO!=="undefined") AUDIO.blip("rim", p.x, p.z); v.multiplyScalar(-0.25); v.y=Math.min(v.y, 0); p.x=ox; p.z=oz; }
    else if(r<0.33 && y>1.38 && y<1.50){ if(typeof AUDIO!=="undefined") AUDIO.blip("rim", p.x, p.z); v.x*=-0.4; v.z*=-0.4; v.y=Math.abs(v.y)*0.3; p.x=ox; p.z=oz; } }
  // anything solid: back out of it and drop
  { const lo=p.y-0.02, hi=p.y+0.02;
    const hit=c=>p.x>c.x0 && p.x<c.x1 && p.z>c.z0 && p.z<c.z1 && hi>c.y0 && lo<c.y1 && c.y1<200;
    let H2=null; for(const c of colsNear(p.x, p.z)) if(hit(c)){ H2=c; break; } if(!H2) for(const c of COL_DYN) if(hit(c)){ H2=c; break; }
    // (already inside where it was, off the rim into the basket's own box: out by its nearest side, and let it fall)
    if(H2 && ox>H2.x0 && ox<H2.x1 && oz>H2.z0 && oz<H2.z1 && oy+0.02>H2.y0 && oy-0.02<H2.y1){
      const m=Math.min(p.x-H2.x0, H2.x1-p.x, p.z-H2.z0, H2.z1-p.z);
      if(m===p.x-H2.x0) p.x=H2.x0-0.01; else if(m===H2.x1-p.x) p.x=H2.x1+0.01; else if(m===p.z-H2.z0) p.z=H2.z0-0.01; else p.z=H2.z1+0.01;
      v.x*=0.3; v.z*=0.3; }
    else if(H2){ p.x=ox; p.z=oz; p.y=oy; v.x*=-0.30; v.z*=-0.30; v.y=Math.min(v.y, 0)*0.5; G.slide=false;
      if(typeof AUDIO!=="undefined" && Math.hypot(v.x, v.z)>0.6) AUDIO.blip("thump", p.x, p.z); } }
  // the water: in the lake is a stroke, thrown again from where it went in
  if(Terrain.lakeSD(p.x, p.z)<0.5 && p.y<EAST.wy+0.05){ G.inLake(); return; }
  if(Terrain.lakeSD(p.x, p.z)>2) G.lastLand={x:p.x, z:p.z};
  if(DG_IN(p.x, p.z) && Terrain.lakeSD(p.x, p.z)>2) G.lastIn={x:p.x, z:p.z};
  // the ground: a skip or two, then it slides to a stop
  // (sliding, it keeps to the ground as the ground falls away under it, and keeps slowing)
  const g=surfaceY(p.x, p.z, p.y+0.3)+0.012;
  if(p.y<=g || (G.slide && p.y<=g+0.05)){ p.y=g;
    if(!G.slide && v.y<-2.2 && G.bounce<2){ v.y=-v.y*0.22; v.x*=0.62; v.z*=0.62; G.bounce++; }
    else { G.slide=true; v.y=0; const hz=Math.hypot(v.x, v.z), dec=Math.min(hz, 7.5*h); if(hz>1e-4){ v.x-=v.x/hz*dec; v.z-=v.z/hz*dec; }
      if(hz<0.05) G.landed(); } }
  else if(G.slide) G.slide=false;
  if(G.ft>14) G.landed();
};
// out of bounds (the course's own ground: the park, the lot and the road's edge) is a stroke, from where it went out
const DG_IN=(x,z)=>x>1230 && x<1380 && z>-1300 && z<-1203;
DGOLF.landed=function(){ const G=DGOLF; G.cam.tgt.copy(G.p);                         // (the view stays where it came down, in bounds or out)
  if(!DG_IN(G.p.x, G.p.z)){ const L=G.lastIn||G.lie, g=Terrain.groundAt(L.x, L.z); G.throws++; G.p.set(L.x, g+0.012, L.z);
    toast("OUT OF BOUNDS · +1", "#ff9a7a"); G.state="down"; G.at={x:L.x, z:L.z, y:g+0.012}; G.msg("OUT OF BOUNDS. A STROKE: THROW AGAIN FROM WHERE IT WENT OUT"); G.draw(); return; }
  G.state="down"; G.at={x:G.p.x, z:G.p.z, y:G.p.y};
  const H=G.holes[G.hole], d=Math.hypot(G.p.x-H.b[0], G.p.z-H.b[1]);
  G.msg(d<10 ? d.toFixed(1)+" M FROM THE BASKET. A PUTT" : Math.round(d)+" M FROM THE BASKET"); G.draw(); };
DGOLF.inLake=function(){ const G=DGOLF; G.throws++; G.cam.tgt.set(G.p.x, EAST.wy, G.p.z);          // (and on the splash)
  if(typeof PUFFS!=="undefined") for(let k=0;k<14;k++) PUFFS.emit(G.p.x+(Math.random()-0.5)*0.3, EAST.wy+0.05, G.p.z+(Math.random()-0.5)*0.3, (Math.random()-0.5)*1.2, 1.0+Math.random(), (Math.random()-0.5)*1.2, 0.10, 0.5, 0.8, 0.5, 1.0, 0);
  if(typeof AUDIO!=="undefined") AUDIO.blip("drip", G.p.x, G.p.z);
  const L=G.lastLand, g=Terrain.groundAt(L.x, L.z); G.state="down"; G.at={x:L.x, z:L.z, y:g+0.012}; G.p.set(L.x, g+0.012, L.z);
  G.msg("IN THE LAKE. A STROKE: THROW AGAIN FROM WHERE IT WENT IN"); toast("IN THE LAKE · +1", "#8fb4ff"); G.draw(); };
DGOLF.holed=function(){ const G=DGOLF, H=G.holes[G.hole];
  G.state="in"; G.p.set(H.b[0]+0.08, H.by+0.70, H.b[1]-0.05); G.v.set(0,0,0); G.cam.tgt.copy(G.p);
  if(typeof AUDIO!=="undefined"){ AUDIO.blip("jingle", H.b[0], H.b[1]); AUDIO.blip("coins", H.b[0], H.b[1]); }
  G.card.push(G.throws); const rel=G.throws-H.par, words={"-2":"EAGLE","-1":"BIRDIE","0":"PAR","1":"BOGEY","2":"DOUBLE BOGEY"};
  const w=G.throws===1 ? "ACE!" : words[String(rel)] || (rel>0 ? "+"+rel : String(rel));
  toast("CHAINS! "+w+" · "+G.throws, "#f4c430"); G.msg("IN THE CHAINS: "+w); G.wait=2.2; G.draw(); };
DGOLF.msg=function(s){ DGOLF.panel.querySelector(".msg").textContent=s; };
DGOLF.draw=function(){ const G=DGOLF; if(!G.panel) return; const H=G.holes[Math.min(G.hole, G.holes.length-1)];
  const tot=G.card.reduce((a,b)=>a+b, 0), par=G.holes.slice(0, G.card.length).reduce((a,h)=>a+h.par, 0), rel=tot-par;
  G.panel.querySelector(".sc").innerHTML="HOLE <b>"+(G.hole+1)+"</b> · PAR <b>"+H.par+"</b> · "+H.len+" M · THROW <b>"+(G.throws+(G.state==="hand" ? 1 : 0))+"</b> · ROUND <b>"+(rel===0 ? "E" : rel>0 ? "+"+rel : rel)+"</b>";
  G.panel.querySelector(".card").innerHTML=G.holes.map((h,i)=>{ const s=G.card[i], cls=i===G.hole && G.state!=="in" ? "now" : s===undefined ? "" : s<h.par ? "u" : s>h.par ? "o" : "";
    return '<span class="'+cls+'">'+(s===undefined ? (i+1) : s)+'</span>'; }).join(""); };
function updateDiscGolf(dt){
  const G=DGOLF; if(!G.disc) return;
  if(!G.on){ G.hand.visible=false; G.cam.k=0; G.cam.seen=false; G.cam.init=false; G.zoomHeld=false;
    if(G.zk>0){ G.zk=0; applyFov(); } return; }
  if(G.wait>0){ G.wait-=dt; if(G.wait<=0 && G.state==="in"){ G.hole++; G.disc.visible=false;
      if(G.hole>=G.holes.length){ G.end(false); return; }
      G.toTee(); const h=G.holes[G.hole]; G.msg("ON TO HOLE "+(G.hole+1)+": THE TEE IS "+Math.round(Math.hypot(h.t[0]-player.pos.x, h.t[1]-player.pos.z))+" M OFF"); G.draw(); } }
  // the flight, in small steps
  if(G.state==="fly"){ let n=Math.ceil(dt*240); const h=dt/n; while(n-- && G.state==="fly") G.step(h);
  }
  // the view goes with it, then waits on where it came down (Space brings it back sooner), then comes back to you,
  // turned to face your disc; 19-loop hands applyCam the frame while k is over nothing
  { const C=G.cam;
    if(G.state==="fly"){ C.k=Math.min(1, C.k+dt*2.5); C.tgt.copy(G.p); C.hold=2.0; }
    else if(C.seen){
      if(C.hold>0 && !C.skip){ C.hold-=dt; C.k=Math.min(1, C.k+dt*2.5); }
      else { if(C.hold>-1){ C.hold=-1; const dx=C.tgt.x-player.pos.x, dz=C.tgt.z-player.pos.z;
          player.yaw=Math.atan2(-dx, -dz); player.pitch=clamp(-Math.atan2(player.feetY+1.6-C.tgt.y, Math.hypot(dx, dz)), -0.6, 0.2); }
        C.k=Math.max(0, C.k-dt*1.8); if(C.k===0){ C.seen=false; C.skip=false; C.init=false; } } } }
  // the sight: Z or the right button held closes the view in on what you are looking at
  { const zt=G.zoomHeld && G.cam.k===0 && !seated && !driving && !droneMode ? 1 : 0, was=G.zk;
    G.zk+=(zt-G.zk)*Math.min(1, dt*9); if(G.zk<0.002) G.zk=0;
    if(G.zk>0 || was>0){ camera.fov=fov+(12-fov)*G.zk; camera.updateProjectionMatrix(); } }
  // the disc where it is: flying flat and spinning, lying on the grass, in the basket
  if(G.state!=="hand"){ G.disc.visible=true; G.disc.position.copy(G.p);
    if(G.state==="fly"){ G.spin+=dt*24; G.disc.rotation.set(0, G.spin, 0); }
    else if(G.state==="down") G.disc.rotation.set(0.04, G.spin, 0.03); }
  // walking up to it picks it up
  if(G.state==="down" && Math.hypot(player.pos.x-G.at.x, player.pos.z-G.at.z)<1.5){ G.state="hand"; G.lie={x:G.at.x, z:G.at.z, y:G.at.y}; G.disc.visible=false;
    G.msg("YOUR DISC. LOOK AT THE BASKET AND THROW"); G.draw(); }
  // the wind-up: the meter climbs and falls back
  const ready=G.ready();
  if(G.charge>=0){ if(!ready){ G.charge=-1; G.power=0; } else { G.charge+=dt; G.power=(1-Math.cos(G.charge*Math.PI/0.9))/2; } }
  else G.power=0;
  G.panel.querySelector(".bar i").style.width=(G.power*100).toFixed(1)+"%";
  if(G.state==="hand" && !ready && !G.wait){ const d=Math.hypot(player.pos.x-G.lie.x, player.pos.z-G.lie.z), m=G.lie.tee ? "THE TEE OF HOLE "+(G.hole+1)+" IS "+Math.round(d)+" M OFF" : "YOUR DISC IS "+Math.round(d)+" M OFF";
    if(G._m!==m && (G._mt=(G._mt||0)-dt)<=0){ G._mt=0.5; G._m=m; G.msg(m); } }
  else if(G.state==="hand" && ready && G._m!=="ready"){ G._m="ready"; const H=G.holes[G.hole], d=Math.hypot(H.b[0]-G.lie.x, H.b[1]-G.lie.z);
    G.msg((G.lie.tee ? "ON THE TEE. " : "")+Math.round(d)+" M TO THE BASKET: LOOK AT IT, HOLD SPACE AND LET GO"); }
  // the disc in your hand, low in the view, drawn back as you wind up
  G.hand.visible=G.state==="hand" && ready && !droneMode;
  if(G.hand.visible){ const pw=G.power, o=V3(0.20-pw*0.28, -0.24+pw*0.04, -0.46+pw*0.10); camera.updateMatrixWorld(); o.applyMatrix4(camera.matrixWorld);
    G.hand.position.copy(o); G.hand.quaternion.copy(camera.quaternion); G.hand.rotateX(Math.PI/2-0.25); }
}
// the view after the disc: from behind it along its way and above it while it flies, from back and above where it lies
// after; blended from your eyes by k, so it goes out and comes back without a cut
const _dgCw=new T.Vector3(), _dgD=new T.Vector3(), _dgL=new T.Vector3();
DGOLF.applyCam=function(dt){ const G=DGOLF, C=G.cam; if(C.k<=0) return;
  const v=G.v, hz=v ? Math.hypot(v.x, v.z) : 0;
  if(G.state==="fly" && hz>0.6) C.dir=[v.x/hz, v.z/hz];
  const fly=G.state==="fly", back=fly ? 5.0 : 4.6, up=fly ? 1.5 : 2.6;
  _dgCw.set(C.tgt.x-C.dir[0]*back, C.tgt.y+up, C.tgt.z-C.dir[1]*back);
  const g=surfaceY(_dgCw.x, _dgCw.z, _dgCw.y+3)+0.9; if(_dgCw.y<g) _dgCw.y=g;
  if(typeof EAST!=="undefined" && _dgCw.y<EAST.wy+1.2) _dgCw.y=EAST.wy+1.2;
  if(!C.init){ C.pos.copy(camera.position); C.init=true; }
  C.pos.lerp(_dgCw, 1-Math.exp(-(fly ? 7 : 3)*dt));
  const e=C.k*C.k*(3-2*C.k);
  camera.getWorldDirection(_dgD); _dgL.copy(camera.position).addScaledVector(_dgD, 8).lerp(C.tgt, e);
  camera.position.lerp(C.pos, e); camera.lookAt(_dgL); };
