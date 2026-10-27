"use strict";
/* REST AREA · 14r-brewery.js
   at the end of Lake Street, on the shore: the brewery, its taproom, its
   beer garden and its deck over the water, and the people in them
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14r · LAKESHORE BREWING CO.
   Past the last house the road runs on fifty metres to the brewery's lot
   (EDIN.x1 is the brewery's east fence now, and the barricade beyond it).
   The building is a long timber taproom with a red standing-seam roof:
   the road side has its door and windows and the name over them; the
   lake side is five glass garage doors, three of them rolled up under the
   ceiling so the room opens onto the grass. Inside, pine on the walls and
   the ceiling, black beams, fans turning, pendant bulbs; the brewhouse
   behind a glass wall at the west end (three fermenters, the kettle,
   kegs); the bar along the east wall with a marble top, stools, the taps
   on a grey barnwood wall, the bottles and two TVs over them.
   Out of the garage doors, the beer garden: lawn going down to the
   water, a big maple in a ring of stones, sofas round a fire pit, a
   cornhole game, and the deck bar, a little timber hut with a window to
   order at. Below it the deck, out over the water on posts: black slatted
   tables and aluminium chairs, red market umbrellas (furled, mostly), a
   black cable rail along the water, strings of bulbs on poles over it
   all, lit at dusk. Two bartenders in the taproom and one in the hut, two
   servers going round the tables with trays, and customers at the bar, at
   the tables, on the sofas, at the rail looking at the lake.
   ---------------------------------------------------------------------- */
