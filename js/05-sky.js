"use strict";
/* REST AREA · 05-sky.js
   sky dome, stars, sun and moon, clouds, birds, vehicles and highway traffic,
   and the DayNight clock
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   5 · SKY DOME, STARS, SUN & MOON  (the engine's, repainted for a humid
   Pennsylvania summer: a pale hazy horizon, a deep blue overhead)
   ---------------------------------------------------------------------- */
let skyDome, skyCtx, skyTex;
const skyImg={top:new T.Color(), mid:new T.Color(), low:new T.Color(), hz:new T.Color()};
const _skyMix=new T.Color();   // scratch for the interpolated gradient stops
(function buildSky(){
  const c=cvs(16,256); skyCtx=c.getContext("2d");
  skyTex=setSRGB(new T.CanvasTexture(c));
  skyDome=new T.Mesh(new T.SphereGeometry(2400,26,18),
    new T.MeshBasicMaterial({map:skyTex, side:T.BackSide, fog:false, depthWrite:false}));
  scene.add(skyDome);
})();
/* --- stars -------------------------------------------------------------
   A single field of identical white dots reads as static and flat. Real sky
   has depth because it has three things this does now: a magnitude
   distribution (a handful of bright stars, a great many faint ones), colour
   temperature (blue-white through orange), and the Milky Way running across
   it. Each magnitude class is its own Points layer so it can carry its own
   pixel size and its own twinkle phase, and the whole lot hangs off a tilted
   pivot that wheels with the clock, the way the sky actually turns.       */
let starSky, starPivot;
const STAR_LAYERS=[];
function starSprite(cross){
  const c=cvs(64,64), x=c.getContext("2d");
  if(cross){                                    // diffraction spikes, bright stars only
    x.strokeStyle="rgba(255,255,255,0.30)"; x.lineWidth=1.4;
    x.beginPath(); x.moveTo(32,5); x.lineTo(32,59); x.moveTo(5,32); x.lineTo(59,32); x.stroke();
  }
  const g=x.createRadialGradient(32,32,0,32,32,30);
  g.addColorStop(0.00,"rgba(255,255,255,1)");
  g.addColorStop(0.14,"rgba(255,255,255,0.92)");
  g.addColorStop(0.30,"rgba(255,255,255,0.30)");
  g.addColorStop(0.62,"rgba(255,255,255,0.06)");
  g.addColorStop(1.00,"rgba(255,255,255,0)");
  x.globalCompositeOperation="lighter";
  x.fillStyle=g; x.fillRect(0,0,64,64);
  return setSRGB(new T.CanvasTexture(c));
}
(function buildStars(){
  const R=2250;
  // the galactic plane: a great circle tilted off the celestial equator
  const gi=1.05, GA=V3(Math.cos(gi),Math.sin(gi),0).normalize();   // pole of the band
  const GU=V3(0,0,1).cross(GA).normalize(), GV=GA.clone().cross(GU).normalize();
  // B through M, weighted the way the naked-eye sky is: mostly white and straw
  const TINT=[[0.66,0.76,1.00],[0.80,0.87,1.00],[1.00,1.00,1.00],[1.00,1.00,1.00],
              [1.00,0.96,0.86],[1.00,0.90,0.74],[1.00,0.80,0.62],[1.00,0.68,0.52]];
  const tex=starSprite(false), texX=starSprite(true);
  // pos on the dome, optionally pulled toward the galactic plane
  function place(pos,i,band){
    let d;
    if(band){                                   // within a few degrees of the plane
      const a=rnd()*Math.PI*2, off=(rnd()+rnd()+rnd()-1.5)*band;
      d=GU.clone().multiplyScalar(Math.cos(a)).addScaledVector(GV,Math.sin(a))
         .addScaledVector(GA,off).normalize();
    }else{
      const th=rnd()*Math.PI*2, ph=Math.acos(2*rnd()-1);
      d=V3(Math.sin(ph)*Math.cos(th), Math.cos(ph), Math.sin(ph)*Math.sin(th));
    }
    pos[i*3]=d.x*R; pos[i*3+1]=d.y*R; pos[i*3+2]=d.z*R;
  }
  function layer(n, size, gamma, lo, opacity, sprite, band, sat){
    const pos=new Float32Array(n*3), col=new Float32Array(n*3);
    for(let i=0;i<n;i++){
      place(pos,i, band);
      const t=TINT[(rnd()*TINT.length)|0], b=lo+(1-lo)*Math.pow(rnd(), gamma);
      col[i*3]  =(1+(t[0]-1)*sat)*b;
      col[i*3+1]=(1+(t[1]-1)*sat)*b;
      col[i*3+2]=(1+(t[2]-1)*sat)*b;
    }
    const g=new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(pos,3));
    g.setAttribute("color",    new T.BufferAttribute(col,3));
    const pts=new T.Points(g, new T.PointsMaterial({map:sprite, vertexColors:true,
      size:size, sizeAttenuation:false, transparent:true, opacity:0, depthWrite:false,
      fog:false, blending:T.AdditiveBlending, toneMapped:false}));
    pts.frustumCulled=false;
    STAR_LAYERS.push({p:pts, base:opacity, ph:rnd()*9, sp:0.6+rnd()*1.5});
    return pts;
  }
  starSky=new T.Group();
  starSky.add(layer(2400, 2.8, 2.6, 0.22, 0.92, tex,  0,     0.75));  // the faint majority
  starSky.add(layer( 900, 3.0, 2.3, 0.24, 0.80, tex,  0.30,  0.80));  // thicker on the band
  starSky.add(layer( 320, 5.4, 1.7, 0.42, 1.00, tex,  0,     0.95));  // second magnitude
  starSky.add(layer(  52,10.0, 1.0, 0.68, 1.00, texX, 0,     1.00));  // the named ones
  // the galactic haze only just shows — a suggestion of the band, not a stripe
  starSky.add(layer( 420,22.0, 1.4, 0.10, 0.075, tex, 0.22,  0.30));
  starPivot=new T.Group();
  starPivot.rotation.x=0.96;                     // the pole, ~35 deg above the horizon
  starPivot.add(starSky); scene.add(starPivot);
})();
let sunDisc, moonDisc;
const SUN_HIGH=new T.Color(0xfff4d6), SUN_LOW=new T.Color(0xff6f28);
(function buildCelestials(){
  const disc=stops=>{
    const c=cvs(128,128), x=c.getContext("2d");
    const g=x.createRadialGradient(64,64,0,64,64,64);
    for(const s of stops) g.addColorStop(s[0],s[1]);
    x.fillStyle=g; x.fillRect(0,0,128,128);
    return setSRGB(new T.CanvasTexture(c));
  };
  const mk=(tex,size)=>{
    const sp=new T.Sprite(new T.SpriteMaterial({map:tex, transparent:true, depthWrite:false,
      fog:false, blending:T.AdditiveBlending}));
    sp.scale.set(size,size,1); scene.add(sp); return sp;
  };
  sunDisc=mk(disc([[0,"rgba(255,255,255,1)"],[0.16,"rgba(255,246,220,0.96)"],
    [0.30,"rgba(255,198,124,0.42)"],[0.60,"rgba(255,150,80,0.12)"],[1,"rgba(255,140,70,0)"]]), 320);
  moonDisc=mk(disc([[0,"rgba(255,255,255,1)"],[0.30,"rgba(226,236,255,0.9)"],
    [0.42,"rgba(160,185,230,0.22)"],[1,"rgba(120,150,210,0)"]]), 150);
})();
const _celDir=new T.Vector3();
function placeCelestial(sp, ang, sign, zBias){
  _celDir.set(Math.cos(ang)*sign, Math.sin(ang)*sign, zBias*sign).normalize();
  sp.position.copy(camera.position).addScaledVector(_celDir, 1800);
  return _celDir.y;
}


