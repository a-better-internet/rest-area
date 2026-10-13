"use strict";
/* REST AREA · 14d-backwoods.js
   behind the building: the path the kids have worn out through the woods,
   the camp at the end of it with its fire and four of them round it, and
   what else a quarter of a kilometre of Pennsylvania woods has in it
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14d · THE BACK WOODS
   The path (TRAIL, 04-terrain) leaves the loop walk behind the pavilion and
   runs east, never graded, over the roots and round the big trees, to a
   clearing (CAMP) with a ring of stones in it. Somebody's fire is going.
   * The path is a ribbon of trodden dirt laid on the drawn ground.
   * The fire is two flame cards that turn to face you, a bed of coals,
     sparks and smoke out of 14a's clouds, and a light that will not hold
     still. Logs to sit on, a cooler, a tent, the firewood, the litter.
   * The kids: hoodies, a marshmallow on a stick, a phone, a can, one
     standing with her hands to the fire. They look up when you come in.
   * Out in the woods: an old stone wall from when this was a field, a
     hunter's ladder stand, a car somebody left in 1974, a trail camera,
     and at the back of it all the property line, POSTED and painted purple
     the way Pennsylvania lets a landowner say no trespassing.
   ---------------------------------------------------------------------- */
const BACKWOODS={teens:[], flames:[], deep:[], left:new Set(), leftItems:[], present:true, leftSeed:1};
(function backwoods(){
  const n0=scene.children.length;                  // what this file adds, for updateDeep
  const F={x:CAMP.x, z:CAMP.z, y:CAMP.y};
  const gy=(x,z)=>Terrain.groundAt(x,z);
  const at=(deg,r)=>{ const a=deg*Math.PI/180; return {x:F.x+Math.cos(a)*r, z:F.z+Math.sin(a)*r}; };
  const faceF=(x,z)=>Math.atan2(F.x-x, F.z-z);
  const rng=_trng(7341);
  addZone(F.x-CAMP.r-3, F.x+CAMP.r+3, F.z-CAMP.r-3, F.z+CAMP.r+3, -50, 60, "THE FIRE RING");

  /* ---- the path ---------------------------------------------------------
     Resampled to a metre, three vertices across (so it lies over the ground
     rather than bridging it), a few centimetres up with a polygon offset.
     The texture is bare dirt down the middle, roots and leaves at the
     edges, its alpha soft at both edges and at both ends of the path. */
  (function path(){
    const c=cvs(128,512), x=c.getContext("2d"), r=_trng(611);
    x.clearRect(0,0,128,512);
    // the edge wanders: a width for every row, smooth along the path
    const edge=[]; for(let j=0;j<512;j++) edge.push(0.80+0.14*Math.sin(j*0.037+1.3)*Math.sin(j*0.011)+0.05*Math.sin(j*0.21));
    for(let j=0;j<512;j++){                              // the worn band
      for(let i=0;i<128;i+=2){
        const u=Math.abs(i-64)/64/edge[j], a=Math.max(0, 1-Math.pow(u, 3))*0.92;
        const l=(0.80+r()*0.22)*(1.06-0.28*u*u);
        x.fillStyle="rgba("+(112*l|0)+","+(92*l|0)+","+(70*l|0)+","+a.toFixed(3)+")";
        x.fillRect(i,j,2,1);
      }
    }
    for(let k=0;k<700;k++){                              // grit, pebbles, damp patches
      const px=20+r()*88, py=r()*512;
      x.fillStyle=r()<0.45?"rgba(150,138,118,0.45)":"rgba(52,40,30,0.30)";
      x.fillRect(px,py,1+r()*3,1+r()*2);
    }
    for(let k=0;k<3;k++){                                // a root or two across it
      const y0=60+k*170+r()*60, a=(r()-0.5)*1.2;
      x.strokeStyle="rgba(74,56,40,0.55)"; x.lineWidth=2+r()*2;
      x.beginPath(); x.moveTo(8,y0); x.quadraticCurveTo(64, y0+a*30+(r()-0.5)*20, 120, y0+a*70); x.stroke();
    }
    for(let k=0;k<520;k++){                              // leaves blown in from the edges
      const side=r()<0.5, d=Math.pow(r(),1.6)*40, py=r()*512;
      const px=side ? 64-edge[py|0]*58+d : 64+edge[py|0]*58-d;
      x.fillStyle=["rgba(120,92,48,0.75)","rgba(96,76,42,0.75)","rgba(132,108,62,0.65)","rgba(80,92,48,0.55)"][k%4];
      x.beginPath(); x.ellipse(px,py,2+r()*3,1+r()*2,r()*3,0,7); x.fill();
    }
    const tex=new T.CanvasTexture(c); tex.wrapT=T.RepeatWrapping; tex.anisotropy=MAXANISO;
    // the centre line at a metre a step
    const S=[];
    for(let i=1;i<TRAIL.length;i++){
      const a=TRAIL[i-1], b=TRAIL[i], L=Math.hypot(b.x-a.x,b.z-a.z), n=Math.max(1,Math.round(L));
      for(let k=0;k<n;k++) S.push({x:a.x+(b.x-a.x)*k/n, z:a.z+(b.z-a.z)*k/n});
    }
    S.push({x:TRAIL[TRAIL.length-1].x, z:TRAIL[TRAIL.length-1].z});
    const P=[], U=[], A=[], IDX=[]; let s=0;
    for(let i=0;i<S.length;i++){
      const p=S[i], q=S[Math.min(S.length-1,i+1)], o=S[Math.max(0,i-1)];
      let tx=q.x-o.x, tz=q.z-o.z; const tl=Math.hypot(tx,tz)||1; tx/=tl; tz/=tl;
      if(i) s+=Math.hypot(p.x-S[i-1].x, p.z-S[i-1].z);
      // a little wider where it is flat and walked more, narrower in the trees
      const w=0.62+0.18*Terrain.fbm(p.x*0.05, p.z*0.05, 2)+(i<12?0.15:0);
      const end=Math.min(smoothstep(0,4,s), smoothstep(0,5,(S.length-1-i)));
      for(const k of [-1,0,1]){
        const x2=p.x-tz*w*k, z2=p.z+tx*w*k;
        P.push(x2, gy(x2,z2)+0.035, z2); U.push((k+1)/2, s/4.2); A.push(end);
      }
      if(i) for(const k of [0,1]){ const a2=(i-1)*3+k, b2=a2+1, c2=i*3+k, d2=c2+1; IDX.push(a2,b2,c2, b2,d2,c2); }   // wound to face up
    }
    const g=new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(P,3));
    g.setAttribute("uv", new T.Float32BufferAttribute(U,2));
    const C=[]; for(const a of A) C.push(a,a,a);
    g.setAttribute("color", new T.Float32BufferAttribute(C,3));
    g.setIndex(IDX); g.computeVertexNormals();
    const mat=new T.MeshStandardMaterial({map:tex, transparent:true, depthWrite:false, roughness:1, metalness:0,
      polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-6});
    // the colour attribute carries the fade at the path's two ends: it scales
    // alpha only, never the dirt's colour
    mat.onBeforeCompile=sh=>{
      sh.vertexShader=sh.vertexShader.replace("#include <common>", "#include <common>\nattribute vec3 color;\nvarying float vFade;")
                                     .replace("#include <begin_vertex>", "#include <begin_vertex>\nvFade=color.r;");
      sh.fragmentShader=sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vFade;")
                                         .replace("#include <map_fragment>", "#include <map_fragment>\ndiffuseColor.a*=vFade;");
    };
    const m=new T.Mesh(g, mat); m.receiveShadow=true; m.renderOrder=1; m.name="trail";
    scene.add(m);
  })();

  /* ---- the fire ring ------------------------------------------------------ */
  const fy=F.y;
  for(let k=0;k<15;k++){                                   // stones, set in a ring
    const a=k/15*Math.PI*2+rng()*0.15, r=0.78+rng()*0.06, s=0.15+rng()*0.08;
    push("rock", rockGeo(s, 300+k), F.x+Math.cos(a)*r, fy+s*0.30, F.z+Math.sin(a)*r, rng()*6, ["#8d887e","#7a766d","#9a958a","#6e6a62"][k%4]);
  }
  // the bed of ash and coals: a disc, black at the rim, grey ash, and the
  // coals themselves a glow laid over it
  const ashT=(function(){
    const c=cvs(128,128), x=c.getContext("2d"), r=_trng(77);
    const g=x.createRadialGradient(64,64,4,64,64,64);
    g.addColorStop(0,"#5b5650"); g.addColorStop(0.55,"#3a3634"); g.addColorStop(0.85,"#1d1b1a"); g.addColorStop(1,"rgba(29,27,26,0)");
    x.fillStyle=g; x.fillRect(0,0,128,128);
    for(let i=0;i<260;i++){ const a=r()*7, d=r()*50; x.fillStyle=r()<0.7?"rgba(20,18,17,0.8)":"rgba(150,146,140,0.6)";
      x.fillRect(64+Math.cos(a)*d, 64+Math.sin(a)*d, 1+r()*4, 1+r()*3); }
    return new T.CanvasTexture(c);
  })();
  { const m=new T.Mesh(new T.CircleGeometry(0.80, 28), new T.MeshStandardMaterial({map:ashT, transparent:true, roughness:1,
      polygonOffset:true, polygonOffsetFactor:-4, polygonOffsetUnits:-8}));
    m.rotation.x=-Math.PI/2; m.position.set(F.x, fy+0.03, F.z); m.receiveShadow=true; scene.add(m); }
  const coalT=(function(){
    const c=cvs(128,128), x=c.getContext("2d"), r=_trng(78);
    x.clearRect(0,0,128,128);
    for(let i=0;i<180;i++){ const a=r()*7, d=Math.pow(r(),0.7)*44, s=2+r()*7;
      const g=x.createRadialGradient(64+Math.cos(a)*d,64+Math.sin(a)*d,0,64+Math.cos(a)*d,64+Math.sin(a)*d,s);
      g.addColorStop(0,"rgba(255,"+(120+r()*90|0)+",40,0.95)"); g.addColorStop(1,"rgba(255,60,10,0)");
      x.fillStyle=g; x.fillRect(64+Math.cos(a)*d-s,64+Math.sin(a)*d-s,s*2,s*2); }
    return new T.CanvasTexture(c);
  })();
  const coals=new T.Mesh(new T.CircleGeometry(0.62, 24), new T.MeshBasicMaterial({map:coalT, transparent:true, depthWrite:false,
    blending:T.AdditiveBlending, toneMapped:false, polygonOffset:true, polygonOffsetFactor:-6, polygonOffsetUnits:-12}));
  coals.rotation.x=-Math.PI/2; coals.position.set(F.x, fy+0.035, F.z); scene.add(coals);
  // the wood: four half-burnt logs leaned in to a point, and two across the bottom
  for(let k=0;k<4;k++){
    const a=k*Math.PI/2+0.4, L=0.85, tilt=0.95;
    const g=FOREST.barkCyl(0.075, 0.06, L, 7);
    push("logbark", g, F.x+Math.cos(a)*0.22, fy+0.27, F.z+Math.sin(a)*0.22, -a, "#4a3e34", 0, tilt);   // leaned in, top to the middle
  }
  for(const a of [0.2, 1.9]) push("logbark", FOREST.barkCyl(0.09,0.085,0.95,7), F.x, fy+0.10, F.z, a, "#3a312a", 0, Math.PI/2);
  addCol(F.x-0.62, F.x+0.62, F.z-0.62, F.z+0.62, fy-0.5, fy+1.0);
  addUse(F.x+1.4, F.z, fy, "WARM YOUR HANDS", ()=>toast(
    ["THE FIRE IS GOOD AND HOT","SMOKE FOLLOWS BEAUTY, THEY SAY. IT FOLLOWS YOU","A LOG SETTLES AND THE SPARKS GO UP"][(Math.random()*3)|0], "#ffc98a"), 1.6);

  /* the flames: cards that turn to face you, a noise rising through them,
     white-yellow at the root, orange, red at the tips, and added, not laid
     over, so where two cross they burn brighter */
  const flameMat=seed=>new T.ShaderMaterial({
    uniforms:{time:{value:0}, seed:{value:seed}, k:{value:1}},
    vertexShader:"varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader:
`uniform float time, seed, k; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h(i),h(i+vec2(1.0,0.0)),f.x), mix(h(i+vec2(0.0,1.0)),h(i+vec2(1.0,1.0)),f.x), f.y); }
float fbm(vec2 p){ float s=0.0, a=0.5; for(int i=0;i<4;i++){ s+=a*n(p); p*=2.03; a*=0.5; } return s; }
void main(){
  float y=vUv.y, t=time*1.9;
  float q=fbm(vec2(vUv.x*3.0+seed, y*2.2-t));
  float q2=fbm(vec2(vUv.x*7.0-seed*1.7, y*4.6-t*1.5));
  float x=abs(vUv.x-0.5+(q-0.5)*0.42*y);
  float w=0.40*pow(max(0.0,1.0-y),0.7)*(0.72+0.56*q2);
  float body=smoothstep(w, w*0.25, x);
  float top=1.0-smoothstep(0.30, 0.95, y+(q-0.5)*0.55);
  float base=smoothstep(0.0, 0.06, y);
  float a=body*top*base*k;
  float heat=clamp(body*(1.2-y)*1.25, 0.0, 1.0);
  vec3 c=mix(vec3(0.85,0.16,0.02), vec3(1.0,0.50,0.07), smoothstep(0.08,0.5,heat));
  c=mix(c, vec3(1.0,0.90,0.58), smoothstep(0.62,0.98,heat));
  gl_FragColor=vec4(c*1.5, a);
}`,
    transparent:true, depthWrite:false, blending:T.AdditiveBlending, side:T.DoubleSide, toneMapped:false, fog:false});
  for(const [w,h,dx,dz,sd] of [[1.05,1.55,0,0,1.3],[0.80,1.20,0.12,-0.08,4.1],[0.62,0.95,-0.14,0.10,7.7]]){
    const g=new T.PlaneGeometry(w,h); g.translate(0,h/2,0);
    const m=new T.Mesh(g, flameMat(sd)); m.position.set(F.x+dx, fy+0.10, F.z+dz); m.renderOrder=4; m.frustumCulled=false;
    scene.add(m); BACKWOODS.flames.push(m);
  }
  const halo=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, color:0xff7a2a, transparent:true, depthWrite:false,
    blending:T.AdditiveBlending, opacity:0.5, toneMapped:false}));
  halo.scale.set(3.4,2.6,1); halo.position.set(F.x, fy+0.75, F.z); scene.add(halo);
  const LIGHT={x:F.x, y:fy+1.0, z:F.z, color:0xff8a3c, intensity:1.7, dist:16, decay:1.45, fire:true};
  LAMPS.push(LIGHT);
  Object.assign(BACKWOODS, {F:F, coals:coals, halo:halo, light:LIGHT, sparkT:0, smokeT:0, pop:3});

  /* ---- round the fire: the logs, the cooler, the chair, the tent ---------- */
  function seatLog(deg, r, len, rad, color){
    const c=at(deg,r), a=deg*Math.PI/180, ry=Math.atan2(-Math.cos(a), -Math.sin(a));
    const y=gy(c.x,c.z)+rad*0.88;
    push("logbark", FOREST.barkCyl(rad, rad*0.96, len, 10), c.x, y, c.z, ry, color||"#8a8070", 0, Math.PI/2);
    const tx=-Math.sin(a), tz=Math.cos(a);                       // along the log
    for(const e of [-1,1]) push("logbark", new T.CircleGeometry(rad*0.95, 10), c.x+tx*e*(len/2+0.004), y, c.z+tz*e*(len/2+0.004),
                                ry+(e>0?Math.PI/2:-Math.PI/2), "#b49a72");      // the sawn ends
    const hx=Math.abs(tx)*len/2+Math.abs(tz)*rad, hz=Math.abs(tz)*len/2+Math.abs(tx)*rad;
    addCol(c.x-hx, c.x+hx, c.z-hz, c.z+hz, y-rad-0.5, y+rad*0.85);
    return {x:c.x, z:c.z, y:y+rad*0.85, tx:tx, tz:tz};
  }
  const logW=seatLog(198, 2.35, 2.4, 0.21);
  const logNE=seatLog(322, 2.45, 2.2, 0.19, "#7d7466");
  for(const e of [-0.5, 0.5]){
    const sx=logNE.x+logNE.tx*e, sz=logNE.z+logNE.tz*e;
    addSeat(sx, sz, logNE.y, faceF(sx,sz)+Math.PI, "THE LOG BY THE FIRE");
  }
  // the cooler: white, a blue lid, the hinge side to the fire
  const coolP=at(108, 2.15), coolY=gy(coolP.x,coolP.z), coolR=faceF(coolP.x,coolP.z);
  { const f=XF(coolP.x, coolP.z, coolR);
    lbx(f, "paintm", 0.62, 0.34, 0.40, 0, coolY+0.17, 0, 0, "#eceae4");
    lbx(f, "paintm", 0.64, 0.07, 0.42, 0, coolY+0.375, 0, 0, "#2a5c9e");
    for(const s of [-1,1]) lbx(f, "paintm", 0.03, 0.05, 0.16, s*0.33, coolY+0.30, 0, 0, "#c8c6c0");
    lcol(f, 0.64, 0.42, 0, 0, coolY-0.5, coolY+0.41); }
  // a folding camp chair, a jacket over its back
  { const c=at(58, 2.75), y=gy(c.x,c.z), f=XF(c.x, c.z, faceF(c.x,c.z));
    lbx(f, "paintm", 0.52, 0.05, 0.46, 0, y+0.40, 0, 0, "#2f4f6e");
    lbx(f, "paintm", 0.52, 0.48, 0.04, 0, y+0.66, -0.25, 0, "#2f4f6e");
    for(const s of [-1,1]){ lbx(f, "paintm", 0.03, 0.03, 0.46, s*0.28, y+0.58, 0, 0, "#1d1d1f");
      push("metal", new T.CylinderGeometry(0.012,0.012,0.62,6), f.x(s*0.27,0), y+0.26, f.z(s*0.27,0), f.ry, "#8d9194", 0.65, 0);
      push("metal", new T.CylinderGeometry(0.012,0.012,0.62,6), f.x(s*0.27,0), y+0.26, f.z(s*0.27,0), f.ry, "#8d9194", -0.65, 0); }
    lbx(f, "paintm", 0.50, 0.30, 0.10, 0.02, y+0.80, -0.30, 0, "#7a2a22");                     // the jacket
    lbx(f, "paintm", 0.16, 0.36, 0.08, 0.20, y+0.58, -0.27, 0, "#7a2a22");
    lcol(f, 0.62, 0.56, 0, 0, y-0.5, y+0.9); }
  // the tent: a dome with its fly, the door unzipped toward the fire
  { const c=at(286, 6.3), y=gy(c.x,c.z), ry=faceF(c.x,c.z);
    const dome=new T.SphereGeometry(1, 22, 10, 0, Math.PI*2, 0, Math.PI/2); dome.scale(1.12, 1.18, 1.05);
    push("paintm", dome, c.x, y, c.z, ry, "#3f5a3a");
    const f=XF(c.x, c.z, ry);
    // the door: the dark of the inside, a patch of the dome a hair outside it
    // on the side facing the fire, the flap rolled up over it
    const door=new T.SphereGeometry(1, 10, 6, Math.PI/2-0.42, 0.84, Math.PI*0.30, Math.PI*0.20); door.scale(1.125, 1.19, 1.06);
    push("paintm", door, c.x, y, c.z, ry, "#141714");
    const roll=new T.CylinderGeometry(0.05,0.05,0.80,8); roll.rotateZ(Math.PI/2);
    push("paintm", roll, f.x(0,0.62), y+0.98, f.z(0,0.62), ry, "#34492f");
    // pole sleeves over the top, the floor's rim, the stakes and guys
    for(const s of [-1,1]){
      const tor=new T.TorusGeometry(1.0, 0.018, 5, 24, Math.PI); tor.scale(1.12, 1.19, 1.05);
      push("paintm", tor, c.x, y, c.z, ry+s*Math.PI/4, "#26331f");
    }
    const rim=new T.CylinderGeometry(1,1,0.08,24,1,true); rim.scale(1.13,1,1.06);
    push("paintm", rim, c.x, y+0.04, c.z, ry, "#22301e");
    for(let k=0;k<4;k++){ const a=ry+k*Math.PI/2+Math.PI/4, ox=Math.sin(a)*1.85, oz=Math.cos(a)*1.85;
      tube("paintm", V3(c.x+Math.sin(a)*0.8, y+0.8, c.z+Math.cos(a)*0.8), V3(c.x+ox, gy(c.x+ox,c.z+oz)+0.02, c.z+oz), 0.003, 3, "#d8d0b0"); }
    addCol(c.x-1.1, c.x+1.1, c.z-1.05, c.z+1.05, y-0.5, y+1.1);
    addUse(f.x(0,1.7), f.z(0,1.7), y, "LOOK IN THE TENT", ()=>toast("TWO SLEEPING BAGS, A PILLOW, AND A LOT OF EMPTY CANS","#cfe0d4"), 1.3);
  }
  // the firewood, split and stacked crosswise; the chopping block, the hatchet in it
  { const c=at(342, 4.7), y=gy(c.x,c.z), ry=faceF(c.x,c.z);
    for(let row=0;row<4;row++) for(let k=0;k<4-row;k++){
      const off=(k-(3-row)/2)*0.17, ax=ry+(row%2?Math.PI/2:0);
      push("logbark", FOREST.barkCyl(0.075,0.07,0.55,6), c.x+Math.cos(ry)*off*(row%2?0:1)+Math.sin(ry)*off*(row%2?1:0), y+0.07+row*0.13,
           c.z-Math.sin(ry)*off*(row%2?0:1)+Math.cos(ry)*off*(row%2?1:0), ax, ["#8a7a64","#7d6e5a","#94846c"][(row+k)%3], 0, Math.PI/2);
    }
    addCol(c.x-0.45, c.x+0.45, c.z-0.45, c.z+0.45, y-0.5, y+0.55);
    const b=at(14, 4.9), by=gy(b.x,b.z);
    push("logbark", FOREST.barkCyl(0.30, 0.27, 0.46, 11), b.x, by+0.22, b.z, 0, "#857a68");
    push("logbark", new T.CircleGeometry(0.27, 11), b.x, by+0.452, b.z, 0, "#b8a07a", -Math.PI/2, 0);
    tube("beam", V3(b.x+0.04, by+0.47, b.z), V3(b.x+0.36, by+0.74, b.z+0.10), 0.016, 6, "#8a6a48");
    push("metal", boxGeo(0.12,0.06,0.015,0), b.x+0.02, by+0.47, b.z-0.01, 0.3, "#4a4c4e", 0, -0.7);
    addCol(b.x-0.3, b.x+0.3, b.z-0.3, b.z+0.3, by-0.5, by+0.46);
  }
  // what is lying about: cans (some crushed), the twelve-pack's box, chips,
  // a backpack against the log, a flashlight, the marshmallows
  { const cans=[[200,1.6],[214,3.1],[96,1.5],[120,2.9],[300,3.4],[330,1.6],[40,3.0],[170,3.6],[250,2.2],[80,2.4],[60,1.5]];
    cans.forEach(([d,r],i)=>{ const p=at(d,r), y=gy(p.x,p.z), crushed=i%3!==1;
      const col=["#b8bcc0","#c8202a","#2b5aa8","#d8d0b8","#3a7a3a"][i%5];
      if(crushed) push("paintm", new T.CylinderGeometry(0.034,0.034,0.04,10), p.x, y+0.022, p.z, i, col, Math.PI/2, 0.3);
      else push("paintm", new T.CylinderGeometry(0.033,0.033,0.122,12), p.x, y+0.061, p.z, i, col);
    });
    const bx2=at(128, 2.95), y2=gy(bx2.x,bx2.z);
    push("paintm", boxGeo(0.40,0.13,0.27,0), bx2.x, y2+0.065, bx2.z, 0.6, "#2a4f9a");
    push("paintm", boxGeo(0.26,0.06,0.18,0), at(232,2.3).x, gy(at(232,2.3).x,at(232,2.3).z)+0.03, at(232,2.3).z, 1.1, "#e0a020");  // chips
    const bp=at(212, 2.85), ybp=gy(bp.x,bp.z), fb=XF(bp.x, bp.z, faceF(bp.x,bp.z)+0.3);
    lbx(fb, "paintm", 0.32, 0.42, 0.20, 0, ybp+0.21, 0, 0, "#2b2e33");
    lbx(fb, "paintm", 0.24, 0.18, 0.06, 0, ybp+0.15, 0.12, 0, "#3b4048");
    const fl=at(150, 1.9); push("paintm", new T.CylinderGeometry(0.02,0.022,0.2,8), fl.x, gy(fl.x,fl.z)+0.022, fl.z, 0.8, "#c8c4b8", 0, Math.PI/2);
    const mb=at(186, 1.75); push("paintm", boxGeo(0.18,0.07,0.12,0), mb.x, gy(mb.x,mb.z)+0.035, mb.z, 0.4, "#f2efe6");
    // spare sticks for the marshmallows, leaned on the north log
    for(const e of [-0.9,-0.75]) tube("beam", V3(logNE.x+logNE.tx*e, logNE.y-0.1, logNE.z+logNE.tz*e),
                                     V3(logNE.x+logNE.tx*e+0.6, gy(logNE.x,logNE.z)+0.02, logNE.z+logNE.tz*e+0.7), 0.006, 4, "#7a5c3c");
  }
  // the speaker: a little cylinder on the log's end, a blue light on it
  { const e=1.0, x=logNE.x+logNE.tx*e, z=logNE.z+logNE.tz*e, y=logNE.y+0.035;
    push("paintm", new T.CylinderGeometry(0.035,0.035,0.17,12), x, y+0.0, z, Math.atan2(logNE.tx, logNE.tz), "#1d1f22", 0, Math.PI/2);
    const led=new T.Mesh(new T.SphereGeometry(0.006,6,4), new T.MeshBasicMaterial({color:0x3a8cff, toneMapped:false}));
    led.position.set(x, y+0.036, z); scene.add(led); BACKWOODS.led=led;
    BACKWOODS.speaker={x:x, z:z};
    addUse(x, z, logNE.y-0.4, "CHANGE THE SONG", ()=>{
      if(AUDIO.campSong) AUDIO.campSong();
      toast(["'HEY, I WAS LISTENING TO THAT'","'PUT THE OTHER ONE BACK ON'","'OKAY THIS ONE'S GOOD'"][(Math.random()*3)|0], "#cfe0d4"); }, 1.0,
      ()=>BACKWOODS.present);
  }

  /* ---- the four of them ---------------------------------------------------
     Built like everyone else (14b), in hoodies and jeans. Each has a thing
     in hand on the forearm's bone, and a few lines for whoever walks in. */
  const hoodies=["#3b3f45","#6d1f2a","#2b3d63","#4a5a3a","#bdb8ac"];
  const mk=(o)=>buildPerson(Object.assign({hoodie:true, long:true, pants:["#3b4a66","#2c3446","#46597a"][(rng()*3)|0],
    shoes:["#f2f0ea","#1d1d1f","#c8c4bc"][(rng()*3)|0], skin:SKINS[(rng()*SKINS.length)|0], hair:HAIRS[(rng()*HAIRS.length)|0]}, o));
  const teen=(P, x, z, sit, act, lines)=>{
    const y=gy(x,z), t={kind:"teen", P:P, x:x, z:z, y:y, yaw:faceF(x,z), sit:sit, act:act, seed:rng()*10, look:0, lines:lines, upd:updTeen};
    P.seed=t.seed; PEOPLE.push(t); BACKWOODS.teens.push(t);
    // solid only while they are here (see _campPresence)
    t.col={x0:x-0.25, x1:x+0.25, z0:z-0.25, z1:z+0.25, y0:y-0.5, y1:y+(sit?1.2:1.75)}; COL_DYN.push(t.col);
    addUse(x, z, y, "SAY HEY", ()=>{ t.look=3; toast(lines[(Math.random()*lines.length)|0], "#cfe0d4"); }, 1.7, ()=>BACKWOODS.present);
    return t;
  };
  const wA={x:logW.x-logW.tx*0.55, z:logW.z-logW.tz*0.55}, wB={x:logW.x+logW.tx*0.55, z:logW.z+logW.tz*0.55};
  // on the west log: one toasting a marshmallow, one on her phone
  const A=teen(mk({h:1.02, shirt:hoodies[0], cap:null}), wA.x, wA.z, true, "roast",
    ["'WANT ONE? THERE'S A WHOLE BAG'","'DON'T TELL ANYBODY WE'RE OUT HERE, OKAY?'","'YOU FROM THE REST STOP? THE VENDING MACHINE EATS DOLLARS'"]);
  const B=teen(mk({female:true, h:0.96, shirt:hoodies[1], beanie:"#c9b8a0"}), wB.x, wB.z, true, "phone",
    ["'HOLD ON, I'M LOSING SIGNAL'","'NO WAY. SHE SAID THAT?'","'IS THAT A COP? — NO, IT'S JUST SOME GUY'"]);
  // on the cooler, a can; standing at the fire, her hood up
  const C=teen(mk({h:1.04, shirt:hoodies[2], cap:"#1d1d1f"}), coolP.x, coolP.z, true, "can",
    ["'YOU'RE SITTING ON THE ROOT BEERS — OH, THAT'S ME'","'WE COME OUT HERE EVERY FRIDAY'","'THERE'S A CAR BACK THERE IN THE WOODS. LIKE A WHOLE CAR'"]);
  const dP=at(28, 1.75);
  const D=teen(mk({female:true, h:0.97, shirt:hoodies[3], hoodUp:true}), dP.x, dP.z, false, "warm",
    ["'IT GETS COLD OUT HERE FAST'","'MIND THE SPARKS'","'THE TRUCKS SOUND LIKE THE OCEAN FROM HERE'",
     "'THERE'S A HOUSE OUT PAST THE ORANGE TAPE. NOBODY'S LIVED THERE SINCE LIKE THE EIGHTIES'","'WE DON'T GO IN THE OLD HOUSE AFTER DARK. TY DID ONCE'"]);
  // what they hold
  { const h=A.P.h, g=new T.Group();
    const stick=new T.Mesh(new T.CylinderGeometry(0.005,0.007,1.15,5), new T.MeshStandardMaterial({color:0x7a5c3c, roughness:0.9}));
    stick.position.y=-0.575; g.add(stick);
    const mm=new T.Mesh(new T.CylinderGeometry(0.018,0.018,0.034,10), new T.MeshStandardMaterial({color:0xf4f1e8, roughness:0.85}));
    mm.position.y=-1.12; g.add(mm);
    const blaze=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, color:0xff7a20, transparent:true, depthWrite:false,
      blending:T.AdditiveBlending, opacity:0, toneMapped:false}));
    blaze.scale.set(0.12,0.16,1); blaze.position.y=-1.10; g.add(blaze);
    g.position.set(0, -0.28*h, 0.02); g.rotation.x=0.02;             // on along the forearm, out over the coals
    A.P.B[A.P.j.elR].add(g); A.stick={g:g, mm:mm, blaze:blaze, t:rng()*30}; }
  { const h=B.P.h, g=new T.Group();
    g.add(new T.Mesh(new T.BoxGeometry(0.072,0.15,0.009), new T.MeshStandardMaterial({color:0x1a1a1c, roughness:0.4})));
    const scr=new T.Mesh(new T.PlaneGeometry(0.064,0.136), new T.MeshBasicMaterial({color:0xbfd6ff, toneMapped:false}));
    scr.position.z=0.0052; g.add(scr);
    g.position.set(-0.04, -0.28*h, 0.03); g.rotation.set(0.15, 0, 0);
    B.P.B[B.P.j.elR].add(g); B.phone={g:g, scr:scr}; }
  { const h=C.P.h, can=new T.Mesh(new T.CylinderGeometry(0.033,0.033,0.122,12), new T.MeshStandardMaterial({color:0x7a3a1c, roughness:0.35, metalness:0.6}));
    can.position.set(0.0, -0.29*h, 0.035); C.P.B[C.P.j.elR].add(can); C.can=can; }

  function updTeen(p, dt, now, dark, cd){
    const P=p.P, B=P.B, J=P.j;
    P.g.visible=BACKWOODS.present; if(!BACKWOODS.present) return;
    P.g.position.set(p.x,p.y,p.z); P.g.rotation.y=p.yaw;
    if(cd>150) return;
    poseP(P, p.sit?"sit":"stand", 0, now);
    const s1=Math.sin(now*0.7+p.seed), s2=Math.sin(now*1.3+p.seed*2);
    if(p.act==="roast"){
      B[J.spine].rotation.x=0.14;
      B[J.shR].rotation.x=-1.12+s1*0.04; B[J.shR].rotation.z=0.12; B[J.elR].rotation.x=-0.28+s2*0.05;
      B[J.shL].rotation.x=-0.45; B[J.elL].rotation.x=-0.9;
      B[J.head].rotation.x=0.18; B[J.head].rotation.y*=0.3;
      // the marshmallow: white, gold, brown, black; eaten; another one on
      const S=p.stick; S.t+=dt; const u=(S.t%38)/38;
      const col=u<0.35 ? [0.96,0.95,0.91] : u<0.6 ? [0.93,0.74,0.38] : u<0.8 ? [0.55,0.32,0.14] : [0.12,0.10,0.09];
      S.mm.material.color.setRGB(...col);
      S.blaze.material.opacity = u>0.8 && u<0.9 ? 0.55+0.3*Math.sin(now*30) : 0;
      S.mm.visible = u<0.93;
    }else if(p.act==="phone"){
      B[J.spine].rotation.x=0.30;
      B[J.shL].rotation.x=-0.52; B[J.shR].rotation.x=-0.55; B[J.shL].rotation.z=-0.22; B[J.shR].rotation.z=0.20;
      B[J.elL].rotation.x=-1.62; B[J.elR].rotation.x=-1.55;
      B[J.head].rotation.x=0.50; B[J.head].rotation.y=Math.sin(now*0.2+p.seed)*0.15;
      // the screen: bright by night, and it lights her face a little
      p.phone.scr.material.color.setRGB(0.45+0.35*dark, 0.55+0.35*dark, 0.75+0.25*dark);
    }else if(p.act==="can"){
      const cyc=(now*0.075+p.seed)%1, up=smoothstep(0,0.08,cyc)*(1-smoothstep(0.16,0.24,cyc));
      B[J.spine].rotation.x=0.12-up*0.12;
      B[J.shR].rotation.x=-0.62-up*0.55; B[J.shR].rotation.z=0.10+up*0.2; B[J.elR].rotation.x=-1.05-up*1.25;
      B[J.head].rotation.x=-up*0.32;
    }else if(p.act==="warm"){
      B[J.shL].rotation.x=B[J.shR].rotation.x=-0.95+s1*0.06;
      B[J.shL].rotation.z=-0.18; B[J.shR].rotation.z=0.18;
      B[J.elL].rotation.x=B[J.elR].rotation.x=-0.55;
      B[J.spine].rotation.y=s2*0.05; B[J.head].rotation.x=0.10;
    }
    // somebody said something: they all laugh at it
    if(BACKWOODS.laugh>0){ const k=Math.min(1,BACKWOODS.laugh)*(0.6+0.4*Math.sin(p.seed*3));
      B[J.spine].rotation.x+=Math.abs(Math.sin(now*14+p.seed))*0.10*k; B[J.head].rotation.x-=0.18*k; }
    // and when you come in, they look round at you
    const px2=player.pos.x-p.x, pz2=player.pos.z-p.z, pd=Math.hypot(px2,pz2);
    p.look=Math.max(0, p.look-dt);
    const want=(pd<7.5 || p.look>0) ? 1 : 0;
    p.lk=(p.lk||0)+(want-(p.lk||0))*Math.min(1,dt*2.5);
    if(p.lk>0.01){
      let rel=Math.atan2(px2,pz2)-p.yaw; while(rel>Math.PI) rel-=Math.PI*2; while(rel<-Math.PI) rel+=Math.PI*2;
      B[J.head].rotation.y=B[J.head].rotation.y*(1-p.lk)+clamp(rel,-1.15,1.15)*p.lk;
      if(p.act!=="phone") B[J.head].rotation.x*=(1-p.lk*0.7);
    }
  }

  /* ---- what else is out there --------------------------------------------- */
  /* Things on trees (signs, paint, straps, a camera) are put on the trunk
     where it actually is: a trunk wanders and tapers, so its surface at a
     given height is found by casting rays at that tree's own geometry. */
  const _rc=new T.Raycaster(), _tm=new T.Mesh(new T.BufferGeometry(), new T.MeshBasicMaterial()), _te=new T.Euler();
  function trunkHit(t, h, ang){
    _tm.geometry=t.v.near; _te.set(t.rx, t.ry, t.rz, "YXZ");
    _tm.position.set(t.x,t.y,t.z); _tm.quaternion.setFromEuler(_te); _tm.scale.setScalar(t.s); _tm.updateMatrixWorld(true);
    const R=t.v.trunkR*t.s, dx=Math.sin(ang), dz=Math.cos(ang);
    _rc.set(V3(t.x+dx*(R+1.2), t.y+h, t.z+dz*(R+1.2)), V3(-dx,0,-dz)); _rc.far=R+2.0;
    for(const hit of _rc.intersectObject(_tm,false)){
      const hr=Math.hypot(hit.point.x-t.x, hit.point.z-t.z);
      if(hr<R*1.6+0.08) return hit.point.clone();
    }
    return V3(t.x+dx*R*0.85, t.y+h, t.z+dz*R*0.85);
  }
  // its axis and radius at height h, from four rays
  function trunkRing(t, h){
    const p=[0,Math.PI/2,Math.PI,Math.PI*1.5].map(a=>trunkHit(t,h,a));
    const x=(p[0].x+p[2].x+p[1].x+p[3].x)/4, z=(p[0].z+p[2].z+p[1].z+p[3].z)/4;
    const r=(Math.hypot(p[0].x-p[2].x,p[0].z-p[2].z)+Math.hypot(p[1].x-p[3].x,p[1].z-p[3].z))/4;
    return {x:x, z:z, r:r*1.09+0.006};                 // round a trunk of flats, out to its corners
  }
  // the nearest tree that stands (from the forest's own planting) to a spot
  // (a hemlock's sprays hang to the ground and hide whatever is on its
  // trunk, so things nailed or strapped to a tree go on a hardwood)
  const treeNear=(x,z,rmax,minR,any)=>{
    let best=null, bd=rmax*rmax;
    for(const it of FOREST.inst){
      if(!it.solid || !it.zone || it.v.trunkR*it.s<(minR||0.12)) continue;
      if(!any && it.v.sp!=="hard" && it.v.sp!=="beech") continue;
      const d=(it.x-x)*(it.x-x)+(it.z-z)*(it.z-z);
      if(d<bd){ bd=d; best=it; }
    }
    return best;
  };
  /* The property line, out past the camp: a yellow POSTED sign on a tree
     every few lengths and a stripe of purple paint on the trees between,
     which since 2019 a Pennsylvania landowner may use in place of signs. */
  const posted=signTex(240,300,(c,W,H)=>{
    c.fillStyle="#f2c418"; c.fillRect(0,0,W,H);
    c.fillStyle="#1a1a1a"; fitHwy(c,"POSTED",W*0.86,H*0.16,W/2,H*0.13);
    c.fillRect(W*0.08,H*0.235,W*0.84,H*0.012);
    fitText(c,"PRIVATE PROPERTY",W*0.84,H*0.085,W/2,H*0.31,"700");
    ["Hunting, Fishing, Trapping","or Trespassing for Any","Purpose is Strictly","Forbidden"].forEach((s,i)=>fitText(c,s,W*0.82,H*0.06,W/2,H*(0.42+i*0.075),"600"));
    c.fillRect(W*0.08,H*0.73,W*0.84,H*0.008);
    fitText(c,"Violators Will Be Prosecuted",W*0.84,H*0.055,W/2,H*0.80,"700");
    c.fillStyle="#3a3a3a"; fitText(c,"OWNER — R. KOCHER",W*0.6,H*0.04,W/2,H*0.90,"500");
    // weather: a rust run from the nail, sun-faded corners
    c.fillStyle="rgba(120,60,20,0.35)"; c.fillRect(W*0.49,H*0.03,W*0.02,H*0.12);
    c.fillStyle="rgba(255,255,255,0.18)"; c.fillRect(0,0,W*0.2,H*0.12);
  });
  const LINE_X=352;
  for(let z=-70, k=0; z<=190; z+=17, k++){
    const t=treeNear(LINE_X+(hash2(z,3)-0.5)*6, z, 7, 0.14);
    if(!t) continue;
    const a=-Math.PI/2+(hash2(z,9)-0.5)*0.4;                          // the face toward the camp (west)
    const hp=trunkHit(t, 1.75, a), sx=hp.x+Math.sin(a)*0.012, sz=hp.z+Math.cos(a)*0.012, sy=hp.y;
    if(k%2===0){
      signPanel(0.30, 0.375, posted, sx, sy, sz, a);
      if(k===4) addUse(sx+Math.sin(a)*1.0, sz+Math.cos(a)*1.0, t.y, "READ THE SIGN", ()=>toast(
        "POSTED · PRIVATE PROPERTY · NO TRESPASSING FOR ANY PURPOSE","#f2c418"), 1.6);
    }
    // purple paint: a band a hand wide at about chest height
    const ring=trunkRing(t, 1.15);
    push("paintm", new T.CylinderGeometry(ring.r+0.006, ring.r+0.008, 0.18, 12, 1, true), ring.x, t.y+1.15, ring.z, 0, "#6a2c8c");
  }
  /* An old stone wall, running north and south through the woods: the line
     a field had when this was a farm. Fieldstone heaped a knee high, fallen
     in places, broken where the path goes through. */
  { const pts=[{x:203,z:-70},{x:200,z:-30},{x:198,z:10},{x:199,z:50},{x:196,z:95},{x:198,z:140}];
    const W=smoothPath(pts, 0.55, true);
    let wall=null;
    for(let i=0;i<W.length;i++){
      const p=W[i], tp=distToPath(TRAIL,p.x,p.z).d;
      const gap = tp<3.2 || hash2(Math.floor(i/14),5)<0.18;      // the path, and where it has come down
      const g=gy(p.x,p.z), q=hash2(i*0.37,1.3);
      if(gap){
        if(q<0.35) push("rock", rockGeo(0.16+q*0.3, i), p.x+(q-0.5)*1.6, g+0.06, p.z, q*9, "#8b877c");
        if(wall){ addCol(wall.x0-0.45, wall.x1+0.45, wall.z0, wall.z1, wall.y-0.5, wall.y+0.62); wall=null; }
        continue;
      }
      for(let k=0;k<4;k++){
        const s=0.20+hash2(i,k*3.1)*0.18, ox=(hash2(i*1.7,k)-0.5)*(k<2?0.8:0.45), oy=k>=2?0.30+hash2(i,k)*0.14:0.10+hash2(k,i)*0.06;
        if(treeNear(p.x+ox, p.z, 0.7, 0, true)) continue;
        push("rock", rockGeo(s, 500+i*3+k), p.x+ox, g+oy, p.z+(hash2(k*7,i)-0.5)*0.5, hash2(i,k)*6,
             ["#8d897e","#7f7b70","#9c978b","#6f6b62","#858a7c"][(i+k)%5]);
      }
      if(!wall) wall={x0:p.x, x1:p.x, z0:p.z, z1:p.z, y:g};
      wall.x0=Math.min(wall.x0,p.x); wall.x1=Math.max(wall.x1,p.x); wall.z0=Math.min(wall.z0,p.z); wall.z1=Math.max(wall.z1,p.z);
      wall.y=Math.min(wall.y,g);
      if(wall.z1-wall.z0>4){ addCol(wall.x0-0.45, wall.x1+0.45, wall.z0, wall.z1, wall.y-0.5, wall.y+0.62); wall=null; }
    }
    addUse(199, 30, gy(199,30), "LOOK AT THE WALL", ()=>toast(
      "FIELDSTONE, HAND-PILED. THIS WAS SOMEBODY'S PASTURE, A HUNDRED YEARS BACK","#cfe0d4"), 2.2);
  }
  /* A ladder stand strapped to a big oak, north of the path: two rails up
     to a platform at fifteen feet, a padded seat, a shooting rail, ratchet
     straps round the trunk. Somebody hunts this ridge in November. */
  { const t=treeNear(232, 17, 9, 0.22) || treeNear(232, 17, 20, 0.15);
    if(t){
      const r=t.v.trunkR*t.s, dir=Math.atan2(t.x-226, t.z-34);               // its ladder toward the path
      const ox=-Math.sin(dir), oz=-Math.cos(dir), sx=Math.cos(dir), sz=-Math.sin(dir);
      const top=t.y+4.6, foot={x:t.x+ox*(r+1.25), z:t.z+oz*(r+1.25)}, fyy=gy(foot.x,foot.z);
      for(const e of [-0.22,0.22]){
        tube("metal", V3(foot.x+sx*e, fyy, foot.z+sz*e), V3(t.x+ox*(r+0.12)+sx*e, top, t.z+oz*(r+0.12)+sz*e), 0.022, 6, "#3e4436");
      }
      for(let k=1;k<15;k++){ const u=k/15;
        const cx=foot.x+(t.x+ox*(r+0.12)-foot.x)*u, cz=foot.z+(t.z+oz*(r+0.12)-foot.z)*u, cy=fyy+(top-fyy)*u;
        tube("metal", V3(cx-sx*0.22, cy, cz-sz*0.22), V3(cx+sx*0.22, cy, cz+sz*0.22), 0.012, 5, "#3e4436"); }
      // the platform, out from the trunk, its seat, the rail
      const px=t.x+ox*(r+0.38), pz=t.z+oz*(r+0.38), f=XF(px, pz, dir);
      lbx(f, "metal", 0.62, 0.04, 0.55, 0, top, 0, 0, "#3e4436");
      lbx(f, "paintm", 0.46, 0.07, 0.36, 0, top+0.48, 0.10, 0, "#4a4632");
      lbx(f, "paintm", 0.46, 0.34, 0.05, 0, top+0.70, 0.30, 0, "#4a4632");
      tube("metal", V3(f.x(-0.32,-0.30),top+0.80,f.z(-0.32,-0.30)), V3(f.x(0.32,-0.30),top+0.80,f.z(0.32,-0.30)), 0.016, 6, "#3e4436");
      for(const e of [-0.32,0.32]) tube("metal", V3(f.x(e,0.25),top,f.z(e,0.25)), V3(f.x(e,-0.30),top+0.80,f.z(e,-0.30)), 0.014, 5, "#3e4436");
      for(const hy of [top-0.1, top+0.75, t.y+2.4]){ const g2=trunkRing(t, hy-t.y);       // the ratchet straps
        push("paintm", new T.CylinderGeometry(g2.r+0.012,g2.r+0.012,0.05,14,1,true), g2.x, hy, g2.z, 0, "#d06a1a"); }
      addCol(foot.x-0.35, foot.x+0.35, foot.z-0.35, foot.z+0.35, fyy-0.5, fyy+2.0);
      addUse(foot.x+ox*0.9, foot.z+oz*0.9, fyy, "LOOK UP AT THE STAND", ()=>toast(
        "A LADDER STAND, STRAPPED TO THE OAK. THE STRAPS ARE NEW; THE SEAT ISN'T","#cfe0d4"), 1.8);
    }
  }
  /* A car somebody left out here half a century ago: a sedan's body (04b's
     builder, no wheels) sunk to its sills, rusted through, the glass gone
     grey, a maple growing up past the front fender. */
  { const cx=152, cz=34, y=gy(cx,cz), ry=0.9;
    const parts=vehicleParts(0, "#6b3a22", null, 0);
    const body=mergeEntries(parts.OP), col=body.attributes.color, pos=body.attributes.position;
    const c=new T.Color(), rust=[new T.Color(0x6a3418), new T.Color(0x8a4a20), new T.Color(0x4a2a18), new T.Color(0x5a5040)];
    for(let i=0;i<col.count;i++){
      const n=Terrain.fbm(pos.getX(i)*2.2+3, pos.getY(i)*2.2+pos.getZ(i)*1.7, 3);
      c.copy(rust[Math.floor(hash2(pos.getX(i)*7,pos.getZ(i)*5)*3)]).lerp(rust[3], smoothstep(0.55,0.75,n)*0.8);
      const k=0.50+0.32*n; col.setXYZ(i, c.r*k, c.g*k, c.b*k);
    }
    col.needsUpdate=true;
    const m=new T.Mesh(body, new T.MeshStandardMaterial({vertexColors:true, roughness:0.96, metalness:0.18}));
    m.position.set(cx, y-0.22, cz); m.rotation.set(0.05, ry, -0.06); m.castShadow=true; m.receiveShadow=true; scene.add(m);
    if(parts.GL.length){ const gl=new T.Mesh(mergeEntries(parts.GL), new T.MeshStandardMaterial({color:0x3a4038, roughness:0.6, metalness:0.1}));
      gl.position.copy(m.position); gl.rotation.copy(m.rotation); scene.add(gl); }
    const hx=Math.abs(Math.sin(ry))*2.5+Math.abs(Math.cos(ry))*0.95, hz=Math.abs(Math.cos(ry))*2.5+Math.abs(Math.sin(ry))*0.95;
    addCol(cx-hx, cx+hx, cz-hz, cz+hz, y-0.5, y+1.2);
    FOREST.plant("sapling", cx+Math.sin(ry)*2.9, cz+Math.cos(ry)*2.9, {scale:1.6, solid:false});
    for(let k=0;k<5;k++) FOREST.plant("fern", cx+(hash2(k,1)-0.5)*5, cz+(hash2(1,k)-0.5)*5, {scale:1.0+hash2(k,k)*0.5, solid:false});
    // a drum and a tyre gone into the ground beside it
    push("metal", new T.CylinderGeometry(0.29,0.29,0.88,14), cx-2.4, gy(cx-2.4,cz+1.2)+0.12, cz+1.2, 0.3, "#5c3a22", 1.35, 0.2);
    push("char", new T.TorusGeometry(0.30,0.10,8,16), cx+1.9, gy(cx+1.9,cz-1.6)+0.06, cz-1.6, 0.6, "#1d1d1d", -Math.PI/2+0.15, 0);
    addUse(cx-Math.cos(ry)*1.6, cz+Math.sin(ry)*1.6, y, "LOOK INSIDE THE CAR", ()=>toast(
      "A SEAT SPRING, A COFFEE CAN, A MOUSE'S NEST. THE ODOMETER SAYS 61,204","#cfe0d4"), 2.0);
  }
  /* A trail camera on a beech by the camp, pointed at the path where it comes
     in. At night its red light blinks when something walks past. */
  { const t=treeNear(268, 40, 10, 0.12);
    if(t){ const a=Math.atan2(278-t.x, 49-t.z), hp=trunkHit(t, 1.25, a), x=hp.x+Math.sin(a)*0.036, z=hp.z+Math.cos(a)*0.036, y=hp.y;
      push("paintm", boxGeo(0.11,0.15,0.07,0), x, y, z, a, "#4a4a36");
      const g2=trunkRing(t, 1.25); push("paintm", new T.CylinderGeometry(g2.r+0.008,g2.r+0.008,0.03,12,1,true), g2.x, y, g2.z, 0, "#2a2a22");
      const led=new T.Mesh(new T.SphereGeometry(0.006,6,4), new T.MeshBasicMaterial({color:0xff2010, toneMapped:false}));
      led.position.set(x+Math.sin(a)*0.037, y+0.05, z+Math.cos(a)*0.037); led.visible=false; scene.add(led);
      BACKWOODS.cam={led:led, x:x, z:z, t:0}; }
  }
  // everything put in the scene here but the path, which starts on the lawn
  BACKWOODS.deep=scene.children.slice(n0).filter(o=>o.name!=="trail");

  /* ---- what they leave behind -----------------------------------------------
     A different handful of their things every day: a hoodie over the log,
     a phone on the cooler still getting messages, a guitar, a skateboard,
     a sketchbook, one shoe... chosen when they go home in the small hours,
     and lying there until the next night. And a note, held down with a
     stone on the chopping block, for whoever comes by. (Not baked: these
     come and go. Out of updateDeep's list: their own visibility rules.) */
  { const L=BACKWOODS.leftItems, mat=c=>new T.MeshStandardMaterial({color:c, roughness:0.8});
    const item=(deg, r, build, line, season)=>{
      const p=at(deg, r), y=gy(p.x,p.z), g=new T.Group(); g.position.set(p.x, y, p.z); g.rotation.y=faceF(p.x,p.z)+rng()*0.6-0.3;
      build(g); g.visible=false; scene.add(g);
      const it={g:g, i:L.length, season:season, x:p.x, z:p.z};
      addUse(p.x, p.z, y, line[0], ()=>toast(line[1], "#cfe0d4"), 1.0, ()=>BACKWOODS.left.has(it.i));
      L.push(it); return it;
    };
    const onLog=(lg, e, build, line)=>{ const x=lg.x+lg.tx*e, z=lg.z+lg.tz*e, g=new T.Group();
      g.position.set(x, lg.y, z); g.rotation.y=Math.atan2(lg.tx, lg.tz); build(g); g.visible=false; scene.add(g);
      const it={g:g, i:L.length, x:x, z:z}; addUse(x, z, lg.y-0.4, line[0], ()=>toast(line[1], "#cfe0d4"), 1.0, ()=>BACKWOODS.left.has(it.i));
      L.push(it); return it; };
    // a hoodie thrown over the west log
    onLog(logW, 0.95, g=>{ const m=mat(["#7a2a3a","#3b3f45","#2b4a6a"][(rng()*3)|0]);
      const b=new T.Mesh(new T.BoxGeometry(0.46,0.05,0.40), m); b.position.y=0.03; g.add(b);
      for(const sd of [-1,1]){ const sl=new T.Mesh(new T.CylinderGeometry(0.055,0.05,0.42,8), m); sl.position.set(sd*0.2,-0.12,0.16); sl.rotation.x=0.9; g.add(sl); }
      const hd=new T.Mesh(new T.SphereGeometry(0.13,10,6,0,Math.PI*2,0,Math.PI/2), m); hd.position.set(0,0.0,-0.24); hd.scale.y=0.4; g.add(hd); },
      ["PICK UP THE HOODIE","A HOODIE. IT SMELLS LIKE THE FIRE. 'EDINBORO XC' ON THE BACK"]);
    // a phone face up on the cooler lid, still getting messages
    { const g=new T.Group(), x=coolP.x, z=coolP.z; g.position.set(x, coolY+0.415, z); g.rotation.y=coolR+0.5;
      g.add(new T.Mesh(new T.BoxGeometry(0.075,0.008,0.155), mat("#151515")));
      const scr=new T.Mesh(new T.PlaneGeometry(0.068,0.146), new T.MeshBasicMaterial({color:0x101418, toneMapped:false}));
      scr.rotation.x=-Math.PI/2; scr.position.y=0.0045; g.add(scr); g.visible=false; scene.add(g);
      const it={g:g, i:L.length, x:x, z:z, scr:scr}; BACKWOODS.phone=it;
      addUse(x, z, coolY, "LOOK AT THE PHONE", ()=>toast(["14 MESSAGES. 'WHERE IS MY PHONE' · 'IS IT AT THE FIRE' · 'PLEASE BE AT THE FIRE'","LOCKED. THE WALLPAPER IS A DOG IN SUNGLASSES","3% BATTERY. 'MOM' IS CALLING"][(Math.random()*3)|0],"#cfe0d4"), 1.0, ()=>BACKWOODS.left.has(it.i));
      L.push(it); }
    // a guitar leaned on the chopping block
    item(18, 4.4, g=>{ const w=mat("#b57a3a"), dk=mat("#3a2a1a");
      const b1=new T.Mesh(new T.SphereGeometry(0.17,14,10), w); b1.scale.set(1,1,0.32); b1.position.set(0,0.22,0); g.add(b1);
      const b2=new T.Mesh(new T.SphereGeometry(0.13,14,10), w); b2.scale.set(1,1,0.32); b2.position.set(0,0.44,0); g.add(b2);
      const hole=new T.Mesh(new T.CircleGeometry(0.045,12), dk); hole.position.set(0,0.36,0.045); g.add(hole);
      const nk=new T.Mesh(new T.BoxGeometry(0.05,0.46,0.03), dk); nk.position.set(0,0.78,0); g.add(nk);
      const hd=new T.Mesh(new T.BoxGeometry(0.07,0.13,0.03), dk); hd.position.set(0,1.06,0); g.add(hd);
      g.rotation.x=-0.28; }, ["LOOK AT THE GUITAR","AN OLD ACOUSTIC. THE LOW E IS MISSING. SOMEBODY CARVED 'J+T' IN THE BACK"]);
    // a skateboard upside down in the leaves
    item(250, 3.4, g=>{ const d=new T.Mesh(new T.BoxGeometry(0.21,0.018,0.80), mat("#1d1d1f")); d.position.y=0.10; g.add(d);
      for(const [x,z] of [[-0.07,0.26],[0.07,0.26],[-0.07,-0.26],[0.07,-0.26]]){ const w=new T.Mesh(new T.CylinderGeometry(0.027,0.027,0.035,10), mat("#e8e2c8"));
        w.rotation.z=Math.PI/2; w.position.set(x,0.135,z); g.add(w); }
      const gfx=new T.Mesh(new T.PlaneGeometry(0.17,0.5), mat("#c8202a")); gfx.rotation.x=-Math.PI/2; gfx.position.y=0.11; g.add(gfx); },
      ["LOOK AT THE SKATEBOARD","A SKATEBOARD. NOWHERE TO RIDE IT FOR MILES"]);
    // a sketchbook open on the north log
    onLog(logNE, -0.95, g=>{ for(const sd of [-1,1]){ const pg=new T.Mesh(new T.BoxGeometry(0.15,0.008,0.21), mat("#f2efe6"));
        pg.position.set(sd*0.077,0.006,0); pg.rotation.z=sd*0.06; g.add(pg); }
      const sk=new T.Mesh(new T.PlaneGeometry(0.11,0.15), mat("#6a6a6a")); sk.rotation.x=-Math.PI/2; sk.position.set(0.08,0.012,0); g.add(sk); },
      ["LOOK AT THE SKETCHBOOK","A SKETCHBOOK. TRUCKS, MOSTLY. ONE OF THE REST STOP AT NIGHT, AND IT'S GOOD"]);
    // one shoe
    item(150, 3.1, g=>{ const m=mat("#e8e6de"); const b=new T.Mesh(new T.BoxGeometry(0.10,0.07,0.27), m); b.position.y=0.035; g.add(b);
      const t=new T.Mesh(new T.BoxGeometry(0.10,0.05,0.12), m); t.position.set(0,0.08,-0.07); g.add(t); g.rotation.z=0.5; },
      ["LOOK AT THE SHOE","ONE SNEAKER. JUST THE ONE. HOW DO YOU GO HOME IN ONE SHOE"]);
    // a pizza box
    item(70, 3.3, g=>{ const b=new T.Mesh(new T.BoxGeometry(0.42,0.05,0.42), mat("#c8b28a")); b.position.y=0.025; g.add(b);
      const t=new T.Mesh(new T.PlaneGeometry(0.30,0.20), mat("#b3151b")); t.rotation.x=-Math.PI/2; t.position.y=0.052; g.add(t); },
      ["OPEN THE PIZZA BOX","ONE SLICE LEFT, AND IT'S THE ONE WITH THE OLIVES"]);
    // a frisbee
    item(300, 4.1, g=>{ const f=new T.Mesh(new T.CylinderGeometry(0.13,0.12,0.025,18), mat("#f28a1a")); f.position.y=0.013; g.add(f); },
      ["PICK UP THE FRISBEE","A FRISBEE WITH TEETH MARKS. SOMEBODY HAS A DOG"]);
    // a plaid blanket folded on the cooler's end
    item(130, 2.9, g=>{ const b=new T.Mesh(new T.BoxGeometry(0.50,0.10,0.38), mat("#8a2a24")); b.position.y=0.05; g.add(b);
      for(let k=0;k<3;k++){ const st=new T.Mesh(new T.BoxGeometry(0.505,0.104,0.03), mat("#2a2a2a")); st.position.set(0,0.05,-0.12+k*0.12); g.add(st); } },
      ["LOOK AT THE BLANKET","A FLANNEL BLANKET, FOLDED. SOMEBODY'S MOM IS GOING TO ASK"]);
    // a lantern, left on
    { const it=item(338, 3.2, g=>{ const b=new T.Mesh(new T.CylinderGeometry(0.07,0.08,0.05,12), mat("#2b4a2a")); b.position.y=0.025; g.add(b);
        const gl=new T.Mesh(new T.CylinderGeometry(0.06,0.06,0.14,12), new T.MeshBasicMaterial({color:0xfff0c8, toneMapped:false})); gl.position.y=0.12; g.add(gl);
        const tp=new T.Mesh(new T.CylinderGeometry(0.05,0.07,0.04,12), mat("#2b4a2a")); tp.position.y=0.21; g.add(tp);
        const h=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, color:0xffe2a0, transparent:true, opacity:0.6, depthWrite:false, blending:T.AdditiveBlending, toneMapped:false}));
        h.scale.set(0.9,0.9,1); h.position.y=0.12; g.add(h); },
      ["LOOK AT THE LANTERN","A CAMP LANTERN, STILL ON. THE BATTERY'S NEARLY GONE"]); BACKWOODS.lantern=it; }
    // a ball
    item(230, 4.6, g=>{ const b=new T.Mesh(new T.SphereGeometry(0.11,14,10), mat("#f2f0ea")); b.position.y=0.11; g.add(b);
      for(let k=0;k<5;k++){ const pt=new T.Mesh(new T.CircleGeometry(0.035,5), mat("#1a1a1a")); const a=k*1.256;
        pt.position.set(Math.cos(a)*0.104, 0.11+Math.sin(a)*0.05, Math.sin(a)*0.06); pt.lookAt(pt.position.clone().multiplyScalar(2).setY(pt.position.y*2-0.11)); g.add(pt); } },
      ["KICK THE BALL","YOU KICK IT INTO THE WOODS. THEY'LL FIND IT"]);
    // a thermos
    item(95, 2.7, g=>{ const t=new T.Mesh(new T.CylinderGeometry(0.04,0.04,0.26,12), mat("#3a6a3a")); t.position.y=0.13; g.add(t);
      const c=new T.Mesh(new T.CylinderGeometry(0.043,0.043,0.06,12), mat("#9a9a9a")); c.position.y=0.29; g.add(c); },
      ["OPEN THE THERMOS","HOT CHOCOLATE, STONE COLD. A LITTLE SOMETHING ELSE IN IT TOO"]);
    // summer: a jar of fireflies with holes in the lid; October: a jack-o'-lantern
    { const it=item(205, 3.3, g=>{ const j=new T.Mesh(new T.CylinderGeometry(0.06,0.06,0.15,12), new T.MeshStandardMaterial({color:0xdfeee8, transparent:true, opacity:0.35, roughness:0.1}));
        j.position.y=0.075; g.add(j);
        const lid=new T.Mesh(new T.CylinderGeometry(0.062,0.062,0.02,12), mat("#b8b8b8")); lid.position.y=0.16; g.add(lid);
        const h=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, color:0xc8ff60, transparent:true, opacity:0, depthWrite:false, blending:T.AdditiveBlending, toneMapped:false}));
        h.scale.set(0.25,0.25,1); h.position.y=0.08; g.add(h); g.userData.glow=h; },
      ["LOOK AT THE JAR","A JAR OF FIREFLIES, HOLES PUNCHED IN THE LID. YOU LET THEM GO"], "summer"); BACKWOODS.jar=it; }
    { const it=item(205, 3.3, g=>{ const p=new T.Mesh(new T.SphereGeometry(0.17,14,10), mat("#e0701a")); p.scale.y=0.82; p.position.y=0.14; g.add(p);
        const st=new T.Mesh(new T.CylinderGeometry(0.018,0.022,0.06,6), mat("#4a5a2a")); st.position.y=0.29; g.add(st);
        const face=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, color:0xffa030, transparent:true, opacity:0, depthWrite:false, blending:T.AdditiveBlending, toneMapped:false}));
        face.scale.set(0.5,0.5,1); face.position.y=0.15; g.add(face); g.userData.glow=face; },
      ["LOOK AT THE PUMPKIN","A JACK-O'-LANTERN WITH THE CANDLE STILL GOING. IT'S GOT TEETH"], "autumn"); BACKWOODS.pumpkin=it; }
    // and the note, under a stone on the chopping block
    { const b=at(14, 4.9), by=gy(b.x,b.z)+0.455, c=cvs(256,192), x2=c.getContext("2d"), tex=setSRGB(new T.CanvasTexture(c));
      const g=new T.Group(); g.position.set(b.x-0.05, by, b.z+0.04); g.rotation.y=faceF(b.x,b.z)+Math.PI;
      const pg=new T.Mesh(new T.PlaneGeometry(0.20,0.15), new T.MeshStandardMaterial({map:tex, roughness:0.9})); pg.rotation.x=-Math.PI/2; pg.rotation.z=0.2; g.add(pg);
      const st=new T.Mesh(new T.SphereGeometry(0.035,8,6), mat("#7a776e")); st.scale.y=0.55; st.position.set(0.06,0.012,-0.04); g.add(st);
      g.visible=false; scene.add(g);
      const it={g:g, i:L.length, x:b.x, z:b.z, c:c, tex:tex, note:true}; L.push(it); BACKWOODS.note=it;
      addUse(b.x, b.z+0.5, by-0.45, "READ THE NOTE", ()=>toast("A NOTE: '"+BACKWOODS.noteText+"'", "#f2efe6"), 1.1, ()=>BACKWOODS.left.has(it.i)); }
  }
  /* ---- their tape, out to the old house -------------------------------------
     The kids' own trail: orange flagging tied round a trunk every twenty
     metres or so from the fire to the house, the way a surveyor marks one. */
  { const A={x:F.x+7, z:F.z+9}, B={x:HOMESTEAD.x-5, z:HOMESTEAD.z-15}, L=Math.hypot(B.x-A.x, B.z-A.z);
    for(let s2=0; s2<=L; s2+=19){
      const t0=s2/L, px=A.x+(B.x-A.x)*t0+Math.sin(s2*0.13)*3, pz=A.z+(B.z-A.z)*t0;
      const tr=treeNear(px, pz, 6, 0.08, true); if(!tr) continue;
      const g2=trunkRing(tr, 1.75), y=tr.y+1.75, a=Math.atan2(px-tr.x, pz-tr.z);
      push("paintm", new T.CylinderGeometry(g2.r+0.008,g2.r+0.008,0.035,10,1,true), g2.x, y, g2.z, 0, "#ff5a14");
      push("paintm", boxGeo(0.03, 0.40, 0.004, 0), g2.x+Math.sin(a)*(g2.r+0.012), y-0.2, g2.z+Math.cos(a)*(g2.r+0.012), a, "#ff5a14", 0, 0.18);
    } }
  /* Flagging tape on the branches along the path, the kind surveyors use,
     tied there by whoever found the way the first time. */
  for(let s=34; s<TRAIL.length*2-10; s+=31){
    const i=Math.min(TRAIL.length-1, Math.round(s/2)), p=TRAIL[i];
    const t=treeNear(p.x, p.z, 4.5, 0.08);
    if(!t) continue;
    const a=Math.atan2(p.x-t.x, p.z-t.z), g2=trunkRing(t, 1.9), y=t.y+1.9;
    const x=g2.x+Math.sin(a)*(g2.r+0.012), z=g2.z+Math.cos(a)*(g2.r+0.012);
    push("paintm", new T.CylinderGeometry(g2.r+0.01,g2.r+0.01,0.03,10,1,true), g2.x, y, g2.z, 0, "#ff6a1a");
    push("paintm", boxGeo(0.025, 0.32, 0.004, 0), x, y-0.16, z, a, "#ff6a1a", 0, 0.12);
  }
})();