const BREWERY={bulbs:null, fans:[], screens:null, scrT:0, fire:null};
(function brewery(){
  const Y=EDIN.y, Z=EDIN.z, HW=EDIN.hw, WY=EAST.wy, SH=EAST.shore, r=_trng(5150);
  const X0=1422, X1=1468, LOTZ=-1226;                                        // the lot, from the road's edge back to LOTZ
  const BL={x0:1430, x1:1460, z0:-1243, z1:-1229}, FF=Y+0.17, WT=0.24, EAVE=FF+3.6, RIDGE=FF+5.7, CEIL=FF+3.4;
  const DK={x0:1423, x1:1467, z0:-1299, z1:-1266}, D=Terrain.groundAt(1445, DK.z1)+0.03;      // the deck, its top level with the lawn's foot
  BREWERY.deck=DK; BREWERY.D=D; BREWERY.bl=BL; BREWERY.FF=FF;
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,rx,rz)=>ent(boxGeo(w,h,d),x,y,z,c,rx,ry,rz);
  const RB=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03, Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0);
  const C=(rad,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||roundSegs(rad)),x,y,z,c,rx,ry,rz);
  const tubeE=(a,b,rad,c,seg)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,seg||8), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(x,s,cx,cy,w,h,col,weight,family)=>{ x.fillStyle=col; fitText(x,s,w,h,cx,cy,weight||"700",family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*400), Math.round((cw||w*400)*h/w), draw), px,py,pz,ry,lit);
  const gy=(x,z)=>Terrain.groundAt(x,z);
  const tileT=(w,h,draw)=>{ const t=signTex(w,h,draw); t.wrapS=t.wrapT=T.RepeatWrapping; return t; };
  // cedar boards on the outside, pine inside, grey barnwood behind the bar
  const boards=(base, spread, grain, seed)=>tileT(128, 128, (c,W,H)=>{ const q=_trng(seed); c.fillStyle=base; c.fillRect(0,0,W,H);
    for(let i=0;i<8;i++){ const x=i*16, l=(q()-0.5)*spread; c.fillStyle="rgba("+(l>0?"255,240,220":"30,20,10")+","+Math.abs(l).toFixed(3)+")"; c.fillRect(x,0,16,H);
      c.fillStyle="rgba(20,14,8,0.45)"; c.fillRect(x,0,1.5,H); }
    for(let k=0;k<70;k++){ c.strokeStyle="rgba("+grain+","+(0.05+q()*0.10).toFixed(3)+")"; c.lineWidth=1; const x=q()*W; c.beginPath(); c.moveTo(x,0); c.bezierCurveTo(x+q()*4-2,H*0.3,x+q()*4-2,H*0.7,x+q()*3-1.5,H); c.stroke(); } });
  bucketOf("brw_cedar", ()=>new T.MeshStandardMaterial({map:boards("#b07a4a", 0.16, "70,40,20", 311), roughness:0.8}));
  bucketOf("brw_pine",  ()=>new T.MeshStandardMaterial({map:boards("#d8b080", 0.10, "120,80,40", 312), roughness:0.75}));
  bucketOf("brw_barn",  ()=>new T.MeshStandardMaterial({map:tileT(128, 128, (c,W,H)=>{ const q=_trng(313); c.fillStyle="#8a8a86"; c.fillRect(0,0,W,H);
      for(let j=0;j<8;j++){ let x=0; while(x<W){ const w=24+q()*60, l=0.55+q()*0.45; c.fillStyle="rgb("+((150*l)|0)+","+((148*l)|0)+","+((140*l)|0)+")"; c.fillRect(x, j*16, w, 15); x+=w+1; }
        c.fillStyle="rgba(30,30,28,0.6)"; c.fillRect(0, j*16+15, W, 1); } }), roughness:0.9}));
  bucketOf("brw_marble", ()=>new T.MeshStandardMaterial({roughness:0.25, metalness:0.05, map:tileT(256, 256, (c,W,H)=>{ const q=_trng(314); c.fillStyle="#e4e4e0"; c.fillRect(0,0,W,H);
      for(let k=0;k<26;k++){ c.strokeStyle="rgba(90,100,96,"+(0.08+q()*0.18).toFixed(3)+")"; c.lineWidth=0.6+q()*2.2; c.beginPath(); let x=q()*W, y=q()*H; c.moveTo(x,y);
        for(let s=0;s<6;s++){ x+=(q()-0.3)*70; y+=(q()-0.5)*50; c.lineTo(x,y); } c.stroke(); } })}));
  bucketOf("brw_turf", ()=>new T.MeshStandardMaterial({roughness:0.95, map:tileT(128, 128, (c,W,H)=>{ const q=_trng(315); c.fillStyle="#4c8a34"; c.fillRect(0,0,W,H);
      for(let k=0;k<1400;k++){ c.fillStyle=q()<0.5 ? "rgba(110,170,70,0.5)" : "rgba(40,90,30,0.5)"; c.fillRect(q()*W, q()*H, 1, 2+q()*3); } })}));

  /* ---- the lot, off the end of the street ---------------------------------- */
  { const g=new T.PlaneGeometry(X1-X0, (Z-HW)-LOTZ), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*(X1-X0)*0.62, U.getY(i)*((Z-HW)-LOTZ)*0.62);
    push("lotpave", g, (X0+X1)/2, Y+0.03, (LOTZ+Z-HW)/2, 0, "#bebcb6", -Math.PI/2, 0);
    addPaveRect(X0, X1, LOTZ, Z-HW, Y); EAST.noPole.push([X0-1.5, X1+1.5]);
    for(let x=X0+1.4; x<=X1-1.0; x+=2.8) push("paint", planeGeo(0.10, 5.0, 0), x, Y+0.034, LOTZ+2.6, 0, "#eceae2", -Math.PI/2, 0);
    const cars=[[0,"#5a2a2a"],[2,"#e8e4da"],[1,"#2a3a5a"],[3,"#7a8a96"],[0,"#2a4a2a"]];
    [1, 2, 5, 7, 11].forEach((k, i)=>parkCar(X0+1.4+k*2.8+1.4, LOTZ+2.7, Math.PI, cars[i][0], cars[i][1], Y+0.03));
    // the walk along the front, and the sign at the lot's mouth
    bx("concrete", BL.x1-BL.x0+4.0, 0.24, 2.85, (BL.x0+BL.x1)/2, Y, LOTZ-1.425, 0.6, 0, "#c3c0b8"); addFlat(BL.x0-2.0, BL.x1+2.0, LOTZ-2.9, LOTZ+0.01, Y+0.12);
    const sx=X0+1.2, sz=Z-HW-1.6;
    for(const dx of [-1.1, 1.1]){ B(0.16, 2.6, 0.16, sx+dx, Y+1.3, sz, "#3a2a1c"); addCol(sx+dx-0.09, sx+dx+0.09, sz-0.09, sz+0.09, Y-0.5, Y+2.6); }
    B(2.6, 1.2, 0.12, sx, Y+1.95, sz, "#3a2a1c");
    for(const sd of [-1,1]) sign(2.4, 1.0, (c,W,H)=>{ c.fillStyle="#1e2a24"; c.fillRect(0,0,W,H); c.strokeStyle="#d8b880"; c.lineWidth=5; c.strokeRect(8,8,W-16,H-16);
        say(c, "LAKESHORE", W/2, H*0.30, W*0.78, H*0.24, "#e8d8b0", "900", "Georgia, serif"); say(c, "BREWING CO.", W/2, H*0.55, W*0.70, H*0.17, "#e8d8b0", "700", "Georgia, serif");
        say(c, "TAPROOM · BEER GARDEN · ON THE WATER", W/2, H*0.80, W*0.78, H*0.10, "#d8b880", "700", "Arial"); }, sx, Y+1.95, sz+sd*0.072, sd>0 ? 0 : Math.PI, false, 640); }

  /* ---- the taproom: walls ---------------------------------------------------- */
  // a wall along x or z, from a to b, with openings {a,b,sill,head}: piers full height, a head over each opening and a
  // sill under it; the heads and sills 4 mm proud of the piers either face and 2 cm into them, so no seam lies flush
  const wall=(ax, c0, c1, a, b, ops, bk, col)=>{
    const t=c1-c0, put=(u0,u1,y0,y1,proud)=>ax==="x" ? bx(bk, u1-u0, y1-y0, t+proud, (u0+u1)/2, (y0+y1)/2, (c0+c1)/2, 0.5, 0, col)
                                                        : bx(bk, t+proud, y1-y0, u1-u0, (c0+c1)/2, (y0+y1)/2, (u0+u1)/2, 0.5, 0, col);
    let u=a;
    for(const o of ops){ if(o.a>u) put(u, o.a, FF-0.10, EAVE, 0);
      put(o.a-0.02, o.b+0.02, o.head, EAVE-0.004, 0.008); if(o.sill>FF+0.01) put(o.a-0.02, o.b+0.02, FF-0.095, o.sill, 0.008); u=o.b; }
    if(b>u) put(u, b, FF-0.10, EAVE, 0); };
  const winS=(a,b)=>({a:a, b:b, sill:FF+0.9, head:FF+2.4});
  const southOps=[winS(1433.4,1436.6), winS(1438.8,1442.0), {a:1444.0, b:1446.0, sill:FF, head:FF+2.3, door:true}, winS(1448.2,1451.4), winS(1453.4,1456.6)];
  const GD=[]; for(let k=0;k<5;k++){ const a=1438.9+k*4.15; GD.push({a:a, b:a+3.6, sill:FF, head:FF+3.0, open:k>0 && k<4}); }
  const northOps=[winS(1431.6,1436.4)].concat(GD);
  wall("x", BL.z1-WT, BL.z1, BL.x0, BL.x1, southOps, "brw_cedar", "#ffffff");
  wall("x", BL.z0, BL.z0+WT, BL.x0, BL.x1, northOps, "brw_cedar", "#ffffff");
  // (the ends between the long walls, 2 cm into them, 4 mm short of their outer faces and their tops)
  for(const [a,b] of [[BL.x0+0.004, BL.x0+WT],[BL.x1-WT, BL.x1-0.004]]) bx("brw_cedar", b-a, EAVE-0.006-(FF-0.11), BL.z1-BL.z0-2*WT+0.04, (a+b)/2, (EAVE-0.006+FF-0.11)/2, (BL.z0+BL.z1)/2, 0.5, 0, "#f2ece4");
  bx("concrete", BL.x1-BL.x0+0.4, 0.62, BL.z1-BL.z0+0.4, (BL.x0+BL.x1)/2, FF-0.31-0.004, (BL.z0+BL.z1)/2, 0.6, 0, "#a8a49a");
  // the colliders: round the openings that are open, the closed doors and the windows solid
  const colWall=(ax, c0, c1, a, b, gaps)=>{ let u=a; for(const [g0,g1] of gaps){ if(g0>u) (ax==="x" ? addCol(u, g0, c0, c1, FF-1, EAVE) : addCol(c0, c1, u, g0, FF-1, EAVE)); u=g1; }
    if(b>u) (ax==="x" ? addCol(u, b, c0, c1, FF-1, EAVE) : addCol(c0, c1, u, b, FF-1, EAVE)); };
  colWall("x", BL.z1-WT, BL.z1, BL.x0, BL.x1, [[1444.0, 1446.0]]);
  colWall("x", BL.z0, BL.z0+WT, BL.x0, BL.x1, GD.filter(o=>o.open).map(o=>[o.a, o.b]));
  colWall("z", BL.x0, BL.x0+WT, BL.z0, BL.z1, []); colWall("z", BL.x1-WT, BL.x1, BL.z0, BL.z1, []);
  // the floor (dark-stained boards), the doorways' thresholds, the ceiling (pine) and the beams across it
  floorAt("wood", BL.x0+WT, BL.x1-WT, BL.z0+WT, BL.z1-WT, FF+0.004, "#6a4a32", 0.6);
  addFlat(BL.x0+WT, BL.x1-WT, BL.z0+WT-0.01, BL.z1-WT+0.01, FF);
  addFlat(1444.0, 1446.0, BL.z1-WT-0.02, BL.z1+0.02, FF); for(const o of GD) if(o.open) addFlat(o.a, o.b, BL.z0-0.02, BL.z0+WT+0.02, FF);
  ceilAt("brw_pine", BL.x0+WT, BL.x1-WT, BL.z0+WT, BL.z1-WT, CEIL, "#ffffff", 0.5);
  for(let x=BL.x0+2.5; x<BL.x1-1; x+=3.0) B(0.16, 0.26, BL.z1-BL.z0-2*WT+0.04, x, CEIL-0.13, (BL.z0+BL.z1)/2, "#1e1c1a");          // (2 cm into the walls)
  addZone(BL.x0, BL.x1, BL.z0, BL.z1, FF-0.5, CEIL, "LAKESHORE BREWING CO.", true);
  // the windows: glass in a black frame; the front door, glass in a black frame too
  const glassPane=(ax, c, a, b, y0, y1)=>{ const mid=(a+b)/2, w=b-a, h=y1-y0;
    if(ax==="x"){ push("glass", planeGeo(w-0.02, h-0.02, 0), mid, (y0+y1)/2, c, 0, "#ffffff"); for(const u of [a+0.03, b-0.03]) B(0.06, h, 0.10, u, (y0+y1)/2, c, "#1a1a1a"); B(w, 0.06, 0.10, mid, y0+0.03, c, "#1a1a1a"); B(w, 0.06, 0.10, mid, y1-0.03, c, "#1a1a1a"); }
    else { push("glass", planeGeo(w-0.02, h-0.02, 0), c, (y0+y1)/2, mid, Math.PI/2, "#ffffff"); for(const u of [a+0.03, b-0.03]) B(0.10, h, 0.06, c, (y0+y1)/2, u, "#1a1a1a"); B(0.10, 0.06, w, c, y0+0.03, mid, "#1a1a1a"); B(0.10, 0.06, w, c, y1-0.03, mid, "#1a1a1a"); } };
  for(const o of southOps) if(!o.door) glassPane("x", BL.z1-WT/2, o.a, o.b, o.sill, o.head);
  glassPane("x", BL.z0+WT/2, 1431.6, 1436.4, FF+0.9, FF+2.4);
  { const m=makeDoor(XF(1444.04, BL.z1-WT/2, 0), 0, FF+0.01, 0, "THE TAPROOM", true, 0, "store"); }
  // the garage doors: a black grid of aluminium round sixteen panes; up under the ceiling on their tracks, or down
  const garage=(o)=>{ const w=o.b-o.a, h=3.0, mid=(o.a+o.b)/2, G=[], gl=[];
    const gb=(bw,bh,bd,x,y,z)=>G.push({geo:boxGeo(bw,bh,bd), matrix:new T.Matrix4().makeTranslation(x,y,z), color:new T.Color("#141414")});
    for(let k=0;k<=4;k++){ gb(w, 0.06, 0.07, 0, k*h/4, 0); gb(0.06, h, 0.07, -w/2+k*w/4, h/2, 0); }
    gl.push({geo:new T.PlaneGeometry(w-0.06, h-0.06), matrix:new T.Matrix4().makeTranslation(0, h/2, 0), color:new T.Color("#ffffff")});
    const grp=new T.Group(); grp.add(new T.Mesh(mergeEntries(G), new T.MeshStandardMaterial({vertexColors:true, roughness:0.4, metalness:0.5})));
    grp.add(new T.Mesh(mergeEntries(gl), DOOR_GLASS_MAT));
    if(o.open){ grp.position.set(mid, CEIL-0.12, BL.z0+WT+0.04); grp.rotation.x=Math.PI/2;
      for(const sx of [o.a+0.08, o.b-0.08]) B(0.05, 0.05, 3.3, sx, CEIL-0.06, BL.z0+WT+1.65, "#2a2a2c"); }
    else grp.position.set(mid, FF+0.004, BL.z0+WT/2);
    scene.add(grp); };
  for(const o of GD) garage(o);
  // the roof: red standing seam over the gable, the ends boarded; the overhang's soffit
  { const ov=0.6, xa=BL.x0-ov, xb=BL.x1+ov, za=BL.z0-ov, zb=BL.z1+ov, zr=(BL.z0+BL.z1)/2, k=(RIDGE-EAVE)/((BL.z1-BL.z0)/2), ye=EAVE-ov*k;
    push("roofmetal", new FaceGeo().slab([V3(xa, ye, zb), V3(xb, ye, zb), V3(xb, RIDGE, zr), V3(xa, RIDGE, zr)], 0.12, 0.6).geo(), 0,0,0, 0, "#8a2a22");
    push("roofmetal", new FaceGeo().slab([V3(xb+0.005, ye, za), V3(xa-0.005, ye, za), V3(xa-0.005, RIDGE-0.004, zr), V3(xb+0.005, RIDGE-0.004, zr)], 0.12, 0.6).geo(), 0,0,0, 0, "#8a2a22");
    for(const [x, sgn] of [[BL.x0, 1], [BL.x1, -1]]){
      // (a standing slab goes back against its winding: the west one in, toward +x, the east one in, toward -x)
      // (on the end walls' tops and in their plane, 4 mm inside the long walls' ends)
      const xg=x+sgn*0.004, pts=sgn>0 ? [V3(xg, EAVE-0.006, BL.z0), V3(xg, EAVE-0.006, BL.z1), V3(xg, RIDGE-0.14, zr)] : [V3(xg, EAVE-0.006, BL.z1), V3(xg, EAVE-0.006, BL.z0), V3(xg, RIDGE-0.14, zr)];
      push("brw_cedar", new FaceGeo().slab(pts, WT, 0.5).geo(), 0,0,0, 0, "#f2ece4"); }
    B(xb-xa+0.02, 0.12, 0.10, (xa+xb)/2, RIDGE+0.02, zr, "#6a2a22");
    addRoof(xa, xb, za, zb, EAVE-0.2); }
  // the names: over the front door, and on the lake end's gable
  sign(7.0, 0.9, (c,W,H)=>{ c.fillStyle="#1e2a24"; c.fillRect(0,0,W,H); c.strokeStyle="#d8b880"; c.lineWidth=6; c.strokeRect(8,8,W-16,H-16);
      say(c, "LAKESHORE BREWING CO.", W/2, H*0.52, W*0.80, H*0.56, "#e8d8b0", "900", "Georgia, serif"); }, 1445, FF+2.95, BL.z1+0.10, 0, false, 1400);
  B(7.1, 1.0, 0.06, 1445, FF+2.95, BL.z1+0.04, "#2a2018");
  sign(3.2, 0.7, (c,W,H)=>{ c.fillStyle="#1e2a24"; c.fillRect(0,0,W,H); say(c, "BREWERY · TAPROOM", W/2, H/2, W*0.80, H*0.56, "#e8d8b0", "800", "Georgia, serif"); },
    1445, EAVE+0.65, BL.z0-0.012-0.01, Math.PI, false, 800);
  B(3.3, 0.8, 0.04, 1445, EAVE+0.65, BL.z0+0.0, "#2a2018");

  /* ---- the brewhouse behind its glass ------------------------------------------- */
  { const gx=1438.4;
    for(let z=BL.z0+WT+0.04; z<BL.z1-WT-0.1; z+=1.6){ const z1=Math.min(z+1.6, BL.z1-WT-0.04); B(0.08, CEIL-FF, 0.06, gx, (FF+CEIL)/2, z, "#141414");
      push("glass", planeGeo(z1-z-0.06, CEIL-FF-0.06, 0), gx, (FF+CEIL)/2, (z+z1)/2, Math.PI/2, "#ffffff"); }
    B(0.08, CEIL-FF, 0.06, gx, (FF+CEIL)/2, BL.z1-WT-0.04, "#141414"); B(0.08, 0.08, BL.z1-BL.z0-2*WT, gx, FF+1.1, (BL.z0+BL.z1)/2, "#141414");
    addCol(BL.x0, gx+0.06, BL.z0, BL.z1, FF-1, CEIL);
    const tank=(x, z, rr, h, col)=>{ C(rr, h, x, FF+0.7+h/2, z, col||"#c8ccd0", 28); ent(new T.ConeGeometry(rr, 0.5, 28), x, FF+0.45, z, col||"#c8ccd0", Math.PI, 0, 0);
      ent(new T.SphereGeometry(rr, 24, 10, 0, Math.PI*2, 0, Math.PI/2), x, FF+0.7+h, z, col||"#c8ccd0");
      for(let k=0;k<3;k++){ const a=k*2.09; tubeE(V3(x+Math.cos(a)*rr*0.85, FF, z+Math.sin(a)*rr*0.85), V3(x+Math.cos(a)*rr*0.85, FF+0.8, z+Math.sin(a)*rr*0.85), 0.03, "#9a9ea2"); }
      C(rr+0.01, 0.08, x, FF+1.4, z, "#9a9ea2", 28); C(rr+0.01, 0.08, x, FF+0.7+h*0.8, z, "#9a9ea2", 28); };
    tank(1432.0, -1240.8, 0.62, 2.0); tank(1434.6, -1240.8, 0.62, 2.0); tank(1432.0, -1238.0, 0.62, 2.0);
    tank(1435.6, -1233.2, 0.75, 1.2, "#b87333");
    for(let k=0;k<6;k++) C(0.21, 0.58, 1431.0+(k%3)*0.46, FF+0.29+((k/3)|0)*0.6, -1230.2, "#b8bcc0", 18);
    B(1.1, 0.12, 1.1, 1434.8, FF+0.06, -1230.5, "#8a6a44"); for(let k=0;k<4;k++) RB(0.5, 0.16, 0.35, 1434.55+(k%2)*0.5, FF+0.2+((k/2)|0)*0.16, -1230.5, "#d8c8a0", 0, 0.05); }

  /* ---- the bar --------------------------------------------------------------- */
  const BX=1455.3, BZ0=-1240.6, BZ1=-1231.4;
  B(0.70, 1.02, BZ1-BZ0, BX-0.35, FF+0.51, (BZ0+BZ1)/2, "#6a4a32");
  bx("brw_barn", 0.02, 0.86, BZ1-BZ0-0.2, BX-0.71, FF+0.50, (BZ0+BZ1)/2, 0.5, 0, "#ffffff");
  bx("brw_marble", 0.90, 0.05, BZ1-BZ0+0.10, BX-0.42, FF+1.045, (BZ0+BZ1)/2, 0.5, 0, "#ffffff");
  tubeE(V3(BX-0.86, FF+0.22, BZ0+0.2), V3(BX-0.86, FF+0.22, BZ1-0.2), 0.025, "#b8a050");
  addCol(BX-0.88, BX, BZ0-0.05, BZ1+0.05, FF-1, FF+1.1);
  // the back bar: a cabinet, the barnwood wall, the taps on it, the bottles on two shelves, the TVs over them
  bx("brw_barn", 0.03, CEIL-FF-0.02, BL.z1-BL.z0-2*WT-0.04, BL.x1-WT-0.025, (FF+CEIL)/2, (BL.z0+BL.z1)/2, 0.5, 0, "#ffffff");
  B(0.70, 0.94, 8.6, BL.x1-WT-0.40, FF+0.47, -1236.0, "#3a2a20"); bx("brw_marble", 0.74, 0.04, 8.64, BL.x1-WT-0.42, FF+0.96, -1236.0, 0.5, 0, "#ffffff");
  addCol(BL.x1-WT-0.78, BL.x1, -1240.4, -1231.6, FF-1, FF+1.0);
  B(0.06, 0.16, 3.2, BL.x1-WT-0.08, FF+1.35, -1236.0, "#8a8d90");
  for(let k=0;k<12;k++){ const z=-1237.45+k*0.26; C(0.012, 0.10, BL.x1-WT-0.14, FF+1.33, z, "#c8ccd0", 6, 0, 0, Math.PI/2);
    B(0.035, 0.16, 0.035, BL.x1-WT-0.19, FF+1.47, z, ["#c42a1a","#2a6a3a","#e6c21c","#1f3b6e","#d8d4c8","#6b4a2b"][k%6]); }
  B(0.20, 0.03, 3.2, BL.x1-WT-0.26, FF+1.0, -1236.0, "#2a2a2c");
  for(const y of [1.75, 2.15]){ B(0.26, 0.03, 2.2, BL.x1-WT-0.16, FF+y, -1239.0, "#2a2018"); B(0.26, 0.03, 2.2, BL.x1-WT-0.16, FF+y, -1233.0, "#2a2018");
    for(const zc of [-1239.0, -1233.0]) for(let k=0;k<11;k++){ const hh=0.24+(k%3)*0.04; C(0.032, hh, BL.x1-WT-0.16, FF+y+0.015+hh/2, zc-1.0+k*0.2, ["#2a5a2a","#6a3a1a","#c8c8b8","#1a1a2a","#8a6a2a"][(k+y*10|0)%5], 8); } }
  // the TVs: a ball game on each, the scoreboard in the corner
  { const c=cvs(256,144), x=c.getContext("2d"), tex=setSRGB(new T.CanvasTexture(c));
    BREWERY.screens={c:c, x:x, tex:tex};
    for(const zc of [-1238.8, -1233.2]){ B(0.06, 0.74, 1.26, BL.x1-WT-0.07, FF+2.70, zc, "#111111");
      const m=new T.Mesh(new T.PlaneGeometry(1.18, 0.66), new T.MeshBasicMaterial({map:tex, toneMapped:false})); m.position.set(BL.x1-WT-0.105, FF+2.70, zc); m.rotation.y=-Math.PI/2; scene.add(m); } }
  // the stools along the bar
  for(let k=0;k<6;k++){ const z=BZ0+0.75+k*1.55, x=BX-1.32;
    C(0.19, 0.06, x, FF+0.76, z, "#1a1a1a", 18); C(0.025, 0.73, x, FF+0.37, z, "#2a2a2c", 8); ent(new T.TorusGeometry(0.17, 0.012, 6, 18), x, FF+0.28, z, "#2a2a2c", Math.PI/2); C(0.20, 0.02, x, FF+0.01, z, "#2a2a2c", 18); }
  // the tables in the room, and the pendant bulbs over the bar; the fans
  const table=(x, z, y, w, d, top, ry)=>{ const f=XF(x, z, ry||0);
    for(let k=0;k<5;k++){ const lz=-d/2+d*(k+0.5)/5; B(w, 0.035, d/5-0.02, f.x(0,lz), y+0.74, f.z(0,lz), top||"#1e1e20", ry||0); }
    B(w-0.1, 0.04, 0.05, f.x(0,-d/2+0.06), y+0.70, f.z(0,-d/2+0.06), "#2a2a2c", ry||0); B(w-0.1, 0.04, 0.05, f.x(0,d/2-0.06), y+0.70, f.z(0,d/2-0.06), "#2a2a2c", ry||0);
    C(0.04, 0.70, x, y+0.35, z, "#2a2a2c", 8); B(0.62, 0.03, 0.06, x, y+0.015, z, "#2a2a2c", (ry||0)+0.785); B(0.62, 0.03, 0.06, x, y+0.015, z, "#2a2a2c", (ry||0)-0.785);
    const hx=Math.abs(Math.cos(ry||0))*w/2+Math.abs(Math.sin(ry||0))*d/2, hz=Math.abs(Math.sin(ry||0))*w/2+Math.abs(Math.cos(ry||0))*d/2;
    addCol(x-hx, x+hx, z-hz, z+hz, y-0.5, y+0.78); };
  // an aluminium chair with black slats, facing ry (its front at +z)
  const chair=(x, z, y, ry, seatOK)=>{ const f=XF(x, z, ry), q=(w,h,d,lx,ly,lz,c,rx)=>ent(boxGeo(w,h,d), f.x(lx,lz), y+ly, f.z(lx,lz), c, rx||0, ry, 0);
    for(let k=0;k<4;k++) q(0.44, 0.02, 0.08, 0, 0.45, -0.18+k*0.11, "#1e1e20");
    for(let k=0;k<3;k++) q(0.42, 0.06, 0.02, 0, 0.62+k*0.12, -0.24, "#1e1e20", -0.1);
    for(const sx of [-0.21, 0.21]){ q(0.025, 0.46, 0.025, sx, 0.23, 0.18, "#b8bcc0"); q(0.025, 0.92, 0.025, sx, 0.46, -0.24, "#b8bcc0"); q(0.025, 0.025, 0.44, sx, 0.44, -0.03, "#b8bcc0"); }
    if(seatOK) addSeat(x, z, y, ry+Math.PI, "A CHAIR"); };
  BREWERY.inTables=[];
  for(const [x,z] of [[1442.2,-1232.6],[1449.0,-1232.6],[1442.2,-1237.2],[1449.0,-1237.2]]){ table(x, z, FF, 0.9, 0.9, "#2a2018");
    chair(x, z+0.72, FF, Math.PI); chair(x, z-0.72, FF, 0); BREWERY.inTables.push({x:x, z:z, seats:[[x, z+0.72, Math.PI],[x, z-0.72, 0]]}); }
  // high-tops by the open doors
  for(const x of [1444.85, 1453.15]){ B(0.7, 0.04, 0.7, x, FF+1.04, -1241.6, "#2a2018"); C(0.04, 1.02, x, FF+0.51, -1241.6, "#2a2a2c", 8); C(0.26, 0.02, x, FF+0.01, -1241.6, "#2a2a2c", 16);
    addCol(x-0.36, x+0.36, -1241.96, -1241.24, FF-0.5, FF+1.06); }
  bucketOf("brw_bulb", ()=>emitMat(0xffd9a0, 1.0, "indoor", null));
  for(let k=0;k<5;k++){ const z=BZ0+0.8+k*2.0; tubeE(V3(BX-0.6, CEIL, z), V3(BX-0.6, FF+2.35, z), 0.005, "#1a1a1a", 4); push("brw_bulb", new T.SphereGeometry(0.055, 12, 10), BX-0.6, FF+2.30, z, 0, "#ffffff"); }
  for(const [x,z] of [[1442.2,-1232.6],[1449.0,-1232.6],[1442.2,-1237.2],[1449.0,-1237.2]]){ tubeE(V3(x, CEIL, z), V3(x, FF+2.25, z), 0.005, "#1a1a1a", 4);
    ent(new T.ConeGeometry(0.20, 0.22, 16, 1, true), x, FF+2.20, z, "#1a1a1a"); push("brw_bulb", new T.SphereGeometry(0.06, 12, 10), x, FF+2.13, z, 0, "#ffffff"); }
  for(const [x,z,i] of [[1445.6,-1234.9,0.62],[1451.4,-1234.9,0.62],[1449.0,-1240.0,0.55],[1456.8,-1236.0,0.5]])
    LAMPS.push({x:x, y:FF+2.3, z:z, color:0xffd2a0, intensity:i, dist:8, decay:1.6, indoor:true, vol:[BL.x0, BL.x1, BL.z0-3, BL.z1, FF-1, CEIL+0.5]});
  for(const [x,z] of [[1445.6,-1234.9],[1451.4,-1234.9]]){ C(0.02, 0.35, x, CEIL-0.18, z, "#1a1a1a", 6); C(0.11, 0.12, x, CEIL-0.40, z, "#1a1a1a", 12);
    const g=new T.Group(); g.position.set(x, CEIL-0.43, z); scene.add(g); BREWERY.fans.push(g);
    for(let k=0;k<5;k++){ const m=new T.Mesh(boxGeo(0.62, 0.012, 0.13), _heldMat("#4a3020")); m.position.set(Math.cos(k*1.2566)*0.38, k*0.003, Math.sin(k*1.2566)*0.38); m.rotation.y=-k*1.2566; g.add(m); } }
  // a chalkboard by the door: today's taps
  sign(0.9, 1.3, (c,W,H)=>{ c.fillStyle="#1e2420"; c.fillRect(0,0,W,H); c.strokeStyle="#8a6a44"; c.lineWidth=10; c.strokeRect(5,5,W-10,H-10);
      const L=["ON TAP","LAKE EFFECT IPA","FRENCH CREEK PILS","WEIR FARM HEFE","CONEAUT STOUT","BREAKWALL RED","CIDER · SELTZER"];
      L.forEach((s,k)=>say(c, s, W/2, H*(0.12+k*0.125), W*0.78, H*(k?0.06:0.09), k ? "#f2efe6" : "#e6c21c", "700", "'Comic Sans MS', 'Marker Felt', cursive")); },
    1447.4, Y+1.15, LOTZ-1.3-0.40, 0, false, 360);
  B(0.95, 1.36, 0.04, 1447.4, Y+1.15, LOTZ-1.3-0.43, "#5a4430"); B(0.05, 1.0, 0.5, 1447.0, Y+0.6, LOTZ-1.3-0.2, "#5a4430"); B(0.05, 1.0, 0.5, 1447.8, Y+0.6, LOTZ-1.3-0.2, "#5a4430");
  addCol(1446.9, 1447.9, LOTZ-1.8, LOTZ-1.0, Y-0.5, Y+1.8);

  /* ---- the beer garden ------------------------------------------------------- */
  // the maple in its ring of stones; turf round the fire pit; the sofas round it; the cornhole boards
  { const tx=1425.6, tz=-1248.0; FOREST.plant("hard", tx, tz, {scale:1.5}); addCol(tx-0.4, tx+0.4, tz-0.4, tz+0.4, gy(tx,tz)-0.5, gy(tx,tz)+6);
    for(let k=0;k<26;k++){ const a=k/26*6.283, rr=1.7+r()*0.3, x=tx+Math.cos(a)*rr, z=tz+Math.sin(a)*rr, s=0.18+r()*0.14;
      ent(new T.DodecahedronGeometry(s, 0), x, gy(x,z)+s*0.45, z, ["#b8a088","#a89070","#c8b090","#9a8468"][(r()*4)|0], r()*3, r()*3); } }
  { const fx=1434.5, fz=-1255.5, g0=gy(fx, fz);
    const tf=new T.PlaneGeometry(9.0, 8.0, 18, 16), P=tf.attributes.position;
    for(let i=0;i<P.count;i++){ const x=fx+P.getX(i), z=fz-P.getY(i); P.setZ(i, gy(x,z)+0.035); } tf.computeVertexNormals();
    { const U=tf.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*9*0.5, U.getY(i)*8*0.5); }
    push("brw_turf", tf.rotateX(-Math.PI/2), fx, 0, fz, 0, "#9aae8a");
    for(let k=0;k<14;k++){ const a=k/14*6.283; ent(new T.DodecahedronGeometry(0.16, 0), fx+Math.cos(a)*0.62, g0+0.12, fz+Math.sin(a)*0.62, "#6a665e", a, a*2); }
    C(0.5, 0.06, fx, g0+0.04, fz, "#2a2624", 18);
    addCol(fx-0.8, fx+0.8, fz-0.8, fz+0.8, g0-0.5, g0+0.4);
    const fire=new T.Mesh(new T.ConeGeometry(0.28, 0.5, 8, 1, true), new T.MeshBasicMaterial({color:0xff8a2a, toneMapped:false, transparent:true, opacity:0.85, side:T.DoubleSide}));
    fire.position.set(fx, g0+0.32, fz); scene.add(fire);
    BREWERY.fire={m:fire, l:{x:fx, y:g0+0.9, z:fz, color:0xff8a3a, intensity:0.0, dist:7, decay:1.6, fire:true}}; LAMPS.push(BREWERY.fire.l);
    // the sofas: dark wicker frames, cream cushions, three of them round the pit
    const sofa=(x, z, ry)=>{ const f=XF(x, z, ry), g=gy(x,z), q=(w,h,d,lx,ly,lz,c)=>RB(w,h,d, f.x(lx,lz), g+ly, f.z(lx,lz), c, ry, 0.04);
      q(1.9, 0.38, 0.82, 0, 0.19, 0, "#3a3028"); q(1.9, 0.48, 0.18, 0, 0.62, -0.32, "#3a3028"); for(const sd of [-1,1]) q(0.16, 0.30, 0.82, sd*0.87, 0.48, 0, "#3a3028");
      q(1.56, 0.14, 0.62, 0, 0.45, 0.06, "#e8e0cc"); q(1.56, 0.38, 0.12, 0, 0.66, -0.20, "#e8e0cc");
      const hx=Math.abs(Math.cos(ry))*0.95+Math.abs(Math.sin(ry))*0.41, hz=Math.abs(Math.sin(ry))*0.95+Math.abs(Math.cos(ry))*0.41;
      addCol(x-hx, x+hx, z-hz, z+hz, g-0.5, g+0.75);
      for(const lx of [-0.45, 0.45]) addSeat(f.x(lx, 0.05), f.z(lx, 0.05), g, ry+Math.PI, "THE SOFA BY THE FIRE"); };
    sofa(fx, fz+2.0, Math.PI); sofa(fx-2.1, fz, Math.PI/2); sofa(fx+2.1, fz, -Math.PI/2);
    BREWERY.sofas=[[fx, fz+2.0, Math.PI],[fx-2.1, fz, Math.PI/2],[fx+2.1, fz, -Math.PI/2]]; }
  { const cz0=-1249.4, cz1=-1258.6, cx=1444.6;
    for(const [z, ry] of [[cz0, 0],[cz1, Math.PI]]){ const g=gy(cx, z), f=XF(cx, z, ry);
      const a=V3(f.x(0,-0.6), g+0.05, f.z(0,-0.6)), b=V3(f.x(0,0.6), g+0.30, f.z(0,0.6)), d=b.clone().sub(a);
      E_board(a, b, d, ry); addCol(cx-0.32, cx+0.32, Math.min(a.z,b.z)-0.05, Math.max(a.z,b.z)+0.05, g-0.5, g+0.35); }
    function E_board(a, b, d, ry){ const L=d.length(); ME.push({geo:boxGeo(0.61, 0.04, L), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
        new T.Quaternion().setFromEuler(new T.Euler(Math.atan2(-d.y, Math.hypot(d.x,d.z))*(1), ry, 0, "YXZ")), V3(1,1,1)), color:new T.Color("#d8c098")}); } }

  /* ---- the deck bar: a timber hut on the grass with a window to order at ----------- */
  { const hx0=1452.2, hx1=1459.6, hz0=-1253.4, hz1=-1247.6, hg=Math.max(gy(hx0,hz0), gy(hx1,hz1), gy(hx0,hz1), gy(hx1,hz0))+0.15, top=hg+2.6, hr=hg+3.9, mz=(hz0+hz1)/2;
    BREWERY.hut={x0:hx0, x1:hx1, z0:hz0, z1:hz1, y:hg};
    bx("concrete", hx1-hx0+0.4, 1.0, hz1-hz0+0.4, (hx0+hx1)/2, hg-0.5, mz, 0.6, 0, "#a8a49a");
    for(const [a,b] of [[hz0, mz-1.3],[mz+1.3, hz1]]) bx("brw_cedar", 0.18, top-hg, b-a, hx0+0.09, (hg+top)/2, (a+b)/2, 0.5, 0, "#ffffff");
    bx("brw_cedar", 0.19, 0.996, 2.62, hx0+0.09, hg+0.502, mz, 0.5, 0, "#ffffff"); bx("brw_cedar", 0.19, 0.496, 2.62, hx0+0.09, top-0.25, mz, 0.5, 0, "#ffffff");      // (4 mm inside the piers' top and foot)
    B(0.45, 0.05, 2.7, hx0-0.05, hg+1.05, mz, "#2a2018");
    for(const z of [hz0, hz1]) bx("brw_cedar", hx1-hx0-0.008, top-hg+0.006, 0.18, (hx0+hx1)/2, (hg-0.01+top-0.004)/2, z+(z===hz0 ? 0.094 : -0.094), 0.5, 0, "#ffffff");     // (a centimetre into the pad, 4 mm inside the west piers' ends)
    bx("brw_cedar", 0.18, top-hg, hz1-hz0-0.36, hx1-0.09, (hg+top)/2, mz, 0.5, 0, "#ffffff");
    push("shingle", new FaceGeo().slab([V3(hx0-0.5, top-0.1, hz1+0.5), V3(hx1+0.5, top-0.1, hz1+0.5), V3(hx1+0.5, hr, mz), V3(hx0-0.5, hr, mz)], 0.10, 0.5).geo(), 0,0,0, 0, "#8a3a2a");
    push("shingle", new FaceGeo().slab([V3(hx1+0.505, top-0.1, hz0-0.5), V3(hx0-0.505, top-0.1, hz0-0.5), V3(hx0-0.505, hr-0.004, mz), V3(hx1+0.505, hr-0.004, mz)], 0.10, 0.5).geo(), 0,0,0, 0, "#8a3a2a");
    for(const [x, sgn] of [[hx0, 1], [hx1, -1]]) push("brw_cedar", new FaceGeo().slab(sgn>0 ? [V3(x, top-0.02, hz0), V3(x, top-0.02, hz1), V3(x, hr-0.1, mz)] : [V3(x, top-0.02, hz1), V3(x, top-0.02, hz0), V3(x, hr-0.1, mz)], 0.18, 0.5).geo(), 0,0,0, 0, "#f2ece4");
    ceilAt("brw_pine", hx0+0.18, hx1-0.18, hz0+0.18, hz1-0.18, top-0.02, "#ffffff", 0.5);
    addCol(hx0, hx1, hz0, hz1, hg-1, top); addRoof(hx0-0.5, hx1+0.5, hz0-0.5, hz1+0.5, top-0.2);
    B(0.5, 0.95, 3.0, hx0+0.9, hg+0.47, mz, "#3a2a20"); for(let k=0;k<5;k++) C(0.012, 0.10, hx0+0.75, hg+1.0, mz-0.6+k*0.3, "#c8ccd0", 6, 0, 0, Math.PI/2);
    LAMPS.push({x:hx0+1.2, y:top-0.4, z:mz, color:0xffd2a0, intensity:0.5, dist:6, decay:1.6, indoor:true});
    push("brw_bulb", new T.SphereGeometry(0.06, 12, 10), hx0+1.2, top-0.15, mz, 0, "#ffffff");
    sign(1.2, 0.36, (c,W,H)=>{ c.fillStyle="#1e2a24"; c.fillRect(0,0,W,H); say(c, "DECK BAR", W/2, H/2, W*0.78, H*0.58, "#e8d8b0", "900", "Georgia, serif"); }, hx0-0.012, top+0.3, mz, -Math.PI/2, false, 480);
    B(0.04, 0.42, 1.28, hx0+0.0, top+0.3, mz, "#2a2018");
    sign(0.7, 1.0, (c,W,H)=>{ c.fillStyle="#1e2420"; c.fillRect(0,0,W,H); c.strokeStyle="#8a6a44"; c.lineWidth=8; c.strokeRect(4,4,W-8,H-8);
        ["ORDER HERE","PINTS 7","FLIGHTS 12","PRETZEL 9","FRIES 6","DOGS ON THE DECK OK"].forEach((s,k)=>say(c, s, W/2, H*(0.13+k*0.15), W*0.78, H*(k?0.065:0.09), k ? "#f2efe6" : "#e6c21c", "700", "'Comic Sans MS', 'Marker Felt', cursive")); },
      hx0-0.9, gy(hx0-0.9, hz1+0.6)+0.95, hz1+0.65, -Math.PI/2+0.4, false, 280);
    BREWERY.hut.bar={x:hx0+1.35, z:mz}; }

  /* ---- the deck, out over the water ------------------------------------------------ */
  bx("lk_deck", DK.x1-DK.x0, 0.08, DK.z1-DK.z0, (DK.x0+DK.x1)/2, D-0.04, (DK.z0+DK.z1)/2, 0.7, 0, "#8e8272");            // (cedar gone grey in the sun)
  addFlat(DK.x0, DK.x1, DK.z0, DK.z1+0.02, D);
  for(const [ex0, ex1, ez0, ez1] of [[DK.x0-0.04, DK.x1+0.04, DK.z0-0.04, DK.z0+0.02],[DK.x0-0.04, DK.x0+0.02, DK.z0, DK.z1],[DK.x1-0.02, DK.x1+0.04, DK.z0, DK.z1]])
    B(ex1-ex0, 0.30, ez1-ez0, (ex0+ex1)/2, D-0.19, (ez0+ez1)/2, "#7a6a58");
  for(let x=DK.x0+0.3; x<DK.x1; x+=3.0) for(let z=DK.z0+0.3; z<DK.z1-1.0; z+=3.0){ const g=Math.min(gy(x,z), WY-0.6); C(0.11, D-0.08-g, x, (D-0.08+g)/2, z, "#6a5a44", 10); }
  addCol(DK.x0, DK.x1, DK.z0-0.1, DK.z0+0.3, WY-1.2, D-0.1);                     // (what a boat runs into, under the deck's edge)
  // the cable rail along the water and down both ends: black posts, a cap rail, six cables
  const railRun=(x0,z0,x1,z1)=>{ const L=Math.hypot(x1-x0,z1-z0), n=Math.max(1,Math.round(L/1.8));
    for(let k=0;k<=n;k++){ const t=k/n; B(0.07, 1.07, 0.07, x0+(x1-x0)*t, D+0.535, z0+(z1-z0)*t, "#141414"); }
    const ax=Math.abs(x1-x0)>0.01; B(ax ? L+0.07 : 0.10, 0.05, ax ? 0.10 : L+0.07, (x0+x1)/2, D+1.09, (z0+z1)/2, "#141414");
    for(let k=0;k<6;k++){ const y=D+0.16+k*0.15; tubeE(V3(x0, y, z0), V3(x1, y, z1), 0.004, "#9a9ea2", 4); } };
  railRun(DK.x0+0.05, DK.z0+0.05, DK.x1-0.05, DK.z0+0.05);
  railRun(DK.x0+0.05, DK.z0+0.05+1.8, DK.x0+0.05, DK.z1-0.05); railRun(DK.x1-0.05, DK.z0+0.05+1.8, DK.x1-0.05, DK.z1-0.05);
  addCol(DK.x0, DK.x1, DK.z0, DK.z0+0.10, D-0.5, D+1.12); addCol(DK.x0, DK.x0+0.10, DK.z0, DK.z1-0.2, D-0.5, D+1.12); addCol(DK.x1-0.10, DK.x1, DK.z0, DK.z1-0.2, D-0.5, D+1.12);
  addZone(DK.x0, DK.x1, DK.z0, DK.z1, D-1, D+4, "THE DECK AT LAKESHORE");
  // the shore's wall (14n's, a step short of the water) opens where the deck goes out over it
  { const w=COL.find(c=>c.y0===-40 && c.y1===300 && Math.abs(c.z0-(SH+0.35))<0.01 && c.x0<DK.x0 && c.x1>DK.x1);
    if(w){ const x1=w.x1; w.x1=DK.x0+0.05; addCol(DK.x1-0.05, x1, w.z0, w.z1, -40, 300).msg=w.msg; } }
  addZone(1422, 1468, DK.z1, BL.z0, Y-3, Y+5, "THE BEER GARDEN");
  // the tables: three rows, the umbrellas (furled but three)
  BREWERY.tables=[];
  const umbrella=(x, z, open)=>{ C(0.025, 2.5, x, D+1.25, z, "#d8d4c8", 8);
    if(open){ ent(new T.ConeGeometry(1.35, 0.45, 8, 1, true), x, D+2.30, z, "#b0221c"); ent(new T.ConeGeometry(1.36, 0.06, 8, 1, true), x, D+2.06, z, "#901a16"); C(0.04, 0.12, x, D+2.56, z, "#d8d4c8", 8); }
    else { ent(new T.CylinderGeometry(0.08, 0.15, 1.5, 10), x, D+1.75, z, "#b0221c"); C(0.03, 0.10, x, D+2.55, z, "#d8d4c8", 8); } };
  const rows=[[-1271.8, [1428, 1436, 1444, 1452, 1460]], [-1281.6, [1432, 1440, 1448, 1456]], [-1291.4, [1428, 1436, 1444, 1452, 1460]]];
  rows.forEach(([z, xs], ri)=>xs.forEach((x, k)=>{ table(x, z, D, 1.5, 0.82, "#1e1e20");
    const seats=[[x-0.38, z+0.68, Math.PI],[x+0.38, z+0.68, Math.PI],[x-0.38, z-0.68, 0],[x+0.38, z-0.68, 0]];
    seats.forEach(([sx,sz,ry],j)=>chair(sx, sz, D, ry));
    BREWERY.tables.push({x:x, z:z, seats:seats});
    if(ri<2) umbrella(x, z, (ri*5+k)%3===1); }));
  // and a fifth in the middle row at its east end, under an umbrella of its own
  { const x=1464.0, z=-1281.6; table(x, z, D, 1.5, 0.82, "#1e1e20");
    const seats=[[x-0.38, z+0.68, Math.PI],[x+0.38, z+0.68, Math.PI],[x-0.38, z-0.68, 0],[x+0.38, z-0.68, 0]];
    seats.forEach(([sx,sz,ry])=>chair(sx, sz, D, ry)); BREWERY.tables.push({x:x, z:z, seats:seats}); umbrella(x, z, true); }
  // high-tops along the rail, two stools at each looking out over the water
  BREWERY.highTops=[];
  for(const x of [1431.0, 1444.5, 1458.0]){ const z=DK.z0+2.3;
    B(0.78, 0.04, 0.62, x, D+1.04, z, "#1e1e20"); C(0.045, 1.02, x, D+0.52, z, "#2a2a2c", 8); C(0.26, 0.02, x, D+0.012, z, "#2a2a2c", 18);
    addCol(x-0.40, x+0.40, z-0.32, z+0.32, D-0.5, D+1.06);
    for(const dx of [-0.42, 0.42]){ const sx=x+dx, sz=z+0.62;
      C(0.18, 0.05, sx, D+0.76, sz, "#1e1e20", 16); C(0.022, 0.73, sx, D+0.37, sz, "#9a9ea2", 8); ent(new T.TorusGeometry(0.15, 0.011, 6, 16), sx, D+0.28, sz, "#9a9ea2", Math.PI/2); C(0.19, 0.02, sx, D+0.012, sz, "#9a9ea2", 16);
      addCol(sx-0.2, sx+0.2, sz-0.2, sz+0.2, D-0.5, D+0.78); BREWERY.highTops.push([sx, sz]); } }
  // and two picnic tables out on the grass west of the fire, their benches either side
  for(const [x, z, ry] of [[1427.4, -1256.2, 0.08],[1426.8, -1262.8, -0.05]]){ const y=gy(x, z), f=XF(x, z, ry);
    for(let k=0;k<5;k++){ const lz=-0.36+k*0.18; B(1.80, 0.04, 0.16, f.x(0, lz), y+0.75, f.z(0, lz), "#8a6a48", ry); }
    for(const sd of [-1,1]){ B(1.80, 0.04, 0.26, f.x(0, sd*0.64), y+0.45, f.z(0, sd*0.64), "#8a6a48", ry);
      for(const lx of [-0.70, 0.70]) ent(boxGeo(0.06, 0.92, 0.08), f.x(lx, sd*0.32), y+0.40, f.z(lx, sd*0.32), "#6a5038", -sd*0.62, ry, 0); }   // (feet out, tops in)
    for(const lx of [-0.70, 0.70]) ent(boxGeo(0.05, 0.05, 1.62), f.x(lx, 0), y+0.40, f.z(lx, 0), "#6a5038", 0, ry, 0);
    addCol(x-1.0, x+1.0, z-0.85, z+0.85, y-0.5, y+0.78);
    for(const sd of [-1,1]) addSeat(f.x(0, sd*0.64), f.z(0, sd*0.64), y, ry+(sd>0 ? 0 : Math.PI), "A PICNIC BENCH"); }
  // the strings of bulbs: poles along the rail and at the lawn's foot, the strings zig-zagging between them over the deck
  { const tops=[], H=4.3;
    for(const x of [DK.x0+0.4, 1434.0, 1445.0, 1456.0, DK.x1-0.4]){ tops.push([x, DK.z0+0.25]); }
    for(const x of [DK.x0+0.4, 1434.0, 1445.0, 1456.0, DK.x1-0.4]){ tops.push([x, DK.z1-0.25]); }
    for(const [x,z] of tops){ B(0.10, H, 0.10, x, D+H/2, z, "#141414"); addCol(x-0.06, x+0.06, z-0.06, z+0.06, D-0.5, D+H); }
    const BM=[], bulbGeo=new T.SphereGeometry(0.045, 8, 6);
    const string=(a, b)=>{ const L=Math.hypot(b[0]-a[0], b[1]-a[1]), n=Math.max(2, Math.round(L/0.75)), sag=Math.min(0.9, L*0.06);
      let prev=null;
      for(let k=0;k<=n;k++){ const t=k/n, x=a[0]+(b[0]-a[0])*t, z=a[1]+(b[1]-a[1])*t, y=D+H-0.05-sag*4*t*(1-t), p=V3(x,y,z);
        if(prev) tubeE(prev, p, 0.004, "#1a1a1a", 3);
        if(k>0 && k<n) BM.push({geo:bulbGeo, matrix:new T.Matrix4().makeTranslation(x, y-0.07, z), color:new T.Color("#ffffff")});
        prev=p; } };
    for(let k=0;k<5;k++){ string(tops[k], tops[5+k]); if(k<4){ string(tops[k], tops[5+k+1]); string(tops[k], tops[k+1]); string(tops[5+k], tops[5+k+1]); } }
    const bm=new T.MeshBasicMaterial({color:0xffd9a0, toneMapped:false}); const m=new T.Mesh(mergeEntries(BM), bm); scene.add(m); BREWERY.bulbs=bm;
    for(const [x,z] of [[1434,-1276],[1456,-1276],[1434,-1289],[1456,-1289],[1445,-1260],[1430,-1252]])
      LAMPS.push({x:x, y:(z<DK.z1 ? D : gy(x,z))+3.4, z:z, color:0xffd8a8, intensity:0.55, dist:11, decay:1.5, mothy:true}); }
  // the paths: from the walk in front, round each end of the building and down the grass to the deck
  { const path=(pts, w)=>{ const P=smoothPath(pts.map(([x,z])=>({x:x, z:z})), 0.8); for(const p of P) p.y=gy(p.x,p.z);
      layRibbon("asphalt", P, -w/2, w/2, 0.03, 0.5, "#b8b4ac"); addPaveRibbon(P, -w/2, w/2); };
    path([[BL.x0-1.0, LOTZ-2.4],[BL.x0-1.6, BL.z0-0.5],[BL.x0-0.6, -1252.0],[1432.0, -1262.0],[1433.0, DK.z1+0.2]], 1.8);
    path([[BL.x1+1.0, LOTZ-2.4],[BL.x1+1.8, BL.z0-0.5],[1462.6, -1252.0],[1460.5, -1262.0],[1459.0, DK.z1+0.2]], 1.8); }

  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, metalness:0.15}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
})();