/* --- clouds and birds -------------------------------------------------- */
const CLOUDS=[], CIRRUS=[], ALTO=[], BIRDS=[], BALLOONS=[], WHITE_C=new T.Color(0xffffff);
let VULTURE=null;              // one bird, a long way up, and not always there
const NIGHT_HAZE=new T.Color(0x0a1020);        // haze colour once the sun is gone
(function buildSky2(){
  // A cumulus is a row of lobes on a flat base, lit from above and shaded
  // underneath. Drawing it that way — mass, then a shaded base, then sunlit
  // tops, then cutting the base flat — reads as weather rather than as fog.
  // One generative model rather than four recognisable archetypes: every cloud
  // picks its own point in a four-axis space — how far it spreads, how much it
  // towers, how broken it is, how much its top shears downwind — so no two
  // read as the same shape. The silhouette is then eroded with a tiling noise
  // field instead of punched with circles, which is what was leaving those
  // negative-space holes: subtracting a proportion of alpha thins the soft rim
  // into wisps and barely touches the solid core, which is how a cloud edge
  // actually behaves.
  const CLOUD_NOISE=(function(){
    const N=256, c=cvs(N,N), x=c.getContext("2d"), img=x.createImageData(N,N);
    const h=(i,j)=>{ const k=Math.sin(i*127.1+j*311.7)*43758.5453; return k-Math.floor(k); };
    const oct=(u,v,f)=>{                              // tiling value noise
      const uu=u*f, vv=v*f, i0=Math.floor(uu), j0=Math.floor(vv);
      const fu=uu-i0, fv=vv-j0, su=fu*fu*(3-2*fu), sv=fv*fv*(3-2*fv);
      const m=(a,b,t)=>a+(b-a)*t, w=(a)=>((a%f)+f)%f;
      const a=h(w(i0),w(j0)), b=h(w(i0+1),w(j0)), cc=h(w(i0),w(j0+1)), d=h(w(i0+1),w(j0+1));
      return m(m(a,b,su), m(cc,d,su), sv);
    };
    for(let j2=0;j2<N;j2++) for(let i2=0;i2<N;i2++){
      const u=i2/N, v=j2/N;
      let n=oct(u,v,4)*0.5+oct(u,v,8)*0.28+oct(u,v,16)*0.14+oct(u,v,32)*0.08;
      n=Math.pow(Math.max(0,(n-0.30)/0.70), 1.9);     // mostly gentle, sometimes a real bite
      const o=(j2*N+i2)*4;
      img.data[o]=img.data[o+1]=img.data[o+2]=0;
      img.data[o+3]=Math.min(255, n*255);
    }
    x.putImageData(img,0,0);
    return c;
  })();
  function cumulusTex(seed){
    let sd=seed*9301+7;
    const r2=()=>{ sd=(sd*9301+49297)%233280; return sd/233280; };
    // the four axes, drawn independently for every cloud
    const spread=0.35+r2()*0.65, tower=Math.pow(r2(),1.7), rag=Math.pow(r2(),1.5),
          shear=(r2()-0.5)*1.7*tower;
    const W=448, H=Math.round(180+tower*210), M=26, IW=W-M*2;
    const base=H-M-12;
    const c=cvs(W,H), x=c.getContext("2d");
    const lobes=[];
    const put=(lx,ly,lr)=>{
      const r=Math.min(lr, lx-M, W-M-lx, ly-M, base+12-ly+lr*0.9);
      if(r>13) lobes.push({x:lx, y:ly, r:r});   // pellets read as debris, drop them
    };
    // the heap along the base: a hump curve with its own skew and wobble
    const n=Math.round(5+spread*9+rag*6), skew=(r2()-0.5)*0.9, cxx=M+IW*(0.30+r2()*0.40);
    for(let i=0;i<n;i++){
      if(rag>0.45 && r2()<rag*0.34) continue;            // broken ones lose lobes
      const t=n>1?i/(n-1):0.5;
      const hump=Math.pow(Math.sin(t*Math.PI), 0.7+skew*0.5);
      const lr=(15+hump*(26+spread*22))*(1-rag*0.34)+r2()*14;
      put(M+IW*0.05+t*IW*0.90+(r2()-0.5)*20*(1+rag),
          base-lr*0.5-hump*(8+tower*26)*r2()-rag*r2()*lr*0.34, lr);
    }
    // and, if it is building, a stack of rounded tiers leaning downwind. The
    // old version tapered by 20% a tier and finished on a 10 px lobe, and then
    // scattered a few small ones above that — which is what the horns poking
    // out of the tops were. Tiers now barely narrow, and the stack is closed
    // by a cap lobe wider than anything beneath it, so the silhouette always
    // rolls over into a dome. Nothing is ever drawn above the cap.
    if(tower>0.18){
      const tiers=2+Math.round(tower*2.6);
      let y=base-30-tower*20, r=34+tower*26, lean=0;
      for(let lvl=0; lvl<tiers && y>M+r*1.35; lvl++){
        lean += shear*r*0.26;
        const cl=2+((r2()*2)|0);
        for(let k=0;k<cl;k++)
          put(cxx+lean+(k-(cl-1)/2)*r*0.52, y+(r2()-0.5)*r*0.10, r*(0.88+r2()*0.16));
        y -= r*(0.40+r2()*0.09);
        r *= 0.91-r2()*0.05;
      }
      put(cxx+lean, y+r*0.30, r*1.14);                   // the cap
    }
    // Nothing floats free of the mass. The ends of the base heap used to land
    // small and clear of their neighbours, which read as pellets beside the
    // cloud rather than part of it.
    if(lobes.length>4){
      let bigI=0; for(let i=1;i<lobes.length;i++) if(lobes[i].r>lobes[bigI].r) bigI=i;
      const big=lobes[bigI];
      for(let i=lobes.length-1;i>=0;i--){
        const L=lobes[i]; if(L===big) continue;
        let touch=false;
        for(const O of lobes)
          if(O!==L && Math.hypot(O.x-L.x, O.y-L.y) < (O.r+L.r)*0.62){ touch=true; break; }
        if(!touch) lobes.splice(i,1);
      }
    }
    for(const L of lobes){                                    // the mass
      const g=x.createRadialGradient(L.x, L.y-L.r*0.16, L.r*0.10, L.x, L.y, L.r);
      g.addColorStop(0.00,"rgba(255,255,255,1.00)");
      g.addColorStop(0.58,"rgba(255,255,255,0.94)");
      g.addColorStop(0.86,"rgba(255,255,255,0.44)");
      g.addColorStop(1.00,"rgba(255,255,255,0)");
      x.fillStyle=g; x.beginPath(); x.arc(L.x,L.y,L.r,0,7); x.fill();
    }
    // erode with noise at two scales — organic, never a circular hole
    x.globalCompositeOperation="destination-out";
    for(const pass of [[1.0+r2()*0.7, 0.34+rag*0.30], [2.3+r2()*1.6, 0.20+rag*0.24]]){
      const sw=256/pass[0], sh=256/pass[0];
      x.globalAlpha=pass[1];
      x.drawImage(CLOUD_NOISE, r2()*(256-sw), r2()*(256-sh), sw, sh, 0, 0, W, H);
    }
    x.globalAlpha=1;
    x.globalCompositeOperation="source-atop";               // shaded underside
    const sg=x.createLinearGradient(0, base-70-tower*40, 0, base+10);
    sg.addColorStop(0,"rgba(150,166,192,0)");
    sg.addColorStop(0.62,"rgba(126,142,172,0.46)");
    sg.addColorStop(1,"rgba(104,120,152,0.74)");
    x.fillStyle=sg; x.fillRect(0,0,W,H);
    x.globalCompositeOperation="lighter";                   // sunlit tops
    for(const L of lobes){
      const hx=L.x-L.r*0.22, hy=L.y-L.r*0.50, hr=L.r*0.76;
      const g=x.createRadialGradient(hx,hy,0,hx,hy,hr);
      g.addColorStop(0,"rgba(255,252,240,0.30)");
      g.addColorStop(1,"rgba(255,252,240,0)");
      x.fillStyle=g; x.beginPath(); x.arc(hx,hy,hr,0,7); x.fill();
    }
    x.globalCompositeOperation="destination-out";           // the base, cut soft
    const cutTop=base-(10+rag*22);
    const eg=x.createLinearGradient(0, cutTop, 0, base+20);
    eg.addColorStop(0,"rgba(0,0,0,0)"); eg.addColorStop(0.55,"rgba(0,0,0,0.55)");
    eg.addColorStop(1,"rgba(0,0,0,1)");
    x.fillStyle=eg; x.fillRect(0,cutTop,W,H-cutTop);
    x.globalCompositeOperation="source-over";
    const tex=setSRGB(new T.CanvasTexture(c));
    if(r2()<0.5){ tex.wrapS=T.RepeatWrapping; tex.repeat.x=-1; tex.offset.x=1; }
    return {tex:tex, aspect:H/W, tower:tower, spread:spread};
  }
  function cirrusTex(seed){
    const W=512, H=128, c=cvs(W,H), x=c.getContext("2d");
    let sd=seed*4133+11;
    const r2=()=>{ sd=(sd*9301+49297)%233280; return sd/233280; };
    const dir=r2()<0.5?1:-1, dens=22+((r2()*22)|0);
    x.lineCap="round";
    for(let i=0;i<dens;i++){
      const y0c=22+r2()*84, len=70+r2()*260, x0c=18+r2()*(W-len-36);
      x.strokeStyle="rgba(255,255,255,"+(0.04+r2()*0.12).toFixed(3)+")";
      x.lineWidth=1.2+r2()*6;
      x.beginPath(); x.moveTo(x0c,y0c);
      x.bezierCurveTo(x0c+len*0.3, y0c-dir*(6+r2()*14), x0c+len*0.7, y0c+dir*(5+r2()*11),
                      x0c+len, y0c-dir*2);
      x.stroke();
    }
    return setSRGB(new T.CanvasTexture(c));
  }
  // Distance is what keeps a cloud from looming. Cumulus bases sit around a
  // mile up, not two hundred metres, and the big ones belong out near the
  // horizon where a sprite's flatness does not show.
  // They drift along x, so z is what sets how close one can ever come. Keeping
  // a floor under |z| is what stops a big one from ending up overhead, and the
  // bigger it is the further out it starts.
  for(let i=0;i<44;i++){
    const t=cumulusTex(i*37+3);
    const m=new T.SpriteMaterial({map:t.tex, transparent:true, depthWrite:false,
      fog:false, opacity:0.0});
    const sp=new T.Sprite(m);
    const big=Math.max(t.tower, t.spread*0.8);
    const sc=240+big*1250+Math.random()*260;
    sp.scale.set(sc, sc*t.aspect, 1);
    const zMin=420+big*820, zMax=zMin+700+big*900;
    const oz=(Math.random()<0.5?-1:1)*(zMin+Math.random()*(zMax-zMin));
    sp.position.set((Math.random()*2-1)*2100, 600+big*760+Math.random()*420, oz);
    // They are pinned to the camera in x and z. Loose in the world they drifted
    // past the 2400 m sky dome and the far plane and vanished mid-sky; at this
    // altitude and distance the parallax you lose by pinning them is nothing.
    scene.add(sp); CLOUDS.push({s:sp, sp:1.2+Math.random()*1.8, ox:sp.position.x, oz:oz});
  }
  // altocumulus: a raft of small flecks in rows, pitched between the cumulus
  // tops and the cirrus. It is the deck that gives the sky a middle distance.
  function altoTex(seed){
    const W=512, H=256, c=cvs(W,H), x=c.getContext("2d");
    let sd=seed*7717+29;
    const r2=()=>{ sd=(sd*9301+49297)%233280; return sd/233280; };
    const rows=5+((r2()*4)|0), tilt=(r2()-0.5)*0.24;
    for(let r=0;r<rows;r++){
      const ry=30+r*((H-60)/rows)+(r2()-0.5)*14;
      const n=9+((r2()*9)|0);
      for(let k=0;k<n;k++){
        const fx=20+r2()*(W-40), fy=ry+(fx-W/2)*tilt+(r2()-0.5)*12;
        const fw=8+r2()*26, fh=fw*(0.34+r2()*0.26);
        const g=x.createRadialGradient(fx,fy-fh*0.2,0, fx,fy,fw);
        g.addColorStop(0.00,"rgba(255,255,255,"+(0.34+r2()*0.34).toFixed(2)+")");
        g.addColorStop(0.55,"rgba(248,250,255,0.26)");
        g.addColorStop(1.00,"rgba(236,242,252,0)");
        x.fillStyle=g;
        x.save(); x.translate(fx,fy); x.scale(1, fh/fw); x.beginPath();
        x.arc(0,0,fw,0,7); x.fill(); x.restore();
      }
    }
    x.globalCompositeOperation="destination-out";     // fade the raft at its edges
    const eg=x.createRadialGradient(W/2,H/2,H*0.22, W/2,H/2,W*0.52);
    eg.addColorStop(0,"rgba(0,0,0,0)"); eg.addColorStop(1,"rgba(0,0,0,1)");
    x.fillStyle=eg; x.fillRect(0,0,W,H);
    return setSRGB(new T.CanvasTexture(c));
  }
  for(let i=0;i<14;i++){
    const m=new T.SpriteMaterial({map:altoTex(i*61+7), transparent:true, depthWrite:false,
      fog:false, opacity:0.0});
    const sp=new T.Sprite(m), sc=900+Math.random()*700;
    sp.scale.set(sc, sc*0.5, 1);
    const oz=(Math.random()<0.5?-1:1)*(600+Math.random()*1700);
    sp.position.set((Math.random()*2-1)*2200, 1400+Math.random()*700, oz);
    scene.add(sp); ALTO.push({s:sp, sp:1.0+Math.random()*1.0, ox:sp.position.x, oz:oz});
  }
  for(let i=0;i<14;i++){
    const m=new T.SpriteMaterial({map:cirrusTex(i*53+9), transparent:true, depthWrite:false,
      fog:false, opacity:0.0});
    const sp=new T.Sprite(m), sc=1400+Math.random()*900;
    sp.scale.set(sc, sc*0.25, 1);
    const oz=(Math.random()<0.5?-1:1)*(700+Math.random()*1500);
    sp.position.set((Math.random()*2-1)*2200, 2200+Math.random()*900, oz);
    scene.add(sp); CIRRUS.push({s:sp, sp:0.9+Math.random()*0.8, ox:sp.position.x, oz:oz});
  }

  const bc=cvs(64,32), bx2=bc.getContext("2d");
  bx2.strokeStyle="rgba(20,16,12,0.85)"; bx2.lineWidth=3; bx2.beginPath();
  bx2.moveTo(6,22); bx2.quadraticCurveTo(20,6,32,18); bx2.quadraticCurveTo(44,6,58,22); bx2.stroke();
  const btex=setSRGB(new T.CanvasTexture(bc));
  for(let i=0;i<6;i++){
    const sp=new T.Sprite(new T.SpriteMaterial({map:btex, transparent:true, depthWrite:false, opacity:0.8}));
    sp.scale.set(7,3.5,1); scene.add(sp);
    BIRDS.push({s:sp, r:70+Math.random()*90, a:Math.random()*6.28, sp:0.12+Math.random()*0.10,
                y:44+Math.random()*36, cx:(Math.random()-0.5)*180, cz:60+(Math.random()-0.5)*180});
  }

  /* --- and one turkey vulture, a long way up: there are plenty over PA ----
     Not one of the six. A vulture soars: it holds a wing in a shallow V,
     it teeters, it turns on a thermal for minutes at a time without a
     single flap, and then the thermal is finished and it slides off to
     find another. So it gets its own silhouette — broad plank wings with
     the primaries slotted like fingers, a small head and a short wedge of
     tail — and its own clock, which has it out of the sky more often than
     in it.                                                             */
  const vc=cvs(128,64), vx=vc.getContext("2d");
  vx.fillStyle="rgba(24,19,15,0.92)";
  vx.beginPath();                                  // the port wing, and the V
  vx.moveTo(64,30); vx.lineTo(26,18); vx.lineTo(10,21); vx.lineTo(9,27);
  vx.lineTo(28,31); vx.lineTo(60,36); vx.closePath(); vx.fill();
  vx.beginPath();                                  // starboard
  vx.moveTo(64,30); vx.lineTo(102,18); vx.lineTo(118,21); vx.lineTo(119,27);
  vx.lineTo(100,31); vx.lineTo(68,36); vx.closePath(); vx.fill();
  for(const q of [-1,1]) for(let k=0;k<4;k++){     // slotted primaries
    const bx3=64+q*(30+k*5.5), by=19+k*1.9;
    vx.beginPath(); vx.moveTo(bx3, by+2);
    vx.lineTo(bx3+q*13, by-3+k*1.2); vx.lineTo(bx3+q*13, by-0.6+k*1.2);
    vx.lineTo(bx3, by+4.4); vx.closePath(); vx.fill();
  }
  vx.beginPath(); vx.ellipse(64,31,7,5,0,0,7); vx.fill();            // body
  vx.beginPath(); vx.ellipse(64,23.5,2.6,3.2,0,0,7); vx.fill();      // head
  vx.beginPath();                                                    // tail
  vx.moveTo(58,35); vx.lineTo(70,35); vx.lineTo(66,47); vx.lineTo(62,47);
  vx.closePath(); vx.fill();
  const vtex=setSRGB(new T.CanvasTexture(vc));
  {
    const sp=new T.Sprite(new T.SpriteMaterial({map:vtex, transparent:true,
                          depthWrite:false, fog:false, opacity:0}));
    sp.scale.set(1,1,1); scene.add(sp);
    VULTURE={s:sp, on:false, t:14+Math.random()*40, a:Math.random()*6.28,
             r:110, y:190, cx:0, cz:0, sp:0.12, drift:0, fade:0};
  }
})();