/* ---- from the site, none of it is drawn ------------------------------------
   At eye height anywhere west of x 60 there are well over a hundred metres
   of woods between you and the back woods: their baked tiles (x past 192)
   and the things this file put in the scene are not drawn from there; the
   forest's own chunks are handled the same way in 07. */
let _deepShown=true;
function updateDeep(cam){
  const show=!(cam.x<60 && cam.y<25);
  if(show===_deepShown) return;
  _deepShown=show;
  if(!BACKWOODS.tiles) BACKWOODS.tiles=BAKED.filter(m=>{          // "bucket:<name>:<ix>:<iz>[:flat]"
    const p=m.name.split(":"), ix=+p[p.length-(p[p.length-1]==="flat"?3:2)]; return ix>=2; });
  for(const m of BACKWOODS.tiles) m.visible=show;
  for(const o of BACKWOODS.deep) o.visible=show;
  _leftShow();
}

/* ---- the kids come and go ------------------------------------------------
   They are out at the fire from about noon until three in the morning.
   They come and go when you are not right there to see them do it, and
   when they go they leave a few things behind: a fresh handful every day. */
const _NOTES_KIDS=["DONT PUT OUT THE FIRE — BACK TONIGHT","WHO TOOK THE MARSHMALLOWS. NOT FUNNY.","IF U FIND A RED HOODIE ITS MINE — K",
  "THE CAR BACK THERE IS HAUNTED. WE CHECKED.","PARTY FRIDAY 9. BRING ICE","TY WAS HERE. JESS TOO.","DEAR REST STOP GUY: SORRY ABOUT THE CANS",
  "DONT TELL ANYONE ABOUT THIS PLACE","WE SAW A BEAR ON THE TRAIL CAM!!!","OUT OF ROOT BEER. AGAIN.","CLASS OF 27 FOREVER",
  "LEAVE THE CHAIR. ITS THE GOOD ONE"];
