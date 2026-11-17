"use strict";
/* REST AREA · 18y-map.js
   the map: the whole world from overhead, and the underworld of its
   basements, full screen on B
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18y · THE MAP
   Drawn from what the world is made of, not photographed from the air
   (a camera up there would meet every distance-based thing the game does
   to save work: the trees thinning, the culling, the haze). So:
   - the ground: its heights sampled every 8 m and shaded as if lit from
     the north-west, a contour every 10 m; the woods where the clearings
     are not (Terrain.clearDist), the lake where its shore says (lakeSD);
   - the fields, each in its crop's colour (EDIN.fields);
   - every paved cell the bake sorted (15's GROUND_KIND, 1.5 m): paving
     grey, gravel buff, laid on crisply over the shading;
   - the buildings: every collider that stands two metres and more and is
     not a fence, a post or a trunk, filled as a roof;
   - names from the warp list (18l), and you, an arrow the way you face.
   The UNDERWORLD is the same world faded back, with everything below the
   ground over it: the buried volumes (06's BURIED), the floors under the
   ground (SURF), the walls down there (COL), and the names of the rooms.
   Both are drawn once, in slices of a few milliseconds a frame after the
   world is built, into canvases of their own; opening the map then costs
   nothing but showing them. While it is open: drag or the arrows to move
   about, the wheel or + / − to zoom, U or Tab for the other map, Space to
   come back to where you are, B or Esc to close.
   ---------------------------------------------------------------------- */