/* --- the cycle itself ---------------------------------------------------
   One number, the time of day, drives the sun, the sky, the fog, every lamp
   and every lit sign. DUR is twenty minutes here, not the motel's seven: a
   rest stop is somewhere you linger, and the afternoon should last. */
const DayNight=(function(){
  const DUR=1200;
  const P={
    dayLight:new T.Color(0xfff3df), setLight:new T.Color(0xffa860), nightLight:new T.Color(0x8ea6d4),
    dayHemi:new T.Color(0xdfe8f2),  nightHemi:new T.Color(0x18243a),
    dayGround:new T.Color(0x46502e),nightGround:new T.Color(0x07090b),
    daySkyTop:new T.Color(0x2c5c9c), daySkyMid:new T.Color(0x78a2cc),
    daySkyLow:new T.Color(0xb6cbdd), daySkyHz:new T.Color(0xcfdae2),
    setSkyTop:new T.Color(0x2a2a52), setSkyMid:new T.Color(0x7a5470),
    setSkyLow:new T.Color(0xe08a5c), setSkyHz:new T.Color(0xc4826a),
    nightTop:new T.Color(0x040611),  nightMid:new T.Color(0x0b1428),
    nightLow:new T.Color(0x16203c),  nightHz:new T.Color(0x1f2a44),
  };
  // The sun runs a fixed arc (t 0..0.5 is daylight); the clock is stretched
  // over it so the days are as long as Crawford County's: late July and
  // mid October, Eastern Daylight Time.
  const SUN={summer:[6.05,20.75], autumn:[7.45,18.75]};
  const sunTimes=()=>(typeof FOREST!=="undefined" && FOREST.isAutumn()) ? SUN.autumn : SUN.summer;
  function tToHour(t){ const [r,e]=sunTimes(), day=e-r;
    return (t<0.5 ? r+day*t/0.5 : e+(24-day)*(t-0.5)/0.5)%24; }
  function hourToT(h){ const [r,e]=sunTimes(), day=e-r, d=((h-r)%24+24)%24;
    return d<day ? 0.5*d/day : 0.5+0.5*(d-day)/(24-day); }
  // early afternoon: the lot half full, the shadows just starting east
  const s={t:hourToT(13.4), sunHeight:0, hemiIntensity:1, sunIntensity:1,
           nightAmount:0, sunsetAmount:0, dark:0, hour:0, paused:false};
  return {
    DUR:DUR, P:P, state:s,
    setHour(h){ s.t=hourToT(h); s.hour=h; }, sunTimes:sunTimes,
    nudge(d){ s.t=(s.t+d+1)%1; },
    tick(dt){
      if(!s.paused) s.t=(s.t+dt/DUR)%1;
      const ang=s.t*Math.PI*2;
      s.sunHeight=Math.sin(ang);
      const day=smoothstep(0.12,0.35,s.sunHeight);
      const set=smoothstep(-0.22,0.12,s.sunHeight)*(1-smoothstep(0.15,0.35,s.sunHeight));
      const tw =smoothstep(-0.50,-0.05,s.sunHeight)*(1-day);
      s.nightAmount=1-smoothstep(-0.50,-0.02,s.sunHeight);
      s.sunsetAmount=set+tw*0.6;
      s.dark=1-smoothstep(-0.14,0.24,s.sunHeight);
      s.hour=tToHour(s.t);
      s.sunIntensity=Math.max(0.04, day*1.10+set*0.66) + s.nightAmount*0.30;
      s.hemiIntensity=Math.max(0.15, day*0.74+set*0.46+(1-s.nightAmount)*0.30);
      return s;
    },
    paint(){
      const day=smoothstep(0.05,0.4,s.sunHeight);
      const set=smoothstep(-0.42,0.06,s.sunHeight)*(1-smoothstep(0.35,0.58,s.sunHeight));
      const night=1-smoothstep(-0.42,0.06,s.sunHeight);
      const tot=day+set+night||1;
      const mix=(o,a,b,c)=>{ o.r=(a.r*day+b.r*set+c.r*night)/tot;
                             o.g=(a.g*day+b.g*set+c.g*night)/tot;
                             o.b=(a.b*day+b.b*set+c.b*night)/tot; };
      mix(skyImg.top,P.daySkyTop,P.setSkyTop,P.nightTop);
      mix(skyImg.mid,P.daySkyMid,P.setSkyMid,P.nightMid);
      mix(skyImg.low,P.daySkyLow,P.setSkyLow,P.nightLow);
      mix(skyImg.hz ,P.daySkyHz ,P.setSkyHz ,P.nightHz );
      const g=skyCtx.createLinearGradient(0,0,0,256);
      g.addColorStop(0,   "#"+skyImg.top.getHexString());
      g.addColorStop(0.19,"#"+_skyMix.copy(skyImg.top).lerp(skyImg.mid,0.20).getHexString());
      g.addColorStop(0.33,"#"+_skyMix.copy(skyImg.top).lerp(skyImg.mid,0.56).getHexString());
      g.addColorStop(0.42,"#"+skyImg.mid.getHexString());
      g.addColorStop(0.58,"#"+_skyMix.copy(skyImg.mid).lerp(skyImg.low,0.34).getHexString());
      g.addColorStop(0.72,"#"+skyImg.low.getHexString());
      g.addColorStop(1,   "#"+skyImg.hz .getHexString());
      skyCtx.fillStyle=g; skyCtx.fillRect(0,0,16,256); skyTex.needsUpdate=true;
    }
  };
})();
scene.fog=new T.Fog(0xcfdae2, 150, 1250);
scene.background=new T.Color(0xcfdae2);