/* ---- the people: behind the bars, at the tables, round the fire, at the rail, and the servers going round ---- */
(function breweryFolk(){
  if(typeof crowdGroup!=="function" || !BREWERY.deck) return;
  const G=crowdGroup("the brewery", 1445, -1258, 175), D=BREWERY.D, FF=BREWERY.FF, DK=BREWERY.deck, q=_trng(7171);
  G.bounds={x0:DK.x0+0.3, x1:DK.x1-0.3, z0:DK.z0+0.3, z1:-1206};          // (its staff keep to its ground: the lot, the taproom, the garden, the deck)
  const yAt=(x,z)=>(x>DK.x0 && x<DK.x1 && z>DK.z0 && z<DK.z1) ? D : (x>BREWERY.bl.x0 && x<BREWERY.bl.x1 && z>BREWERY.bl.z0 && z<BREWERY.bl.z1) ? FF : Terrain.groundAt(x,z);
  const pick=a=>a[(q()*a.length)|0];
  const guest=(o)=>Object.assign({h:0.96+q()*0.1, skin:pick(SKINS), hair:pick(HAIRS), shirt:pick(["#2f5f8f","#b33a3a","#e8e4d8","#3d6e44","#1d1f22","#c99a2a","#7a4f8a","#5d6a73","#d77a3a","#2b3d63","#8aa8c8","#e8c8a0"]),
    pants:pick(PANTS), shoes:pick(["#f2f0ea","#1d1d1f","#6b4a2b"]), shorts:q()<0.35, cap:q()<0.25 ? pick(["#b3151b","#1f3b6e","#2f5a35","#c8b890"]) : null, shades:q()<0.2}, o);
  const staff=(o)=>Object.assign({h:1.0, skin:pick(SKINS), hair:pick(HAIRS), shirt:"#1d1f22", pants:"#1d1f22", shoes:"#1d1d1f"}, o);
  // the bartenders: two in the taproom, one in the hut
  crowdAdd(G, {look:staff({female:true, h:0.96}), x:1457.0, z:-1238.2, y:FF, yaw:-Math.PI/2, mode:"stand", job:"pour"});
  crowdAdd(G, {look:staff({beard:"#4a3020"}), x:1457.1, z:-1233.6, y:FF, yaw:-Math.PI/2, mode:"stand", job:"pour"});
  { const h=BREWERY.hut; crowdAdd(G, {look:staff({female:true, h:0.95, hair:HAIRS[3]}), x:h.bar.x, z:h.bar.z, y:h.y, yaw:-Math.PI/2, mode:"stand", job:"pour"}); }
  // at the bar, on the stools
  // (each sits on top of the seat: the hips five or six centimetres over it, the stools' tops at 0.79, the chairs' 0.46,
  // the sofas' cushions 0.52)
  for(const z of [-1239.85, -1236.75, -1235.2]) crowdAdd(G, {look:guest({}), x:1453.98, z:z, y:FF+0.30, yaw:Math.PI/2, mode:"sit", sitY:0.545, held:"pint", drink:true});
  // at the tables inside, and out on the deck, round the fire, at the rail
  const at=(x, z, ry, y, sy)=>crowdAdd(G, {look:guest({}), x:x, z:z, y:y, yaw:ry, mode:"sit", sitY:sy||0.515, held:q()<0.8 ? "pint" : "can", drink:true});
  // (a chair faces its table, and whoever is in it faces the same way; every chair left empty is one you can sit in)
  const taken=new Set(), sitAt=(tbls, ti, sj, y)=>{ const t=tbls[ti]; if(!t) return; const [x,z,ry]=t.seats[sj]; at(x, z, ry, y); taken.add(t.seats[sj]); };
  sitAt(BREWERY.inTables, 0, 0, FF); sitAt(BREWERY.inTables, 0, 1, FF); sitAt(BREWERY.inTables, 3, 0, FF);
  for(const [ti, sj] of [[0,0],[0,3],[1,1],[3,0],[3,1],[3,2],[5,2],[6,0],[6,3],[8,1],[10,0],[10,1],[12,2],[13,3]]) sitAt(BREWERY.tables, ti, sj, D);
  for(const [tbls, y] of [[BREWERY.inTables, FF],[BREWERY.tables, D]]) for(const t of tbls) for(const s of t.seats) if(!taken.has(s)) addSeat(s[0], s[1], y, s[2]+Math.PI, "A CHAIR");
  for(const [x,z,ry] of BREWERY.sofas.slice(0,2)){ const f=XF(x, z, ry); at(f.x(0.45, 0.05), f.z(0.45, 0.05), ry, Terrain.groundAt(x,z), 0.575); }
  for(const [x,dz] of [[1437.6,0],[1438.4,0.1],[1451.0,0]]) crowdAdd(G, {look:guest({}), x:x, z:DK.z0+0.55+dz, y:D, yaw:Math.PI, mode:"stand", held:"pint", drink:true, sway:0.5});
  // two on the stools at the rail's high-tops, looking out at the lake
  for(const k of [0, 3]){ const [sx, sz]=BREWERY.highTops[k]; crowdAdd(G, {look:guest({}), x:sx, z:sz, y:D+0.30, yaw:Math.PI, mode:"sit", sitY:0.54, held:"pint", drink:true}); }
  // and somebody's dog, lying on the boards by their table with her water bowl, watching the servers go by
  { const t=BREWERY.tables[3], dx=t.x+1.25, dz=t.z+0.95, dog=buildDog("#c8a060");
    dog.g.position.set(dx, D, dz); dog.g.rotation.y=-Math.PI/2-0.3;
    const bowl=new T.Mesh(new T.CylinderGeometry(0.11, 0.08, 0.07, 16), new T.MeshStandardMaterial({color:0xb8bcc0, metalness:0.7, roughness:0.3}));
    bowl.position.set(dx-0.15, D+0.04, dz-0.55); scene.add(bowl);
    addCol(dx-0.42, dx+0.42, dz-0.25, dz+0.25, D-0.5, D+0.4);
    BREWERY.dog={D:dog, t:0, x:dx, z:dz}; }
  // cornhole, two at it
  crowdAdd(G, {look:guest({}), x:1445.4, z:-1248.6, yaw:Math.PI, mode:"stand", job:"toss"});
  crowdAdd(G, {look:guest({female:true, h:0.95}), x:1443.8, z:-1259.4, yaw:0, mode:"stand", job:"toss"});
  // the servers, round the tables with a tray, from the hut's window and back
  const hut=BREWERY.hut;
  crowdAdd(G, {look:staff({female:true, h:0.95, hair:HAIRS[0]}), mode:"walk", job:"tray", held:"tray", heldL:true, loop:true, speed:1.05, yAt:yAt,
    path:[[hut.x0-0.8, hut.z0+2.0, undefined, 6],[1450, -1262],[1448, -1269.6, undefined, 4],[1444, -1276.8],[1440, -1279.4, undefined, 4],[1437, -1286.8],[1436, -1289.4, undefined, 4],[1446, -1286.8],[1452, -1279.4, undefined, 3],[1455.5, -1262]]});
  crowdAdd(G, {look:staff({h:1.03}), mode:"walk", job:"tray", held:"tray", heldL:true, loop:true, speed:1.15, yAt:yAt,
    path:[[1446.0, -1244.6, undefined, 5],[1440.0, -1252.0],[1433.0, -1263.0],[1430.0, -1269.6, undefined, 4],[1428.0, -1276.8],[1432.0, -1279.4, undefined, 3],[1428.5, -1286.8],[1428.0, -1289.4, undefined, 4],[1440.0, -1276.8],[1439.0, -1264.0],[1446.0, -1250.0]]});
})();
// the fans going round, the game on the TVs, the fire in its pit, and the bulbs brighter as the light goes
function updateBrewery(dt, dark){
  const B=BREWERY; if(!B.bulbs) return;
  const c=camera.position; if(Math.hypot(c.x-1445, c.z+1258)>220) return;
  for(const f of B.fans) f.rotation.y+=dt*3.2;
  B.bulbs.color.setHex(0xffd9a0).multiplyScalar(0.72+0.48*smoothstep(0.2, 0.7, dark));                 // (glass by day, lit by dusk)
  // the dog: lying down, front legs out, the hind ones folded; the head up, panting, turning to whatever goes past,
  // now and then down on the paws for a bit; the tail going slow on the boards
  if(B.dog){ const g=B.dog, Dg=g.D, Bn=Dg.B, t=(g.t+=dt);
    Bn[0].position.y=0.18; Bn[0].rotation.set(0, 0, 0);
    // (the hind legs folded forward along her sides: shortened to the haunch, all that shows of a folded leg)
    Dg.legs.forEach((b,k)=>{ Bn[b].rotation.set(k<2 ? -1.38 : -1.42, 0, k<2 ? 0 : (k===2 ? -0.22 : 0.22)); Bn[b].scale.set(1, k<2 ? 1 : 0.55, k<2 ? 1 : 1.25); });
    const rest=smoothstep(0.6, 0.85, _noise1(t*0.05+3.1)), look=_noise1(t*0.18+1.7);
    Bn[Dg.head].rotation.set(0.35*rest+Math.sin(t*9)*0.015*(1-rest), look*0.9*(1-rest*0.6), 0);
    Bn[Dg.tail].rotation.set(-0.62, Math.sin(t*(1.6+1.4*Math.max(0, _noise1(t*0.3))))*0.40, 0); }       // (laid out behind her, sweeping the boards)
  if(B.fire){ const n=0.8+0.2*Math.sin(CROWD.t*11)*Math.sin(CROWD.t*4.3); B.fire.m.scale.set(1, n, 1); B.fire.m.material.opacity=0.55+0.3*n;
    B.fire.l.intensity=0.9*n*smoothstep(0.15, 0.6, dark); B.fire.m.visible=true;
    if(dark>0.2 && typeof PUFFS!=="undefined" && Math.random()<dt*6) PUFFS.emit(B.fire.l.x+(Math.random()-0.5)*0.2, B.fire.l.y-0.3, B.fire.l.z+(Math.random()-0.5)*0.2, 0, 0.5, 0, 0.12, 0.7, 2.2, 0.35, 0.55, 0.7); }
  // the game on the TVs: a dozen frames a second while you are near enough to watch, a couple from further off
  const near=Math.hypot(c.x-1452, c.z+1236)<26;
  bbTick(B.screens, dt);
  B.scrT+=dt; if(B.scrT<(near ? 0.08 : 0.5)) return; B.scrT=0;
  bbDraw(B.screens); B.screens.tex.needsUpdate=true;
}

