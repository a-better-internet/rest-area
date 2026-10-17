"use strict";
/* REST AREA · 10b-trailer.js
   the dry van in the truck lot whose back doors open, and what is in it
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   10b · THE WALK-IN TRAILER
   One of the Northern Tier vans in the truck lot is partway through a
   run of drops: the seal is cut, and E at the back swings its doors round
   flat against the sides, one leaf then the other, and folds the step
   down off the sill. Inside it is what a 53-foot dry van is: an oak plank
   floor scuffed by pallet jacks, white composite walls with two rows of
   E-track and a galvanized scuff band, a translucent roof that lets the
   day through between the bows, and the load. The back few metres are
   clear (that stop is done), with the pallet jack parked against the wall
   and a pallet leaning on it; then two wrapped pallets and the floor-loaded
   cartons along both walls with an aisle up the middle; and from the
   load bar forward, cartons wall to wall and nearly to the roof. 10-cars
   picks the rig and leaves its trailer hollow; everything here hangs off
   that rig's group, in its own frame, and the walls stand at its angle
   (06's turned boxes).
   ---------------------------------------------------------------------- */
const TRAILER_RT={open:0, target:0, told:false, leaves:[], ladder:null, steps:[], door:null, use:null,
                  lamp:null, mats:null, g:null, d:null};
