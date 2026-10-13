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
/* --- the Milky Way ---------------------------------------------------------
   On a clear night out here, away from the towns, it is the thing you look
   up at: a pale river across the sky, brighter and broken toward Sagittarius
   low in the south, split down its length by the dark of the Great Rift.
   It is a band of geometry along the galactic plane (the same great circle
   the star layers crowd toward), painted with mottled star-cloud and dust
   lanes, added onto the sky; the moon and any cloud wash it out. */
let MILKY=null;
function milkyWay(GU, GV, GA, R){
  const W=1024, H=128, c=cvs(W,H), x=c.getContext("2d"), img=x.createImageData(W,H), d=img.data;
  const hsh=(i,j)=>{ const k=Math.sin(i*127.1+j*311.7)*43758.5453; return k-Math.floor(k); };
  const vn=(u,v,f,fv)=>{                              // value noise, wrapping round the band
    const uu=u*f, vv=v*fv, i0=Math.floor(uu), j0=Math.floor(vv), fu=uu-i0, fq=vv-j0;
    const su=fu*fu*(3-2*fu), sv=fq*fq*(3-2*fq), w=a=>((a%f)+f)%f;
    const a=hsh(w(i0),j0), b=hsh(w(i0+1),j0), cc=hsh(w(i0),j0+1), dd=hsh(w(i0+1),j0+1);
    return (a+(b-a)*su)+((cc+(dd-cc)*su)-(a+(b-a)*su))*sv;
  };
  for(let j=0;j<H;j++) for(let i=0;i<W;i++){
    const u=i/W, v=j/H-0.5;
    // brighter toward the core (u ~ 0.25) and in Cygnus (u ~ 0.62), faint opposite
    const core=Math.exp(-Math.pow((((u-0.25)%1+1.5)%1-0.5)/0.10,2)), cyg=Math.exp(-Math.pow((u-0.62)/0.07,2));
    const wide=0.15+0.10*core+0.03*cyg, lane=v-0.03*Math.sin(u*25)-0.02*(vn(u,v,9,4)-0.5);
    let b=Math.exp(-lane*lane/(2*wide*wide))*(0.30+0.85*core+0.40*cyg);
    // star clouds and the dust between them: clumped, not a smooth beam
    const n=vn(u,v,18,5)*0.40+vn(u,v,48,12)*0.32+vn(u,v,130,26)*0.18+vn(u,v,300,50)*0.10;
    b*=0.22+1.30*Math.pow(n,1.5);
    const dust=vn(u+0.37,v,34,9)*0.6+vn(u+0.11,v,90,20)*0.4;
    b*=1-0.75*smoothstep(0.52,0.80,dust);
    // the Great Rift: a ragged dark lane down the middle from Cygnus to the core
    const rift=(u>0.18 && u<0.68) ? Math.exp(-Math.pow((lane+0.012)/0.035,2))*(0.55+0.4*vn(u,v,40,10))*smoothstep(0.18,0.28,u)*(1-smoothstep(0.58,0.68,u)) : 0;
    b*=1-rift*0.85;
    b*=smoothstep(0.5,0.30,Math.abs(v));                // nothing at the band's edges
    const o=(j*W+i)*4, warm=core*0.5;
    d[o]=Math.min(255,b*(205+40*warm)); d[o+1]=Math.min(255,b*(212+20*warm)); d[o+2]=Math.min(255,b*(238-30*warm)); d[o+3]=255;
  }
  x.putImageData(img,0,0);
  // and the star clouds: grains too small to be stars of their own
  for(let k=0;k<16000;k++){
    const u=Math.random(), v=(Math.random()+Math.random()+Math.random()-1.5)*0.26;
    const core=Math.exp(-Math.pow((((u-0.25)%1+1.5)%1-0.5)/0.12,2));
    if(Math.random()>0.30+0.6*core) continue;
    x.fillStyle="rgba(255,248,236,"+(0.05+Math.random()*0.17).toFixed(3)+")";
    x.fillRect(u*W, (0.5+v)*H, 1, 1);
  }
  const tex=setSRGB(new T.CanvasTexture(c)); tex.wrapS=T.RepeatWrapping;
  const N=160, HALF=0.24, pos=[], uv=[], idx=[];
  for(let k=0;k<=N;k++){
    const a=k/N*Math.PI*2;
    for(const sv of [-1,1]){
      const dir=GU.clone().multiplyScalar(Math.cos(a)).addScaledVector(GV,Math.sin(a)).addScaledVector(GA,sv*HALF).normalize();
      pos.push(dir.x*R, dir.y*R, dir.z*R); uv.push(k/N, sv<0?0:1);
    }
    if(k<N){ const b=k*2; idx.push(b,b+1,b+2, b+1,b+3,b+2); }
  }
  const g=new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(pos,3));
  g.setAttribute("uv", new T.Float32BufferAttribute(uv,2)); g.setIndex(idx);
  const m=new T.Mesh(g, new T.MeshBasicMaterial({map:tex, transparent:true, opacity:0, depthWrite:false, fog:false,
    blending:T.AdditiveBlending, toneMapped:false, side:T.DoubleSide}));
  m.frustumCulled=false; m.renderOrder=-2;
  MILKY=m;
  return m;
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
    pts.frustumCulled=false; pts.renderOrder=-2;
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
  starSky.add(milkyWay(GU, GV, GA, R-30));
  starPivot=new T.Group();
  starPivot.rotation.x=0.96;                     // the pole, ~35 deg above the horizon
  starPivot.add(starSky); scene.add(starPivot);
})();
/* --- the moon, and where it is in the month --------------------------------
   The phase starts from the real one tonight (days since a known new moon,
   over the synodic month) and moves on a day for every day of the clock
   here. It rides behind the sun by the phase: new, it is up with the sun and
   lost in it; at first quarter it is high in the south at sunset; full, it
   rises as the sun goes down. Its face is drawn on a canvas: the grey seas,
   the bright highlands, and the lit part cut by the terminator, an ellipse
   whose width goes with the phase, turned so the lit limb faces the sun
   wherever the sun is. The dark part keeps a little earthshine. */