/* --- moths at the lamps ------------------------------------------------- */
const MOTHS=[];
(function buildMotes(){
  const c=cvs(32,32), x=c.getContext("2d");
  const g=x.createRadialGradient(16,16,0,16,16,16);
  g.addColorStop(0,"rgba(236,226,196,0.95)"); g.addColorStop(0.5,"rgba(180,164,128,0.5)");
  g.addColorStop(1,"rgba(0,0,0,0)");
  x.fillStyle=g; x.fillRect(0,0,32,32);
  const mothTex=setSRGB(new T.CanvasTexture(c));
  for(let i=0;i<10;i++){
    const sp=new T.Sprite(new T.SpriteMaterial({map:mothTex, transparent:true, depthWrite:false, opacity:0}));
    sp.scale.set(0.09,0.09,1); scene.add(sp);
    MOTHS.push({s:sp, a:Math.random()*6.28, r:0.30+Math.random()*0.55,
                sp:1.6+Math.random()*2.2, ph:Math.random()*6.28});
  }
})();

/* ----------------------------------------------------------------------
   5b · VEHICLES — one builder for everything with wheels
   Modelled in the vehicle's own space: x right, y up from the ground, z
   forward. A body is two profile extrusions — the lower body at full
   width, the greenhouse narrower on top of it — because a modern car's
   whole character is its side profile, and a box with a box on it is a
   1950s car. The greenhouse is dark glass all the way round (that is what
   tinted glass at forty metres looks like), with the roof and the pillars
   laid over it in paint.
   kinds: 0 sedan · 1 SUV · 2 pickup · 3 minivan · 4 box truck ·
          5 tractor-trailer · 6 reefer · 7 car-hauler-less flatbed with load
   ---------------------------------------------------------------------- */