function _pickLeftovers(seed){
  const BW=BACKWOODS, r=_trng(seed*7919+3), aut=FOREST.isAutumn();
  BW.left.clear();
  const pool=BW.leftItems.filter(it=>!it.note && (!it.season || (it.season==="autumn")===aut));
  for(let i=pool.length-1;i>0;i--){ const j=(r()*(i+1))|0; [pool[i],pool[j]]=[pool[j],pool[i]]; }
  const n=4+((r()*3)|0);
  for(let k=0;k<n && k<pool.length;k++) BW.left.add(pool[k].i);
  if(BW.note){ BW.left.add(BW.note.i);
    BW.noteText=_NOTES_KIDS[(seed*5+((r()*_NOTES_KIDS.length)|0))%_NOTES_KIDS.length];
    const c=BW.note.c, x=c.getContext("2d"); x.fillStyle="#f6f3e8"; x.fillRect(0,0,256,192);
    x.strokeStyle="#a8c0dc"; for(let k=0;k<7;k++){ x.beginPath(); x.moveTo(0,40+k*22); x.lineTo(256,40+k*22); x.stroke(); }
    x.fillStyle="#2a2a6a"; const words=BW.noteText.split(" "); let line="", y=56;
    x.font="600 22px 'Comic Sans MS','Segoe Print',cursive"; x.textAlign="left"; x.textBaseline="alphabetic";
    for(const w of words){ const t=line?line+" "+w:w; if(x.measureText(t).width>230){ x.fillText(line,12,y); y+=24; line=w; } else line=t; }
    x.fillText(line,12,y); BW.note.tex.needsUpdate=true; }
  _leftShow();
}
function _leftShow(){
  const BW=BACKWOODS;
  for(const it of BW.leftItems) it.g.visible=_deepShown && BW.left.has(it.i);
}
function _campPresence(d){
  const BW=BACKWOODS, h=DayNight.state.hour, want=h>=12 || h<3;
  if(want===BW.present || d<45) return;
  BW.present=want;
  for(const t of BW.teens){ const i=COL_DYN.indexOf(t.col); if(want && i<0) COL_DYN.push(t.col); if(!want && i>=0) COL_DYN.splice(i,1); }
  if(!want) _pickLeftovers(++BW.leftSeed+DayNight.state.day*31);
}
_pickLeftovers(1);

