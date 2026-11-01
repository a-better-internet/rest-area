"use strict";
/* REST AREA · 08w-weigh.js
   the weigh station a mile north of Edinboro on northbound I-79: its
   ramps, its paving and its lines, and the signs on the interstate that
   bring the trucks in
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. (Before 08b, which lays the interstate's
   edge lines once every ramp has said where it joins.) */
/* ----------------------------------------------------------------------
   08w · THE WEIGH STATION: THE ROAD
   WEIGH (04) sets it out. The off-ramp leaves the right lane on a taper
   and swings east along the valley floor; it opens into two lanes, the
   bypass lane on the left and the scale lane on the right, past the scale
   house (14w) and over the scale, and they close again into the on-ramp,
   which swings back west and merges on a taper of its own. East of the
   scale lane past the scale, a paved apron for the trucks that are pulled
   over. Everything rides the road's own grade.
   The ramps go down through rampPave (08), like every other ramp, so the
   edge line dots and the rumble strips stop where they join. The station's
   paving is one lot layer over them where they meet (a step stronger in
   the polygon-offset ladder and a centimetre and a half up), and its
   lines are paint over that.
   ---------------------------------------------------------------------- */
(function weighRoad(){
  const W=WEIGH, RW=2.45, LY=PAVE_T+0.015, PY=LY+0.006;
  // the ground under it is walked on at the paving's height
  addPaveRaster(-182, -3460, -18, -2500);
  rampPave(W.off, RW, NB_X1, 1, "start", 110, "#9a9a98");
  rampPave(W.on, RW, NB_X1, 1, "end", 110, "#9a9a98");

  /* ---- the lanes and the apron: one ribbon along the lanes' middle, every two metres, its west edge the bypass lane's
     and its east edge the scale lane's, or the apron's past the scale; narrowing to the ramps' width at either end ---- */
  const lx=W.lx, half=W.lw, zA=W.z1-3, zB=W.z0+3, AP=W.apron;
  const P=[]; for(let z=Math.ceil(zA/2)*2; z<=zB; z+=2) P.push({x:lx, z:z, y:roadY(z)});
  P.forEach((q,i)=>{ q.s=i ? P[i-1].s+(q.z-P[i-1].z) : 0; });
  // (how much of the full width at z: the tapers to the ramps' own width over the end 18 m)
  const widen=z=>smoothstep(W.z1-3, W.z1+12, z)*(1-smoothstep(W.z0-15, W.z0+3, z));
  const west=z=>-(RW+(half-RW)*widen(z)), east=z=>(z>=AP.z0 && z<=AP.z1) ? AP.x1-lx : RW+(half-RW)*widen(z);
  layRibbonVar("lotpave", P, (i,p)=>west(p.z), (i,p)=>east(p.z), LY, 0.40, "#9c9c9a");
  addPaveRibbon(P, -half, half);
  addPaveRibbon([{x:lx, z:AP.z0, y:roadY(AP.z0)}, {x:lx, z:AP.z1, y:roadY(AP.z1)}], half, AP.x1-lx);

  // the lines: white on the station's paving, a centimetre or so over it
  const line=(pts, w, col)=>{ const Q=pts.map(q=>({x:q[0], z:q[1], y:roadY(q[1])}));
    Q.forEach((q,i)=>{ q.s=i ? Q[i-1].s+Math.hypot(q.x-Q[i-1].x, q.z-Q[i-1].z) : 0; });
    if(Q.length>1) layRibbon("paint", Q, -w/2, w/2, PY, 1, col||WHITE_LINE); };
  const run=(x0, z0, x1, z1, w, col)=>{ const n=Math.max(1, Math.ceil(Math.hypot(x1-x0, z1-z0)/4)), pts=[];
    for(let k=0;k<=n;k++) pts.push([lerp(x0, x1, k/n), lerp(z0, z1, k/n)]); line(pts, w, col); };
  // the edges, following the tapers in; the scale lane's right edge stops where the apron opens off it
  { const eW=[], eE1=[], eE2=[];
    for(let z=Math.ceil((W.z1+2)/2)*2; z<=W.z0-2; z+=2){ eW.push([lx+west(z)+0.25, z]);
      if(z>AP.z1+0.5) eE1.push([lx+east(z)-0.25, z]); else if(z<AP.z0-0.5) eE2.push([lx+east(z)-0.25, z]); }
    line(eW, 0.15); line(eE1, 0.15); if(eE2.length>1) line(eE2, 0.15); }
  // between the two lanes, solid, from where they are both full width to where they close again
  run(lx, W.z1+14, lx, W.z0-16, 0.15);
  // across the scale lane: the stop bar past the scale (stop on red), and the apron's mouth dotted
  run(W.scale.x-W.lw/2+0.2, W.scale.z0-3.0, W.scale.x+W.lw/2-0.2, W.scale.z0-3.0, 0.45);
  for(let z=AP.z1-1; z>AP.z0+1; z-=3.6) run(lx+half-0.25, z, lx+half-0.25, z-1.2, 0.20);
  // the apron: four truck stalls, nose to the north, their lines from its back to near its mouth
  for(let k=0;k<=4;k++){ const x=AP.x0+6.5+k*4.6; run(x, AP.z1-4, x, AP.z0+3, 0.12); }

  /* ---- words and arrows on the lanes: canvases laid flat over the paving, a step up again (paint's own) ---- */
  { const deck=(w, h, draw, x, z, ry)=>{ const tex=signTex(Math.round(w*90), Math.round(h*90), draw);
      const m=new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({map:tex, transparent:true, roughness:0.7,
        polygonOffset:true, polygonOffsetFactor:-5, polygonOffsetUnits:-10}));
      m.rotation.set(-Math.PI/2, 0, ry||0); m.position.set(x, roadY(z)+PY+0.004, z); m.receiveShadow=true; scene.add(m); return m; };
    const word=(s)=>(c, Wd, H)=>{ c.clearRect(0, 0, Wd, H); c.fillStyle=WHITE_LINE; fitHwy(c, s, Wd*0.80, H*0.60, Wd/2, H/2); };
    const arrow=(c, Wd, H)=>{ c.clearRect(0, 0, Wd, H); c.fillStyle=WHITE_LINE; const cx=Wd/2;
      c.beginPath(); c.moveTo(cx, H*0.06); c.lineTo(cx+Wd*0.34, H*0.40); c.lineTo(cx+Wd*0.12, H*0.40); c.lineTo(cx+Wd*0.12, H*0.94);
      c.lineTo(cx-Wd*0.12, H*0.94); c.lineTo(cx-Wd*0.12, H*0.40); c.lineTo(cx-Wd*0.34, H*0.40); c.closePath(); c.fill(); };
    // read by a driver heading north (−z): the tops of the letters to the north
    for(const [xx, s] of [[lx-half/2, "BYPASS"], [lx+half/2, "SCALE"]]){
      deck(1.1, 3.0, arrow, xx, W.z0-19, 0); deck(3.2, 1.3, word(s), xx, W.z0-24, 0); }
    deck(3.6, 1.3, word("STOP"), W.scale.x, W.scale.z0-1.5, 0); }

  /* ---- the signs on the interstate that bring them in ---- */
  const X=NB_X1+5.0;
  guideSign(X, -1830, 5.0, 2.8, 0, ["WEIGH STATION","1/2 MILE"]);
  guideSign(X, W.off[0].z+90, 5.0, 2.8, 0, ["WEIGH STATION","NEXT RIGHT"]);
  // at the gore: where to go, small, past the nose
  { const nose=W.off.find(p=>p.x>NB_X1+4.8) || W.off[W.off.length-1];
    guideSign(nose.x-1.5, nose.z-4, 2.6, 1.6, 0, ["WEIGH STATION","↗"], {clear:1.6}); }
  // speed on the ramp, on its right
  { const p=W.off[Math.floor(W.off.length*0.45)], tex=signTex(120, 160, (c, Wd, H)=>{ c.fillStyle="#f2f0ea"; c.fillRect(0, 0, Wd, H);
      c.strokeStyle="#1a1a1a"; c.lineWidth=5; rrect(c, 7, 7, Wd-14, H-14, 8); c.stroke(); c.fillStyle="#1a1a1a";
      fitHwy(c, "SPEED", Wd*0.74, H*0.13, Wd/2, H*0.20); fitHwy(c, "LIMIT", Wd*0.74, H*0.13, Wd/2, H*0.36); fitHwy(c, "15", Wd*0.74, H*0.38, Wd/2, H*0.68); });
    const x=p.x+RW+1.6, y=roadY(p.z);
    bx("metal", 0.07, 2.4, 0.07, x, y+1.2, p.z-0.06, 0.5, 0, "#a3a8aa"); bx("metal", 0.62, 0.82, 0.03, x, y+2.0, p.z-0.02, 0.5, 0, "#8d9294");
    signPanel(0.60, 0.80, tex, x, y+2.0, p.z+0.008, 0); addCol(x-0.06, x+0.06, p.z-0.12, p.z, y-1, y+2.4); }
  WEIGH.signOpenZ=-2240; WEIGH.signOpenX=X;                       // (14w puts up the one with the lights)
})();