const VEH_SPEC={
  0:{len:4.86, nose:2.44, tail:-2.42, hw:0.93, ht:1.45, wr:0.34, axles:[1.42,-1.42], track:0.80},
  1:{len:4.76, nose:2.38, tail:-2.38, hw:0.97, ht:1.76, wr:0.37, axles:[1.45,-1.45], track:0.84},
  2:{len:5.92, nose:2.94, tail:-2.98, hw:1.00, ht:1.90, wr:0.38, axles:[1.86,-1.80], track:0.86},
  3:{len:5.02, nose:2.52, tail:-2.50, hw:0.99, ht:1.76, wr:0.35, axles:[1.52,-1.52], track:0.84},
  4:{len:8.2,  nose:3.80, tail:-4.40, hw:1.24, ht:3.58, wr:0.48, axles:[2.70,-2.60], track:1.00},
  5:{len:23.4, nose:10.9, tail:-12.6, hw:1.30, ht:4.08, wr:0.52, axles:[9.35,5.0,3.72,-10.3,-11.6], track:1.02},
  6:{len:23.4, nose:10.9, tail:-12.6, hw:1.30, ht:4.08, wr:0.52, axles:[9.35,5.0,3.72,-10.3,-11.6], track:1.02},
  7:{len:21.6, nose:10.9, tail:-10.8, hw:1.30, ht:3.30, wr:0.52, axles:[9.35,5.0,3.72,-8.6,-9.9], track:1.02},
};
// paint people actually buy, now: mostly greyscale, then blue and red
const CAR_PAINTS=["#e9e9e6","#1c1d20","#9fa3a8","#5b5f64","#273a5c","#7c1c1c","#d6d6d2",
                  "#3b3f44","#4d5b3e","#6b4a33","#2d4b6b","#a8a9aa"];
