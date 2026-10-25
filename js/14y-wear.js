"use strict";
/* REST AREA · 14y-wear.js
   the world worn in: oil in the stalls, sealed cracks over the lots and the
   interstate, the drains and the lids, leaves down under the trees, the
   state's marker by the walk, the units behind the building; and the poles
   and the wires along US 6N at Edinboro
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14y · WEAR AND SMALL THINGS
   Everything here is laid over what 08 to 14k built, so it comes after
   them: the leaves keep clear of every collider, floor and room.
   The flat things sit on the polygon-offset ladder (08) above the paint:
   tar sealant at -5, oil and the iron lids at -6, the leaves at -6 a
   centimetre up.
   ---------------------------------------------------------------------- */
const WEAR={leaves:[], autumn:null};
(function wear(){
  const t0=performance.now();
  const r=_trng(9090);
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const C=(rad,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||roundSegs(rad)),x,y,z,c,rx,ry,rz);
  const tubeE=(a,b,rad,c,seg)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,seg||8), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };

  /* ---- sealed cracks: tar snakes, the black lines a road crew leaves over every crack ---- */
  bucketOf("tarseal", ()=>new T.MeshStandardMaterial(Object.assign({color:0xffffff, roughness:0.30, metalness:0.05}, _po(-5))));
  // a wandering line, as a flat strip a few centimetres wide, laid where it is paved
  let nCrack=0;
  const crack=(x, z, a, L, w, turn)=>{
    const pts=[]; let h=a, lift=0.0035+(nCrack++%5)*0.0007;     // (each a hair over the last, so two that cross never share a plane)
    for(let s=0; s<=L; s+=0.22){ const y=pavedY(x,z); if(y===null) break; pts.push([x,y,z]);
      h+=(r()-0.5)*turn; x+=Math.sin(h)*0.22; z+=Math.cos(h)*0.22; }
    if(pts.length<4) return;
    const P=[], I=[];
    for(let i=0;i<pts.length;i++){ const p=pts[i], q=pts[Math.min(i+1,pts.length-1)], o=pts[Math.max(i-1,0)];
      const dx=q[0]-o[0], dz=q[2]-o[2], n=Math.hypot(dx,dz)||1, hw=w*(0.6+0.4*Math.sin(i*0.9+a))/2;
      P.push(p[0]-dz/n*hw, p[1]+lift, p[2]+dx/n*hw,  p[0]+dz/n*hw, p[1]+lift, p[2]-dx/n*hw);
      if(i) I.push((i-1)*2, i*2, (i-1)*2+1, (i-1)*2+1, i*2, i*2+1); }
    const g=new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(P,3)); g.setIndex(I);
    const U=[]; for(let i=0;i<P.length/3;i++) U.push(i%2, i*0.1); g.setAttribute("uv", new T.Float32BufferAttribute(U,2));
    g.computeVertexNormals();
    // (wound the other way, the strip faces down: turn it over)
    if(g.attributes.normal.getY(0)<0){ for(let k=0;k<I.length;k+=3){ const t=I[k+1]; I[k+1]=I[k+2]; I[k+2]=t; } g.setIndex(I); g.computeVertexNormals(); }
    push("tarseal", g, 0,0,0, 0, ["#1a1a1c","#202022","#161618"][(r()*3)|0]); };
  const Cr=SITE.car, Tk=SITE.truck;
  for(let k=0;k<70;k++) crack(Cr.x0+1+r()*(Cr.x1-Cr.x0-2), Cr.z0+2+r()*(Cr.z1-Cr.z0-4), r()<0.6?Math.PI/2+(r()-0.5)*0.6:(r()-0.5)*0.6, 3+r()*12, 0.04+r()*0.025, 0.5);
  for(let k=0;k<80;k++) crack(Tk.x0+1+r()*(Tk.x1-Tk.x0-2), Tk.z0+2+r()*(Tk.z1-Tk.z0-4), r()<0.6?Math.PI/2+(r()-0.5)*0.6:(r()-0.5)*0.6, 4+r()*14, 0.045+r()*0.03, 0.45);
  // and the interstate by the site: across the lanes every so often, and down the joint between them
  for(const cx of [HWY.nb, HWY.sb]){
    for(let z=-560+r()*20; z<560; z+=12+r()*26){ const sd=r()<0.5?-1:1;
      crack(cx+sd*(HWY.lane*2+HWY.shR*0.6), z, sd>0?-Math.PI/2:Math.PI/2, HWY.lane*2+2.5+r()*2, 0.05+r()*0.02, 0.35); }
    for(let k=0;k<10;k++) crack(cx+(r()-0.5)*0.6, -540+r()*1080, (r()<0.5?0:Math.PI)+(r()-0.5)*0.08, 18+r()*40, 0.05, 0.06); }

  /* ---- oil where the cars stand, nose in to the curb ---- */
  { const tex=signTex(256,256,(c,W,H)=>{ c.clearRect(0,0,W,H); const q=_trng(515);
      for(let cell=0; cell<4; cell++){ const ox=(cell%2)*128+64, oy=((cell/2)|0)*128+64;
        for(let k=0;k<9;k++){ const bx2=ox+(q()-0.5)*50, by=oy+(q()-0.5)*60, rr=12+q()*26, g=c.createRadialGradient(bx2,by,0,bx2,by,rr);
          g.addColorStop(0,"rgba(18,16,14,0.55)"); g.addColorStop(0.6,"rgba(22,20,18,0.30)"); g.addColorStop(1,"rgba(22,20,18,0)");
          c.fillStyle=g; c.beginPath(); c.ellipse(bx2,by,rr,rr*(0.7+q()*0.5),q()*3,0,7); c.fill(); }
        c.fillStyle="rgba(10,10,10,0.35)"; for(let k=0;k<40;k++){ c.beginPath(); c.arc(ox+(q()-0.5)*80, oy+(q()-0.5)*90, 1+q()*2.5, 0, 7); c.fill(); } } });
    bucketOf("oilspot", ()=>new T.MeshStandardMaterial(Object.assign({map:tex, transparent:true, depthWrite:false, roughness:0.35}, _po(-6))));
    const C2=CARLOT, y=pavedY((Cr.x0+Cr.x1)/2, 0);
    for(let k=0; C2.stallZ0+(k+1)*C2.stallW<=C2.stallZ1+0.01; k++){ const zc=C2.stallZ0+(k+0.5)*C2.stallW;
      for(const [x,ada] of [[Cr.x0+0.3+1.5, false],[Cr.x1-0.3-1.5, true]]){
        if(ada && C2.ada[k]) continue; if(r()>0.62) continue;
        push("oilspot", cellGeo(0.9+r()*0.6, 1.0+r()*0.8, 2, 2), x+(r()-0.5)*0.4, y+0.0045, zc+(r()-0.5)*0.5, r()*0.5-0.25, "#ffffff", -Math.PI/2, 0); } } }

  /* ---- the storm inlets at the curbs, and the lids down the aisles ---- */
  { const grate=signTex(128,192,(c,W,H)=>{ c.fillStyle="#9a968c"; c.fillRect(0,0,W,H); c.fillStyle="#2a2826"; c.fillRect(14,14,W-28,H-28);
      c.fillStyle="#4a4743"; for(let y=20;y<H-20;y+=12) c.fillRect(18,y,W-36,5); c.fillStyle="#3a3835"; for(let x=20;x<W-20;x+=24) c.fillRect(x,18,4,H-36); });
    const lid=signTex(128,128,(c,W,H)=>{ c.fillStyle="#3a3936"; c.beginPath(); c.arc(64,64,63,0,7); c.fill(); c.strokeStyle="#55524c"; c.lineWidth=3;
      for(const rr of [58,44]){ c.beginPath(); c.arc(64,64,rr,0,7); c.stroke(); }
      c.save(); c.beginPath(); c.arc(64,64,42,0,7); c.clip(); c.strokeStyle="#4a4843"; c.lineWidth=2;
      for(let k=-64;k<128;k+=10){ c.beginPath(); c.moveTo(k,0); c.lineTo(k+64,128); c.stroke(); c.beginPath(); c.moveTo(k+64,0); c.lineTo(k,128); c.stroke(); } c.restore();
      c.fillStyle="#6a675f"; fitText(c,"STORM",W*0.40,H*0.12,64,64,"800"); });
    bucketOf("drainlid", ()=>new T.MeshStandardMaterial(Object.assign({map:grate, roughness:0.55, metalness:0.35}, _po(-6))));
    bucketOf("lotlid",   ()=>new T.MeshStandardMaterial(Object.assign({map:lid, roughness:0.50, metalness:0.40, transparent:true, alphaTest:0.5}, _po(-6))));
    for(const [x,z] of [[Cr.x0+0.45,-70],[Cr.x0+0.45,-12],[Cr.x0+0.45,48],[Tk.x0+0.45,-100],[Tk.x0+0.45,-20],[Tk.x0+0.45,60]]){
      const y=pavedY(x+0.5,z); if(y===null) continue; push("drainlid", planeGeo(0.62, 0.92, 0), x, y+0.006, z, 0, "#ffffff", -Math.PI/2, 0); }
    for(const [x,z] of [[(CARLOT.aisle0+CARLOT.aisle1)/2,-30],[(CARLOT.aisle0+CARLOT.aisle1)/2,40],[(TRUCKLOT.aisle0+TRUCKLOT.aisle1)/2,-80],[(TRUCKLOT.aisle0+TRUCKLOT.aisle1)/2,30]]){
      const y=pavedY(x,z); if(y===null) continue; push("lotlid", new T.CircleGeometry(0.34, 32), x, y+0.006, z, r()*6, "#ffffff", -Math.PI/2, 0); } }

  /* ---- the state's marker by the walk: blue, gold letters, the keystone over them ---- */
  { const x=-19.0, z=-21.5, y=Terrain.groundAt(x,z), ry=-1.1, s=Math.sin(ry), c=Math.cos(ry);
    const tex=signTex(440,420,(g,W,H)=>{ g.fillStyle="#1d3a86"; g.fillRect(0,0,W,H);
      g.strokeStyle="#d8b440"; g.lineWidth=8; g.strokeRect(10,10,W-20,H-20);
      // the keystone, at the top
      g.fillStyle="#d8b440"; g.beginPath(); g.moveTo(W/2-34,24); g.lineTo(W/2+34,24); g.lineTo(W/2+24,78); g.lineTo(W/2-24,78); g.closePath(); g.fill();
      g.fillStyle="#1d3a86"; fitText(g,"PA",44,30,W/2,51,"900");
      const lines=["Named by George Washington, who","followed it north in December 1753","to the French fort at Le Boeuf,","carrying Virginia's demand that","France leave the Ohio country.","The French called it Rivière aux Boeufs."];
      g.fillStyle="#d8b440"; fitText(g,"FRENCH CREEK",W*0.80,H*0.12,W/2,H*0.29,"900","Georgia, serif");
      // the lines, all at the one size the longest of them needs
      let px=40; for(const t of lines){ g.font="600 "+px+"px Georgia, serif"; while(g.measureText(t).width>W*0.80 && px>8){ px--; g.font="600 "+px+"px Georgia, serif"; } }
      g.textAlign="center"; g.textBaseline="middle"; g.font="600 "+Math.min(px, H*0.055)+"px Georgia, serif";
      lines.forEach((t,i)=>g.fillText(t, W/2, H*(0.43+i*0.075)));
      fitText(g,"Pennsylvania Historical and Museum Commission",W*0.76,H*0.04,W/2,H*0.91,"500","Georgia, serif"); });
    C(0.055, 2.0, x, y+1.0, z, "#2a3a6a", 14);
    B(1.04, 0.98, 0.05, x, y+2.32, z, "#1d3a86", ry); B(1.10, 0.06, 0.08, x, y+2.84, z, "#d8b440", ry);
    for(const sd of [1,-1]) signPanel(1.0, 0.95, tex, x+s*sd*0.031, y+2.32, z+c*sd*0.031, sd>0?ry:ry+Math.PI, false);
    addCol(x-0.10, x+0.10, z-0.10, z+0.10, y-0.5, y+2.9);
    addUse(x+s*1.2, z+c*1.2, y, "READ THE MARKER", ()=>toast("FRENCH CREEK · WASHINGTON CAME UP IT IN 1753","#d8b440"), 1.8); }

  /* ---- behind the men's wing: the condensers on their pad, the lines into the wall, the meter ---- */
  { const wx=7.0, gy=0;
    bx("concrete", 1.40, 0.12, 3.0, wx+1.55, gy+0.055, -8.1, 0.5, 0, "#b8b4aa");
    for(const z of [-8.85,-7.35]){ const x=wx+1.55, y0=gy+0.115;
      B(0.82, 0.78, 0.82, x, y0+0.39, z, "#cfccc2"); C(0.33, 0.02, x, y0+0.79, z, "#2a2a2a", 32); C(0.05, 0.03, x, y0+0.81, z, "#5a5a58", 14);
      for(let k=0;k<5;k++) tubeE(V3(x-0.33+k*0.165, y0+0.801, z-0.33), V3(x-0.33+k*0.165, y0+0.801, z+0.33), 0.006, "#5a5a58", 6);
      for(const sd of [-1,1]) for(let k=0;k<10;k++) B(0.006, 0.60, 0.012, x+sd*0.413, y0+0.38, z-0.32+k*0.07, "#9a978e");
      tubeE(V3(x-0.41, y0+0.25, z+0.20), V3(wx+0.08, y0+0.25, z+0.20), 0.022, "#1a1a1a"); tubeE(V3(wx+0.08, y0+0.25, z+0.20), V3(wx+0.08, y0+1.2, z+0.20), 0.022, "#1a1a1a");
      tubeE(V3(x-0.41, y0+0.18, z+0.30), V3(wx+0.06, y0+0.18, z+0.30), 0.010, "#b87333");
      addCol(x-0.45, x+0.45, z-0.45, z+0.45, gy-0.5, gy+1.0); }
    B(0.26, 0.36, 0.12, wx+0.08, 1.35, -9.9, "#8a8d8a"); B(0.18, 0.26, 0.10, wx+0.07, 1.45, -6.3, "#8a8d8a");
    C(0.09, 0.10, wx+0.14, 1.52, -6.3, "#d8dcd8", 20, 0, 0, Math.PI/2);
    tubeE(V3(wx+0.04, 0.0, -6.3), V3(wx+0.04, 1.33, -6.3), 0.02, "#7a7d7a"); }

  /* ---- leaves down under the hardwoods, on the lawns and the walks; in October, a lot of them ---- */
  { const tex=signTex(256,256,(c,W,H)=>{ c.clearRect(0,0,W,H);
      const vein=(x,y,a,L)=>{ c.strokeStyle="rgba(90,70,50,0.6)"; c.lineWidth=1.5; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.sin(a)*L, y-Math.cos(a)*L); c.stroke(); };
      // maple, five-pointed; oak, lobed; beech, a plain oval; a curled brown one
      { const ox=64, oy=70; c.fillStyle="#f2ece0"; c.beginPath();
        for(let k=0;k<=20;k++){ const a=-Math.PI*0.95+k*Math.PI*1.9/20, rr=(k%4===0)?54:(k%2?40:30); c.lineTo(ox+Math.sin(a)*rr, oy-Math.cos(a)*rr*0.95); }
        c.lineTo(ox, oy+18); c.closePath(); c.fill(); for(const a of [0,-1.1,1.1,-2.1,2.1]) vein(ox,oy+8,a,46); }
      { const ox=192, oy=64; c.fillStyle="#f2ece0"; c.beginPath();
        for(let k=0;k<=24;k++){ const t=k/24, yy=oy-52+t*104, wv=(18+10*Math.sin(t*Math.PI*5))*Math.sin(t*Math.PI); c.lineTo(ox+wv, yy); }
        for(let k=24;k>=0;k--){ const t=k/24, yy=oy-52+t*104, wv=(18+10*Math.sin(t*Math.PI*5+0.5))*Math.sin(t*Math.PI); c.lineTo(ox-wv, yy); }
        c.closePath(); c.fill(); vein(ox,oy+50,0,100); }
      { const ox=64, oy=192; c.fillStyle="#f2ece0"; c.beginPath(); c.ellipse(ox,oy,24,50,0,0,7); c.fill(); vein(ox,oy+48,0,96);
        for(let k=-3;k<=3;k++) if(k){ c.beginPath(); c.moveTo(ox,oy+k*12); c.lineTo(ox+20,oy+k*12-10); c.moveTo(ox,oy+k*12); c.lineTo(ox-20,oy+k*12-10); c.stroke(); } }
      { const ox=192, oy=192; c.fillStyle="#d8ccb4"; c.beginPath(); c.ellipse(ox,oy,36,30,0.6,0,7); c.fill(); c.fillStyle="rgba(80,60,40,0.5)"; c.beginPath(); c.ellipse(ox+8,oy-4,18,10,0.6,0,7); c.fill(); } });
    tex.wrapS=tex.wrapT=T.ClampToEdgeWrapping;
    const mat=new T.MeshStandardMaterial(Object.assign({map:tex, alphaTest:0.45, roughness:0.85, side:T.FrontSide}, _po(-6)));
    const cols=["#c8641a","#b03018","#d8a020","#9a5a22","#c87a28","#8a3018","#d0b040"].map(h=>new T.Color(h));
    const dry=["#7a5a3a","#6a4a2a","#8a6a44","#5a4630"].map(h=>new T.Color(h));
    const LV=[[],[],[],[]], hard={hard:1, beech:1, edge:1, lawn:1};
    const open=(x,z)=>Terrain.siteDist(x,z)<=0.3 || (x>EDIN.farm.x0 && x<EDIN.farm.x1 && z>EDIN.farm.z0 && z<EDIN.farm.z1);
    // (the colliders and the floors on a two-metre grid, so each leaf tests only its own few)
    const G=new Map(), key=(i,j)=>i*100003+j, idx=(list, keep)=>{ for(const c of list){ if(!keep(c)) continue;
      for(let i=Math.floor(c.x0/2); i<=Math.floor(c.x1/2); i++) for(let j=Math.floor(c.z0/2); j<=Math.floor(c.z1/2); j++){ const k=key(i,j); let L=G.get(k); if(!L) G.set(k, L=[]); L.push(c); } } };
    idx(COL, c=>c.x1-c.x0<80 && c.z1-c.z0<80); idx(SURF, s2=>s2.flat && s2.x1-s2.x0<80 && s2.z1-s2.z0<80);
    const INDOOR=ZONES.filter(q=>q.indoor);
    const place=(x,z,gy)=>{ let y=gy; const L=G.get(key(Math.floor(x/2), Math.floor(z/2)))||[];
      for(const c of L) if(c.flat && x>c.x0 && x<c.x1 && z>c.z0 && z<c.z1 && c.y>y && c.y<=gy+0.4) y=c.y;
      const pv=pavedY(x,z); if(pv!==null && pv>y && pv<=gy+0.4) y=pv;
      if(y-gy>0.3) return null;
      for(const c of L) if(!c.flat && x>c.x0-0.05 && x<c.x1+0.05 && z>c.z0-0.05 && z<c.z1+0.05 && c.y1>y+0.02 && c.y0<y+0.3) return null;
      for(const q of INDOOR) if(x>q.x0 && x<q.x1 && z>q.z0 && z<q.z1 && y>=q.y0 && y<q.y1) return null;
      return y; };
    // the lawn trees first and thickly (they stand over the grove, the plaza, the farm's yard), then a sprinkle
    // off the woods' edge trees onto the lawn; and under each lawn tree, drifts of them as litter
    const PT=[[],[],[],[]];
    let total=0;
    const trees=FOREST.inst.filter(t=>hard[t.v.sp]).sort((a,b)=>(b.v.sp==="lawn")-(a.v.sp==="lawn"));
    for(const t of trees){ const lawn=t.v.sp==="lawn";
      if(!lawn && total>30000) break;
      if(!lawn && !open(t.x+4,t.z) && !open(t.x-4,t.z) && !open(t.x,t.z+4) && !open(t.x,t.z-4)) continue;
      const R=(lawn?5.6:4.2)*t.s, n=Math.round((lawn?520:30)*t.s);
      for(let k=0;k<n;k++){ const a=r()*6.283, d=Math.pow(r(), lawn?0.7:0.5)*R, x=t.x+Math.cos(a)*d, z=t.z+Math.sin(a)*d;
        if(!open(x,z)) continue;
        const y=place(x, z, Terrain.groundAt(x,z)); if(y===null) continue;
        LV[(r()*4)|0].push([x, y+0.010+r()*0.008, z, r()*6.283, (r()-0.5)*0.3, (r()-0.5)*0.3, 0.75+r()*0.6, cols[(r()*cols.length)|0], 0.75+r()*0.35]); total++; }
      if(lawn) for(let k=0;k<Math.round(42*t.s);k++){ const a=r()*6.283, d=Math.pow(r(),0.7)*R*0.95, x=t.x+Math.cos(a)*d, z=t.z+Math.sin(a)*d;
        if(!open(x,z)) continue; const y=place(x, z, Terrain.groundAt(x,z)); if(y===null) continue;
        PT[(r()*4)|0].push([x, y+0.008+(k%4)*0.0015, z, r()*6.283, 1.2+r()*1.4]); } }
    // the litter: a sheet of four drifts of small leaves, each fading out to its edge
    { const lt=signTex(512,512,(c,W,H)=>{ c.clearRect(0,0,W,H); const q2=_trng(626), gs=()=>Math.sqrt(-2*Math.log(q2()||1e-6))*Math.cos(6.2832*q2()), pal=["#c8641a","#b03018","#d8a020","#9a5a22","#c87a28","#8a3018","#d0b040","#7a5a3a"];
        for(let cell=0;cell<4;cell++){ const ox=(cell%2)*256+128, oy=((cell/2)|0)*256+128;
          // a few clumps, not a disc: each a scatter round its own centre, kept inside the cell
          const cl=[]; for(let j=0;j<3+((q2()*3)|0);j++){ const a=q2()*6.283, d=q2()*62; cl.push([ox+Math.cos(a)*d, oy+Math.sin(a)*d, 18+q2()*26]); }
          for(let k=0;k<170;k++){ const C3=cl[(q2()*cl.length)|0], g1=gs(), g2=gs();
            let x=C3[0]+g1*C3[2], y=C3[1]+g2*C3[2]; const dd=Math.hypot(x-ox,y-oy); if(dd>104){ x=ox+(x-ox)*104/dd; y=oy+(y-oy)*104/dd; }
            const sz=5+q2()*8, rot=q2()*6.283;
            c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=pal[(q2()*pal.length)|0];
            if(q2()<0.5){ c.beginPath(); for(let j=0;j<=10;j++){ const t2=-Math.PI+j*Math.PI*2/10, rr=j%2?sz*0.55:sz; c.lineTo(Math.cos(t2)*rr, Math.sin(t2)*rr); } c.closePath(); c.fill(); }
            else { c.beginPath(); c.ellipse(0,0,sz*0.45,sz,0,0,7); c.fill(); }
            c.strokeStyle="rgba(60,40,20,0.35)"; c.lineWidth=1; c.beginPath(); c.moveTo(0,-sz*0.8); c.lineTo(0,sz*0.8); c.stroke(); c.restore(); } } });
      const lmat=new T.MeshStandardMaterial(Object.assign({map:lt, alphaTest:0.5, roughness:0.9}, _po(-6)));
      const m4=new T.Matrix4(), q=new T.Quaternion(), e=new T.Euler();
      PT.forEach((L, cell)=>{ if(!L.length) return;
        const g=new T.PlaneGeometry(1, 1), U=g.attributes.uv;
        for(let k=0;k<U.count;k++) U.setXY(k, ((cell%2)+U.getX(k))*0.5, ((1-((cell/2)|0))+U.getY(k))*0.5);
        g.rotateX(-Math.PI/2);
        const im=new T.InstancedMesh(g, lmat, L.length);
        L.forEach((t,i)=>{ e.set(0, t[3], 0); q.setFromEuler(e); m4.compose(V3(t[0],t[1],t[2]), q, V3(t[4],1,t[4])); im.setMatrixAt(i, m4); });
        im.frustumCulled=false; im.receiveShadow=true; im.name="litter"; im.count=0; scene.add(im);
        WEAR.leaves.push({m:im, n:L.length, litter:true}); }); }
    const m4=new T.Matrix4(), q=new T.Quaternion(), e=new T.Euler(), col=new T.Color();
    LV.forEach((L, cell)=>{ if(!L.length) return;
      for(let i=L.length-1;i>0;i--){ const j=(r()*(i+1))|0, t=L[i]; L[i]=L[j]; L[j]=t; }            // (shuffled, so any first n are a fair few)
      const g=new T.PlaneGeometry(0.11, 0.11), U=g.attributes.uv;
      for(let k=0;k<U.count;k++) U.setXY(k, ((cell%2)+U.getX(k))*0.5, ((1-((cell/2)|0))+U.getY(k))*0.5);       // (the sheet's top row is its upper half)
      g.rotateX(-Math.PI/2);
      const im=new T.InstancedMesh(g, mat, L.length);
      L.forEach((t,i)=>{ e.set(t[4], t[3], t[5], "YXZ"); q.setFromEuler(e); m4.compose(V3(t[0],t[1],t[2]), q, V3(t[6],1,t[6]*(0.8+((i*37)%10)*0.04))); im.setMatrixAt(i, m4);
        col.copy(i<L.length*0.12 ? dry[i%dry.length] : t[7]).multiplyScalar(t[8]); im.setColorAt(i, col); });     // (the ones down all year are last year's, dry)
      im.frustumCulled=false; im.receiveShadow=true; im.name="leaves"; scene.add(im);
      WEAR.leaves.push({m:im, n:L.length}); });
    WEAR.count=total; }

  /* ---- along US 6N at Edinboro: the poles and the wires, a tap across the road and up the Weirs' lane ---- */
  { const E=EDIN, Z=E.z, Y=E.y, WOOD="#6b5a46", WIRE="#2a2a2a";
    const pole=(x,z,h,arm)=>{ const gy=Terrain.groundAt(x,z);
      ent(new T.CylinderGeometry(0.12, 0.16, h, 14), x, gy+h/2, z, WOOD);
      if(arm){ B(0.12, 0.10, 2.4, x, gy+h-0.35, z, WOOD); for(const dz of [-1.05,0,1.05]) C(0.035, 0.12, x, gy+h-0.24, z+dz, "#7a8a6a", 12); }
      addCol(x-0.17, x+0.17, z-0.17, z+0.17, gy-0.5, gy+h); return gy+h; };
    // a wire hangs in a curve: cut into pieces that sag to the middle
    const wire=(a,b,sag,rad)=>{ const n=10; let p=a.clone();
      for(let k=1;k<=n;k++){ const t=k/n, q=new T.Vector3().lerpVectors(a,b,t); q.y-=sag*4*t*(1-t); tubeE(p, q, rad||0.010, WIRE, 5); p=q; } };
    const zN=Z-8.2, tops=[];
    // (on east along the road to the street's end, each moved clear of a lot's mouth or a drive, EAST.noPole)
    for(let x0=40; x0<=EAST.x1-24; x0+=45){ let x=x0;
      for(const [a,b] of EAST.noPole) if(x>a && x<b) x=(x-a<b-x) ? a : b;
      if(tops.length && x-tops[tops.length-1][0]<8) continue;                        // (two moved to the same gap's edge: one pole)
      const top=pole(x, zN, 10.5, true); tops.push([x, top]); }
    // along the street, a light out over the road from each pole
    for(const [x,t] of tops){ if(x<EAST.town.x0 || x>EAST.town.x1) continue;
      tubeE(V3(x, t-2.7, zN+0.1), V3(x, t-2.2, zN+2.8), 0.04, "#8a8d90"); B(0.30, 0.14, 0.62, x, t-2.24, zN+3.05, "#7a7d80");
      push("lk_porch", boxGeo(0.22, 0.012, 0.46, 0), x, t-2.317, zN+3.05, 0, "#ffffff");
      LAMPS.push({x:x, y:t-2.6, z:zN+3.05, color:0xffe0b0, intensity:0.9, dist:22, decay:1.3, mothy:true}); }
    for(let i=1;i<tops.length;i++){ const [x0,t0]=tops[i-1], [x1,t1]=tops[i];
      for(const dz of [-1.05,0,1.05]) wire(V3(x0, t0-0.18, zN+dz), V3(x1, t1-0.18, zN+dz), 0.75);
      wire(V3(x0, t0-1.6, zN), V3(x1, t1-1.6, zN), 0.9, 0.012); }
    for(const [x,t] of tops) B(0.06, 0.06, 0.10, x, t-1.6, zN, "#3a3a3a");
    // the tap: across the road to a pole by the lane, up the lane, a can on it, and drops to the house and the barn
    const t130=tops.find(p=>p[0]===130)[1], S1={x:153.0, z:Z+6.6}, S2={x:153.0, z:Z+30.0};
    const h1=pole(S1.x, S1.z, 9.5, false), h2=pole(S2.x, S2.z, 9.5, false);
    B(0.10, 0.10, 1.0, S1.x, h1-0.4, S1.z, WOOD); B(0.10, 0.10, 1.0, S2.x, h2-0.4, S2.z, WOOD);
    wire(V3(130, t130-0.18, zN+1.05), V3(S1.x, h1-0.30, S1.z), 0.6); wire(V3(130, t130-1.6, zN), V3(S1.x, h1-1.4, S1.z), 0.7);
    wire(V3(S1.x, h1-0.30, S1.z), V3(S2.x, h2-0.30, S2.z), 0.5); wire(V3(S1.x, h1-1.4, S1.z), V3(S2.x, h2-1.4, S2.z), 0.6);
    C(0.26, 0.75, S2.x+0.32, h2-2.2, S2.z, "#8a8d8a", 20); C(0.27, 0.05, S2.x+0.32, h2-1.80, S2.z, "#7a7d7a", 20);
    tubeE(V3(S2.x+0.32, h2-1.78, S2.z), V3(S2.x, h2-0.30, S2.z), 0.008, WIRE, 5);
    const FF=E.y+0.65, house=V3(132.06, FF+4.55, Z+35.0), barn=V3(167.96, Y+4.9, Z+48.6);
    tubeE(V3(132.03, FF+4.0, Z+35.0), V3(132.03, FF+4.75, Z+35.0), 0.025, "#7a7d7a"); ent(new T.SphereGeometry(0.04, 12, 8), 132.03, FF+4.78, Z+35.0, "#5a5d5a");
    wire(V3(S2.x+0.32, h2-2.5, S2.z), house, 0.8, 0.012); wire(V3(S2.x+0.32, h2-2.5, S2.z), barn, 0.7, 0.012);
    addZone(36, 590, zN-1, zN+1, Y-1, Y+12, "US 6N"); }

  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.75, metalness:0.08}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
  WEAR.ms=performance.now()-t0;
})();
// the leaves: all of them in October, a sprinkle of last year's the rest of the year
function updateWear(){
  const a=FOREST.isAutumn();
  if(a===WEAR.autumn) return; WEAR.autumn=a;
  for(const L of WEAR.leaves) L.m.count = a ? L.n : L.litter ? 0 : Math.round(L.n*0.12);
}