(function walkInTrailer(){
  const W=WALKIN; if(!W.g) return;
  const S=W.S, z0=S.tail, z1=3.60, y0=1.30, y1=4.06, hw=1.295;
  const XI=1.235, YF=1.36, YC=3.96, ZF=3.52, ZR=z0+0.12;     // inside: the liner, floor, ceiling, front wall, frame
  const Y=PAVE_T, xf=XF(W.x, W.z, W.yaw);
  const RT=TRAILER_RT;
  // its own dice, so building it does not move anything after it
  let _s=74471; const R=()=>{ _s=(_s*1664525+1013904223)&0x7fffffff; return _s/0x7fffffff; };
  const G=new T.Group(); W.g.add(G); RT.g=G;                  // the inside: hidden from far off
  const D=new T.Group(); W.g.add(D); RT.d=D;                  // the doors and the step: always there
  const ent=(A, geo, x,y,z, c, rx,ry,rz)=>A.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0, ry||0, rz||0, "YXZ")), V3(1,1,1)), color:(c instanceof T.Color)?c:new T.Color(c)});
  const rep=t=>{ t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=8; return setSRGB(t); };

  /* ---- the surfaces ------------------------------------------------------ */
  // laminated oak, in strips that run the length of the trailer: 256 px is 0.62 m across, 1024 is 2.4 m along
  const floorTex=(function(){
    const c=cvs(256,1024), x=c.getContext("2d");
    x.fillStyle="#6a5038"; x.fillRect(0,0,256,1024);
    let px=0, k=0;
    while(px<256){
      const w=11+((R()*3)|0)*2, tone=R();
      let py=-((R()*700)|0);
      while(py<1024){                                   // each strip is short lengths finger-jointed end to end
        const len=180+R()*420, t2=tone+(R()-0.5)*0.18;
        x.fillStyle=`rgb(${(86+t2*44)|0},${(66+t2*30)|0},${(47+t2*20)|0})`; x.fillRect(px,py,w,len);
        for(let g=0;g<6;g++){ x.fillStyle="rgba(50,30,14,"+(0.08+R()*0.1)+")"; x.fillRect(px+R()*w, py+R()*len, 1, 30+R()*120); }
        x.strokeStyle="rgba(40,24,10,0.55)"; x.lineWidth=1; x.beginPath();
        for(let j=0;j<=w;j+=3) x.lineTo(px+j, py+len+(j%6?3:-3)); x.stroke();
        py+=len;
      }
      x.fillStyle=(++k%7===0)?"rgba(26,16,8,0.85)":"rgba(40,26,12,0.45)"; x.fillRect(px+w-1,0,(k%7===0)?2:1,1024);
      px+=w;
    }
    // the screws into the crossmembers, a row every 30 cm
    for(let r=0;r<1024;r+=128) for(let i=6;i<256;i+=22){ x.fillStyle="rgba(30,30,30,0.7)"; x.fillRect(i,r+60,3,3); x.fillStyle="rgba(200,200,190,0.25)"; x.fillRect(i,r+60,1,1); }
    // a working floor: grey wear, black scuffs from the jack's wheels, a stain or two
    for(let i=0;i<40;i++){ x.fillStyle="rgba(40,36,30,"+(0.04+R()*0.08)+")"; x.beginPath(); x.ellipse(R()*256,R()*1024,6+R()*30,10+R()*60,R()*3,0,7); x.fill(); }
    for(let i=0;i<26;i++){ x.strokeStyle="rgba(12,12,12,"+(0.15+R()*0.3)+")"; x.lineWidth=1+R()*3; x.beginPath();
      const sx=R()*256, sy=R()*1024; x.moveTo(sx,sy); x.quadraticCurveTo(sx+(R()-0.5)*40, sy+60, sx+(R()-0.5)*30, sy+80+R()*160); x.stroke(); }
    const t=rep(new T.CanvasTexture(c)); return t;
  })();
  // the wall: white composite, a seam every 1.22 m, the scuff band, E-track at 1.1 and 2.0 m: 256 px across, 512 up 2.6 m
  const wallTex=(function(){
    const c=cvs(256,512), x=c.getContext("2d"), vy=m=>512-m*197;
    x.fillStyle="#dcdcd5"; x.fillRect(0,0,256,512);
    for(let i=0;i<500;i++){ x.fillStyle="rgba(120,120,110,"+(0.02+R()*0.03)+")"; x.fillRect(R()*256,R()*512,1+R()*2,1+R()*2); }
    for(let i=0;i<14;i++){ const yy=vy(0.3+R()*1.3); x.fillStyle="rgba(70,64,56,"+(0.06+R()*0.1)+")"; x.fillRect(R()*256, yy, 20+R()*90, 1+R()*2); }   // rub marks at load height
    x.fillStyle="#c9cac6"; x.fillRect(0,0,3,512); x.fillStyle="rgba(255,255,255,0.7)"; x.fillRect(3,0,1,512);
    for(let r=6;r<512;r+=13){ x.fillStyle="#9a9c98"; x.fillRect(6,r,3,3); }
    // the scuff band, galvanized, riveted along its top
    const sb=vy(0.30); let g=x.createLinearGradient(0,sb,0,512); g.addColorStop(0,"#b6babb"); g.addColorStop(1,"#8f9496");
    x.fillStyle=g; x.fillRect(0,sb,256,512-sb);
    for(let i=0;i<60;i++){ x.fillStyle="rgba(40,40,40,"+(0.1+R()*0.2)+")"; x.fillRect(R()*256, sb+4+R()*(512-sb-6), 6+R()*40, 1); }
    for(let i=4;i<256;i+=16){ x.fillStyle="#5d6264"; x.fillRect(i,sb+3,3,3); }
    x.fillStyle="rgba(0,0,0,0.25)"; x.fillRect(0,sb,256,2);
    // two rows of E-track: a galvanized strip, slots on a 2-inch pitch
    for(const m of [1.10, 2.00]){
      const ty=vy(m)-12; g=x.createLinearGradient(0,ty,0,ty+25); g.addColorStop(0,"#c6cacb"); g.addColorStop(0.5,"#a3a8aa"); g.addColorStop(1,"#7e8486");
      x.fillStyle=g; x.fillRect(0,ty,256,25);
      for(let i=2;i<256;i+=10.7){ x.fillStyle="#2a2d2e"; x.fillRect(i,ty+6,4,13); x.fillStyle="rgba(255,255,255,0.35)"; x.fillRect(i,ty+19,4,1); }
      x.fillStyle="rgba(0,0,0,0.3)"; x.fillRect(0,ty+25,256,2);
    }
    return rep(new T.CanvasTexture(c));
  })();
  // the roof sheet: fibreglass, the light coming through it mottled
  const roofTex=(function(){
    const c=cvs(256,256), x=c.getContext("2d");
    x.fillStyle="#eef0ea"; x.fillRect(0,0,256,256);
    for(let i=0;i<260;i++){ x.fillStyle="rgba("+(R()<0.5?"200,196,170":"255,255,250")+","+(0.08+R()*0.12)+")";
      x.beginPath(); x.ellipse(R()*256,R()*256,2+R()*14,1+R()*6,R()*3,0,7); x.fill(); }
    for(let i=0;i<30;i++){ x.strokeStyle="rgba(160,150,120,0.12)"; x.beginPath(); x.moveTo(R()*256,R()*256); x.lineTo(R()*256,R()*256); x.stroke(); }
    return rep(new T.CanvasTexture(c));
  })();
  /* the cartons: one sheet, eight faces. 0 a top with its tape; 1 a freight
     label; 2 this way up; 3 fragile; 4 paper towels; 5 keep dry; 6 a white
     case of canned beans; 7 a stencilled lot number */
  const cartonTex=(function(){
    const c=cvs(1024,512), x=c.getContext("2d");
    const kraft=(base)=>{ x.fillStyle=base||"#b98a58"; x.fillRect(0,0,256,256);
      for(let i=0;i<700;i++){ x.fillStyle="rgba("+(R()<0.5?"90,58,26":"225,190,140")+","+(0.03+R()*0.05)+")"; x.fillRect(R()*256,R()*256,1+R()*4,1); }
      x.fillStyle="rgba(70,46,20,0.25)"; x.fillRect(0,5,256,2); x.fillRect(0,249,256,2);
      let g=x.createLinearGradient(0,200,0,256); g.addColorStop(0,"rgba(60,40,20,0)"); g.addColorStop(1,"rgba(60,40,20,0.14)"); x.fillStyle=g; x.fillRect(0,200,256,56); };
    const txt=(s, px, py, font, col)=>{ x.fillStyle=col||"#1d1b19"; x.font=font; x.textAlign="center"; x.textBaseline="middle"; x.fillText(s,px,py); };
    const arrow=(ax,ay,s)=>{ x.beginPath(); x.moveTo(ax,ay-s); x.lineTo(ax+s*0.6,ay-s*0.3); x.lineTo(ax+s*0.22,ay-s*0.3); x.lineTo(ax+s*0.22,ay+s*0.5);
      x.lineTo(ax-s*0.22,ay+s*0.5); x.lineTo(ax-s*0.22,ay-s*0.3); x.lineTo(ax-s*0.6,ay-s*0.3); x.closePath(); x.fill(); };
    const cell=(i, draw)=>{ x.save(); x.translate((i%4)*256, ((i/4)|0)*256); x.beginPath(); x.rect(0,0,256,256); x.clip(); draw(); x.restore(); };
    cell(0, ()=>{ kraft("#bd8f5d"); x.fillStyle="rgba(60,40,18,0.5)"; x.fillRect(0,127,256,2);
      x.fillStyle="rgba(214,178,118,0.92)"; x.fillRect(0,104,256,48); x.fillStyle="rgba(255,240,210,0.35)"; x.fillRect(0,110,256,4);
      x.fillStyle="rgba(120,90,50,0.3)"; for(let i=0;i<256;i+=37) x.fillRect(i,104,1,48); });
    cell(1, ()=>{ kraft(); x.fillStyle="#f4f2ec"; x.fillRect(118,132,112,80); x.fillStyle="#1b1b1b";
      for(let i=124;i<222;i+=3) if(R()<0.62) x.fillRect(i,170,1+((R()*2)|0),32);
      txt("NORTHERN TIER", 174, 142, "bold 11px Arial"); txt("PRO 7184 2209 3", 174, 157, "10px monospace");
      x.fillStyle="rgba(30,30,30,0.6)"; x.fillRect(28,40,80,3); x.fillRect(28,50,60,3); });
    cell(2, ()=>{ kraft(); x.fillStyle="#1d1b19"; arrow(100,108,46); arrow(156,108,46); x.fillRect(66,146,124,8);
      txt("THIS SIDE UP", 128, 190, "bold 22px Arial"); });
    cell(3, ()=>{ kraft(); txt("FRAGILE", 128, 88, "bold 46px Impact, Arial Black, sans-serif", "#b8261c");
      x.strokeStyle="#b8261c"; x.lineWidth=5; x.beginPath(); x.moveTo(108,128); x.quadraticCurveTo(110,176,128,178); x.quadraticCurveTo(146,176,148,128); x.closePath(); x.stroke();
      x.beginPath(); x.moveTo(128,178); x.lineTo(128,214); x.moveTo(110,214); x.lineTo(146,214); x.moveTo(122,130); x.lineTo(132,150); x.lineTo(124,162); x.stroke();
      txt("HANDLE WITH CARE", 128, 236, "bold 15px Arial", "#b8261c"); });
    cell(4, ()=>{ kraft(); x.fillStyle="#2f6b3a"; x.beginPath(); x.moveTo(52,120); x.lineTo(80,64); x.lineTo(108,120); x.closePath(); x.fill(); x.fillRect(76,118,8,16);
      txt("ALLEGHENY", 160, 82, "bold 30px Oswald, Impact, Arial Black, sans-serif", "#2f6b3a"); txt("PAPER CO.", 166, 112, "bold 18px Arial", "#2f6b3a");
      x.fillStyle="#2f6b3a"; x.fillRect(30,146,196,4);
      txt("PAPER TOWELS", 128, 176, "bold 22px Arial", "#2f6b3a"); txt("12 ROLLS · 2-PLY", 128, 204, "16px Arial", "#2f6b3a"); });
    cell(5, ()=>{ kraft(); x.fillStyle="#1d1b19"; x.beginPath(); x.arc(128,104,44,Math.PI,0); x.closePath(); x.fill();
      x.fillRect(126,104,5,54); x.lineWidth=5; x.strokeStyle="#1d1b19"; x.beginPath(); x.arc(118,158,10,0,Math.PI); x.stroke();
      for(const [dx,dy] of [[-60,40],[-40,70],[50,30],[64,64]]) { x.fillRect(128+dx,40+dy,3,12); }
      txt("KEEP DRY", 128, 200, "bold 24px Arial"); });
    cell(6, ()=>{ x.fillStyle="#e8e5dc"; x.fillRect(0,0,256,256);
      for(let i=0;i<300;i++){ x.fillStyle="rgba(150,140,120,"+(0.03+R()*0.05)+")"; x.fillRect(R()*256,R()*256,1+R()*3,1); }
      x.fillStyle="#a8231e"; x.fillRect(0,22,256,30); txt("LAUREL VALLEY", 128, 38, "bold 22px Oswald, Impact, Arial Black, sans-serif", "#f4efe2");
      x.fillStyle="#3f7a2e"; for(let k=0;k<5;k++){ x.beginPath(); x.ellipse(70+k*28,110,8,30,0.5,0,7); x.fill(); }
      txt("CUT GREEN BEANS", 128, 168, "bold 20px Arial", "#a8231e"); txt("24 / 14.5 OZ CANS", 128, 196, "15px Arial", "#3a3a36");
      x.fillStyle="rgba(70,46,20,0.18)"; x.fillRect(0,5,256,2); x.fillRect(0,249,256,2); });
    cell(7, ()=>{ kraft("#b3845a"); x.globalAlpha=0.82; txt("LOT 4471", 128, 96, "bold 36px 'Courier New', monospace"); txt("38 LB", 128, 140, "bold 30px 'Courier New', monospace");
      txt("MADE IN U.S.A.", 128, 186, "bold 18px 'Courier New', monospace"); x.globalAlpha=1;
      x.fillStyle="rgba(60,38,16,0.3)"; x.beginPath(); x.ellipse(220,230,40,18,0.3,0,7); x.fill(); });
    const t=setSRGB(new T.CanvasTexture(c)); t.anisotropy=8; return t;
  })();

  /* ---- materials: each of the inside's takes the dome light and the day
     through the roof as a little emissive of its own colour (16's pool
     lights cannot cast shadows, so a real lamp in here would light the
     ground under the trailer through its floor) ---- */
  const glowing=(m, k)=>{ m.emissive=new T.Color(0xfff2dc); m.emissiveIntensity=0; if(m.map) m.emissiveMap=m.map; m.userData.k=k; return m; };
  const M={
    floor:glowing(new T.MeshStandardMaterial({map:floorTex, roughness:0.78, metalness:0.0}), 0.55),
    wall: glowing(new T.MeshStandardMaterial({map:wallTex, roughness:0.62, metalness:0.05}), 0.55),
    roof: glowing(new T.MeshStandardMaterial({map:roofTex, roughness:0.9, metalness:0.0}), 1.0),
    box:  glowing(new T.MeshStandardMaterial({map:cartonTex, vertexColors:true, roughness:0.88, metalness:0.0}), 0.5),
    kit:  glowing(new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, metalness:0.2}), 0.0),
    wrap: new T.MeshStandardMaterial({color:0xe6eef0, transparent:true, opacity:0.20, roughness:0.12, metalness:0.0, depthWrite:false, side:T.DoubleSide}),
  };
  M.kit.emissive.setHex(0x4a463e);                      // no map: a dim grey rather than white
  RT.mats=M;
  const mesh=(geo, m, cast)=>{ const o=new T.Mesh(geo, m); o.receiveShadow=true; o.castShadow=!!cast; return o; };
  // a plane, its texture repeating every tu by tv metres
  const plane=(w,h,tu,tv, m, x,y,z, rx,ry)=>{
    const g=new T.PlaneGeometry(w,h), uv=g.attributes.uv;
    for(let i=0;i<uv.count;i++) uv.setXY(i, uv.getX(i)*w/tu, uv.getY(i)*h/tv);
    const o=mesh(g, m); o.position.set(x,y,z); o.rotation.set(rx||0, ry||0, 0, "YXZ"); G.add(o); return o;
  };
  const Lw=ZF-ZR, Zm=(ZR+ZF)/2;
  plane(2*XI, ZF-(z0+0.14), 0.62, 2.4, M.floor, 0, YF, (z0+0.14+ZF)/2, -Math.PI/2, 0);
  plane(Lw, YC-YF, 1.22, YC-YF, M.wall, -XI, (YF+YC)/2, Zm, 0, Math.PI/2);
  plane(Lw, YC-YF, 1.22, YC-YF, M.wall,  XI, (YF+YC)/2, Zm, 0, -Math.PI/2);
  plane(2*XI, YC-YF, 1.22, YC-YF, M.wall, 0, (YF+YC)/2, ZF, 0, Math.PI);
  plane(2*XI, Lw, 1.2, 1.2, M.roof, 0, YC, Zm, Math.PI/2, 0);

  /* ---- the steel: the rear frame, the roof bows, the jack, the pallets --- */
  const K=[];
  ent(K, boxGeo(2*hw-0.006, 0.16, 0.12), 0, y1-0.083, z0+0.06, 0x9ea2a3);          // the header
  for(const sd of [-1,1]){
    ent(K, boxGeo(0.107, y1-0.163-YF, 0.12), sd*(hw-0.0565), (YF+y1-0.163)/2, z0+0.06, 0xa6aaab);   // the rear posts
    ent(K, new T.CylinderGeometry(0.018,0.018,1.0,8), sd*1.14, YF+1.15, z0+0.16, 0xe0b21e);           // grab handles
    for(const hy of [YF+0.65, YF+1.65]) ent(K, boxGeo(0.06,0.04,0.05), sd*1.165, hy, z0+0.15, 0x6e7274);
  }
  ent(K, boxGeo(2*hw-0.006, 0.11, 0.14), 0, YF+0.002-0.055, z0+0.07, 0x8d9294);      // the sill, a diamond-plate top
  for(let i=0;i<22;i++) ent(K, boxGeo(0.05,0.004,0.02), -1.05+i*0.1, YF+0.003, z0+0.04+(i%2)*0.05, 0xb5b9ba, 0, 0.6);
  for(let z=ZR+0.30; z<ZF-0.1; z+=0.61) ent(K, boxGeo(2*XI-0.01, 0.045, 0.05), 0, YC-0.024, z, 0xb4b8b9);   // roof bows
  // two LED domes under the roof, lit when the doors are open (updateTrailer)
  { const L=[]; for(const z of [z0+2.2, -2.0]){ ent(K, boxGeo(0.36,0.025,0.12), 0, YC-0.0605, z, 0x8d9091); ent(L, boxGeo(0.30,0.012,0.08), 0, YC-0.079, z, 0xffffff); }
    RT.led=new T.MeshStandardMaterial({color:0x3a3a36, emissive:0xfff3e0, emissiveIntensity:0, roughness:0.4});
    G.add(new T.Mesh(mergeEntries(L), RT.led)); }

  /* a pallet, 48 by 40: stringers along z, boards across */
  const pallet=(A, cx, cy, cz, ry, grey)=>{
    const c=grey?0x8e8572:0xb39466, c2=grey?0x7c7462:0xa48558, q=new T.Matrix4().makeRotationY(ry||0);
    const P=(w,h,d,x,y,z,col)=>{ const v=V3(x,0,z).applyMatrix4(q); ent(A, boxGeo(w,h,d), cx+v.x, cy+y, cz+v.z, col, 0, ry||0); };
    for(let i=0;i<7;i++) P(1.02, 0.016, 0.13, 0, 0.137, -0.545+i*0.1817, i%3?c:c2);
    for(const sx of [-0.47,0,0.47]) P(0.04, 0.09, 1.22, sx, 0.084, 0, c2);
    for(const sz of [-0.545,0,0.545]) P(1.02, 0.016, 0.13, 0, 0.032, sz, c);
    for(const sx of [-0.47,0,0.47]) P(0.04, 0.02, 1.22, sx, 0.012, 0, c2);
  };

  /* ---- the cartons ------------------------------------------------------- */
  const B=[];
  const LOTS={
    paper:{a:0.60, b:0.42, h:0.48, long:4, short:2},
    cans: {a:0.40, b:0.27, h:0.25, long:6, short:7, white:true},
    glass:{a:0.50, b:0.40, h:0.40, long:3, short:5},
    gen:  {a:0.46, b:0.44, h:0.44, long:1, short:2},
    small:{a:0.36, b:0.30, h:0.28, long:7, short:1},
  };
  // a carton of a lot, its long side along z (alongZ) or x; the faces that way get the lot's print
  const carton=(L, x,y,z, ry, alongZ, sx,sy,sz)=>{
    const w=alongZ?L.b:L.a, d=alongZ?L.a:L.b, g=new T.BoxGeometry(sx||w, sy||L.h, sz||d), uv=g.attributes.uv;
    const sideX=alongZ?L.long:L.short, sideZ=alongZ?L.short:L.long, top=L.white?6:0;
    const cells=[sideX, R()<0.5?sideX:1, top, 0, sideZ, R()<0.4?sideZ:7];
    for(let f=0;f<6;f++){ const cc=cells[f], cu=cc%4, cv=(cc/4)|0, inset=(f===2||f===3)?0.0:0.01;
      for(let i=0;i<4;i++){ const k=f*4+i;
        uv.setXY(k, (cu+inset+uv.getX(k)*(1-2*inset))/4, 1-(cv+1)/2+(inset+uv.getY(k)*(1-2*inset))/2); } }
    const t=L.white?0.94+R()*0.08:0.84+R()*0.2;
    ent(B, g, x, y, z, new T.Color(t, t*(0.98+R()*0.03), t*(0.95+R()*0.06)), 0, ry, 0);
  };
  const jit=()=>(R()-0.5)*0.022, jr=()=>(R()-0.5)*0.05;
  const cols=[];                                         // what you walk round: [cx, cz, hx, hz, top]
  const box=(cx,cz,hx,hz,top)=>cols.push([cx,cz,hx,hz,top]);
  /* a run of cartons against one wall, side -1 or 1, from za to zb, n deep,
     stacked to hMax with a ragged top: the cartons nearest the aisle are the
     ones you see, so they get the print and the jitter */
  const wallRun=(side, za, zb, lot, deep, hMax)=>{
    const L=LOTS[lot], n=Math.max(1, Math.floor((zb-za)/(L.a+0.012))), gap=((zb-za)-n*L.a)/n;
    for(let i=0;i<n;i++){
      const zc=za+gap/2+L.a/2+i*(L.a+gap), full=Math.floor(hMax/(L.h+0.003));
      const layers=Math.max(1, full-(R()<0.3?1:0)-(R()<0.1?1:0));
      for(let d=0; d<deep; d++){ const xc=side*(XI-0.014-L.b/2-d*(L.b+0.008));
        for(let l=0;l<layers;l++) carton(L, xc+jit()*0.6, YF+L.h/2+l*(L.h+0.003), zc+jit(), jr(), true); }
    }
    const dep=deep*(L.b+0.008)+0.014;
    box(side*(XI-dep/2), (za+zb)/2, dep/2, (zb-za)/2, hMax);
    return dep;
  };
  // the front of the load, wall to wall from zA to the front wall: columns of whatever lot, long side across
  const frontLoad=(zA, hMax)=>{
    const order=["gen","small","paper","gen","glass","small"]; let x=-XI+0.012, k=0;
    while(x<XI-0.30){
      let L=LOTS[order[k%order.length]]; if(x+L.a>XI-0.012) L=LOTS.small; if(x+L.a>XI-0.012) break;
      const nz=Math.floor((ZF-0.01-zA)/(L.b+0.006)), full=Math.floor(hMax/(L.h+0.003));
      for(let j=0;j<nz;j++){
        const layers = j===0 ? Math.max(2, full-(R()<0.35?1:0)) : full;
        for(let l=0;l<layers;l++) carton(L, x+L.a/2+jit()*0.4, YF+L.h/2+l*(L.h+0.003), zA+L.b/2+j*(L.b+0.006)+(j===0?jit()*2:0), jr()*0.6, false);
      }
      x+=L.a+0.008; k++;
    }
    box(0, (zA+ZF)/2, XI, (ZF-zA)/2, hMax);
  };
  frontLoad(0.24, 2.30);
  // the floor-loaded middle, an aisle up it
  wallRun(-1, -6.25, -2.60, "paper", 1, 2.42);
  wallRun(-1, -2.60,  0.22, "gen",   1, 2.25);
  wallRun( 1, -6.25, -3.30, "cans",  2, 2.02);
  wallRun( 1, -3.30,  0.22, "small", 2, 2.10);
  wallRun( 1, -9.40, -6.30, "glass", 1, 1.25);
  // two wrapped pallets on the left: towels, then canned beans
  const WRAP=[];
  { const px=-XI+0.02+0.51;
    for(const [pz,lot,nx,nzz,nl] of [[-8.69,"paper",2,2,3],[-7.45,"cans",3,3,6]]){
      pallet(K, px, YF, pz, 0, false);
      const L=LOTS[lot], sx=L.b, sz=L.a, base=YF+0.145;
      for(let l=0;l<nl;l++) for(let i=0;i<nx;i++) for(let j=0;j<nzz;j++)
        carton(L, px-(nx-1)*sx/2+i*sx, base+L.h/2+l*(L.h+0.002), pz-(nzz-1)*sz/2+j*sz, jr()*0.3, true);
      const hh=nl*(L.h+0.002);
      WRAP.push([nx*sx+0.02, hh-0.04, nzz*sz+0.02, px, base+hh/2+0.01, pz]);
      // the corner boards the wrap is pulled over
      for(const [cxs,czs] of [[-1,-1],[1,-1],[-1,1],[1,1]]) ent(K, boxGeo(0.05,hh-0.06,0.05), px+cxs*(nx*sx/2+0.005), base+hh/2, pz+czs*(nzz*sz/2+0.005), 0xa7845a);
    }
    box(px, -8.07, 0.53, 1.25, 1.65);
  }
  // the back, emptied at the last stop: a pallet on its edge against the wall, two cartons left, one knocked over
  pallet(K, 0, 0, 0, 0, true);                          // built at the origin, then stood on its long edge, leaning in
  { const pe=K.splice(K.length-16);
    const m=new T.Matrix4().compose(V3(XI-0.10, YF+0.52, -11.55), new T.Quaternion().setFromEuler(new T.Euler(0, 0, Math.PI/2-0.14, "YXZ")), V3(1,1,1));
    for(const e of pe){ e.matrix.premultiply(m); K.push(e); }
    box(XI-0.12, -11.55, 0.13, 0.63, 1.1); }
  carton(LOTS.gen, XI-0.24, YF+0.22, -9.92, 0.06, true); carton(LOTS.gen, XI-0.25, YF+0.66+0.003, -9.90, -0.04, true);
  carton(LOTS.small, 0.88, YF+0.15, -10.60, 0.32, false, 0.36, 0.28, 0.30);
  box(XI-0.25, -9.91, 0.24, 0.25, 0.9); box(0.88, -10.60, 0.22, 0.22, 0.3);
  { const g=new T.BoxGeometry(0.92,0.008,0.62), uv=g.attributes.uv;            // a carton broken down flat
    for(let k=0;k<uv.count;k++) uv.setXY(k, uv.getX(k)/4, 0.5+uv.getY(k)/2);
    ent(B, g, -0.15, YF+0.006, -10.1, 0xd8c8b0, 0, 0.35, 0); }
  // the bill of lading on the top carton
  ent(K, boxGeo(0.23,0.012,0.32), XI-0.27, YF+0.885+0.006, -9.88, 0x6b4a2c, 0, 0.2);
  ent(K, boxGeo(0.21,0.004,0.28), XI-0.27, YF+0.894+0.006, -9.885, 0xf1efe8, 0, 0.2);
  ent(K, boxGeo(0.08,0.012,0.03), XI-0.27-0.02, YF+0.900+0.006, -10.01, 0xb7babb, 0, 0.2);
  // the seal, cut, on the floor by the sill: a yellow tag and the two halves of the bolt
  ent(K, boxGeo(0.07,0.006,0.035), 0.42, YF+0.004, z0+0.55, 0xe6c21c, 0, 0.7);
  ent(K, new T.CylinderGeometry(0.006,0.006,0.07,6), 0.38, YF+0.008, z0+0.62, 0x8a8e90, 0, 1.2, Math.PI/2);
  ent(K, new T.CylinderGeometry(0.006,0.006,0.05,6), 0.55, YF+0.008, z0+0.40, 0x8a8e90, 0, -0.4, Math.PI/2);
  // a yellow ratchet strap hung off the E-track by its hook, its tail coiled under it
  for(const [sz,len] of [[-11.9,1.35],[-11.2,1.05]]){
    ent(K, boxGeo(0.008,len,0.05), -XI+0.012, YF+2.0-len/2, sz, 0xe2b81c);
    ent(K, boxGeo(0.03,0.06,0.07), -XI+0.02, YF+2.0, sz, 0x5c6062);
    ent(K, new T.TorusGeometry(0.11,0.025,6,16), -XI+0.12, YF+0.04, sz+0.05, 0xd8ae18, Math.PI/2, 0, 0); }
  // the load bar, sprung tight across in front of the wall of cartons
  ent(K, new T.CylinderGeometry(0.026,0.026,2*XI-0.10,10), 0, YF+1.30, 0.19, 0x8f9496, 0, 0, Math.PI/2);
  for(const sd of [-1,1]) ent(K, boxGeo(0.03,0.16,0.10), sd*(XI-0.03), YF+1.30, 0.19, 0x1e1e1f);
  ent(K, boxGeo(0.10,0.05,0.06), 0.28, YF+1.30, 0.19, 0x3a3c3e);

  /* the pallet jack, parked against the left wall, handle to the doors */
  { const jx=-0.92, jz=-11.05, FR=0xc8281d, BK=0x1c1c1d;
    for(const sx of [-0.20,0.20]){
      ent(K, boxGeo(0.16,0.06,1.15), jx+sx, YF+0.075, jz+0.18, FR);
      ent(K, new T.CylinderGeometry(0.04,0.04,0.07,10), jx+sx, YF+0.04, jz+0.70, 0x2a2a2a, 0, 0, Math.PI/2); }
    ent(K, boxGeo(0.56,0.10,0.20), jx, YF+0.13, jz-0.47, FR);
    ent(K, boxGeo(0.18,0.30,0.16), jx, YF+0.30, jz-0.50, FR);
    ent(K, new T.CylinderGeometry(0.035,0.035,0.24,10), jx, YF+0.52, jz-0.50, 0xb9bcbd);
    for(const sx of [-0.09,0.09]) ent(K, new T.CylinderGeometry(0.09,0.09,0.06,14), jx+sx, YF+0.09, jz-0.58, BK, 0, 0, Math.PI/2);
    ent(K, boxGeo(0.05,0.90,0.05), jx, YF+1.06, jz-0.62, FR, -0.18);
    ent(K, boxGeo(0.34,0.05,0.05), jx, YF+1.50, jz-0.70, BK, -0.18);
    ent(K, boxGeo(0.04,0.10,0.05), jx+0.15, YF+1.46, jz-0.69, BK, -0.18); ent(K, boxGeo(0.04,0.10,0.05), jx-0.15, YF+1.46, jz-0.69, BK, -0.18);
    box(jx, jz, 0.32, 0.82, 1.2); }

  G.add(mesh(mergeEntries(K), M.kit, false));
  G.add(mesh(mergeEntries(B), M.box, false));
  for(const w of WRAP){ const o=new T.Mesh(new T.BoxGeometry(w[0],w[1],w[2]), M.wrap); o.position.set(w[3],w[4],w[5]); o.renderOrder=1; G.add(o); }

  /* ---- the doors ---------------------------------------------------------
     Two leaves, hinged at the corners a few cm proud of the sides, so they
     swing 270 degrees and lie flat along them. Their outsides are the
     door half of the livery sheet, with the handles moved down to where a
     hand would be; four lock rods stand off them. */
  const doorTex=(function(){
    const c=cvs(512,256), x=c.getContext("2d"), s=512/400, row=W.row||0;
    x.drawImage(TRAILER_TEX.image, 1632, row*256, 400, 256, 0, 0, 512, 256);
    const dc=["#dcdbd4","#dddcd5","#e2e2dc","#d6d6d0"][row];
    for(const k of [0.14,0.36,0.64,0.86]){ x.fillStyle=dc; x.fillRect((400*k-8)*s,118,16*s,30);
      x.fillStyle="#c6c9ca"; x.fillRect((400*k-3)*s,118,6*s,30); }
    const t=setSRGB(new T.CanvasTexture(c)); t.anisotropy=8; return t;
  })();
  const outM=envOut(new T.MeshStandardMaterial({map:doorTex, roughness:0.55, metalness:0.15}), 0.55);
  const inM=new T.MeshStandardMaterial({color:0xd9d9d3, roughness:0.68, metalness:0.05});
  const edgeM=new T.MeshStandardMaterial({color:0xb4b8b9, roughness:0.45, metalness:0.4});
  const hwM=new T.MeshStandardMaterial({vertexColors:true, roughness:0.4, metalness:0.55});
  const LW=hw-0.012, LH=y1-y0-0.012, LD=0.045, E=0.04, KN=[];
  for(const sd of [1,-1]){
    const piv=new T.Group(); piv.position.set(sd*(hw+E), 0, z0-E); D.add(piv);
    const g=new T.BoxGeometry(LW, LH, LD), uv=g.attributes.uv, off=sd>0?0:0.5;
    for(let f=0;f<6;f++) for(let i=0;i<4;i++){ const k=f*4+i;
      if(f===5) uv.setXY(k, off+uv.getX(k)*0.5, uv.getY(k)); }
    const leaf=new T.Mesh(g, [edgeM,edgeM,edgeM,edgeM,inM,outM]); leaf.castShadow=true; leaf.receiveShadow=true;
    const lcx=sd*(0.004+LW/2)-sd*(hw+E), lcz=(z0-LD/2-0.002)-(z0-E);
    leaf.position.set(lcx, (y0+y1)/2, lcz); piv.add(leaf);
    // the rods, their guides and cams, the handles, the hinge straps
    const H=[], fz=lcz-LD/2;
    for(const rx of [-0.284, 0.284]){
      ent(H, new T.CylinderGeometry(0.017,0.017,LH-0.10,8), lcx+rx, (y0+y1)/2, fz-0.03, 0xc6c9ca);
      for(const hy of [y0+0.12, y0+0.80, y1-0.80, y1-0.12]) ent(H, boxGeo(0.06,0.035,0.035), lcx+rx, hy, fz-0.017, 0x7c7f80);
      for(const hy of [y0+0.03, y1-0.03]) ent(H, boxGeo(0.05,0.07,0.05), lcx+rx, hy, fz-0.03, 0x5f6263);
      const hdir=(rx>0?-1:1);
      ent(H, boxGeo(0.30,0.04,0.025), lcx+rx+hdir*0.15, y0+0.50, fz-0.05, 0x8d9091);
      ent(H, boxGeo(0.05,0.07,0.03), lcx+rx+hdir*0.30, y0+0.50, fz-0.03, 0x5f6263);
    }
    for(const hy of [y0+0.25, y0+1.0, y1-1.0, y1-0.25]){
      ent(H, boxGeo(0.30,0.07,0.012), sd*(hw-0.10)-sd*(hw+E), hy, fz-0.006, 0x55585a);
      ent(H, new T.CylinderGeometry(0.024,0.024,0.11,10), 0, hy, 0, 0x55585a);
      ent(KN, boxGeo(0.05,0.11,0.06), sd*(hw+0.02), hy, z0+0.02, 0x55585a);      // the knuckles' other halves, on the frame
    }
    const hm=new T.Mesh(mergeEntries(H), hwM); hm.castShadow=true; piv.add(hm);
    RT.leaves.push({piv:piv, sd:sd});
  }
  D.add(mesh(mergeEntries(KN), hwM, true));

  /* ---- the step: an aluminium ladder hinged under the sill. Stowed it
     lies flat under the floor, above the bumper; down, it hangs back at
     twenty degrees with its two treads level at 0.45 and 0.90 m. ---- */
  { const lad=new T.Group(); lad.position.set(0, 1.27, z0-0.02); D.add(lad);
    const A=0.353, Lr=1.30, H=[];
    for(const sx of [-0.26,0.26]) ent(H, boxGeo(0.035,Lr,0.05), sx, -Lr/2, 0, 0xc4c8c9);
    // each tread fixed to the rails at the angle that makes it level once the ladder is down,
    // its top at the drop below the hinge that puts it at 0.45 or 0.90 m: s along the rails
    for(const s of [0.394, 0.874]){
      const tm=new T.Matrix4().compose(V3(0,-s,0), new T.Quaternion().setFromEuler(new T.Euler(-A,0,0)), V3(1,1,1));
      for(const [w,h,d,c,ty,tz] of [[0.54,0.03,0.22,0xb9bdbe,-0.015,-0.07],[0.54,0.006,0.012,0x8a8e90,0.003,-0.12],[0.54,0.006,0.012,0x8a8e90,0.003,-0.02]])
        H.push({geo:boxGeo(w,h,d), matrix:tm.clone().multiply(new T.Matrix4().makeTranslation(0,ty,tz)), color:new T.Color(c)}); }
    ent(H, boxGeo(0.56,0.04,0.04), 0, -Lr+0.02, 0, 0x2a2a2a);
    lad.add(mesh(mergeEntries(H), hwM, true));
    lad.rotation.x=-Math.PI/2; RT.ladder={g:lad, a:A};
  }

  /* ---- where you stand and what stops you -------------------------------- */
  const wx=(lx,lz)=>xf.x(lx,lz), wz=(lx,lz)=>xf.z(lx,lz), yaw=W.yaw;
  const ob=(lx,lz,hx,hz,ya,yb)=>addColOB(wx(lx,lz), wz(lx,lz), yaw, hx, hz, Y+ya, Y+yb);
  const zc=(z0+z1)/2, hz=(z1-z0)/2;
  for(const sd of [-1,1]) ob(sd*1.3025, zc, 0.0675, hz, -0.5, 4.12);                 // the sides, and a door folded on each
  ob(0, 3.56, hw, 0.06, -0.5, 4.12);                                                  // the front
  ob(0, (z0+0.17+z1)/2, XI, (z1-z0-0.17)/2, -0.5, 1.0);                               // nobody walks under it (from the bumper on)
  for(const c of cols) ob(c[0], c[1], c[2], c[3], YF-0.3, YF+Math.max(c[4],1.0));
  RT.door=ob(0, z0-0.03, hw, 0.04, YF, y1);                                           // the shut doors, while they are
  RT.doorTop=Y+y1;
  addFlatOB(wx(0,(z0+ZF)/2), wz(0,(z0+ZF)/2), yaw, XI, (ZF-z0)/2, Y+YF);
  RT.steps=[addFlatOB(wx(0,z0-0.45), wz(0,z0-0.45), yaw, 0.42, 0.19, -99),
            addFlatOB(wx(0,z0-0.13), wz(0,z0-0.13), yaw, 0.42, 0.13, -99)];
  RT.stepY=[Y+0.45, Y+0.90];
  addZoneOB(wx(0,zc), wz(0,zc), yaw, XI, hz, Y+YF-0.2, Y+YC, "TRAILER · NORTHERN TIER FREIGHT", true);
  // the roof, for the rain (16b): one turned box
  W.ob=_ob(wx(0,zc), wz(0,zc), yaw, hw, hz); W.top=Y+y1;
  // the dome light, which only the inside sees (16's pool, gated on the turned box)
  RT.lamp={x:wx(0,z0+4.5), y:Y+YC-0.15, z:wz(0,z0+4.5), color:0xfff2dc, intensity:0, dist:9, decay:1.4, indoor:true,
           ob:_ob(wx(0,zc), wz(0,zc), yaw, XI, hz)};
  LAMPS.push(RT.lamp);
  RT.ctr={x:wx(0,z0), z:wz(0,z0)};
  const toggle=()=>{
    RT.target=RT.target>0.5?0:1;
    if(typeof AUDIO!=="undefined") AUDIO.blip(RT.target?"latch":"slam", RT.ctr.x, RT.ctr.z);
    if(RT.target && !RT.told){ RT.told=true; toast("THE SEAL'S CUT · NORTHERN TIER FREIGHT · STOP 3 OF 5","#cfe0d4"); }
  };
  RT.use=addUse(wx(0,z0-1.1), wz(0,z0-1.1), Y, "OPEN THE TRAILER DOORS", toggle, 2.1);
  addUse(wx(0,z0+0.8), wz(0,z0+0.8), Y+YF, "PUSH THE DOORS OPEN", ()=>{ if(RT.target<0.5) toggle(); }, 1.3, ()=>RT.target<0.5);
})();
function updateTrailer(dt, now, dark){
  const RT=TRAILER_RT; if(!RT.g) return;
  const W=WALKIN, cam=camera.position, d=Math.hypot(cam.x-W.x, cam.z-W.z);
  RT.g.visible = d<85;
  const was=RT.open;
  RT.open=clamp(RT.open+(RT.target>RT.open?1:-1)*dt/4.2, 0, 1);
  const ease=t=>t*t*(3-2*t), o=RT.open;
  // the right-hand leaf, then the left, then the step; shutting runs it backwards
  const a=[ease(clamp(o/0.5,0,1)), ease(clamp((o-0.25)/0.5,0,1))];
  RT.leaves.forEach((L,i)=>{ L.piv.rotation.y=-L.sd*1.5*Math.PI*a[i]; });
  const s=ease(clamp((o-0.78)/0.22,0,1));
  RT.ladder.g.rotation.x=lerp(-Math.PI/2, RT.ladder.a, s);
  if(Math.floor(was*6)!==Math.floor(o*6) && o>0.02 && o<0.8 && typeof AUDIO!=="undefined") AUDIO.blip("hinge", RT.ctr.x, RT.ctr.z);
  RT.steps[0].y = s>0.96 ? RT.stepY[0] : -99;
  RT.steps[1].y = s>0.96 ? RT.stepY[1] : -99;
  RT.door.y1 = o<0.15 ? RT.doorTop : RT.door.y0-1;
  if(RT.use) RT.use.label = RT.target>0.5 ? "CLOSE THE TRAILER DOORS" : "OPEN THE TRAILER DOORS";
  // light: the day through the roof sheet, the domes once the doors are open
  const day=(1-dark)*(1-0.5*WEATHER.cover);
  const dome=ease(clamp((o-0.1)/0.3,0,1));
  for(const k in RT.mats){ const m=RT.mats[k]; if(m.userData.k===undefined) continue;
    m.emissiveIntensity = k==="roof" ? 0.30*day+0.10*dome : m.userData.k*(0.05*day+0.16*dome); }
  RT.mats.kit.emissiveIntensity=0.10*dome;
  RT.lamp.intensity=0.65*dome;
  RT.led.emissiveIntensity=1.6*dome;
}