const MOON=(function(){
  const S=256, c=cvs(S,S), face=cvs(S,S), fx=face.getContext("2d"), R=37;
  // the face, once: highlands, maria, a few rayed craters
  const cx=S/2, cy=S/2;
  const g=fx.createRadialGradient(cx-8,cy-10,4,cx,cy,R);
  g.addColorStop(0,"#fbfaf4"); g.addColorStop(0.8,"#e4e2d8"); g.addColorStop(1,"#c9c7be");
  fx.fillStyle=g; fx.beginPath(); fx.arc(cx,cy,R,0,7); fx.fill();
  fx.save(); fx.beginPath(); fx.arc(cx,cy,R,0,7); fx.clip();
  for(const [mx,my,mr,a] of [[-10,-12,11,0.30],[-17,0,9,0.26],[2,-14,8,0.28],[8,-2,9,0.24],[13,8,6,0.22],[-6,10,7,0.20],
                             [-22,-12,6,0.22],[18,-10,5,0.20],[-2,2,5,0.16],[6,20,4,0.14]]){
    const mg=fx.createRadialGradient(cx+mx,cy+my,0,cx+mx,cy+my,mr);
    mg.addColorStop(0,"rgba(110,112,118,"+a+")"); mg.addColorStop(1,"rgba(110,112,118,0)");
    fx.fillStyle=mg; fx.beginPath(); fx.arc(cx+mx,cy+my,mr,0,7); fx.fill();
  }
  for(const [mx,my,mr] of [[-4,27,2.6],[20,14,1.6],[-26,6,1.4]]){        // Tycho and friends, bright and rayed
    fx.fillStyle="rgba(255,255,250,0.55)"; fx.beginPath(); fx.arc(cx+mx,cy+my,mr,0,7); fx.fill();
    fx.strokeStyle="rgba(255,255,250,0.10)"; fx.lineWidth=0.8;
    for(let k=0;k<8;k++){ const a=k*0.785+mr; fx.beginPath(); fx.moveTo(cx+mx,cy+my); fx.lineTo(cx+mx+Math.cos(a)*14, cy+my+Math.sin(a)*14); fx.stroke(); }
  }
  fx.restore();
  const x=c.getContext("2d");
  const M={c:c, phase:0, frac:1, theta:0, up:0, _f:-1, _t:9, bright:0};
  // the phase tonight: days since the new moon of 6 January 2000, 18:14 UT
  const base=((Date.now()/86400000+2440587.5-2451550.26)/29.530588853)%1;
  M.phaseAt=day=>((base+day/29.530588853)%1+1)%1;
  M.draw=function(f, theta, haze){
    if(Math.abs(f-this._f)<0.004 && Math.abs(theta-this._t)<0.02) return false;
    this._f=f; this._t=theta;
    x.clearRect(0,0,S,S);
    // the glow round it, as much as there is moon to make it
    const hg=x.createRadialGradient(cx,cy,R*0.9,cx,cy,S/2);
    hg.addColorStop(0,"rgba(190,205,240,"+(0.30*f+0.02).toFixed(3)+")"); hg.addColorStop(0.35,"rgba(150,170,220,"+(0.08*f).toFixed(3)+")");
    hg.addColorStop(1,"rgba(120,150,210,0)");
    x.fillStyle=hg; x.fillRect(0,0,S,S);
    // earthshine: the whole disc, very faint, cut out of the sky behind it
    x.globalAlpha=0.10; x.drawImage(face,0,0); x.globalAlpha=1;
    // the lit part: the half toward the sun, and the terminator's ellipse
    x.save(); x.translate(cx,cy); x.rotate(-theta);
    const a=R*Math.abs(1-2*f);
    x.beginPath(); x.arc(0,0,R+0.5,-Math.PI/2,Math.PI/2,false);
    if(f>=0.5) x.ellipse(0,0,a,R+0.5,0,Math.PI/2,Math.PI*1.5,false);
    else       x.ellipse(0,0,Math.max(0.01,a),R+0.5,0,Math.PI/2,-Math.PI/2,true);
    x.closePath(); x.rotate(theta); x.translate(-cx,-cy); x.clip();
    x.drawImage(face,0,0);
    x.restore();
    return true;
  };
  return M;
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
  sunDisc.renderOrder=-2;
  const mt=setSRGB(new T.CanvasTexture(MOON.c));
  moonDisc=new T.Sprite(new T.SpriteMaterial({map:mt, transparent:true, depthWrite:false, fog:false}));
  moonDisc.scale.set(250,250,1); moonDisc.renderOrder=-2; scene.add(moonDisc);
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
           nightAmount:0, sunsetAmount:0, dark:0, hour:0, paused:false, day:0};
  return {
    DUR:DUR, P:P, state:s,
    setHour(h){ s.t=hourToT(h); s.hour=h; }, sunTimes:sunTimes,
    nudge(d){ s.t=(s.t+d+1)%1; },
    tick(dt){
      if(!s.paused){ const t0=s.t; s.t=(s.t+dt/DUR)%1; if(s.t<t0) s.day++; }   // a new day at sunrise
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
      if(typeof skyWeather==="function") skyWeather(skyImg, day, set, night);   // overcast, fog, lightning
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

/* 5b · the vehicles themselves are built in 04b-vehicles.js */

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
// a vehicle's group: its shell near, a coarse one far, the trailer's
// painted box shared by both; wheels come from WHEEL_POOL
function buildVehicleMesh(kind, paint, trailer, livery){
  const parts=vehicleParts(kind, paint, trailer, livery), S=parts.spec;
  const far=vehicleParts(kind, paint, trailer, livery, true);
  const g=new T.Group(), near=new T.Group(), farG=new T.Group();
  const body=new T.Mesh(mergeEntries(parts.OP), VEH_MAT); body.castShadow=true; body.receiveShadow=true;
  near.add(body);
  if(parts.GL.length) near.add(new T.Mesh(mergeEntries(parts.GL), VEH_GLASS));
  const fb=new T.Mesh(mergeEntries(far.OP), VEH_MAT); fb.castShadow=true; farG.add(fb);
  if(far.GL.length) farG.add(new T.Mesh(mergeEntries(far.GL), VEH_GLASS));
  farG.visible=false;
  g.add(near); g.add(farG);
  if(parts.LV && parts.LV.length){ const lv=new T.Mesh(mergeEntries(parts.LV), TRAILER_MAT); lv.castShadow=true; lv.receiveShadow=true; g.add(lv); }
  return {g:g, spec:S, lamps:parts.lamps, lod:{near:near, far:farG}};
}
(function buildTraffic(){
  const lensMat=(c)=>new T.MeshBasicMaterial({color:c, transparent:true, opacity:0, depthWrite:false,
    fog:false, toneMapped:false, side:T.DoubleSide});
  // the lenses and their glows, at the anchors the builder left on the body
  function lamps(g, A, big){
    const L=[];
    const lens=(a, w, h, c, extra)=>{
      const m=new T.Mesh(new T.PlaneGeometry(w,h), lensMat(c));
      m.position.copy(a.p); m.lookAt(a.p.clone().add(a.n)); g.add(m);
      L.push(Object.assign({s:m}, extra));
    };
    const glow=(a, sc, c, extra)=>{
      const s=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, transparent:true, depthWrite:false,
        blending:T.AdditiveBlending, opacity:0, color:c}));
      s.scale.set(sc,sc,1); s.position.copy(a.p).addScaledVector(a.n,0.06); g.add(s);
      L.push(Object.assign({s:s, soft:true}, extra));
    };
    for(const a of A.head){ lens(a, big?0.34:0.30, big?0.20:0.10, 0xfff0d0, {head:true}); glow(a, 1.3, 0xffffff, {head:true}); }
    for(const a of A.tail){ lens(a, big?0.24:0.28, big?0.12:0.11, 0xff2a12, {head:false}); glow(a, 0.7, 0xff3418, {head:false}); }
    for(const a of (A.amber||[])) lens(a, 0.10, 0.06, 0xffa21c, {head:false, amber:true});
    return L;
  }
  // forty-odd vehicles: two in five a truck, the way the interstate runs
  const MIX=[0,1,0,5,1,3,0,6,2,1,0,4,5,1,0,7,3,0,1,5,2,0];
  for(let i=0;i<44;i++){
    const dir=(i%2)?1:-1, kind=MIX[i%MIX.length];
    const big=kind>=4;
    const paint=big ? TRUCK_PAINTS[(i*5)%TRUCK_PAINTS.length] : CAR_PAINTS[(i*7+3)%CAR_PAINTS.length];
    const trailer=["#e8e7e2","#dcdad3","#c9c9c4","#e9e9e6","#b9bcbf"][(i*3)%5];
    const m=buildVehicleMesh(kind, paint, trailer, (i>>1)%2);
    const v={g:m.g, kind:kind, spec:m.spec, nose:m.spec.nose, tail:m.spec.tail,
             hw:m.spec.hw+0.04, ht:m.spec.ht, big:big,
             dir:dir, lane:big ? 0 : (i%5===0 ? 1 : 0), laneT:0, fromLane:0,
             col:{x0:0,x1:0,z0:0,z1:0,y0:0,y1:0}};
    v.fromLane=v.lane; v.laneT=1;
    v.lamps=lamps(m.g, m.lamps, big);
    v.lod=m.lod;
    WHEEL_POOL.register(v, m.spec);
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
/* An incident on the northbound shoulder, now and then (14e-incidents):
   while it is on, the right lane is coned off from zt down to zEnd, and
   everybody slows to look as they go by. */
const CRASH={on:false, dir:-1, lane:0, zt:64, zEnd:-60, virt:{speed:0, tail:0, nose:0}};
// where a vehicle is along its own direction of travel
const _trafProg=v=>v.z*v.dir;                 // distance travelled: z grows northbound-down, so sign by direction
function updateTraffic(dt, dark){
  // car following and lane changes, per carriageway
  for(const v of TRAFFIC){
    if(v.route) continue;                       // on the ramps: 14-life drives it
    let lead=null, gap=1e9, leadO=null, gapO=1e9, behindO=1e9, behindV=0;
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
        if(d<=0 && -clear<behindO){ behindO=-clear; behindV=o.speed; }
      }
    }
    /* THE INTELLIGENT DRIVER MODEL (Treiber): free-road acceleration toward
       the speed it wants, less a braking term that grows as the gap closes
       on the desired gap — a standstill margin plus a time headway plus
       whatever it takes to shed the closing speed. Trucks hang back further
       and pull away slower. */
    // the incident: the cones are a standing obstacle in the closed lane, and
    // from a couple of hundred metres out until past it everyone rubbernecks
    let coned=false, inZone=false;
    if(CRASH.on && v.dir===CRASH.dir){
      const dT=(v.z-CRASH.zt)*(-v.dir), dE=(v.z-CRASH.zEnd)*(-v.dir);   // ahead of the taper / of the end
      inZone=dT<260 && dE>-25;
      if(myLane===CRASH.lane && dT>0 && dT-v.nose<gap){ gap=Math.max(0.5, dT-v.nose); lead=CRASH.virt; coned=true; }
    }
    let v0=Math.max(1, v.want*v.slow), Amax=v.big?0.7:1.3, Bc=2.2, Tg=v.big?1.9:1.5, s0=v.big?9:6;
    if(inZone) v0=Math.min(v0, v.big?17:19);
    let acc=Amax*(1-Math.pow(Math.min(2, v.speed/v0),4));
    if(lead){
      const dv=v.speed-lead.speed, ss=s0+Math.max(0, v.speed*Tg+v.speed*dv/(2*Math.sqrt(Amax*Bc)));
      acc-=Amax*Math.pow(ss/Math.max(gap,0.5),2);
    }
    acc=clamp(acc,-9,Amax);
    v.braking=acc<-1.2;
    // round it, or back right once past; a lane change needs room both ways
    v.hold=Math.max(0,(v.hold||0)-dt);
    if(v.laneT>=1 && !v.parking && v.hold<=0){
      const okAhead=gapO>Math.max(40, v.speed*1.9), okBehind=behindO>Math.max(18, 8+behindV*1.3);
      if(v.lane===0 && !v.exiting && (!v.big || coned) && (okAhead || coned) && okBehind &&
         ((lead && gap<120 && lead.speed<v.want-2) || v.yieldMerge)){
        v.fromLane=0; v.lane=1; v.laneT=0; v.hold=7+rnd()*5;
      }else if(v.lane===1 && !inZone && (!leadO || gapO>Math.max(90, v.speed*3.0)) && behindO>Math.max(30, 10+behindV*1.5)){
        v.fromLane=1; v.lane=0; v.laneT=0; v.hold=5+rnd()*6;
      }
    }
    v.yieldMerge=false;
    v.speed=Math.max(0, v.speed+acc*dt);
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
    v.spin=(v.spin+v.speed*dt/v.spec.wr)%(Math.PI*2);
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