/* ---- every frame --------------------------------------------------------- */
const _cp=new T.Vector3();
function updateBackwoods(dt, now, dark){
  const BW=BACKWOODS, F=BW.F, cam=camera.position;
  const d=Math.hypot(cam.x-F.x, cam.z-F.z);
  // the light breathes and jumps; the halo and the coals with it
  const n=0.5+0.5*Math.sin(now*7.3)*Math.sin(now*3.1+1.3)+0.25*Math.sin(now*17.9);
  const fl=0.78+0.22*clamp(n,0,1);
  // the kids come and go (and leave things behind when they go)
  _campPresence(d);
  const lo=BW.present ? 1 : 0.32;                   // left to burn down: embers and a little flame
  BW.burn=(BW.burn===undefined?lo:BW.burn)+(lo-(BW.burn===undefined?lo:BW.burn))*Math.min(1,dt*0.3);
  BW.light.intensity=1.7*fl*BW.burn;
  BW.halo.material.opacity=(0.18+0.42*dark)*fl*(0.4+0.6*BW.burn);
  for(const m of BW.flames) m.scale.set(0.55+0.45*BW.burn, 0.35+0.65*BW.burn, 1);
  BW.coals.material.opacity=0.65+0.35*Math.sin(now*2.1)*Math.sin(now*0.7);
  if(d>220) return;
  // the flames face you
  for(let i=0;i<BW.flames.length;i++){
    const m=BW.flames[i];
    m.rotation.y=Math.atan2(cam.x-m.position.x, cam.z-m.position.z)+(i-1)*0.5;
    m.material.uniforms.time.value=now+i*3.7;
    m.material.uniforms.k.value=0.85+0.15*fl;
  }
  // sparks: a steady few, and now and then a log pops and throws a handful
  BW.sparkT-=dt; BW.pop-=dt;
  if(BW.sparkT<=0){ BW.sparkT=(0.06+Math.random()*0.12)/BW.burn;
    SPARKS.emit(F.x+(Math.random()-0.5)*0.4, F.y+0.35, F.z+(Math.random()-0.5)*0.4,
      (Math.random()-0.5)*0.5, 1.4+Math.random()*1.6, (Math.random()-0.5)*0.5, 0.035+Math.random()*0.025, 0.9+Math.random()*1.4); }
  if(BW.pop<=0){ BW.pop=(2+Math.random()*7)/BW.burn;
    for(let k=0;k<6+Math.random()*8;k++) SPARKS.emit(F.x+(Math.random()-0.5)*0.3, F.y+0.3, F.z+(Math.random()-0.5)*0.3,
      (Math.random()-0.5)*1.4, 2.0+Math.random()*2.4, (Math.random()-0.5)*1.4, 0.04+Math.random()*0.03, 1.0+Math.random()*1.2);
    if(typeof AUDIO!=="undefined" && AUDIO.campPop) AUDIO.campPop(); }
  // smoke off the top of it, lit from under by the fire for a while
  BW.smokeT-=dt;
  if(BW.smokeT<=0 && d<160){ BW.smokeT=(0.10+Math.random()*0.06)/(0.5+0.5*BW.burn);
    PUFFS.emit(F.x+(Math.random()-0.5)*0.3, F.y+1.05, F.z+(Math.random()-0.5)*0.3, (Math.random()-0.5)*0.12, 0.7+Math.random()*0.3,
      (Math.random()-0.5)*0.12, 0.22, 1.5+Math.random()*0.8, 5.5+Math.random()*2.5, 0.20, 0.62, 0.9*dark+0.2); }
  // the speaker's light pulses with the beat
  if(BW.led) BW.led.material.color.setRGB(0.15, 0.4+0.4*(Math.sin(now*9.2)>0?1:0), 1.0);
  // somebody laughs now and then, and they all go
  BW.laugh=Math.max(0,(BW.laugh||0)-dt);
  BW.laughT=(BW.laughT===undefined?8:BW.laughT)-dt;
  if(BW.laughT<=0){ BW.laughT=9+Math.random()*22;
    if(d<90 && BW.present){ BW.laugh=1.6; if(typeof AUDIO!=="undefined" && AUDIO.campLaugh) AUDIO.campLaugh(); } }
  // the phone on the cooler lights up with another message now and then;
  // the lantern, the jar and the pumpkin glow after dark
  if(BW.phone && BW.left.has(BW.phone.i)){ const lit=((now*0.13)%1)<0.08; BW.phone.scr.material.color.setHex(lit?0x9fc8ff:0x101418); }
  for(const it of [BW.jar, BW.pumpkin]) if(it && it.g.visible) it.g.userData.glow.material.opacity=(0.15+0.75*dark)*(it===BW.jar?0.5+0.5*Math.sin(now*3.1)*Math.sin(now*1.7):0.85+0.15*Math.sin(now*9));
  if(BW.lantern && BW.lantern.g.visible) BW.lantern.g.children[3].material.opacity=0.2+0.6*dark;
  // the trail camera's light, when somebody walks past it in the dark
  if(BW.cam){ const C=BW.cam, pd=Math.hypot(player.pos.x-C.x, player.pos.z-C.z);
    if(pd<9 && dark>0.4) C.t=4;
    C.t=Math.max(0, C.t-dt); C.led.visible=C.t>0 && Math.sin(now*12)>0; }
}