const MAP={open:false, layer:0, ready:false, prog:0, zoom:1, cx:0, cz:0, el:null, cv:null, x:null, surf:null, under:null, B:null, PX:2};
(function worldMap(){
  // the ground it covers: the interstate's length, Edinboro's farms and both its roads' ends, the lake
  const B={x0:-1720, x1:2300, z0:Math.min(-4260, HWY.zN-40), z1:Math.max(1860, HWY.zS+40)}; MAP.B=B;
  const PX=MAP.PX, W=Math.ceil((B.x1-B.x0)/PX), H=Math.ceil((B.z1-B.z0)/PX);
  const mk=()=>{ const c=document.createElement("canvas"); c.width=W; c.height=H; return c; };
  const toX=x=>(x-B.x0)/PX, toY=z=>(z-B.z0)/PX;

  /* ---- the screen ---- */
  const st=document.createElement("style");
  st.textContent="#wmap{position:fixed;inset:0;z-index:40;display:none;background:#10140f;cursor:grab}#wmap.show{display:block}#wmap canvas{position:absolute;inset:0;width:100%;height:100%}"+
    "#wmap .bar{position:absolute;left:14px;top:12px;display:flex;gap:8px;align-items:center;font-family:'Oswald',sans-serif;letter-spacing:.14em;color:#e8ecef;font-size:15px}"+
    "#wmap .tab{padding:4px 12px;border:1px solid #4a5a4e;border-radius:4px;background:rgba(10,14,12,.75);cursor:pointer}#wmap .tab.on{background:#f4c430;color:#1a1a1a;border-color:#f4c430}"+
    "#wmap .keys{position:absolute;left:14px;bottom:12px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#cfd6cf;background:rgba(10,14,12,.75);padding:6px 10px;border-radius:4px}"+
    "#wmap .keys b{color:#f4c430;font-weight:500}#wmap .prog{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family:'Oswald',sans-serif;color:#e8ecef;letter-spacing:.2em}";
  document.head.appendChild(st);
  const el=document.createElement("div"); el.id="wmap";
  el.innerHTML='<canvas></canvas><div class="bar"><span class="tab on" data-l="0">THE WORLD</span><span class="tab" data-l="1">THE UNDERWORLD</span></div>'+
    '<div class="keys"><b>DRAG</b> or <b>ARROWS</b> move · <b>WHEEL</b> or <b>+ −</b> zoom · <b>U</b> / <b>TAB</b> the other map · <b>SPACE</b> where you are · <b>B</b> / <b>ESC</b> close</div><div class="prog"></div>';
  document.body.appendChild(el); MAP.el=el; MAP.cv=el.querySelector("canvas"); MAP.x=MAP.cv.getContext("2d");
  el.querySelectorAll(".tab").forEach(t=>t.addEventListener("click", ()=>{ MAP.layer=+t.dataset.l; MAP.tabs(); }));
  MAP.tabs=()=>el.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on", +t.dataset.l===MAP.layer));

  /* ---- drawing it, a slice at a time (no slice much over a few milliseconds, so the game never hitches) ---- */
  const G=6, GW=Math.ceil((B.x1-B.x0)/G)+1, GH=Math.ceil((B.z1-B.z0)/G)+1;
  // the ground's height, how far into the woods (the clearings' signed distance) and how far out over the lake, every 6 m
  const hgt=new Float32Array(GW*GH), wd=new Float32Array(GW*GH), lk=new Float32Array(GW*GH);
  let row=0, step=0, S=null, sx_=null, lo=null, img=null, sRow=0, cells=null, ci=0, cols=null, ki=0;
  const jobs=[], slice=()=>{ const t0=performance.now(); return ()=>performance.now()-t0<4; };
  const lerp=(a, b, t)=>a+(b-a)*t;
  const sm=(a, b, v)=>{ const t=Math.max(0, Math.min(1, (v-a)/(b-a))); return t*t*(3-2*t); };
  // 1. sample the ground
  jobs.push(()=>{ const go=slice();
    while(row<GH && go()){ const z=B.z0+row*G;
      for(let i=0;i<GW;i++){ const x=B.x0+i*G, k=row*GW+i; hgt[k]=Terrain.groundAt(x, z); wd[k]=Terrain.clearDist(x, z);
        lk[k]=(typeof EAST!=="undefined" && Terrain.lakeSD) ? Terrain.lakeSD(x, z) : 99; }
      row++; }
    MAP.prog=0.6*row/GH; return row>=GH; });
  // 2. shade it into a picture a sample to a pixel: grass, woods eased in over their edge, water by its depth; light from the north-west
  jobs.push(()=>{ if(!lo){ lo=document.createElement("canvas"); lo.width=GW; lo.height=GH; img=lo.getContext("2d").createImageData(GW, GH); }
    const go=slice(), LX=-0.55, LY=0.65, LZ=-0.52, Ll=Math.hypot(LX, LY, LZ);
    while(sRow<GH && go()){ const j=sRow++;
      for(let i=0;i<GW;i++){ const k=j*GW+i, h=hgt[k];
        const hx=hgt[j*GW+Math.min(GW-1, i+1)]-hgt[j*GW+Math.max(0, i-1)], hz=hgt[Math.min(GH-1, j+1)*GW+i]-hgt[Math.max(0, j-1)*GW+i];
        const nx=-hx/(2*G), nz=-hz/(2*G), nl=Math.hypot(nx, 1, nz), sh=Math.max(0, (nx*LX+LY+nz*LZ)/(nl*Ll)), f=0.6+0.55*sh;
        const w=sm(0, 9, wd[k]), q=sm(1.5, -1.5, lk[k]), deep=sm(0, -60, lk[k]);
        let r=lerp(132, 50, w)*f, g=lerp(152, 82, w)*f, bl=lerp(98, 46, w)*f;
        r=lerp(r, lerp(86, 46, deep), q); g=lerp(g, lerp(128, 88, deep), q); bl=lerp(bl, lerp(150, 120, deep), q);
        // a contour every ten metres on the land, faint
        if(q<0.5){ const a=Math.floor(h/10); if(a!==Math.floor(hgt[j*GW+Math.min(GW-1, i+1)]/10) || a!==Math.floor(hgt[Math.min(GH-1, j+1)*GW+i]/10)){ r*=0.9; g*=0.9; bl*=0.9; } }
        const o=k*4; img.data[o]=r; img.data[o+1]=g; img.data[o+2]=bl; img.data[o+3]=255; } }
    MAP.prog=0.6+0.15*sRow/GH; if(sRow<GH) return false;
    lo.getContext("2d").putImageData(img, 0, 0); S=MAP.surf=mk(); sx_=S.getContext("2d"); sx_.imageSmoothingEnabled=true; sx_.imageSmoothingQuality="high";
    sx_.drawImage(lo, 0, 0, GW, GH, 0, 0, GW*G/PX, GH*G/PX); return true; });
  // 3. the fields in their crops' colours, rows ruled across; the creek
  jobs.push(()=>{ const x=sx_, CROP={corn:"#7e8e3a", soy:"#5e7e36", hay:"#a8a060", pasture:"#78944e", grape:"#566638", sunflower:"#c0a030", xmas:"#38563a", pumpkin:"#a07a3a"};
    if(typeof EDIN!=="undefined" && EDIN.fields) for(const F of EDIN.fields){ x.fillStyle=CROP[F.crop]||"#8a9a5a"; x.globalAlpha=0.88; x.fillRect(toX(F.x0), toY(F.z0), (F.x1-F.x0)/PX, (F.z1-F.z0)/PX);
      x.globalAlpha=0.22; x.fillStyle="#2a3018"; for(let xx=F.x0+3; xx<F.x1; xx+=6) x.fillRect(toX(xx), toY(F.z0), 0.8, (F.z1-F.z0)/PX); x.globalAlpha=1; }
    if(typeof CREEK!=="undefined"){ x.strokeStyle="#4e82aa"; x.lineWidth=2; x.lineJoin="round"; x.beginPath(); CREEK.forEach((p, i)=>i ? x.lineTo(toX(p.x), toY(p.z)) : x.moveTo(toX(p.x), toY(p.z))); x.stroke(); }
    cells=[]; if(typeof GROUND_KIND!=="undefined" && GROUND_KIND.each) GROUND_KIND.each((cx, cz, v)=>cells.push(cx, cz, v)); return true; });
  // 4. the paving, cell by cell (a cell is 1.5 m): paving grey, gravel buff
  jobs.push(()=>{ const x=sx_, cs=(typeof GROUND_KIND!=="undefined" ? GROUND_KIND.CELL : 1.5)/PX+0.35, go=slice();
    while(ci<cells.length && go()){ for(let n=0;n<3000 && ci<cells.length;n++, ci+=3){ x.fillStyle=cells[ci+2]===1 ? "#5c5c5a" : "#b4a684"; x.fillRect(toX(cells[ci]), toY(cells[ci+1]), cs, cs); } }
    MAP.prog=0.75+0.12*ci/Math.max(1, cells.length); return ci>=cells.length; });
  // 5. the buildings: every indoor room at the ground filled as a roof, and every wall two metres and more drawn over it
  jobs.push(()=>{ const x=sx_;
    x.fillStyle="#a89478"; for(const Z of ZONES){ if(!Z.indoor) continue; const g=Terrain.groundAt((Z.x0+Z.x1)/2, (Z.z0+Z.z1)/2); if(Z.y1<g+0.5 || Z.y0>g+8) continue;
      if(Z.ob){ const o=Z.ob; x.save(); x.translate(toX(o.cx), toY(o.cz)); x.rotate(Math.atan2(-o.s, o.c)); x.fillRect(-o.hx/PX, -o.hz/PX, 2*o.hx/PX, 2*o.hz/PX); x.restore(); }
      else x.fillRect(toX(Z.x0), toY(Z.z0), (Z.x1-Z.x0)/PX, (Z.z1-Z.z0)/PX); }
    cols=[]; ki=0; return true; });
  // the walls worth drawing: two metres and more, standing on the ground, and a metre and more long (not a tree's trunk)
  let fi=0; jobs.push(()=>{ const go=slice(); while(fi<COL.length && go()){ for(let n=0;n<4000 && fi<COL.length;n++){ const c=COL[fi++]; if(c.y0<=-39 && c.y1>=299) continue;
      const w=c.x1-c.x0, d=c.z1-c.z0, L=c.ob ? 2*Math.max(c.ob.hx, c.ob.hz) : Math.max(w, d); if(L<1.2 || c.y1-c.y0<2.0) continue;
      const g=Terrain.groundAt((c.x0+c.x1)/2, (c.z0+c.z1)/2); if(c.y1>g+2.2 && c.y0<g+1.2) cols.push(c); } } return fi>=COL.length; });
  jobs.push(()=>{ const x=sx_, go=slice(); x.fillStyle="#3e3228";
    while(ki<cols.length && go()){ for(let n=0;n<2000 && ki<cols.length;n++, ki++){ const c=cols[ki];
      if(c.ob){ const o=c.ob; x.save(); x.translate(toX(o.cx), toY(o.cz)); x.rotate(Math.atan2(-o.s, o.c)); x.fillRect(-o.hx/PX, -o.hz/PX, Math.max(0.8, 2*o.hx/PX), Math.max(0.8, 2*o.hz/PX)); x.restore(); }
      else x.fillRect(toX(c.x0), toY(c.z0), Math.max(0.8, (c.x1-c.x0)/PX), Math.max(0.8, (c.z1-c.z0)/PX)); } }
    MAP.prog=0.87+0.08*ki/Math.max(1, cols.length); return ki>=cols.length; });
  // 6. the underworld: the surface faded back; each room below ground filled warm, its floors, its walls; names from its rooms
  jobs.push(()=>{
    const below=(x0, x1, z0, z1, y)=>y<Terrain.groundAt((x0+x1)/2, (z0+z1)/2)-1.0;
    const V=MAP.vec={buried:BURIED.map(q=>[q.x0, q.z0, q.x1, q.z1]), rooms:[], floors:[], walls:[]}, rooms=[];
    for(const Z of ZONES){ if(!Z.indoor) continue; const cx=(Z.x0+Z.x1)/2, cz=(Z.z0+Z.z1)/2; if(Z.y1>Terrain.groundAt(cx, cz)+0.5) continue;
      V.rooms.push([Z.x0, Z.z0, Z.x1, Z.z1]); const n=(Z.name||"").split(" · ").pop(); if(n) rooms.push([n, cx, cz, (Z.x1-Z.x0)*(Z.z1-Z.z0)]); }
    for(const s of SURF) if(s.flat && below(s.x0, s.x1, s.z0, s.z1, s.y)) V.floors.push([s.x0, s.z0, s.x1, s.z1]);
    // each name once in its neighbourhood, at its largest room, and not again where the warp list already names it
    rooms.sort((a, b)=>b[3]-a[3]); const kept=[];
    for(const q of rooms) if(!kept.some(k=>k[0]===q[0] && Math.hypot(k[1]-q[1], k[2]-q[2])<60)) kept.push(q);
    MAP.underNames=kept; return true; });
  let ui=0; jobs.push(()=>{ const go=slice(), V=MAP.vec;
    while(ui<COL.length && go()){ for(let n=0;n<4000 && ui<COL.length;n++){ const c=COL[ui++]; if(c.y0<=-39 && c.y1>=299 || c.y1-c.y0<=1.0) continue; const cx=(c.x0+c.x1)/2, cz=(c.z0+c.z1)/2;
      if(!BURIED.some(q=>cx>q.x0-1.5 && cx<q.x1+1.5 && cz>q.z0-1.5 && cz<q.z1+1.5) || c.y1>=Terrain.groundAt(cx, cz)+0.3) continue;
      V.walls.push([c.x0, c.z0, c.x1, c.z1]); } }
    if(ui<COL.length) return false;
    MAP.underNames=MAP.underNames.filter(q=>!names().some(p=>Math.hypot(p[1]-q[1], p[2]-q[2])<25 && (ALIAS[p[0]]||p[0])===q[0]));
    // the warp list's places, each on the map it belongs to (below ground if its floor is in a buried volume)
    MAP.places=names().map(p=>{ let y=0; try{ y=p[4](p); }catch(e){ y=Terrain.groundAt(p[1], p[2]); }
      const under=!!p[5] || (typeof buriedVolAt==="function" && !!buriedVolAt(p[1], p[2], y+1.0)); return {n:ALIAS[p[0]]||p[0], x:p[1], z:p[2], under:under}; });
    MAP.prog=1; return true; });
  MAP.pump=function(){ if(MAP.ready) return; if(jobs[step] && jobs[step]()) step++; if(step>=jobs.length){ MAP.ready=true; if(MAP.open) MAP.draw(); } };

  /* ---- showing it ---- */
  const names=()=>(typeof WARP!=="undefined" && WARP.places) ? WARP.places : [];
  const ALIAS={"THE LOBBY":"I-79 REST AREA"};
  // the names that stay up when zoomed right out, and the map's own: the town, the lake, the roads
  const MAJOR=/^(I-79 REST AREA|THE FUEL STOP|THE WEIR FARM|LAKE STREET|THE BREWERY|THE WEIGH STATION|FRENCH CREEK PINES|THE STONE HOUSE|THE RADIO STATION|THE CHAPEL|THE FIREWORKS STORE|THE ARCADE|THE PINE KNOT|THE SUB-BASEMENT)$/;
  const MINOR=/ROOF|CATWALK|'S |HOOP|CROSSOVER/;
  const AREAS=[["EDINBORO", -40, -1290, 22],["EDINBORO LAKE", 1620, -1700, 26],["I-79 NORTH", 70, -2500, 15],["I-79 SOUTH", 70, 900, 15],["US 6N", -1000, -1212, 14],["US 6N", 760, -1212, 14]];
  MAP.show=function(on){ MAP.open=on; el.classList.toggle("show", on);
    if(on){ if(document.pointerLockElement) document.exitPointerLock(); if(typeof clearKeys==="function") clearKeys(); MAP.here(); MAP.zoom=Math.max(MAP.zoom, 0.6); MAP.size(); MAP.draw(); } };
  MAP.here=function(){ const p=MAP.you(); MAP.cx=p.x; MAP.cz=p.z; };
  MAP.you=function(){ const d=typeof driving!=="undefined" && driving && driving.veh ? driving.veh : null;
    return {x:camera.position.x, z:camera.position.z, yaw:(typeof player!=="undefined" ? player.yaw : 0), under:typeof buriedVolAt==="function" && !!buriedVolAt(camera.position.x, camera.position.z, camera.position.y), car:!!d}; };
  MAP.size=function(){ const r=Math.min(devicePixelRatio||1, 2); MAP.cv.width=Math.round(innerWidth*r); MAP.cv.height=Math.round(innerHeight*r); MAP.r=r; };
  addEventListener("resize", ()=>{ if(MAP.open){ MAP.size(); MAP.draw(); } });
  // world to screen: zoom is screen pixels a metre
  const sx=x=>(x-MAP.cx)*MAP.zoom*MAP.r+MAP.cv.width/2, sy=z=>(z-MAP.cz)*MAP.zoom*MAP.r+MAP.cv.height/2;
  MAP.draw=function(){ const c=MAP.x, Wc=MAP.cv.width, Hc=MAP.cv.height, r=MAP.r;
    c.fillStyle=MAP.layer ? "#0c0e12" : "#20281c"; c.fillRect(0, 0, Wc, Hc);
    const prog=el.querySelector(".prog");
    if(!MAP.ready){ prog.textContent="DRAWING THE MAP · "+Math.round(MAP.prog*100)+"%"; return; } prog.textContent="";
    const k=MAP.zoom*PX*r;
    c.imageSmoothingEnabled=MAP.zoom*PX<2.5; if(MAP.layer) c.globalAlpha=0.2; c.drawImage(MAP.surf, sx(B.x0), sy(B.z0), W*k, H*k); c.globalAlpha=1;
    if(MAP.layer && MAP.vec){ const V=MAP.vec, R=(L, col, pad)=>{ c.fillStyle=col; for(const q of L){ const X0=sx(q[0])-pad, Y0=sy(q[1])-pad, X1=sx(q[2])+pad, Y1=sy(q[3])+pad;
        if(X1<0 || Y1<0 || X0>Wc || Y0>Hc) continue; c.fillRect(X0, Y0, Math.max(1, X1-X0), Math.max(1, Y1-Y0)); } };
      R(V.buried, "#2e2a22", 0); R(V.rooms, "#7a6a4e", 0); R(V.floors, "#9c8a66", 0); R(V.walls, "#efe4c8", Math.max(0.6, 0.12*MAP.zoom*r)); }
    // names: the warp list's, by layer; the underworld's own rooms
    c.textAlign="center"; c.textBaseline="middle";
    const label=(t, x, z, size, col)=>{ const X=sx(x), Y=sy(z); if(X<-200 || X>Wc+200 || Y<-40 || Y>Hc+40) return;
      c.font="600 "+Math.round(size*r)+"px Oswald, 'Arial Narrow', sans-serif"; c.lineWidth=3*r; c.strokeStyle="rgba(0,0,0,0.75)"; c.strokeText(t, X, Y); c.fillStyle=col; c.fillText(t, X, Y); };
    const big=MAP.zoom<0.5;
    if(!MAP.layer){ for(const [n, x, z, sz] of AREAS) label(n, x, z, sz, "rgba(255,246,220,0.85)");
      for(const p of MAP.places||[]){ if(p.under || (big && !MAJOR.test(p.n)) || (MAP.zoom<2 && MINOR.test(p.n))) continue; label(p.n, p.x, p.z-6/MAP.zoom, big ? 11 : 12, "#fff6dc"); } }
    else { for(const p of MAP.places||[]) if(p.under && (!big || MAJOR.test(p.n))) label(p.n, p.x, p.z-6/MAP.zoom, 12, "#ffd48a");
      if(MAP.zoom>1.2) for(const [n, x, z] of MAP.underNames||[]) label(n, x, z, 10, "#c8d0e0"); }
    // you
    const Y=MAP.you(), X=sx(Y.x), Yz=sy(Y.z), a=Y.yaw;
    c.save(); c.translate(X, Yz); c.rotate(-a); c.fillStyle=Y.under && !MAP.layer ? "#ffb070" : "#ff4a3a"; c.strokeStyle="#ffffff"; c.lineWidth=2*r;
    c.beginPath(); c.moveTo(0, -11*r); c.lineTo(7*r, 8*r); c.lineTo(0, 4*r); c.lineTo(-7*r, 8*r); c.closePath(); c.fill(); c.stroke(); c.restore();
    if(Y.under && !MAP.layer) label("(BELOW GROUND · U)", Y.x, Y.z+22/MAP.zoom, 10, "#ffb070");
    // a scale bar
    const m=[10, 25, 50, 100, 250, 500, 1000].find(v=>v*MAP.zoom>80)||1000, L=m*MAP.zoom*r;
    c.fillStyle="rgba(10,14,12,0.75)"; c.fillRect(Wc-L-34*r, Hc-36*r, L+22*r, 26*r); c.fillStyle="#e8ecef"; c.fillRect(Wc-L-23*r, Hc-20*r, L, 3*r);
    c.font=Math.round(10*r)+"px 'JetBrains Mono', monospace"; c.fillText(m+" m", Wc-L/2-23*r, Hc-28*r); };
  // while open: its own keys and the mouse
  MAP.key=function(e){
    if(!MAP.open){ if(e.code==="KeyB" && !e.repeat){ MAP.show(true); return true; } return false; }
    const c=e.code, mv=120/MAP.zoom;
    if(c==="KeyB" || c==="Escape"){ if(!e.repeat) MAP.show(false); }
    else if(c==="KeyU" || c==="Tab"){ if(!e.repeat){ MAP.layer=1-MAP.layer; MAP.tabs(); } }
    else if(c==="Equal" || c==="NumpadAdd") MAP.zoomAt(1.25);
    else if(c==="Minus" || c==="NumpadSubtract") MAP.zoomAt(0.8);
    else if(c==="ArrowLeft" || c==="KeyA") MAP.cx-=mv; else if(c==="ArrowRight" || c==="KeyD") MAP.cx+=mv;
    else if(c==="ArrowUp" || c==="KeyW") MAP.cz-=mv; else if(c==="ArrowDown" || c==="KeyS") MAP.cz+=mv;
    else if(c==="Space") MAP.here();
    MAP.draw(); return true; };
  MAP.zoomAt=function(f, px, py){ const z0=MAP.zoom, z1=clamp(z0*f, 0.12, 12); if(px!==undefined){ const wx=MAP.cx+(px*MAP.r-MAP.cv.width/2)/(z0*MAP.r), wz=MAP.cz+(py*MAP.r-MAP.cv.height/2)/(z0*MAP.r);
      MAP.cx=wx-(px*MAP.r-MAP.cv.width/2)/(z1*MAP.r); MAP.cz=wz-(py*MAP.r-MAP.cv.height/2)/(z1*MAP.r); } MAP.zoom=z1; };
  let drag=null, wacc=0;
  el.addEventListener("mousedown", e=>{ drag={x:e.clientX, y:e.clientY, cx:MAP.cx, cz:MAP.cz}; el.style.cursor="grabbing"; });
  addEventListener("mouseup", ()=>{ drag=null; el.style.cursor="grab"; });
  el.addEventListener("mousemove", e=>{ if(!drag) return; MAP.cx=drag.cx-(e.clientX-drag.x)/MAP.zoom; MAP.cz=drag.cz-(e.clientY-drag.y)/MAP.zoom; MAP.draw(); });
  // (the wheel added up into steps: a trackpad sends a stream of small ones)
  el.addEventListener("wheel", e=>{ e.preventDefault(); wacc+=e.deltaY; while(Math.abs(wacc)>=60){ MAP.zoomAt(wacc>0 ? 0.87 : 1.15, e.clientX, e.clientY); wacc-=Math.sign(wacc)*60; } MAP.draw(); }, {passive:false});
})();
/* each frame (19): draw the map a slice at a time until it is done; while it is open, redraw it so you move on it */
function updateMap(){ if(!MAP.ready){ MAP.pump(); if(MAP.open) MAP.draw(); return; } if(MAP.open) MAP.draw(); }
