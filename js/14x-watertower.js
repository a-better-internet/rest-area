"use strict";
/* REST AREA · 14x-watertower.js
   Edinboro's water tower, behind the fuel stop: a ladder up to its catwalk
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14x · THE WATER TOWER
   On the flat behind the fuel stop, north of US 6N and west of the lane up
   to the substation: a steel tower of the old kind, four legs splayed out
   on concrete footings and braced in three tiers with tie rods, the riser
   pipe up the middle, and up top the tank, a drum with a bowl under it and a
   cone over it, painted pale and lettered EDINBORO both ways. A red light
   on the finial blinks at night.
   A ladder goes straight up the east side in its cage from the ground to
   the catwalk round the tank (06's addLadder, 17's climb: E at its foot,
   W to climb). The catwalk is a ring a metre and a half wide inside a
   railing, and from it you can see the whole country: the interstate and
   its bridge, the fields, the farm and the chapel, the woods away to the
   lake. In zombie mode (21) the fog thins the higher you are, and they
   cannot climb.
   ---------------------------------------------------------------------- */
const WATERTOWER=(function(){
  const TX=-32, TZ=-1318, G=groundY(TX, TZ);
  const TANK_R=5.6, CW=G+26.05, TOP=G+32.6, RAIL_R=7.18, LADX=TX+7.55;
  const W={x:TX, z:TZ, g:G, catwalk:CW, r:RAIL_R};
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(new T.BoxGeometry(w,h,d),x,y,z,c,0,ry||0,0);
  const tubeE=(a,b,rad,c,seg)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,seg||8), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const STEEL="#8a9296", DKSTEEL="#5e666a", PAINT="#c4ccca";
  /* ---- the legs: four, from footings 6.6 m out to the bowl's rim 4.4 m out, braced in three tiers ---- */
  const legAt=(k,y)=>{ const a=Math.PI/4+k*Math.PI/2, t=(y-G)/(CW-0.3-G), r=lerp(6.6, 4.4, t); return V3(TX+Math.cos(a)*r, y, TZ+Math.sin(a)*r); };
  for(let k=0;k<4;k++){
    const a=legAt(k, G), b=legAt(k, CW-0.3);
    tubeE(a.clone().setY(G+0.45), b, 0.26, STEEL, 14);
    ent(new T.CylinderGeometry(0.55, 0.65, 0.9, 16), a.x, G+0.2, a.z, "#9a978f");                 // the footing, sunk a little
    addCol(a.x-0.45, a.x+0.45, a.z-0.45, a.z+0.45, G-1, G+3.2);
  }
  // the tiers: a strut round at each, and crossed tie rods in the panels between
  const tiers=[G+0.6, G+9.0, G+17.2, CW-0.6];
  for(let i=0;i<tiers.length;i++){ const y=tiers[i];
    for(let k=0;k<4;k++){ const a=legAt(k, y), b=legAt((k+1)%4, y);
      if(i>0) tubeE(a, b, 0.11, STEEL, 10);
      if(i<tiers.length-1){ const y2=tiers[i+1], a2=legAt(k, y2), b2=legAt((k+1)%4, y2);
        tubeE(a, b2, 0.035, DKSTEEL, 6); tubeE(b, a2, 0.035, DKSTEEL, 6); } } }
  // the riser up the middle, and its collar where it meets the bowl
  ent(new T.CylinderGeometry(0.62, 0.62, CW-2.2-G, 20), TX, (G+CW-2.2)/2, TZ, PAINT);
  ent(new T.CylinderGeometry(0.95, 0.95, 0.5, 20), TX, G+0.25, TZ, "#9a978f");
  addCol(TX-0.75, TX+0.75, TZ-0.75, TZ+0.75, G-1, CW-2);
  /* ---- the tank: the bowl under, the drum lettered both ways, the cone over, the finial and its light ---- */
  { const bowl=new T.SphereGeometry(TANK_R, 40, 14, 0, Math.PI*2, Math.PI/2, Math.PI/2); bowl.scale(1, 0.46, 1);
    ent(bowl, TX, CW+0.15, TZ, PAINT); }
  { const tex=signTex(2048, 256, (c,Wd,Hh)=>{ c.fillStyle=PAINT; c.fillRect(0,0,Wd,Hh);
      c.fillStyle="rgba(90,100,98,0.35)"; c.fillRect(0, Hh*0.06, Wd, Hh*0.03); c.fillRect(0, Hh*0.91, Wd, Hh*0.03);
      const q=_trng(6161); for(let k=0;k<40;k++){ c.fillStyle="rgba(120,84,50,"+(0.05+q()*0.10).toFixed(2)+")"; const x=q()*Wd; c.fillRect(x, Hh*0.1, 2+q()*4, Hh*(0.3+q()*0.6)); }
      c.fillStyle="#1f3b6e"; for(const u of [0.25, 0.75]) fitText(c, "EDINBORO", Wd*0.30, Hh*0.56, Wd*u, Hh*0.52, "700", "Oswald, Arial"); });
    const drum=new T.Mesh(new T.CylinderGeometry(TANK_R, TANK_R, TOP-(CW+0.15), 48, 1, true), new T.MeshStandardMaterial({map:tex, roughness:0.55, metalness:0.15}));
    drum.position.set(TX, (CW+0.15+TOP)/2, TZ); drum.rotation.y=Math.PI/2; drum.castShadow=true; drum.receiveShadow=true; scene.add(drum); }
  ent(new T.ConeGeometry(TANK_R+0.12, 2.4, 48, 1, true), TX, TOP+1.19, TZ, "#aeb6b6");
  ent(new T.CylinderGeometry(TANK_R+0.12, TANK_R+0.12, 0.12, 48, 1, true), TX, TOP-0.01, TZ, DKSTEEL);   // the roof's edge, a band proud of the drum
  ent(new T.CylinderGeometry(0.28, 0.34, 0.5, 14), TX, TOP+2.55, TZ, DKSTEEL); ent(new T.SphereGeometry(0.22, 12, 8), TX, TOP+2.9, TZ, DKSTEEL);
  { const m=new T.MeshBasicMaterial({color:0xff2a18, transparent:true, opacity:0}); const s=new T.Mesh(new T.SphereGeometry(0.16, 12, 8), m);
    s.position.set(TX, TOP+3.16, TZ); scene.add(s); GLOW.push({m:m, basic:true, blink:1.7, duty:0.4, max:1}); }
  /* ---- the catwalk: a ring of grating round the bowl's rim, its railing, its brackets under ---- */
  { const ring=new T.RingGeometry(TANK_R-0.05, RAIL_R+0.06, 64, 1); ring.rotateX(-Math.PI/2);             // (its inner edge into the bowl's rim)
    const grate=new T.Mesh(ring, new T.MeshStandardMaterial({color:0x6e7478, roughness:0.75, metalness:0.3, side:T.DoubleSide}));
    grate.position.set(TX, CW, TZ); grate.receiveShadow=true; grate.castShadow=true; scene.add(grate);
    ent(new T.CylinderGeometry(RAIL_R+0.07, RAIL_R+0.07, 0.10, 64, 1, true), TX, CW-0.05, TZ, DKSTEEL);   // its toe plate round the edge
    for(let k=0;k<16;k++){ const a=k/16*Math.PI*2+Math.PI/16;
      tubeE(V3(TX+Math.cos(a)*(TANK_R-0.2), CW-1.6, TZ+Math.sin(a)*(TANK_R-0.2)), V3(TX+Math.cos(a)*(RAIL_R-0.05), CW-0.06, TZ+Math.sin(a)*(RAIL_R-0.05)), 0.05, DKSTEEL, 6); }
    // the railing: posts all round but where the ladder comes up, a top rail and a mid rail between them
    const N=24, gap=(a)=>Math.abs(Math.atan2(Math.sin(a), Math.cos(a)))<0.14;
    for(let k=0;k<N;k++){ const a=k/N*Math.PI*2+Math.PI/N, b=(k+1)/N*Math.PI*2+Math.PI/N;
      const pa=(r,y,t)=>V3(TX+Math.cos(t)*r, y, TZ+Math.sin(t)*r);
      if(!gap(a)) tubeE(pa(RAIL_R, CW, a), pa(RAIL_R, CW+1.08, a), 0.03, STEEL, 6);
      if(!gap((a+b)/2)) for(const y of [0.55, 1.06]) tubeE(pa(RAIL_R, CW+y, a), pa(RAIL_R, CW+y, b), 0.024, STEEL, 6);
      // and inside it: the drum's wall all round, and the rail all round but at the ladder's gap (the ladder takes you over)
      const m=(a+b)/2, s=(b-a)*RAIL_R;
      addColOB(TX+Math.cos(m)*(TANK_R-0.1), TZ+Math.sin(m)*(TANK_R-0.1), -m, 0.2, s*0.5*(TANK_R/RAIL_R)+0.05, CW-0.5, CW+6);
      addColOB(TX+Math.cos(m)*(RAIL_R+0.1), TZ+Math.sin(m)*(RAIL_R+0.1), -m, 0.12, s*0.5+0.06, CW-0.5, CW+1.2); }
    addFlat(TX-RAIL_R-0.2, TX+RAIL_R+0.2, TZ-RAIL_R-0.2, TZ+RAIL_R+0.2, CW);
    addZone(TX-RAIL_R-0.3, TX+RAIL_R+0.3, TZ-RAIL_R-0.3, TZ+RAIL_R+0.3, CW-0.5, CW+8, "THE WATER TOWER · CATWALK");
  }
  /* ---- the ladder: rails and rungs from the ground to over the catwalk's edge, its cage from head height up ---- */
  { const z0=TZ-0.22, z1=TZ+0.22, yA=G+0.05, yB=CW+1.15;
    for(const z of [z0, z1]) tubeE(V3(LADX, yA, z), V3(LADX, yB, z), 0.025, STEEL, 6);
    for(let y=G+0.3; y<CW+0.95; y+=0.3) tubeE(V3(LADX, y, z0), V3(LADX, y, z1), 0.016, STEEL, 6);
    // over the top, the rails bend in to the catwalk
    for(const z of [z0, z1]){ tubeE(V3(LADX, yB, z), V3(LADX-0.36, yB, z), 0.025, STEEL, 6); tubeE(V3(LADX-0.36, yB, z), V3(LADX-0.36, CW, z), 0.025, STEEL, 6); }
    const cx=LADX+0.42;
    for(let y=G+2.6; y<CW+0.8; y+=1.2){ const tor=new T.TorusGeometry(0.42, 0.016, 6, 24, Math.PI*1.25); tor.rotateX(Math.PI/2);
      ent(tor, cx, y, TZ, STEEL, 0, Math.PI*0.625, 0); }                     // (its open side to the ladder, -x)
    for(const dz of [-0.4, 0, 0.4]) tubeE(V3(cx+(dz ? 0.18 : 0.42), G+2.6, TZ+dz), V3(cx+(dz ? 0.18 : 0.42), CW+0.8, TZ+dz), 0.014, STEEL, 6);
    addCol(LADX-0.06, LADX+0.06, z0-0.05, z1+0.05, G-1, CW-0.3);
    W.ladder=addLadder(LADX, TZ, G, CW, Math.PI/2, {x:TX+8.5, z:TZ}, {x:TX+6.45, z:TZ, y:CW}, "THE WATER TOWER");
  }
  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, metalness:0.2}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
  addZone(TX-9, TX+9, TZ-9, TZ+9, G-1, G+4, "THE WATER TOWER");
  return W;
})();