const TRUCK_PAINTS=["#c9c9c4","#7a1e1a","#1d3b6e","#262626","#e7e5df","#356b3a","#d9a522","#5d6168"];
function vehicleParts(kind, paintHex, trailerHex){
  const S=VEH_SPEC[kind], OP=[], GL=[];
  const P=new T.Color(paintHex), DK=new T.Color(0x17181a), TRIM=new T.Color(0x26272a),
        CHR=new T.Color(0xb6b9bb), GLC=new T.Color(0x202b33), HL=new T.Color(0xdfe5e8),
        TL=new T.Color(0x8e1410), AMB=new T.Color(0xd08a1c), PLATE=new T.Color(0xe6e2d4);
  const _eu=new T.Euler(), _qq=new T.Quaternion(), _one=new T.Vector3(1,1,1);
  const add=(L,geo,x,y,z,c,rx,ry,rz)=>{
    _eu.set(rx||0,ry||0,rz||0,"YXZ"); _qq.setFromEuler(_eu);
    L.push({geo:geo, matrix:new T.Matrix4().compose(new T.Vector3(x,y,z),_qq,_one), color:c});
  };
  const B=(L,w,h,d,x,y,z,c,rx)=>add(L, boxGeo(w,h,d,0.5), x,y,z,c,rx);
  // a side profile [forward, up] extruded across the width
  const prof=(L,pts,w,c,x)=>{ const g=prismGeo(pts,w,0.5); g.rotateY(-Math.PI/2); add(L,g,x||0,0,0,c); };
  const cylX=(L,r,len,x,y,z,c,seg)=>add(L,new T.CylinderGeometry(r,r,len,seg||12),x,y,z,c,0,0,Math.PI/2);
  const cylZ=(L,r,len,x,y,z,c,seg)=>add(L,new T.CylinderGeometry(r,r,len,seg||10),x,y,z,c,Math.PI/2,0,0);
  const car=(lower, glass, roof, w, gw)=>{
    prof(OP, lower, w, P);
    prof(GL, glass, gw, GLC);
    prof(OP, roof, gw+0.04, P);
  };
  if(kind===0){
    car([[2.38,0.30],[2.44,0.58],[2.34,0.78],[1.05,0.95],[-1.85,1.00],[-2.32,0.96],[-2.42,0.64],[-2.36,0.30]],
        [[1.02,0.94],[0.10,1.40],[-1.12,1.42],[-1.92,0.98]],
        [[0.18,1.36],[0.10,1.41],[-1.12,1.43],[-1.22,1.37]], 1.84, 1.50);
    B(OP,1.53,0.40,0.12, 0,1.17,-0.42, P);                        // B pillar
  }else if(kind===1){
    car([[2.30,0.36],[2.38,0.70],[2.26,0.96],[1.20,1.08],[-2.20,1.10],[-2.36,1.02],[-2.36,0.40]],
        [[1.10,1.06],[0.32,1.68],[-2.05,1.70],[-2.28,1.08]],
        [[0.40,1.64],[0.32,1.70],[-2.06,1.72],[-2.14,1.65]], 1.92, 1.62);
    B(OP,1.64,0.56,0.12, 0,1.38,-0.38, P);
    B(OP,1.64,0.56,0.12, 0,1.38,-1.42, P);
    for(const s of [-1,1]) B(OP,0.05,0.05,2.0, s*0.70,1.76,-0.85, CHR);        // roof rails
  }else if(kind===2){
    prof(OP, [[2.85,0.40],[2.92,0.78],[2.82,0.92],[-2.98,0.92],[-2.98,0.42]], 1.98, P);
    prof(OP, [[2.82,0.92],[2.78,1.10],[1.30,1.20],[-0.80,1.20],[-0.80,0.92]], 1.96, P);
    prof(GL, [[1.30,1.18],[0.58,1.84],[-0.74,1.86],[-0.78,1.18]], 1.70, GLC);
    prof(OP, [[0.64,1.80],[0.58,1.86],[-0.74,1.88],[-0.80,1.82]], 1.74, P);
    for(const s of [-1,1]) B(OP,0.08,0.40,2.14, s*0.95,1.12,-1.91, P);         // bed sides
    B(OP,1.98,0.40,0.08, 0,1.12,-2.94, P);                                       // tailgate
    B(OP,1.82,0.05,2.08, 0,0.95,-1.90, TRIM);                                    // bed floor
    B(OP,1.98,0.40,0.10, 0,1.12,-0.86, P);
    B(OP,1.20,0.30,0.06, 0,0.66,2.93, DK);
  }else if(kind===3){
    car([[2.45,0.32],[2.52,0.66],[2.30,0.92],[1.30,1.04],[-2.40,1.06],[-2.50,0.98],[-2.48,0.34]],
        [[1.35,1.02],[0.30,1.70],[-2.30,1.72],[-2.45,1.06]],
        [[0.38,1.66],[0.30,1.72],[-2.30,1.74],[-2.36,1.68]], 1.96, 1.70);
    B(OP,1.72,0.62,0.12, 0,1.38,0.05, P);
    B(OP,1.72,0.62,0.10, 0,1.38,-1.30, P);
    B(OP,0.04,0.03,1.4, 0.99,1.12,-0.90, CHR);                                   // slider track
  }else if(kind===4){                                       // box truck
    prof(OP, [[3.70,0.55],[3.80,1.05],[3.62,1.42],[2.72,1.58],[1.60,1.60],[1.60,0.55]], 2.24, P);
    prof(GL, [[2.74,1.56],[2.28,2.42],[1.66,2.44],[1.66,1.56]], 2.02, GLC);
    prof(OP, [[2.32,2.38],[2.28,2.44],[1.66,2.46],[1.62,2.40]], 2.06, P);
    B(OP,2.46,2.56,5.80, 0,2.30,-1.50, new T.Color(trailerHex||0xe6e4de));      // the box
    B(OP,2.48,0.10,5.82, 0,3.56,-1.50, new T.Color(0xc8c6c0));
    B(OP,0.90,0.26,7.6, 0,0.80,-0.4, DK);                                        // frame
    B(OP,2.40,0.30,0.20, 0,0.62,-4.42, DK);                                      // ICC bumper
    B(OP,2.30,0.42,0.25, 0,0.68,3.82, TRIM);
  }else{                                                    // the big rigs
    const trailerC=new T.Color(trailerHex||0xe8e7e2);
    // tractor
    B(OP,1.00,0.30,8.6, 0,0.98,6.6, DK);                                         // frame rails
    prof(OP, [[10.80,0.72],[10.88,1.46],[10.72,1.96],[8.30,2.16],[8.30,0.72]], 2.38, P);
    prof(OP, [[8.30,1.14],[8.30,2.24],[7.94,3.24],[5.40,3.34],[5.40,1.14]], 2.46, P);
    prof(OP, [[5.40,1.14],[5.40,3.34],[4.90,3.98],[3.86,4.04],[3.86,1.14]], 2.46, P);
    B(GL,2.10,0.88,0.06, 0,2.74,8.14, GLC, -0.36);                                // windshield
    for(const s of [-1,1]) B(GL,0.04,0.66,1.20, s*1.235,2.70,7.25, GLC);         // door glass
    B(OP,1.18,1.02,0.08, 0,1.36,10.90, CHR);                                      // grille
    B(OP,2.52,0.40,0.30, 0,0.76,10.92, CHR);                                      // bumper
    for(const s of [-1,1]){
      cylZ(OP,0.34,1.5, s*1.10,0.98,6.0, CHR, 14);                                 // fuel tanks
      add(OP,new T.CylinderGeometry(0.08,0.08,2.6,10), s*1.12,3.0,5.45, CHR);      // stacks
      B(OP,0.30,0.48,0.08, s*1.32,2.10,8.30, DK);                                  // mirrors
      B(OP,0.10,0.70,0.10, s*1.26,2.10,8.24, DK);
    }
    if(kind===7){                                           // flatbed, lumber on it
      B(OP,2.56,0.26,13.9, 0,1.42,-3.1, new T.Color(0x3a3c3e));
      for(let k=0;k<3;k++) B(OP,2.30,0.96,3.9, 0,2.04,1.6-k*4.4, new T.Color(0xc4a676));
      for(let k=0;k<6;k++) B(OP,2.34,1.00,0.05, 0,2.05,3.2-k*2.6, new T.Color(0x2a2a2a));
    }else{
      B(OP,2.59,2.76,16.2, 0,2.68,-4.5, trailerC);                                 // the van
      B(OP,2.61,0.12,16.22, 0,4.02,-4.5, new T.Color(0xcfcdc6));
      B(OP,2.61,0.12,16.22, 0,1.36,-4.5, new T.Color(0x9b9a95));
      for(const s of [-1,1]) B(OP,0.04,0.80,9.0, s*1.28,0.90,-3.6, new T.Color(0x3a3c3f));   // side skirts
      B(OP,2.60,2.70,0.05, 0,2.68,-12.62, new T.Color(0xd6d4cd));                 // rear doors
      B(OP,0.04,2.66,0.06, 0,2.68,-12.66, DK);
      for(const s of [-1,1]) for(const hy of [1.9,3.4]) B(OP,0.22,0.06,0.06, s*0.85,hy,-12.67, CHR);
      for(const s of [-1,1]) B(OP,0.08,1.0,0.08, s*0.9,0.82,1.4, DK);            // landing gear
      if(kind===6){                                          // the reefer unit
        B(OP,2.10,1.40,0.50, 0,3.20,3.88, new T.Color(0xdcdcd6));
        B(OP,1.60,0.90,0.04, 0,3.24,4.14, new T.Color(0x3c3f42));
      }
    }
    B(OP,2.50,0.32,0.20, 0,0.64,-12.55, DK);
  }
  // shared detail: lamps, plate, the dark sill, the arches
  const nz=S.nose, tz=S.tail, big=kind>=4;
  const lampY=big?1.10:(kind===1||kind===3?0.88:kind===2?0.92:0.72);
  for(const s of [-1,1]){
    B(OP, big?0.34:0.40, big?0.24:0.10, 0.08, s*(S.hw-(big?0.32:0.30)), lampY, nz-0.03, HL);
    B(OP, big?0.20:0.36, big?0.32:0.14, 0.08, s*(S.hw-(big?0.20:0.24)), big?1.20:(lampY+0.10), tz+0.03, TL);
    if(!big) B(OP,0.05,0.42,0.86, s*(S.hw-0.005), S.wr+0.16, S.axles[0], DK);   // wheel arches
    if(!big) B(OP,0.05,0.42,0.86, s*(S.hw-0.005), S.wr+0.16, S.axles[S.axles.length-1], DK);
    if(!big) B(OP,0.09,0.09,0.18, s*(S.hw+0.05), (kind===0?1.00:1.16), S.axles[0]-0.62, P);   // mirrors
  }
  if(!big) B(OP,S.hw*2+0.02,0.14,S.len*0.62, 0,0.34,0, TRIM);                    // rocker
  B(OP,0.32,0.16,0.03, 0,big?0.82:0.56, tz-0.005, PLATE);
  if(big) for(const s of [-1,1]){                                                // marker lamps
    B(OP,0.12,0.06,0.04, s*1.18, kind===4?3.52:4.00, kind===4?1.22:3.58, AMB);
  }
  return {OP:OP, GL:GL, spec:S};
}
// the wheel, axle along local x, so steering is a y turn and rolling an x one
function wheelGeo(r, wide){
  const L=[], w=wide||0.24;
  const _eu=new T.Euler(0,0,Math.PI/2), _qq=new T.Quaternion().setFromEuler(_eu), one=new T.Vector3(1,1,1);
  const at=(geo,c)=>L.push({geo:geo, matrix:new T.Matrix4().compose(new T.Vector3(),_qq,one), color:new T.Color(c)});
  at(new T.CylinderGeometry(r,r,w,18), 0x141414);
  at(new T.CylinderGeometry(r*0.66,r*0.66,w+0.012,16), 0xa9adb0);                  // alloy
  at(new T.CylinderGeometry(r*0.20,r*0.20,w+0.03,8), 0x55585b);
  for(let k=0;k<5;k++){                                                            // spokes, so it turns
    const a=k/5*Math.PI*2;
    L.push({geo:boxGeo(w+0.02, r*1.10, 0.05, 0), matrix:new T.Matrix4().makeRotationX(a), color:new T.Color(0x7e8285)});
  }
  return mergeEntries(L);
}
const VEH_MAT  =new T.MeshStandardMaterial({vertexColors:true, roughness:0.36, metalness:0.38});
const VEH_GLASS=new T.MeshStandardMaterial({vertexColors:true, roughness:0.06, metalness:0.55});
const _WHEEL_CACHE={};
function wheelGeoCached(r, wide){
  const k=r.toFixed(2)+":"+(wide||0.24);
  return _WHEEL_CACHE[k] || (_WHEEL_CACHE[k]=wheelGeo(r, wide));
}