/* ---- the ball game on the TVs ---------------------------------------------------------------------------------
   A director cutting between shots as the game goes: the centre-field camera on each pitch (the windup, the
   ball to the plate, the swing), the batter close up with his name across the bottom, the wide shot when the
   ball is put in play (its arc, an outfielder running it down or the runner going), a replay of a hit in slow
   motion, the crowd, the line score between innings and an ad. The count, the outs, the bases and the score
   go on from pitch to pitch; the bug in the corner keeps them. */
const BB={TEAMS:["ERI","ALT"], NAMES:[["R. KOWALSKI",".281"],["D. MARSH",".246"],["J. OKAFOR",".305"],["T. BRENNAN",".219"],["M. SATO",".268"],
  ["L. ESPINAL",".292"],["C. WEAVER",".233"],["A. ROWE",".254"],["B. DUFRESNE",".198"]]};
function bbTick(S, dt){
  if(!S.g) S.g={inn:6, top:false, outs:1, b:0, s:1, bases:[false,true,false], sc:[3,2], line:[[0,1,0,0,2,0],[1,0,0,1,0]], bat:2,
                shot:"cf", t:0, cyc:0, out:null, arc:null, msg:null, msgT:0};
  const g=S.g; g.t+=dt; g.msgT=Math.max(0, g.msgT-dt);
  const next=(shot)=>{ g.shot=shot; g.t=0; };
  const nextBatter=()=>{ g.b=0; g.s=0; g.bat=(g.bat+1)%9; };
  const run=(n)=>{ const k=g.top ? 0 : 1; g.sc[k]+=n; const L=g.line[k]; L[L.length-1]+=n; if(n){ g.msg=n>1 ? n+" RUNS SCORE" : "RUN SCORES"; g.msgT=3; } };
  const sideOut=()=>{ g.outs=0; g.bases=[false,false,false]; nextBatter(); if(g.top){ g.top=false; g.line[1].push(0); } else { g.top=true; g.inn++; g.line[0].push(0); } next("line"); };
  // each pitch decided as it is thrown (so the batter swings when he does and the banner is right), its outcome
  // put on the board after
  if(g.shot==="cf" && !g.res){ const r=Math.random(), arc={hit:Math.random()<0.38, far:0.55+Math.random()*0.45, dir:(Math.random()-0.5)*1.4};
    arc.hr=arc.hit && arc.far>0.97;
    g.res=r<0.34 ? {k:"ball", lab:g.b>=3 ? "BALL FOUR" : "BALL"}
         : r<0.62 ? (Math.random()<0.5 ? {k:"strike", lab:g.s>=2 ? "STRIKE THREE" : "STRIKE"} : {k:"strike", swing:true, lab:g.s>=2 ? "STRIKE THREE" : "SWING AND A MISS"})
         : r<0.78 ? {k:"foul", swing:true, lab:"FOUL"}
         : {k:"play", swing:true, arc:arc, lab:arc.hr ? "GONE! HOME RUN" : arc.hit ? (arc.far>0.8 ? "INTO THE GAP" : "BASE HIT") : (arc.far>0.7 ? "FLY BALL" : "GROUND BALL")}; }
  const pitchOver=()=>{ const R=g.res; g.res=null; g.out=R.lab;
    if(R.k==="ball"){ g.b++; if(g.b>=4){ const B=g.bases; if(B[0]&&B[1]&&B[2]) run(1); B[2]=B[2]||(B[0]&&B[1]); B[1]=B[1]||B[0]; B[0]=true; nextBatter(); } }
    else if(R.k==="strike"){ g.s++; if(g.s>=3){ g.outs++; nextBatter(); } }
    else if(R.k==="foul"){ if(g.s<2) g.s++; }
    else { g.arc=R.arc; const hit=R.arc.hit, far=R.arc.far;
      if(hit){ const B=g.bases, n=g.arc.hr ? 4 : far>0.8 ? 2 : 1; let runs=0;
        for(let k=0;k<n;k++){ if(B[2]) runs++; B[2]=B[1]; B[1]=B[0]; B[0]=k===0; } if(g.arc.hr){ runs+=B.filter(v=>v).length; B[0]=B[1]=B[2]=false; } run(runs); }
      else g.outs++;
      nextBatter(); return next("wide"); }
    if(g.outs>=3) return sideOut();
    next(Math.random()<0.3 ? "batter" : Math.random()<0.15 ? "crowd" : "cf"); };
  if(g.shot==="cf" && g.t>3.6) pitchOver();
  else if(g.shot==="batter" && g.t>2.6) next("cf");
  else if(g.shot==="crowd" && g.t>2.2) next("cf");
  else if(g.shot==="wide" && g.t>4.2){ if(g.outs>=3) sideOut(); else next(g.arc && g.arc.hit ? "replay" : "batter"); }
  else if(g.shot==="replay" && g.t>3.6) next("batter");
  else if(g.shot==="line" && g.t>3.2) next("ad");
  else if(g.shot==="ad" && g.t>4.5){ g.ad=((g.ad||0)+1)%3; next("batter"); }
}
function bbDraw(S){
  const g=S.g, x=S.x, W=256, H=144, t=g.t, fe=(c)=>x.fillStyle=c;
  const txt=(s, px, py, size, col, align)=>{ x.font="bold "+size+"px Arial"; x.textAlign=align||"left"; x.textBaseline="middle"; fe(col); x.fillText(s, px, py); };
  // a ballplayer, from behind or in front: legs, body, arms, head with its cap; s his size, home team in white
  const man=(px, py, sz, home, armA, legA, bat)=>{ const sh=home ? "#f2efe6" : "#7a7a84", tr=home ? "#1f3b6e" : "#7a1a1a";
    fe(home ? "#e8e4da" : "#6a6a74"); x.fillRect(px-sz*0.22, py-sz*0.45, sz*0.16, sz*0.45); x.fillRect(px+sz*0.06+legA*sz*0.1, py-sz*0.45, sz*0.16, sz*0.45);
    fe(sh); x.fillRect(px-sz*0.26, py-sz, sz*0.52, sz*0.58); fe(tr); x.fillRect(px-sz*0.26, py-sz*0.5, sz*0.52, sz*0.06);
    x.save(); x.translate(px+sz*0.22, py-sz*0.92); x.rotate(armA); fe(sh); x.fillRect(-sz*0.06, 0, sz*0.12, sz*0.42); x.restore();
    fe("#c8946a"); x.beginPath(); x.arc(px, py-sz*1.12, sz*0.15, 0, 7); x.fill(); fe(tr); x.fillRect(px-sz*0.16, py-sz*1.28, sz*0.32, sz*0.09);
    if(bat!==undefined){ x.save(); x.translate(px+sz*0.18, py-sz*0.8); x.rotate(bat); fe("#c89a5a"); x.fillRect(-sz*0.03, -sz*0.75, sz*0.06, sz*0.75); x.restore(); } };
  const grass=(y0)=>{ const gr=x.createLinearGradient(0, y0, 0, H); gr.addColorStop(0, "#3c8a3e"); gr.addColorStop(1, "#2a6a2e"); fe(gr); x.fillRect(0, y0, W, H-y0);
    for(let k=0;k<8;k++){ x.fillStyle="rgba(255,255,255,0.05)"; if(k%2) x.fillRect(0, y0+(H-y0)*k/8, W, (H-y0)/8); } };
  const crowd=(y0, y1, bob)=>{ fe("#2a2a34"); x.fillRect(0, y0, W, y1-y0);
    for(let r=0;r<6;r++) for(let k=0;k<34;k++){ const h=Math.sin(k*12.9898+r*78.233)*43758.5453, f=h-Math.floor(h), up=bob ? Math.max(0, Math.sin(g.t*6+k+r))*2 : 0;
      fe(["#c42a1a","#f2efe6","#1f3b6e","#e6c21c","#3a6a3a","#8a6a4a"][(f*6)|0]); x.fillRect(k*7.6+(r%2)*3.8, y0+3+r*(y1-y0-6)/6-up, 4, 4); } };
  const sh=g.shot;
  if(sh==="cf"){
    // the centre-field camera: the pitcher's back big in front, the batter, catcher and ump at the plate beyond
    fe("#6a8aa8"); x.fillRect(0, 0, W, 30); crowd(10, 34, false); grass(34);
    fe("#b08458"); x.beginPath(); x.ellipse(W/2, 66, 46, 14, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(W/2, 124, 30, 16, 0, 0, 7); x.fill();
    fe("#f2efe6"); x.fillRect(W/2-3, 64, 6, 3);
    const wind=smoothstep(0.4, 1.6, t)*(1-smoothstep(1.6, 1.85, t)), rel=smoothstep(1.6, 1.85, t), fly=smoothstep(1.75, 2.15, t);
    const swing=g.res && g.res.swing ? smoothstep(2.0, 2.25, t) : 0;
    man(W/2-8, 62, 15, g.top, -0.3, 0, -0.6-swing*2.4);                                    // the batter
    fe("#3a3a40"); x.fillRect(W/2-4, 56, 10, 7); fe("#1f1f24"); x.fillRect(W/2+4, 50, 8, 13);   // the catcher, the ump
    man(W/2, 140, 46, !g.top, -2.6*wind+rel*1.4, wind*0.6);                                  // the pitcher, his back to us
    if(t>1.75 && t<2.25){ fe("#ffffff"); x.beginPath(); x.arc(lerp(W/2+6, W/2-2, fly), lerp(92, 60, fly), lerp(3, 1.4, fly), 0, 7); x.fill(); }
  }else if(sh==="batter" || sh==="replay"){
    const sl=sh==="replay" ? 0.35 : 1, tt=t*sl;
    crowd(0, 70, false); fe("rgba(40,40,50,0.5)"); x.fillRect(0, 0, W, 70); grass(70);
    const wag=Math.sin(tt*3)*0.25, sw=sh==="replay" ? smoothstep(0.4, 1.0, tt) : 0;
    man(W/2+10, 150, 70, g.top, -0.9-sw*1.0, 0, -0.9+wag-sw*2.6);
    if(sh==="batter"){ const nm=BB.NAMES[g.bat]; fe("rgba(10,20,40,0.85)"); x.fillRect(20, H-30, W-40, 20); fe("#e6c21c"); x.fillRect(20, H-30, 6, 20);
      txt("#"+(10+g.bat*3)+"  "+nm[0], 32, H-20, 11, "#f2efe6"); txt("AVG "+nm[1], W-28, H-20, 11, "#e6c21c", "right"); }
    else { fe("#c42a1a"); x.fillRect(W-74, 10, 64, 18); txt("REPLAY", W-42, 19, 12, "#ffffff", "center"); }
  }else if(sh==="wide"){
    // the ball in the air off the bat, the outfielder after it; the fence and the stands behind
    fe("#6a8aa8"); x.fillRect(0, 0, W, 24); crowd(6, 40, true); fe("#1f4a2a"); x.fillRect(0, 40, W, 10); grass(50);
    const A=g.arc||{far:0.6, dir:0, hit:false}, u=smoothstep(0, 2.6, t), bx=W/2+A.dir*90*u, by=136-u*(86*A.far)-Math.sin(u*Math.PI)*60;
    const fx=lerp(W/2+A.dir*40, W/2+A.dir*86*A.far, smoothstep(0.2, 2.6, t)), fy=lerp(70, 140-86*A.far, smoothstep(0.2, 2.6, t));
    man(fx, Math.max(fy, 58), 14, !g.top, -1.0-Math.sin(t*10)*0.6, Math.sin(t*12));
    if(!(A.hr && u>0.95)){ fe("#ffffff"); x.beginPath(); x.arc(bx, by, 2.2, 0, 7); x.fill(); }
  }else if(sh==="crowd"){ crowd(0, H, true); fe("rgba(255,255,255,0.08)"); x.fillRect(0, 0, W, H); }
  else if(sh==="line"){
    // the line score between half-innings
    fe("#0e1a2e"); x.fillRect(0, 0, W, H); txt("END OF "+(g.top ? g.inn-1 : g.inn)+(g.top ? "" : " ½"), W/2, 22, 13, "#e6c21c", "center");
    for(let r=0;r<2;r++){ const y=56+r*28; txt(BB.TEAMS[r], 18, y, 13, "#f2efe6");
      for(let k=0;k<9;k++) txt(g.line[r][k]!==undefined ? String(g.line[r][k]) : "", 62+k*16, y, 12, "#c8d0e0", "center");
      txt(String(g.sc[r]), W-26, y, 14, "#e6c21c", "center"); }
    for(let k=0;k<9;k++) txt(String(k+1), 62+k*16, 38, 10, "#7a8aa8", "center"); txt("R", W-26, 38, 10, "#7a8aa8", "center");
  }else if(sh==="ad"){
    const ad=g.ad||0;
    if(ad===0){ fe("#c8a03a"); x.fillRect(0, 0, W, H); fe("#7a4a1a"); x.fillRect(W*0.62, 30+Math.sin(t*2)*3, 34, 80); fe("#f4f2ec"); x.fillRect(W*0.62, 30+Math.sin(t*2)*3, 34, 14);
      txt("LAKESHORE", 20, 52, 18, "#2a1a0a"); txt("PALE ALE", 20, 74, 18, "#2a1a0a"); txt("ON TAP HERE", 20, 104, 11, "#5a3a1a"); }
    else if(ad===1){ fe("#1f3b6e"); x.fillRect(0, 0, W, H); fe("#c42a1a"); x.fillRect((t*90)%(W+120)-120, 80, 110, 32); fe("#1a1a1a"); for(const dx of [20, 90]){ x.beginPath(); x.arc((t*90)%(W+120)-120+dx, 114, 8, 0, 7); x.fill(); }
      txt("FRENCH CREEK FORD", W/2, 30, 15, "#f2efe6", "center"); txt("0% FOR 60 MONTHS", W/2, 52, 11, "#e6c21c", "center"); }
    else { fe("#2a6a3a"); x.fillRect(0, 0, W, H); txt("WEIR FARM STAND", W/2, 40, 15, "#f4f2ec", "center"); txt("SWEET CORN · ROUTE 6N", W/2, 66, 11, "#e6c21c", "center"); txt("HONOR SYSTEM", W/2, 92, 11, "#f4f2ec", "center"); }
  }
  // the bug: the score, the inning, the count, the outs and the bases (not over the ads and the line score)
  if(sh!=="ad" && sh!=="line"){
    fe("rgba(10,12,22,0.85)"); x.fillRect(6, 6, 104, 32);
    for(let r=0;r<2;r++){ txt(BB.TEAMS[r], 12, 15+r*14, 10, "#f2efe6"); txt(String(g.sc[r]), 48, 15+r*14, 11, "#ffffff", "center"); }
    txt((g.top ? "▲" : "▼")+g.inn, 66, 15, 10, "#e6c21c"); txt(g.b+"-"+g.s, 66, 29, 10, "#f2efe6");
    for(let k=0;k<2;k++){ fe(k<g.outs ? "#e6c21c" : "#4a4e5a"); x.beginPath(); x.arc(88+k*7, 29, 2.5, 0, 7); x.fill(); }
    for(const [k, dx, dy] of [[0, 7, 0],[1, 0, -6],[2, -7, 0]]){ x.save(); x.translate(94+dx, 16+dy); x.rotate(Math.PI/4); fe(g.bases[k] ? "#e6c21c" : "#4a4e5a"); x.fillRect(-2.5, -2.5, 5, 5); x.restore(); }
    const lab=sh==="cf" ? (t>2.1 && g.res ? g.res.lab : null) : sh==="wide" ? g.out : null;
    if(lab){ fe("rgba(196,42,26,0.9)"); x.fillRect(W/2-60, H-26, 120, 18); txt(lab, W/2, H-17, 11, "#ffffff", "center"); }
    if(g.msgT>0){ fe("rgba(230,194,28,0.92)"); x.fillRect(W-110, 8, 100, 18); txt(g.msg, W-60, 17, 10, "#1a1a1a", "center"); }
  }
}