/* --- highway traffic -----------------------------------------------------
   Four lanes, two each way, and nothing on rails any more than it has to
   be. Each vehicle wants a speed; it follows whatever is ahead of it in its
   lane, and when that is slower than it would like and the other lane is
   clear it pulls out, passes, and moves back right — keep right except to
   pass, which on I-79 most people do. Wrapped at ±1.56 km, past the haze. */
const TRAFFIC=[];
const GLOW_TEX=(function(){
  const c=cvs(64,64), x=c.getContext("2d");
  const g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,"rgba(255,255,255,1)"); g.addColorStop(0.25,"rgba(255,244,214,0.65)");
  g.addColorStop(1,"rgba(255,230,170,0)");
  x.fillStyle=g; x.fillRect(0,0,64,64); return setSRGB(new T.CanvasTexture(c));
})();
// lane centre x for a carriageway (dir -1 northbound, +1 southbound), lane 0 = right
function laneX(dir, lane){
  if(dir<0) return HWY.nb + (lane===0 ? 1 : -1)*HWY.lane/2;
  return HWY.sb + (lane===0 ? -1 : 1)*HWY.lane/2;
}
function buildVehicleMesh(kind, paint, trailer){
  const parts=vehicleParts(kind, paint, trailer), S=parts.spec;
  const g=new T.Group();
  const ent=parts.OP.slice();
  const wg=wheelGeoCached(S.wr, S.wr>0.45?0.56:0.24);
  for(const az of S.axles) for(const s of [-1,1])
    ent.push({geo:wg, matrix:new T.Matrix4().makeTranslation(s*S.track, S.wr, az), color:null});
  const body=new T.Mesh(mergeEntries(ent), VEH_MAT); body.castShadow=true; body.receiveShadow=true;
  g.add(body);
  if(parts.GL.length) g.add(new T.Mesh(mergeEntries(parts.GL), VEH_GLASS));
  return {g:g, spec:S};
}
(function buildTraffic(){
  const lensMat=(c)=>new T.MeshBasicMaterial({color:c, transparent:true, opacity:0, depthWrite:false,
    fog:false, toneMapped:false, side:T.DoubleSide});
  function lamps(g, S, big){
    const L=[];
    const hy=big?1.10:0.74, ty=big?1.20:0.86;
    for(const s of [-1,1]){
      const hx=s*(S.hw-(big?0.32:0.30));
      const hm=new T.Mesh(new T.PlaneGeometry(big?0.34:0.38,big?0.22:0.12), lensMat(0xfff0d0));
      hm.position.set(hx, hy, S.nose+0.04); g.add(hm); L.push({s:hm, head:true});
      const hs=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, transparent:true, depthWrite:false,
        blending:T.AdditiveBlending, opacity:0}));
      hs.scale.set(1.3,1.3,1); hs.position.set(hx, hy, S.nose+0.10); g.add(hs); L.push({s:hs, head:true, soft:true});
      const tm=new T.Mesh(new T.PlaneGeometry(0.34,0.14), lensMat(0xff2a12));
      tm.position.set(s*(S.hw-(big?0.20:0.24)), ty, S.tail-0.05); tm.rotation.y=Math.PI;
      g.add(tm); L.push({s:tm, head:false});
      const ts=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, transparent:true, depthWrite:false,
        blending:T.AdditiveBlending, opacity:0, color:0xff3418}));
      ts.scale.set(0.7,0.7,1); ts.position.set(s*(S.hw-0.22), ty, S.tail-0.10); g.add(ts);
      L.push({s:ts, head:false, soft:true});
      if(big){                                   // the amber clearance lamps up top
        const am=new T.Mesh(new T.PlaneGeometry(0.12,0.07), lensMat(0xffa21c));
        am.position.set(s*1.18, S.ht-0.06, (S.len>12?3.62:1.26)); g.add(am); L.push({s:am, head:false, amber:true});
      }
    }
    return L;
  }
  // forty-odd vehicles: two in five a truck, the way the interstate runs
  const MIX=[0,1,0,5,1,3,0,6,2,1,0,4,5,1,0,7,3,0,1,5,2,0];
  for(let i=0;i<44;i++){
    const dir=(i%2)?1:-1, kind=MIX[i%MIX.length];
    const big=kind>=4;
    const paint=big ? TRUCK_PAINTS[(i*5)%TRUCK_PAINTS.length] : CAR_PAINTS[(i*7+3)%CAR_PAINTS.length];
    const trailer=["#e8e7e2","#dcdad3","#c9c9c4","#e9e9e6","#b9bcbf"][(i*3)%5];
    const m=buildVehicleMesh(kind, paint, trailer);
    const v={g:m.g, kind:kind, spec:m.spec, nose:m.spec.nose, tail:m.spec.tail,
             hw:m.spec.hw+0.04, ht:m.spec.ht, big:big,
             dir:dir, lane:big ? 0 : (i%5===0 ? 1 : 0), laneT:0, fromLane:0,
             col:{x0:0,x1:0,z0:0,z1:0,y0:0,y1:0}};
    v.fromLane=v.lane; v.laneT=1;
    v.lamps=lamps(m.g, m.spec, big);
    // spread round the loop, out of step with the other carriageway
    v.z=-HWY.wrap + ((i>>1)/22)*HWY.wrap*2 + (dir>0?67:0) + rnd()*40;
    v.want=big ? rr(25.5,28.5) : rr(29,34.5);          // 57-64 and 65-77 mph
    v.speed=v.want;
    v.sway=0; v.swayV=0; v.slow=1; v.x=laneX(dir, v.lane);
    m.g.rotation.order="YXZ";
    scene.add(m.g);
    TRAFFIC.push(v);
  }
})();
// where a vehicle is along its own direction of travel
const _trafProg=v=>v.z*v.dir;                 // distance travelled: z grows northbound-down, so sign by direction
function updateTraffic(dt, dark){
  // car following and lane changes, per carriageway
  for(const v of TRAFFIC){
    if(v.route) continue;                       // on the ramps: 14-life drives it
    let lead=null, gap=1e9, leadO=null, gapO=1e9, behindO=1e9;
    const me=_trafProg(v), myLane=v.laneT<1 ? (v.laneT<0.5?v.fromLane:v.lane) : v.lane;
    for(const o of TRAFFIC){
      if(o===v || o.dir!==v.dir || o.route) continue;
      let d=_trafProg(o)-me;
      if(d<-HWY.wrap) d+=HWY.wrap*2; else if(d>HWY.wrap) d-=HWY.wrap*2;
      const oLane=o.laneT<0.5 ? o.fromLane : o.lane;
      const clear=d - ((v.nose - o.tail)*(d>0?1:0)) - ((o.nose - v.tail)*(d<0?1:0));
      if(oLane===myLane || (o.laneT<1 && (o.lane===myLane || o.fromLane===myLane))){
        if(d>0 && clear<gap){ gap=clear; lead=o; }
      }
      if(oLane!==myLane || (o.laneT<1)){
        if(d>0 && clear<gapO){ gapO=clear; leadO=o; }
        if(d<=0 && -clear<behindO) behindO=-clear;
      }
    }
    // the speed it can hold behind whatever is in front
    let target=v.want*v.slow;
    const safe=v.speed*1.5+9;
    if(lead && gap<safe*2.2) target=Math.min(target, lead.speed*(0.6+0.4*clamp((gap-6)/safe,0,1.4)));
    if(lead && gap<7) target=Math.min(target, lead.speed*0.5);
    // ...and whether to go round it, or to go back right once past
    if(v.laneT>=1 && !v.parking){
      if(v.lane===0 && lead && gap<90 && lead.speed<v.want-1.5 && !v.exiting &&
         gapO>70 && behindO>34 && !v.big){
        v.fromLane=0; v.lane=1; v.laneT=0;
      }else if(v.lane===1 && (!leadO || gapO>60) && behindO>22){
        v.fromLane=1; v.lane=0; v.laneT=0;
      }
    }
    v.speed += clamp(target-v.speed, -6.5*dt, 2.2*dt);
    if(v.laneT<1) v.laneT=Math.min(1, v.laneT+dt/3.6);
  }
  for(const v of TRAFFIC){
    if(v.route) continue;
    // a struck vehicle runs wide and a damped spring walks it back
    if(v.swayV || v.sway!==0){
      v.swayV += (-v.sway*6.4 - v.swayV*2.3)*dt;
      v.sway  += v.swayV*dt;
      v.sway=clamp(v.sway,-3.2,3.2);
      if(Math.abs(v.sway)<0.004 && Math.abs(v.swayV)<0.02){ v.sway=0; v.swayV=0; }
    }
    if(v.slow<1) v.slow=Math.min(1, v.slow+dt*0.42);
    v.z += v.speed*v.dir*dt;
    if(v.z> HWY.wrap && v.dir>0){ v.z-=HWY.wrap*2; v.sway=0; v.swayV=0; }
    if(v.z<-HWY.wrap && v.dir<0){ v.z+=HWY.wrap*2; v.sway=0; v.swayV=0; }
    const e=v.laneT*v.laneT*(3-2*v.laneT);
    const lx=lerp(laneX(v.dir,v.fromLane), laneX(v.dir,v.lane), e);
    const latV=(laneX(v.dir,v.lane)-laneX(v.dir,v.fromLane))*(v.laneT<1 ? 6*v.laneT*(1-v.laneT)/3.6 : 0);
    v.x=lx+v.sway;
    placeVehicle(v, v.x, v.z, Math.atan2(latV+v.swayV, v.dir*Math.max(v.speed,4)), dark);
  }
  if(typeof updateVisitors==="function") updateVisitors(dt, dark);
}
// put a vehicle's shell, its collider and its lamps where it is
function placeVehicle(v, x, z, head, dark, gy){
  const y=(gy===undefined ? roadY(z) : gy)+0.02;
  v.g.position.set(x, y, z);
  v.g.rotation.y=head;
  const fz=Math.cos(head), fx=Math.sin(head);
  // nose up or down with the grade, along whichever way it is pointed
  v.g.rotation.x=(gy===undefined) ? -Math.atan((roadY(z+fz)-roadY(z-fz))/2) : (v.pitch||0);
  const c=v.col, hx=Math.abs(fz)*v.hw+Math.abs(fx)*(v.nose-v.tail)/2,
        hz=Math.abs(fx)*v.hw+Math.abs(fz)*(v.nose-v.tail)/2;
  const mid=(v.nose+v.tail)/2;
  c.x0=x+fx*mid-hx; c.x1=x+fx*mid+hx; c.z0=z+fz*mid-hz; c.z1=z+fz*mid+hz;
  c.y0=y; c.y1=y+v.ht;
  const lit=dark>0.04;
  for(const L of v.lamps){
    L.s.visible=lit;
    if(!lit) continue;
    const brake=(!L.head && !L.amber && v.braking) ? 1.0 : 0.0;
    L.s.material.opacity = L.soft ? dark*(L.head?0.34:0.22+brake*0.25)
                                  : dark*(L.head?0.98:(L.amber?0.85:0.80+brake*0.2));
  }
}
