"use strict";
/* REST AREA · 07-forest.js
   the Pennsylvania woods: species, the foliage atlas, instanced chunks with
   two levels of detail, the canopy seen from the road, wind, the seasons
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   7 · THE WOODS
   Northern hardwoods, mostly: sugar and red maple, black cherry, red oak,
   beech, with eastern hemlock in the damp hollows and white pine in clumps.
   Second growth, so the trunks are straight and close and the crowns are
   all up top; at the edge of a clearing the light comes in from the side
   and everything fills in down to the ground.

   How it is drawn:
   * Every tree is one of a handful of VARIANTS — trunk, limbs and a crown of
     alpha-cut leaf cards — built once and instanced thousands of times.
   * The instances are bucketed by 96 m CHUNKS, each with its own bounding
     sphere (r128 culls an InstancedMesh by its geometry's sphere and knows
     nothing of where the instances are), and each chunk has a NEAR set and
     a cheap FAR set: a few soft blobs where the leaf cards were. The loop
     picks one per chunk by distance.
   * Past the walkable zone the woods are a CANOPY: one lumpy surface laid
     over the hills at crown height, which is all a forest ever is from a
     car at seventy or a drone at two hundred feet.
   * One material for every near tree: bark and leaves share an atlas. A
     card's normal is pointed out from the middle of its crown rather than
     off its own face, so a crown shades as one soft volume. Leaves sway.
   * A tree's leaves take their colour from the instance and its bark does
     not, which is what lets the same woods turn in October.
   ---------------------------------------------------------------------- */
const WIND_U={uTime:{value:0}, uGust:{value:0.3}};
const FOREST=(function(){
  /* ---- the atlas -------------------------------------------------------
     1024 square. Leaves are drawn in near-neutral light tones and take their
     hue from the vertex and the instance; bark is drawn in its own colour.
       leaf     0,0     512²   a broadleaf spray: maple, cherry, oak
       conifer  512,0   512²   a hemlock frond, flat, needles both sides
       pine     0,512   512²   white pine: soft bundles of long needles
       bark     512,512 256×512 furrowed: oak, maple, cherry, hemlock
       smooth   768,512 256²   beech grey, smooth, with the odd eye
       fern     768,768 256²   one hay-scented fern frond                 */
  const ATL=1024, atlas=cvs(ATL,ATL), ax=atlas.getContext("2d");
  ax.clearRect(0,0,ATL,ATL);
  const REG={leaf:[0,0,512,512], conifer:[512,0,512,512], pine:[0,512,512,512],
             bark:[512,512,256,512], smooth:[768,512,256,256], fern:[768,768,256,256]};
  const R0=_trng(77777);
  function gauss(){ return Math.sqrt(-2*Math.log(R0()+1e-7))*Math.cos(6.2831853*R0()); }
  (function drawLeaves(){
    const [ox,oy,S]=REG.leaf, c=S/2;
    // twigs, so the holes in a crown have something in them
    ax.lineCap="round";
    for(let i=0;i<14;i++){
      const a=R0()*6.283, L=S*(0.22+R0()*0.22);
      ax.strokeStyle="rgba(78,66,50,1)"; ax.lineWidth=2.2;
      ax.beginPath(); ax.moveTo(ox+c+Math.cos(a)*S*0.04, oy+c+Math.sin(a)*S*0.04);
      ax.quadraticCurveTo(ox+c+Math.cos(a+0.3)*L*0.5, oy+c+Math.sin(a+0.3)*L*0.5,
                          ox+c+Math.cos(a)*L, oy+c+Math.sin(a)*L); ax.stroke();
    }
    // three depths of leaf: the back ones darker, which is the crown shading itself
    const layers=[[260,0.50],[240,0.68],[190,0.86]];
    for(const [n,lum] of layers){
      for(let i=0;i<n;i++){
        let px=gauss()*S*0.17, py=gauss()*S*0.17;
        const d=Math.hypot(px,py); if(d>S*0.44){ px*=S*0.44/d; py*=S*0.44/d; }
        const L=S*(0.020+R0()*0.018), W=L*(0.55+R0()*0.25), a=R0()*6.283;
        const l=lum+(R0()-0.5)*0.16, warm=(R0()-0.5)*0.06;
        ax.save(); ax.translate(ox+c+px, oy+c+py); ax.rotate(a);
        ax.fillStyle="rgb("+((l+warm)*236|0)+","+(l*244|0)+","+((l-warm)*214|0)+")";
        ax.beginPath(); ax.moveTo(0,-L); ax.quadraticCurveTo(W,-L*0.1,0,L);
        ax.quadraticCurveTo(-W,-L*0.1,0,-L); ax.fill();
        ax.strokeStyle="rgba(40,46,30,0.30)"; ax.lineWidth=0.8;
        ax.beginPath(); ax.moveTo(0,-L*0.85); ax.lineTo(0,L*0.9); ax.stroke();
        ax.restore();
      }
    }
  })();
  (function drawConifer(){
    const [ox,oy,S]=REG.conifer;
    // three fronds fanned from the left edge: a card's +u runs out from the
    // trunk, so the frond's base is at u = 0
    for(let f=0;f<5;f++){
      const y0=oy+S*(0.22+f*0.14), droop=(f-2)*0.06;
      let px=ox+6, py=y0;
      const segs=24;
      for(let k=0;k<segs;k++){
        const t=k/segs, nx=px+S*0.95/segs, ny=py+S*droop/segs+(R0()-0.5)*2;
        ax.strokeStyle="rgba(84,72,56,1)"; ax.lineWidth=2.6*(1-t)+0.6;
        ax.beginPath(); ax.moveTo(px,py); ax.lineTo(nx,ny); ax.stroke();
        // needles both sides, short and flat, shorter toward the tip
        const nl=S*0.046*(1-t*0.5);
        for(const sd of [-1,1]) for(let q=0;q<4;q++){
          const bx2=px+(nx-px)*q/3, by2=py+(ny-py)*q/3;
          const l=0.48+R0()*0.44;
          ax.strokeStyle="rgb("+(l*214|0)+","+(l*236|0)+","+(l*214|0)+")";
          ax.lineWidth=3.2;
          ax.beginPath(); ax.moveTo(bx2,by2); ax.lineTo(bx2+nl*0.3, by2+sd*nl); ax.stroke();
        }
        // side shoots
        if(k%4===2 && t<0.8) for(const sd of [-1,1]){
          let sx=nx, sy=ny;
          for(let j=0;j<5;j++){
            const ex=sx+S*0.026, ey=sy+sd*S*0.024;
            for(const s2 of [-1,1]){ const l=0.5+R0()*0.4;
              ax.strokeStyle="rgb("+(l*214|0)+","+(l*236|0)+","+(l*214|0)+")"; ax.lineWidth=2.0;
              ax.beginPath(); ax.moveTo(sx,sy); ax.lineTo(sx+S*0.012+s2*S*0.016, sy+s2*S*0.022); ax.stroke(); }
            sx=ex; sy=ey;
          }
        }
        px=nx; py=ny;
      }
    }
  })();
  (function drawPine(){
    const [ox,oy,S]=REG.pine, c=S/2;
    for(let b=0;b<9;b++){
      const bx2=ox+c+gauss()*S*0.10, by2=oy+c+gauss()*S*0.10;
      const dir=R0()*6.283;
      for(let n=0;n<60;n++){
        const a=dir+(R0()-0.5)*2.4, L=S*(0.14+R0()*0.16);
        const l=0.52+R0()*0.42;
        ax.strokeStyle="rgb("+(l*206|0)+","+(l*236|0)+","+(l*214|0)+")";
        ax.lineWidth=1.8;
        ax.beginPath(); ax.moveTo(bx2,by2);
        ax.quadraticCurveTo(bx2+Math.cos(a)*L*0.5, by2+Math.sin(a)*L*0.5+L*0.08,
                            bx2+Math.cos(a)*L, by2+Math.sin(a)*L+L*0.16); ax.stroke();
      }
    }
  })();
  (function drawBark(){
    const [ox,oy,W,H]=REG.bark;
    ax.fillStyle="#7c766c"; ax.fillRect(ox,oy,W,H);
    for(let i=0;i<16000;i++){
      const g=(70+R0()*80)|0;
      ax.fillStyle="rgba("+g+","+(g-4)+","+(g-10)+",0.35)";
      ax.fillRect(ox+R0()*W, oy+R0()*H, 1+R0()*2, 2+R0()*4);
    }
    // the furrows: dark, wandering, mostly vertical
    for(let i=0;i<26;i++){
      let px=ox+R0()*W, py=oy;
      ax.strokeStyle="rgba(34,30,26,"+(0.45+R0()*0.4).toFixed(2)+")"; ax.lineWidth=2+R0()*4;
      ax.beginPath(); ax.moveTo(px,py);
      while(py<oy+H){ py+=10+R0()*24; px+=(R0()-0.5)*12; ax.lineTo(clamp(px,ox,ox+W),py); }
      ax.stroke();
    }
    for(let i=0;i<40;i++){                    // lichen, grey-green and pale
      ax.fillStyle="rgba("+(R0()<0.6?"170,184,150":"210,214,190")+","+(0.18+R0()*0.22).toFixed(2)+")";
      ax.beginPath(); ax.ellipse(ox+R0()*W, oy+R0()*H, 3+R0()*10, 3+R0()*14, 0, 0, 7); ax.fill();
    }
  })();
  (function drawSmooth(){
    const [ox,oy,W,H]=REG.smooth;
    ax.fillStyle="#b4b2aa"; ax.fillRect(ox,oy,W,H);
    for(let i=0;i<3000;i++){
      ax.fillStyle="rgba("+(R0()<0.5?"255,255,250":"60,60,56")+",0.07)";
      ax.fillRect(ox+R0()*W, oy+R0()*H, 1+R0()*3, 1);
    }
    for(let i=0;i<10;i++){                    // the eyes a beech grows round old limbs
      const px=ox+R0()*W, py=oy+R0()*H;
      ax.strokeStyle="rgba(50,48,44,0.5)"; ax.lineWidth=2;
      ax.beginPath(); ax.ellipse(px,py,6+R0()*6,3+R0()*3,0,0,7); ax.stroke();
    }
    for(let i=0;i<30;i++){
      ax.fillStyle="rgba(150,170,130,"+(0.10+R0()*0.18).toFixed(2)+")";
      ax.beginPath(); ax.ellipse(ox+R0()*W, oy+R0()*H, 4+R0()*14, 4+R0()*10, 0, 0, 7); ax.fill();
    }
  })();
  (function drawFern(){
    const [ox,oy,S]=REG.fern;
    // a frond from the bottom-left corner to the top-right
    const steps=26;
    for(let k=0;k<steps;k++){
      const t=k/steps, px=ox+8+t*(S-24), py=oy+S-8-t*(S-24)-Math.sin(t*3.1)*12;
      const L=S*0.20*(1-t*0.8)*(t<0.08?t/0.08:1);
      for(const sd of [-1,1]){
        const l=0.55+R0()*0.35;
        ax.fillStyle="rgb("+(l*220|0)+","+(l*240|0)+","+(l*200|0)+")";
        ax.save(); ax.translate(px,py); ax.rotate(-0.785+sd*1.25);
        ax.beginPath(); ax.moveTo(0,0); ax.quadraticCurveTo(L*0.5,L*0.16,L,0);
        ax.quadraticCurveTo(L*0.5,-L*0.16,0,0); ax.fill(); ax.restore();
      }
    }
    ax.strokeStyle="rgba(90,110,60,1)"; ax.lineWidth=2;
    ax.beginPath(); ax.moveTo(ox+8,oy+S-8); ax.lineTo(ox+S-16,oy+16); ax.stroke();
  })();
  const ATLAS=setSRGB(new T.CanvasTexture(atlas));
  ATLAS.anisotropy=MAXANISO;
  // a region's UVs, inset two texels so mip filtering stays inside it
  function reg(name){
    const r=REG[name], w=r[2], h=r[3]||r[2], i=2;
    return {u0:(r[0]+i)/ATL, u1:(r[0]+w-i)/ATL, v0:1-(r[1]+h-i)/ATL, v1:1-(r[1]+i)/ATL};
  }
  const RG={leaf:reg("leaf"), conifer:reg("conifer"), pine:reg("pine"), bark:reg("bark"),
            smooth:reg("smooth"), fern:reg("fern")};

  /* ---- materials: wind, and colour that only reaches the leaves -------- */
  function patchColour(shader){
    shader.vertexShader="attribute float aLeaf;\n"+shader.vertexShader.replace("#include <color_vertex>",
      ["#if defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )",
       "  vColor = vec3( 1.0 );",
       "#endif",
       "#ifdef USE_COLOR",
       "  vColor *= color;",
       "#endif",
       "#ifdef USE_INSTANCING_COLOR",
       "  vColor *= mix( vec3( 1.0 ), instanceColor, aLeaf );",
       "#endif"].join("\n"));
  }
  const WIND_GLSL=["#include <begin_vertex>",
    "#ifdef USE_INSTANCING",
    "  vec3 ip = vec3( instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2] );",
    "#else",
    "  vec3 ip = vec3( 0.0 );",
    "#endif",
    "  float ph = ip.x*0.071 + ip.z*0.093;",
    "  float sw = aSway * ( 0.55 + uGust ) * ( sin( uTime*1.15 + ph ) * 0.6 + sin( uTime*2.9 + ph*2.3 + position.y*0.4 ) * 0.28 );",
    "  transformed.x += sw * 0.16;",
    "  transformed.z += sw * 0.10;",
    "  transformed.y += sw * 0.03;"].join("\n");
  function patchWind(shader){
    shader.uniforms.uTime=WIND_U.uTime; shader.uniforms.uGust=WIND_U.uGust;
    shader.vertexShader="attribute float aSway;\nuniform float uTime;\nuniform float uGust;\n"+
      shader.vertexShader.replace("#include <begin_vertex>", WIND_GLSL);
  }
  // the crown shades as one volume: keep the radial normal on both faces
  const NOFLIP=T.ShaderChunk.normal_fragment_begin.replace("normal = normal * faceDirection;", "");
  const NEAR_MAT=new T.MeshStandardMaterial({map:ATLAS, alphaTest:0.42, side:T.DoubleSide,
    vertexColors:true, roughness:0.82, metalness:0});
  NEAR_MAT.onBeforeCompile=(sh)=>{ patchColour(sh); patchWind(sh);
    sh.fragmentShader=sh.fragmentShader.replace("#include <normal_fragment_begin>", NOFLIP); };
  const DEPTH_MAT=new T.MeshDepthMaterial({map:ATLAS, alphaTest:0.42, depthPacking:T.RGBADepthPacking,
    side:T.DoubleSide});
  DEPTH_MAT.onBeforeCompile=(sh)=>{ patchWind(sh); };
  const FAR_TEX=(function(){
    const c=cvs(128,128), x=c.getContext("2d"), r=_trng(5150);
    x.fillStyle="#b8bcb0"; x.fillRect(0,0,128,128);
    for(let i=0;i<420;i++){
      const l=0.35+r()*0.65;
      x.fillStyle="rgba("+(l*240|0)+","+(l*250|0)+","+(l*228|0)+",0.6)";
      x.beginPath(); x.arc(r()*128, r()*128, 1.5+r()*5, 0, 7); x.fill();
    }
    return _tex(c);
  })();
  const FAR_MAT=new T.MeshStandardMaterial({map:FAR_TEX, vertexColors:true, roughness:0.92, metalness:0});
  FAR_MAT.onBeforeCompile=(sh)=>{ patchColour(sh); };

  /* ---- a tree, built by hand: limbs and cards ---------------------------- */
  class TG{
    constructor(){ this.P=[]; this.N=[]; this.U=[]; this.C=[]; this.S=[]; this.L=[]; this.I=[]; }
    v(p,n,u,v,c,s,l){ this.P.push(p.x,p.y,p.z); this.N.push(n.x,n.y,n.z); this.U.push(u,v);
      this.C.push(c.r,c.g,c.b); this.S.push(s); this.L.push(l); return this.P.length/3-1; }
    // a tapered limb from a to b; the bark tile runs once along it
    limb(a,b,r0,r1,seg,col,rg,s0,s1){
      const d=new T.Vector3().subVectors(b,a), L=d.length(); if(L<1e-3) return;
      d.multiplyScalar(1/L);
      const u=Math.abs(d.y)<0.9 ? new T.Vector3(0,1,0).cross(d).normalize() : new T.Vector3(1,0,0).cross(d).normalize();
      const w=new T.Vector3().crossVectors(d,u);
      const base=this.P.length/3, vr=Math.min(1, L/6);
      for(let k=0;k<=seg;k++){
        const a2=k/seg*Math.PI*2, cs=Math.cos(a2), sn=Math.sin(a2);
        const n=new T.Vector3().addScaledVector(u,cs).addScaledVector(w,sn);
        const uu=rg.u0+(rg.u1-rg.u0)*(k/seg);
        this.v(a.clone().addScaledVector(n,r0), n, uu, rg.v0, col, s0||0, 0);
        this.v(b.clone().addScaledVector(n,r1), n, uu, rg.v0+(rg.v1-rg.v0)*vr, col, s1||0, 0);
      }
      for(let k=0;k<seg;k++){
        const i0=base+k*2, i1=i0+1, i2=i0+2, i3=i0+3;
        this.I.push(i0,i2,i1, i1,i2,i3);
      }
    }
    // a card centred on c, spanning ±w/2 along ex and ±h/2 along ey; normals
    // pointed out from `ctr`, the middle of the crown it belongs to
    card(c, ex, ey, w, h, rg, col, sway, ctr, upB){
      const base=this.P.length/3, n=new T.Vector3();
      const cs=[[-1,-1,rg.u0,rg.v0],[1,-1,rg.u1,rg.v0],[1,1,rg.u1,rg.v1],[-1,1,rg.u0,rg.v1]];
      for(const q of cs){
        const p=c.clone().addScaledVector(ex,q[0]*w/2).addScaledVector(ey,q[1]*h/2);
        n.subVectors(p,ctr); n.y+= (upB===undefined?0.35:upB)*n.length(); n.normalize();
        this.v(p, n, q[2], q[3], col, sway*(0.7+0.3*hash2(p.x*3.1,p.z*2.7)), 1);
      }
      this.I.push(base,base+1,base+2, base,base+2,base+3);
    }
    // a soft ball for the far set: radial normals, so twenty triangles shade round
    blob(c, r, sy, col, leaf){
      const g=new T.IcosahedronGeometry(1, 0), p=g.attributes.position, uv=g.attributes.uv;
      const base=this.P.length/3;
      for(let i=0;i<p.count;i++){
        const x=p.getX(i), y=p.getY(i), z=p.getZ(i), L=Math.hypot(x,y,z)||1;
        const jit=0.85+0.3*hash2(c.x*7+x*3, c.z*5+z*3+y);
        this.v(new T.Vector3(c.x+x*r*jit, c.y+y*r*sy*jit, c.z+z*r*jit), new T.Vector3(x/L,y/L+0.25,z/L).normalize(),
               uv.getX(i)*2, uv.getY(i)*2, col, 0, leaf);
        this.I.push(base+i);
      }
    }
    cone(c, r, h, col, seg){                        // for the far conifers
      const base=this.P.length/3, tip=new T.Vector3(c.x, c.y+h, c.z);
      for(let k=0;k<seg;k++){
        const a0=k/seg*6.2832, a1=(k+1)/seg*6.2832;
        const p0=new T.Vector3(c.x+Math.cos(a0)*r, c.y, c.z+Math.sin(a0)*r);
        const p1=new T.Vector3(c.x+Math.cos(a1)*r, c.y, c.z+Math.sin(a1)*r);
        const n0=new T.Vector3(Math.cos(a0), r/h, Math.sin(a0)).normalize();
        const n1=new T.Vector3(Math.cos(a1), r/h, Math.sin(a1)).normalize();
        const nt=n0.clone().add(n1).normalize();
        const i0=this.v(p0,n0,0,0,col,0,1), i1=this.v(p1,n1,1,0,col,0,1), i2=this.v(tip,nt,0.5,1,col,0,1);
        this.I.push(i0,i2,i1);
      }
    }
    geo(){
      const g=new T.BufferGeometry();
      g.setAttribute("position", new T.Float32BufferAttribute(this.P,3));
      g.setAttribute("normal",   new T.Float32BufferAttribute(this.N,3));
      g.setAttribute("uv",       new T.Float32BufferAttribute(this.U,2));
      g.setAttribute("color",    new T.Float32BufferAttribute(this.C,3));
      g.setAttribute("aSway",    new T.Float32BufferAttribute(this.S,1));
      g.setAttribute("aLeaf",    new T.Float32BufferAttribute(this.L,1));
      g.setIndex(this.I);
      g.computeBoundingSphere();
      return g;
    }
  }
  const UP=new T.Vector3(0,1,0);
  // a random unit vector, biased towards `out`
  function randDir(r, out, bias){
    const v=new T.Vector3(r()*2-1, r()*2-1, r()*2-1).normalize();
    if(out) v.addScaledVector(out, bias).normalize();
    return v;
  }
  function cardAxes(n, spin){
    let ex=new T.Vector3().crossVectors(n, UP);
    if(ex.lengthSq()<1e-4) ex.set(1,0,0);
    ex.normalize();
    const ey=new T.Vector3().crossVectors(ex, n).normalize();
    const c=Math.cos(spin), s=Math.sin(spin);
    return [ex.clone().multiplyScalar(c).addScaledVector(ey,s), ey.clone().multiplyScalar(c).addScaledVector(ex,-s)];
  }
  const BARK=new T.Color(0x8a8378), BARK_D=new T.Color(0x6d675e), BARK_BEECH=new T.Color(0x8f8c85);
  // the far set has no shadows in it and no holes, so it starts darker than
  // the near set's leaves, or the woods brighten as you walk away from them
  const WHITEISH=new T.Color(0x8c8c8c);
  function leafTone(r){ const k=0.86+r()*0.14; return new T.Color(k, k, k*(0.96+r()*0.06)); }

  /* --- broadleaf: maple, cherry, oak, beech ----------------------------
     H the nominal height, cb the crown base as a fraction of it, R the
     crown's radius; edge trees carry their crown much lower. */
  function broadleaf(seed, o){
    const r=_trng(seed), near=new TG(), far=new TG();
    const H=o.H, cb=o.cb, R=o.R, bark=o.bark||BARK, brg=o.smooth?RG.smooth:RG.bark;
    const trunkTop=H*0.86, r0=o.r0||0.30;
    // a trunk that wanders a little, in three pieces, with a root flare
    const lean=new T.Vector3((r()-0.5)*0.05,1,(r()-0.5)*0.05).normalize();
    const pts=[new T.Vector3(0,0,0)];
    for(let k=1;k<=4;k++){
      const y=trunkTop*k/4;
      pts.push(new T.Vector3(lean.x*y+(r()-0.5)*0.25*k/4, y, lean.z*y+(r()-0.5)*0.25*k/4));
    }
    near.limb(new T.Vector3(0,-0.2,0), new T.Vector3(0,0.5,0), r0*1.42, r0*0.99, 8, bark, brg);
    for(let k=0;k<4;k++){
      const ra=r0*(1-k/4*0.78), rb=r0*(1-(k+1)/4*0.78);
      near.limb(pts[k], pts[k+1], ra, rb, k<2?8:6, bark, brg, k/4*0.15, (k+1)/4*0.15);
    }
    far.limb(new T.Vector3(0,-0.2,0), pts[3], r0*1.1, r0*0.42, 4, bark, brg);
    // the crown: limbs out to clump centres, a clump of cards at each end
    const ctr=new T.Vector3(lean.x*H*0.7, H*(cb+(1-cb)*0.55), lean.z*H*0.7);
    const clumps=[];
    const nb=o.limbs||7;
    for(let i=0;i<nb;i++){
      const t=i/(nb-1), y=H*(cb+0.04+t*(0.86-cb-0.04));
      const yaw=i*2.39996+r()*0.6, el=0.45+r()*0.45+t*0.25;
      const L=R*(1.05-t*0.45)*(0.75+r()*0.35);
      const a=new T.Vector3(lean.x*y, y, lean.z*y);
      const dir=new T.Vector3(Math.cos(yaw)*Math.cos(el), Math.sin(el), Math.sin(yaw)*Math.cos(el));
      const b=a.clone().addScaledVector(dir, L);
      const mid=a.clone().addScaledVector(dir, L*0.55).add(new T.Vector3(0, L*0.08, 0));
      near.limb(a, mid, r0*0.42*(1-t*0.5), r0*0.25, 5, bark, brg, 0.15, 0.35);
      near.limb(mid, b, r0*0.25, 0.04, 4, bark, brg, 0.35, 0.6);
      clumps.push({c:b, r:(o.clump||2.3)*(1.05-t*0.25)*(0.85+r()*0.3)});
      // a secondary clump part way along the bigger limbs
      if(t<0.6 && r()<0.7) clumps.push({c:mid.clone().add(new T.Vector3(0,0.6,0)), r:(o.clump||2.3)*0.8});
    }
    clumps.push({c:pts[4].clone().add(new T.Vector3(0,0.4,0)), r:(o.clump||2.3)*1.0});
    // and fill the middle so you never see through the whole crown
    clumps.push({c:ctr.clone(), r:R*0.55});
    for(const cl of clumps){
      const n=Math.round((o.cards||8)*(cl.r/2.3));
      for(let k=0;k<n;k++){
        const off=randDir(r).multiplyScalar(cl.r*0.55*Math.cbrt(r()));
        const c=cl.c.clone().add(off);
        const out=new T.Vector3().subVectors(c, ctr).normalize();
        const nrm=randDir(r, out, 0.9);
        const [ex,ey]=cardAxes(nrm, r()*6.283);
        const s=cl.r*(1.05+r()*0.45);
        near.card(c, ex, ey, s, s, RG.leaf, leafTone(r), 0.35+0.65*(c.y/H), ctr);
      }
    }
    /* The far set is the crown's mass and its silhouette, nothing else: one
       big soft ball in the middle and the three clumps that stand furthest
       out from it. Twenty triangles a ball; seven thousand trees of these
       are what you see from the road. */
    far.blob(ctr, R*0.92, 0.82, WHITEISH, 1);
    const outer=clumps.slice(0,-1).map(cl=>({cl:cl, d:cl.c.distanceTo(ctr)})).sort((a2,b2)=>b2.d-a2.d);
    const used=[];
    for(const o2 of outer){
      if(used.length>=3) break;
      if(used.some(u=>u.c.distanceTo(o2.cl.c)<R*0.8)) continue;
      used.push(o2.cl); far.blob(o2.cl.c, o2.cl.r*1.2, 0.85, WHITEISH, 1);
    }
    return {near:near.geo(), far:far.geo(), trunkR:r0*1.1};
  }
  /* --- eastern hemlock: a dark cone of drooping, flat sprays ------------ */
  function hemlock(seed, o){
    const r=_trng(seed), near=new TG(), far=new TG();
    const H=o.H, base=o.cb*H, R=o.R, bark=BARK_D;
    near.limb(new T.Vector3(0,-0.2,0), new T.Vector3(0,H*0.55,0), o.r0*1.3, o.r0*0.7, 7, bark, RG.bark);
    near.limb(new T.Vector3(0,H*0.55,0), new T.Vector3((r()-0.5)*0.3,H,(r()-0.5)*0.3), o.r0*0.7, 0.03, 5, bark, RG.bark, 0.1, 0.5);
    far.limb(new T.Vector3(0,-0.2,0), new T.Vector3(0,base+1,0), o.r0*1.1, o.r0*0.8, 5, bark, RG.bark);
    const tiers=o.tiers||13, ctrY=base+(H-base)*0.4;
    for(let i=0;i<tiers;i++){
      const t=i/(tiers-1), y=base+t*(H-base)*0.97;
      const rad=R*Math.pow(1-t,0.85)*(0.9+r()*0.3)+0.45;
      const per=Math.max(4, Math.round(8-t*4));
      for(let k=0;k<per;k++){
        const yaw=k/per*6.283+i*0.9+r()*0.5;
        const out=new T.Vector3(Math.cos(yaw),0,Math.sin(yaw));
        // the frond runs out from the trunk and droops at its tip
        const droop=0.18+r()*0.22+t*0.1;
        const ex=new T.Vector3(out.x*Math.cos(droop), -Math.sin(droop), out.z*Math.cos(droop));
        const ey=new T.Vector3(-out.z,0,out.x);
        const c=new T.Vector3(0,y,0).addScaledVector(ex, rad*0.5);
        near.card(c, ex, ey, rad*1.15, rad*1.0, RG.conifer, leafTone(r), 0.2+0.6*t,
                  new T.Vector3(0,ctrY,0), 0.6);
      }
      // the skin of the cone: sprays standing on its surface, facing out, so
      // from the side a conifer is a wall of needles and not a set of spokes
      for(let k=0;k<3;k++){
        const yaw=k/3*6.283+i*1.7+r()*0.6, out=new T.Vector3(Math.cos(yaw),0,Math.sin(yaw));
        const c=new T.Vector3(0,y-0.2,0).addScaledVector(out, rad*0.62);
        const nrm=out.clone().add(new T.Vector3(0,0.35,0)).normalize();
        const ey=new T.Vector3(-out.x*0.35,1,-out.z*0.35).normalize();
        const ex=new T.Vector3().crossVectors(ey,nrm).normalize();
        near.card(c, ex, ey, rad*1.25, (H-base)/tiers*2.6, RG.conifer, leafTone(r), 0.25+0.5*t,
                  new T.Vector3(0,ctrY,0), 0.4);
      }
      // and a flat spray across the trunk at every other tier, so that from
      // above (or from under) a hemlock is a mass and not a coat rack
      if(i%2===0){
        const yaw=r()*6.283, ex=new T.Vector3(Math.cos(yaw),-0.12,Math.sin(yaw)).normalize(),
              ey=new T.Vector3(-Math.sin(yaw),0,Math.cos(yaw));
        near.card(new T.Vector3(0,y+0.1,0), ex, ey, rad*2.0, rad*1.5, RG.conifer, leafTone(r), 0.2+0.5*t,
                  new T.Vector3(0,ctrY-3,0), 1.2);
      }
    }
    far.cone(new T.Vector3(0,base,0), R*1.02, (H-base)*0.62, WHITEISH, 7);
    far.cone(new T.Vector3(0,base+(H-base)*0.36,0), R*0.72, (H-base)*0.66, WHITEISH, 7);
    return {near:near.geo(), far:far.geo(), trunkR:o.r0*1.2};
  }
  /* --- white pine: tiers of horizontal limbs with tufts at the ends ----- */
  function pine(seed, o){
    const r=_trng(seed), near=new TG(), far=new TG();
    const H=o.H, bark=BARK_D;
    near.limb(new T.Vector3(0,-0.2,0), new T.Vector3(0,H*0.6,0), o.r0*1.25, o.r0*0.7, 7, bark, RG.bark);
    near.limb(new T.Vector3(0,H*0.6,0), new T.Vector3(0.3,H,0.1), o.r0*0.7, 0.05, 5, bark, RG.bark, 0.05, 0.4);
    far.limb(new T.Vector3(0,-0.2,0), new T.Vector3(0,H*0.75,0), o.r0*1.1, o.r0*0.4, 5, bark, RG.bark);
    const ctr=new T.Vector3(0,H*0.72,0);
    let y=H*o.cb;
    while(y<H*0.97){
      const t=(y-H*o.cb)/(H*(1-o.cb));
      const nb=3+((r()*3)|0);
      for(let k=0;k<nb;k++){
        const yaw=r()*6.283, L=o.R*(1-t*0.55)*(0.6+r()*0.6);
        const a=new T.Vector3(0,y,0), dir=new T.Vector3(Math.cos(yaw), 0.18+r()*0.18, Math.sin(yaw)).normalize();
        const b=a.clone().addScaledVector(dir, L);
        near.limb(a, b, 0.07, 0.02, 4, bark, RG.bark, 0.1, 0.5);
        // two or three soft tufts along the outer half, near horizontal
        for(let q=0;q<3;q++){
          const c=a.clone().addScaledVector(dir, L*(0.45+q*0.27)).add(new T.Vector3(0,0.15,0));
          const n=randDir(r, UP, 2.2);
          const [ex,ey]=cardAxes(n, r()*6.283);
          const s=1.5+r()*0.9;
          near.card(c, ex, ey, s, s, RG.pine, leafTone(r), 0.3+0.6*t, ctr, 0.6);
        }
      }
      y+=1.4+r()*1.6;
    }
    far.blob(new T.Vector3(0.2,H*0.9,0), 2.4, 0.8, WHITEISH, 1);
    far.blob(new T.Vector3(0.6,H*0.74,-0.4), o.R*0.75, 0.42, WHITEISH, 1);
    far.blob(new T.Vector3(-0.6,H*0.58,0.5), o.R*0.85, 0.40, WHITEISH, 1);
    return {near:near.geo(), far:far.geo(), trunkR:o.r0*1.15};
  }
  /* --- a shrub: dense, down to the ground -------------------------------- */
  function shrub(seed, o){
    const r=_trng(seed), near=new TG(), far=new TG();
    const ctr=new T.Vector3(0,o.h*0.45,0);
    for(let k=0;k<5;k++){
      const yaw=r()*6.28, b=new T.Vector3(Math.cos(yaw)*o.w*0.3, o.h*0.8, Math.sin(yaw)*o.w*0.3);
      near.limb(new T.Vector3(0,0,0), b, 0.03, 0.012, 3, BARK_D, RG.bark, 0, 0.3);
    }
    const n=o.cards||12;
    for(let k=0;k<n;k++){
      const c=new T.Vector3((r()-0.5)*o.w*0.7, o.h*(0.25+r()*0.55), (r()-0.5)*o.w*0.7);
      const nrm=randDir(r, new T.Vector3().subVectors(c,ctr).normalize(), 0.8);
      const [ex,ey]=cardAxes(nrm, r()*6.28);
      const s=o.w*(0.55+r()*0.25);
      near.card(c, ex, ey, s, s, o.rg||RG.leaf, leafTone(r), 0.25, ctr, 0.4);
    }
    far.blob(ctr, o.w*0.55, o.h/o.w*1.1, WHITEISH, 1);
    return {near:near.geo(), far:far.geo(), trunkR:0};
  }
  // a fern: a fan of fronds arching out of one crown
  function fern(seed){
    const r=_trng(seed), near=new TG(), far=new TG();
    const ctr=new T.Vector3(0,0.1,0);
    for(let k=0;k<7;k++){
      const yaw=k/7*6.283+r()*0.4, out=new T.Vector3(Math.cos(yaw),0,Math.sin(yaw));
      const lift=0.55+r()*0.35;
      // the frond texture runs corner to corner: lay the card's diagonal outward
      const ex0=new T.Vector3(out.x*Math.cos(lift), Math.sin(lift), out.z*Math.cos(lift));
      const ey0=new T.Vector3(-out.z,0,out.x);
      const ex=ex0.clone().add(ey0).normalize(), ey=new T.Vector3().crossVectors(ex, new T.Vector3().crossVectors(ey0,ex0)).normalize();
      const s=0.62+r()*0.25;
      near.card(new T.Vector3(0,0.05,0).addScaledVector(ex0, s*0.62), ex, ey, s, s, RG.fern, leafTone(r), 0.4, ctr, 0.8);
    }
    return {near:near.geo(), far:far.geo(), trunkR:0};
  }

  /* ---- the species and their variants ---------------------------------
     Each entry: builder, a few seeds, summer and autumn palettes. Colours
     are what the instance multiplies the near-white leaves by. */
  const SPECIES={
    hard:  {build:(s)=>broadleaf(s,{H:22,cb:0.50,R:5.2,r0:0.30,limbs:7,cards:8}), seeds:[11,23,37],
            summer:["#5f8a3a","#6a9440","#577f36","#729a44"],
            autumn:["#c23a22","#d9661f","#e09a26","#e6bb30","#b8471f","#8c5a2a","#d77f1f"]},
    edge:  {build:(s)=>broadleaf(s,{H:18,cb:0.16,R:5.4,r0:0.27,limbs:9,cards:8,clump:2.4}), seeds:[41,53],
            summer:["#628d3b","#6e9842","#5a8538"],
            autumn:["#d0461f","#e0821f","#e6b52c","#c23324","#9a5a26"]},
    beech: {build:(s)=>broadleaf(s,{H:19,cb:0.36,R:5.0,r0:0.27,limbs:8,cards:8,smooth:true,bark:BARK_BEECH}), seeds:[61],
            summer:["#78a24a","#82aa52"], autumn:["#c99a38","#b9862e","#d4ac40"]},
    hemlock:{build:(s)=>hemlock(s,{H:19,cb:0.10,R:3.8,r0:0.28,tiers:17}), seeds:[71,83],
            summer:["#3f6138","#466a3c","#3a5833"], autumn:["#3f6138","#466a3c","#3a5833"]},
    pine:  {build:(s)=>pine(s,{H:25,cb:0.42,R:4.4,r0:0.32}), seeds:[97],
            summer:["#4f7446","#56794a"], autumn:["#4f7446","#56794a"]},
    sapling:{build:(s)=>broadleaf(s,{H:7.5,cb:0.30,R:2.2,r0:0.07,limbs:5,cards:5,clump:1.3}), seeds:[101,113],
            summer:["#6f9b44","#7aa54a"], autumn:["#d8a52c","#c9522a","#9aa13c"]},
    lawn:  {build:(s)=>broadleaf(s,{H:15,cb:0.20,R:6.4,r0:0.34,limbs:10,cards:9,clump:2.7}), seeds:[131,149],
            summer:["#5c8a38","#668f3c"], autumn:["#cf3b24","#e0731e","#e4b02e"]},
    spruce:{build:(s)=>hemlock(s,{H:13,cb:0.04,R:3.0,r0:0.22,tiers:15}), seeds:[163],
            summer:["#4d6b5e"], autumn:["#4d6b5e"]},
    shrub: {build:(s)=>shrub(s,{h:1.9,w:2.2,cards:13}), seeds:[171,181],
            summer:["#5f8a3a","#6e9442","#587e34"], autumn:["#b8322a","#c9582a","#8e7a32"]},
    bush:  {build:(s)=>shrub(s,{h:1.0,w:1.3,cards:11}), seeds:[191],       // clipped boxwood, the beds
            summer:["#4c6e32","#557a36"], autumn:["#4c6e32","#557a36"]},
    fern:  {build:(s)=>fern(s), seeds:[201,211],
            summer:["#7aa246","#86ab4c"], autumn:["#b99a46","#a8883e"]},
  };
  const VARIANTS=[];                 // {sp, near, far, trunkR}
  const SPV={};
  for(const name in SPECIES){
    SPV[name]=[];
    for(const seed of SPECIES[name].seeds){
      const b=SPECIES[name].build(seed);
      const v={sp:name, near:b.near, far:b.far, trunkR:b.trunkR, idx:VARIANTS.length};
      VARIANTS.push(v); SPV[name].push(v);
    }
  }

  /* ---- planting --------------------------------------------------------- */
  const INST=[];                     // {v, x,y,z, s, ry, rx, rz, cs, ca}
  let autumn=false;
  function plant(sp, x, z, o){
    o=o||{};
    const list=SPV[sp], h=hash2(x*1.37,z*0.91);
    const v=list[Math.floor(h*list.length)%list.length];
    const S=SPECIES[sp];
    const pick2=(arr,k)=>new T.Color(arr[Math.floor(hash2(x*k,z*k+3)*arr.length)%arr.length]);
    const cs=o.color ? new T.Color(o.color) : pick2(S.summer, 2.3);
    const ca=o.autumn ? new T.Color(o.autumn) : pick2(S.autumn, 4.1);
    // a little brightness of its own, so no two crowns are the same green
    const k=0.90+hash2(x*5.1,z*3.3)*0.18;
    cs.multiplyScalar(k); ca.multiplyScalar(k);
    const y=o.y===undefined ? Terrain.groundAt(x,z) : o.y;
    INST.push({v:v, x:x, y:y, z:z, s:o.scale||1, ry:o.ry===undefined?h*6.283:o.ry,
               rx:o.lean===false?0:(hash2(x,z*2)-0.5)*0.06, rz:o.lean===false?0:(hash2(x*2,z)-0.5)*0.06,
               cs:cs, ca:ca, solid:o.solid!==false, zone:inZone(x,z)});
  }
  function inZone(x,z){ const Z=SITE.zone; return x>Z.x0 && x<Z.x1 && z>Z.z0 && z<Z.z1; }

  /* ---- the wild woods inside the zone ------------------------------------
     A jittered lattice, 6.4 m, thinned by the mask so the edge of the woods
     is ragged. Which species grows where is a matter of patches: hemlock
     in the damp, pine in clumps, beech scattered, maples and cherry and oak
     everywhere else. Within nine metres of a clearing the trees are edge
     trees, crowned to the ground on the side the light comes from.     */
  (function wild(){
    const Z=SITE.zone, SP=6.4;
    for(let gz=Z.z0+SP/2; gz<Z.z1; gz+=SP) for(let gx=Z.x0+SP/2; gx<Z.x1; gx+=SP){
      const x=gx+(hash2(gx,gz)-0.5)*SP*0.9, z=gz+(hash2(gz*1.3,gx*0.7)-0.5)*SP*0.9;
      // nothing on the path or in the camp; the thinning and the edge trees
      // belong to the site's own clearings, not to a footpath in the woods
      if(Terrain.clearDist(x,z)<0.5) continue;
      const cd=Terrain.siteDist(x,z);
      const m=smoothstep(0.5,6,cd);
      if(hash2(x*3.3,z*1.9)>m*0.96) continue;
      const hem=Terrain.fbm(x*0.010+40, z*0.010+12, 3), pin=Terrain.fbm(x*0.016+3, z*0.016+71, 3);
      const q=hash2(x*0.77,z*1.13);
      let sp;
      if(cd<9) sp = q<0.12 ? "hemlock" : "edge";
      else if(Terrain.pathDist(x,z)<3.2) sp = q<0.2 ? "beech" : "hard";   // high crowns over the path, not hemlock sprays across it
      else if(hem>0.60 && q<0.85) sp="hemlock";
      else if(pin>0.64 && q<0.75) sp="pine";
      else if(q<0.16) sp="beech";
      else if(q<0.22) sp="hemlock";
      else sp="hard";
      plant(sp, x, z, {scale:0.82+hash2(x*7,z*5)*0.36});
    }
    // understory: saplings everywhere, ferns where it is open and damp,
    // and a hedge of shrubs along every edge the sun reaches
    // (as many to the square metre however big the zone is)
    const NU=Math.round(16000*(Z.x1-Z.x0)*(Z.z1-Z.z0)/(416*576));
    for(let i=0;i<NU;i++){
      const x=Z.x0+hash2(i*1.7,3.1)*(Z.x1-Z.x0), z=Z.z0+hash2(i*2.3,7.7)*(Z.z1-Z.z0);
      const cd=Terrain.siteDist(x,z);
      if(cd<-0.5 || Terrain.pathDist(x,z)<0.4) continue;
      const q=hash2(x*1.9,z*2.1);
      if(cd<7){ if(q<0.80) plant(q<0.62?"shrub":"sapling", x, z, {scale:0.75+q*0.7, solid:false}); }
      else if(cd<70){
        if(q<0.16) plant("sapling", x, z, {scale:0.7+q*1.6, solid:false});
        else if(q<0.62 && Terrain.fbm(x*0.05,z*0.05,2)>0.42) plant("fern", x, z, {scale:0.8+q*0.8, solid:false});
      }else if(q<0.08) plant("sapling", x, z, {scale:0.7+q*2, solid:false});
    }
  })();
  /* ---- the floor: logs down, stumps, and the rocks the glacier left -----
     Baked, not instanced: there are only a couple of hundred and they never
     change. A log is a cylinder with its UVs pointed into the atlas's bark,
     lying half sunk, at whatever angle it fell. */
  bucketOf("logbark", ()=>new T.MeshStandardMaterial({map:ATLAS, roughness:0.95}));
  function barkCyl(r0,r1,L,seg){
    const g=new T.CylinderGeometry(r1,r0,L,seg||8,1,false), uv=g.attributes.uv, R=RG.bark;
    for(let i=0;i<uv.count;i++) uv.setXY(i, R.u0+(R.u1-R.u0)*uv.getX(i), R.v0+(R.v1-R.v0)*Math.min(1,uv.getY(i)*L/6));
    uv.needsUpdate=true; return g;
  }
  (function floor(){
    const Z=SITE.zone, NF=Math.round(2600*(Z.x1-Z.x0)*(Z.z1-Z.z0)/(416*576));
    for(let i=0;i<NF;i++){
      const x=Z.x0+hash2(i*3.7,1.3)*(Z.x1-Z.x0), z=Z.z0+hash2(i*5.1,9.7)*(Z.z1-Z.z0);
      const cd=Terrain.clearDist(x,z);
      if(cd<3) continue;
      const q=hash2(x*2.9,z*3.7), y=Terrain.groundAt(x,z);
      if(q<0.040){
        const L=3+q*120, r=0.16+hash2(x,z)*0.2, a=hash2(z,x)*6.28;
        push("logbark", barkCyl(r*0.85, r, L, 8), x, y+r*0.55, z, a, "#8a8070", 0, Math.PI/2);
        if(r>0.24){ const hx=Math.abs(Math.cos(a))*L/2+r, hz=Math.abs(Math.sin(a))*L/2+r;
          if(L<5) addCol(x-hx, x+hx, z-hz, z+hz, y, y+r*1.1); }
      }else if(q<0.060){
        const r=0.22+hash2(x,z)*0.25, h=0.3+hash2(z,x)*0.6;
        push("logbark", barkCyl(r*1.15, r, h, 9), x, y+h/2-0.05, z, q*99, "#8c8272");
        push("logbark", new T.CircleGeometry(r*0.96,9), x, y+h-0.045, z, 0, "#b49a72", -Math.PI/2, 0);   // the rings, a hair over the cap
        addCol(x-r, x+r, z-r, z+r, y, y+h);
      }else if(q<0.095){
        const s=0.35+hash2(x*7,z)*1.3;
        push("rock", rockGeo(s, (i%40)+3), x, y+s*0.18, z, q*80, "#9a958a");
        if(s>0.6) addCol(x-s*0.75, x+s*0.75, z-s*0.75, z+s*0.75, y, y+s*0.55);
      }
    }
  })();
  /* ---- the treelines along the interstate, outside the zone -------------
     From the road a forest is its edge: two ragged rows of real trees
     against the canopy behind them, all the way to the haze. */
  (function roadEdges(){
    const Z=SITE.zone;
    for(let z=-1600; z<1600; z+=5.2){
      if(z>Z.z0-2 && z<Z.z1+2) continue;
      for(const [ex, side] of [[HWY.nb+19,1],[HWY.nb-19,-1],[HWY.sb+19,1],[HWY.sb-19,-1]]){
        for(const row of [2.8, 7.6, 12.5]){
          const x=ex+side*(row+(hash2(z,ex+row)-0.5)*3.0), zz=z+(hash2(ex,z*1.3+row)-0.5)*4.0;
          const cd=Terrain.clearDist(x,zz);
          if(cd<0.6) continue;
          const q=hash2(x*0.9,zz*1.1);
          const sp= row<4 ? (q<0.15?"hemlock":"edge") : (q<0.18?"hemlock":q<0.26?"pine":"hard");
          plant(sp, x, zz, {scale:0.85+hash2(x*3,zz)*0.3});
          if(row<4 && q<0.5) plant("shrub", x-side*2.2, zz+1.3, {scale:0.8+q, solid:false});
        }
      }
    }
  })();
  /* ---- Edinboro's hedgerows -----------------------------------------------
     Between the fields (EDIN.fields), where the plough never went: a ragged
     line of hardwoods with gaps, a cedar or two, shrubs at their feet; and a
     big lone oak left standing in a hay field for the shade. The fields are
     out of the woods' zone, so their trunks are given colliders here. */
  (function hedgerows(){
    const E=EDIN, tree=(sp, x, z, s)=>{ if(Terrain.clearDist(x,z)>-1 && sp!=="oak") return;
      plant(sp==="oak"?"hard":sp, x, z, {scale:s});
      const y=Terrain.groundAt(x,z), r=0.22*s; addCol(x-r, x+r, z-r, z+r, y-0.5, y+6); };
    const row=(x0,z0,x1,z1,seed)=>{ const L=Math.hypot(x1-x0,z1-z0), n=Math.floor(L/6.5);
      for(let i=0;i<=n;i++){ const t=i/n, h=hash2(seed+i*1.7, seed*0.3);
        if(h<0.22) continue;                                     // a gap where a tree came down
        const x=lerp(x0,x1,t)+(hash2(i,seed)-0.5)*3, z=lerp(z0,z1,t)+(hash2(seed,i*2.1)-0.5)*3;
        tree(h<0.32 ? "hemlock" : "hard", x, z, 0.75+h*0.5);
        if(h>0.6) plant("shrub", x+2.0, z+1.1, {scale:0.9+h*0.5, solid:false}); } };
    // between neighbouring fields, the length of the shorter edge
    for(const a of E.fields) for(const b of E.fields){
      if(a===b || b.x0<a.x1 || b.x0-a.x1>16 || b.z0!==a.z0) continue;
      row((a.x1+b.x0)/2, a.z0+4, (a.x1+b.x0)/2, a.z1-4, a.x1);
    }
    // and along the back of each, where it meets the woods
    for(const f of E.fields){ const zb=f.z0<E.z ? f.z0-5 : f.z1+5; row(f.x0+4, zb, f.x1-4, zb, f.x0*0.7+zb); }
    tree("oak", E.fields[3].x0+96, E.fields[3].z0+170, 1.45);
  })();

  /* ---- the canopy past the zone -----------------------------------------
     The crown height above the ground, wherever the woods are: about nineteen
     metres of second growth, lumped into individual crowns where the grid
     is fine enough to show them, dropped below the ground in a clearing so
     it simply is not there. */
  const _cell=(x,z)=>{                       // the tallest crown over (x,z)
    const S=8.5, cx=Math.floor(x/S), cz=Math.floor(z/S);
    let best=0;
    for(let j=-1;j<=1;j++) for(let i=-1;i<=1;i++){
      const ix=cx+i, iz=cz+j, h=hash2(ix*1.31,iz*2.17);
      const px=(ix+0.2+h*0.6)*S, pz=(iz+0.2+hash2(iz*0.7,ix*1.9)*0.6)*S;
      const rad=S*(0.55+h*0.35), d=Math.hypot(x-px,z-pz);
      if(d<rad) best=Math.max(best, (2.6+h*2.2)*Math.sqrt(1-(d/rad)*(d/rad)));
    }
    return best;
  };
  function canopyY(x,z,fine){
    const cd=Terrain.clearDist(x,z);
    let m=smoothstep(3, 11, cd);
    // either end of Lake Street by the shore (behind the dog park, and beside the brewery's garden and deck) the woods
    // are close to and real (14n plants them fifty-odd metres deep there): the shell climbs slowly under their crowns
    // instead of standing up as a green wall
    // (the west side runs on north to the water round the lake's corner, which leaves land there out to z −1350, and
    //  a strip of it twenty metres deep past the dog park's fence)
    if(fine && typeof EAST!=="undefined"){ const T0=EAST.town;
      for(const [a0, a1, b0] of [[T0.x0-64, T0.x0+52, T0.z0-84], [T0.x1-2, T0.x1+64, T0.z0-20]]){      // (the west box takes in the
                                                                                                    //  strip past the dog park's fence)
        const ex=Math.max(0, x-a1, a0-x), ez=Math.max(0, z-(T0.z0+74), b0-z);
        const w=1-smoothstep(0, 16, Math.hypot(ex, ez)); if(w>0) m=m+(smoothstep(3, 44, cd)-m)*w; } }
    const g=Terrain.heightAt(x,z);
    if(m<=0) return g-3;
    const base=15.5+Terrain.fbm(x*0.006+9, z*0.006+4, 3)*6;
    return g + m*(base+(fine?_cell(x,z):1.6)) - (1-m)*3;
  }
  const CAN={meshes:[], colS:[], colA:[]};
  (function canopy(){
    const Z=SITE.zone;
    const tex=(function(){
      const c=cvs(512,512), x=c.getContext("2d"), r=_trng(9001);
      x.fillStyle="#7e8a70"; x.fillRect(0,0,512,512);
      for(let i=0;i<1400;i++){
        const px=r()*512, py=r()*512, rad=10+r()*26;
        const g=x.createRadialGradient(px-rad*0.3,py-rad*0.3,rad*0.1,px,py,rad);
        const l=0.75+r()*0.25;
        g.addColorStop(0,"rgba("+(l*250|0)+","+(l*255|0)+","+(l*235|0)+",0.95)");
        g.addColorStop(0.7,"rgba("+(l*190|0)+","+(l*205|0)+","+(l*180|0)+",0.6)");
        g.addColorStop(1,"rgba(70,80,60,0)");
        x.fillStyle=g; x.beginPath(); x.arc(px,py,rad,0,7); x.fill();
      }
      return _tex(c);
    })();
    tex.anisotropy=MAXANISO;
    const mat2=new T.MeshStandardMaterial({vertexColors:true, map:tex, roughness:0.95, metalness:0});
    const sumA=[new T.Color(0x456c2e), new T.Color(0x3c6029), new T.Color(0x4f7633), new T.Color(0x33502c)];
    const autA=[new T.Color(0xc0472a), new T.Color(0xd9822a), new T.Color(0xd8b23a), new T.Color(0x8a5a2c), new T.Color(0x4a6a3a)];
    function shell(R, cell, holes, fine){
      const nx=Math.round((R.x1-R.x0)/cell), nz=Math.round((R.z1-R.z0)/cell);
      const N=(nx+1)*(nz+1), Y=new Float32Array(N), M=new Float32Array(N);
      for(let j=0;j<=nz;j++) for(let i=0;i<=nx;i++){
        const x=R.x0+i*cell, z=R.z0+j*cell, k=j*(nx+1)+i;
        Y[k]=canopyY(x,z,fine); M[k]=smoothstep(3,11,Terrain.clearDist(x,z));
      }
      const P=[], U=[], CS=[], CA=[], IDX=[], cs=new T.Color(), ca=new T.Color();
      for(let j=0;j<=nz;j++) for(let i=0;i<=nx;i++){
        const x=R.x0+i*cell, z=R.z0+j*cell, k=j*(nx+1)+i;
        P.push(x,Y[k],z); U.push(x/26, z/26);
        const pa=Terrain.fbm(x*0.008+1, z*0.008+8, 3), pb=hash2(Math.floor(x/9),Math.floor(z/9));
        cs.copy(sumA[Math.floor(pb*3)]).lerp(sumA[3], smoothstep(0.55,0.72,pa));
        ca.copy(autA[Math.floor(pb*4)]).lerp(autA[4], smoothstep(0.55,0.72,pa));
        // hollows between crowns are darker; far off, where there are no crowns to shade, it goes in
        // patches, darker and lighter stands (one even green is what reads flat and blown out from the lake)
        const lump=fine ? _cell(x,z)/4.8 : 0.10+0.80*Terrain.fbm(x*0.011+5.3, z*0.011+2.9, 3);
        // and where it comes down at the edge of a clearing, its face goes dark towards the foot: the
        // inside of a wood, not a lit green wall
        const shade=(fine ? 0.62+0.38*lump : 0.50+0.36*lump)*(0.34+0.66*M[k]);
        CS.push(cs.r*shade, cs.g*shade, cs.b*shade); CA.push(ca.r*shade, ca.g*shade, ca.b*shade);
      }
      const inHole=(cx0,cx1,cz0,cz1)=>{
        for(const h of holes) if(cx0>=h.x0 && cx1<=h.x1 && cz0>=h.z0 && cz1<=h.z1) return true;
        return false;
      };
      for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){
        const cx0=R.x0+i*cell, cz0=R.z0+j*cell;
        if(inHole(cx0,cx0+cell,cz0,cz0+cell)) continue;
        const a=j*(nx+1)+i, b=a+1, d=a+nx+1, e=d+1;
        if(M[a]<0.02 && M[b]<0.02 && M[d]<0.02 && M[e]<0.02) continue;
        IDX.push(a,d,b, b,d,e);
      }
      const g=new T.BufferGeometry();
      g.setAttribute("position", new T.Float32BufferAttribute(P,3));
      g.setAttribute("uv", new T.Float32BufferAttribute(U,2));
      const colAttr=new T.Float32BufferAttribute(CS.slice(),3);
      g.setAttribute("color", colAttr);
      g.setIndex(IDX); g.computeVertexNormals();
      const mesh=new T.Mesh(g, mat2); mesh.receiveShadow=true; mesh.name="canopy";
      scene.add(mesh);
      CAN.meshes.push(mesh); CAN.colS.push(new Float32Array(CS)); CAN.colA.push(new Float32Array(CA));
    }
    shell(RING_MID, 8, [Z], true);
    shell(EAST.can, 8, [], true);                                   // (east along US 6N: the woods the road goes through, close to)
    shell({x0:-2400,x1:2400,z0:-2400,z1:2400}, 32, [RING_MID, EAST.can], false);
    /* The curtain. From inside the zone, through a hundred metres of trunks,
       the edge of the canopy would be a lid with daylight under it. So the
       zone's boundary hangs a dark wall from the canopy down to the ground:
       the inside of a wood, seen from inside a wood. */
    const cv=(function(){
      const W=512, H=256, c=cvs(W,H), x=c.getContext("2d"), r=_trng(4242);
      const g=x.createLinearGradient(0,0,0,H);
      g.addColorStop(0,"#405038"); g.addColorStop(0.30,"#2e3828"); g.addColorStop(0.75,"#262a20"); g.addColorStop(1,"#22241c");
      x.fillStyle=g; x.fillRect(0,0,W,H);
      // three depths of trunks: far ones pale with haze and thin, near ones dark
      for(const [n,lo,hi,w0,w1,a] of [[140,0.42,0.55,1,2.5,0.55],[90,0.26,0.36,2,4,0.75],[40,0.14,0.22,3,7,0.9]]){
        for(let i=0;i<n;i++){
          const px=r()*W, w=w0+r()*(w1-w0), l=lo+r()*(hi-lo);
          x.fillStyle="rgba("+(l*150|0)+","+(l*142|0)+","+(l*120|0)+","+a+")";
          x.fillRect(px, 10+r()*60, w, H);
          x.fillStyle="rgba(255,255,240,"+(a*0.06).toFixed(3)+")"; x.fillRect(px, 10, Math.max(1,w*0.25), H);
        }
      }
      // understory: small, dark, many — leaves in shade, not lit discs
      for(let i=0;i<2600;i++){
        const y=110+r()*146, d=(y-110)/146;
        x.fillStyle="rgba("+(34+r()*30|0)+","+(46+r()*34|0)+","+(26+r()*20|0)+","+(0.35+r()*0.35).toFixed(2)+")";
        x.fillRect(r()*W, y, 1+r()*(2+d*3), 1+r()*2);
      }
      // the haze that sits low in a wood
      const hz=x.createLinearGradient(0,H*0.45,0,H); hz.addColorStop(0,"rgba(120,128,112,0)"); hz.addColorStop(1,"rgba(120,128,112,0.18)");
      x.fillStyle=hz; x.fillRect(0,H*0.45,W,H*0.55);
      return _tex(c);
    })();
    const P=[], U=[], C=[], IDX=[];
    const edge=(ax0,az0,ax1,az1,nx2,nz2)=>{
      const L=Math.hypot(ax1-ax0, az1-az0), n=Math.ceil(L/4);
      const base=P.length/3;
      for(let k=0;k<=n;k++){
        const t=k/n, x=ax0+(ax1-ax0)*t, z=az0+(az1-az0)*t;
        // (never lower than a wood's height except over the interstate, which is meant to run on out of sight:
        //  over a track or a creek or the power line's cut the canopy dips, and a low curtain there is a window
        //  on the end of the world; "over the interstate" takes in its ramps and their mowed verges, out to 40 m)
        const open=Math.min(Math.abs(x-HWY.nb), Math.abs(x-HWY.sb))<40;
        const bot=Terrain.heightAt(x,z)-1, top=Math.max(canopyY(x+nx2*0.5, z+nz2*0.5, true), open ? -1e9 : bot+17);
        const h=Math.max(0, top-bot);
        P.push(x, bot+Math.max(h,0.01), z,  x, bot, z);
        U.push(t*L/18, 1, t*L/18, 0);
        const on=h>2 ? 1 : 0;
        C.push(on,on,on, on,on,on);
      }
      for(let k=0;k<n;k++){ const a=base+k*2, b=a+1, c=a+2, d=a+3; IDX.push(a,b,c, c,b,d); }
    };
    edge(Z.x0,Z.z0, Z.x1,Z.z0, 0,-1);
    edge(Z.x1,Z.z0, Z.x1,Z.z1, 1,0);
    edge(Z.x1,Z.z1, Z.x0,Z.z1, 0,1);
    edge(Z.x0,Z.z1, Z.x0,Z.z0, -1,0);
    const g=new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(P,3));
    g.setAttribute("uv", new T.Float32BufferAttribute(U,2));
    g.setAttribute("color", new T.Float32BufferAttribute(C,3));
    g.setIndex(IDX); g.computeVertexNormals();
    const curtain=new T.Mesh(g, new T.MeshBasicMaterial({map:cv, vertexColors:true, side:T.DoubleSide,
      transparent:false, fog:true}));
    curtain.name="curtain"; scene.add(curtain);
    CAN.curtain=curtain;
    // unlit, so it is told how much light there is: 19-loop sets it each frame
    CAN.curtainLight=(k)=>curtain.material.color.setScalar(k);
  })();

  /* ---- the zone's edge: as far as the woods let you walk ----------------
     Walls along the zone's boundary, with gaps where the interstate and its
     verges cross it, and the treelines down both sides of the road beyond
     it. The drone goes where it likes. */
  (function bounds(){
    const Z0=SITE.zone, I=SITE.walkInset, gaps=[[HWY.sb-19,HWY.sb+19],[HWY.nb-19,HWY.nb+19]];
    const Z={x0:Z0.x0+I, x1:Z0.x1-(SITE.walkInsetE||I), z0:Z0.z0+I, z1:Z0.z1-I};
    for(const zz of [Z.z0, Z.z1]){
      let x=Z.x0;
      for(const g of gaps){ addCol(x, g[0], zz-0.5, zz+0.5, -40, 300); x=g[1]; }
      addCol(x, Z.x1, zz-0.5, zz+0.5, -40, 300);
    }
    addCol(Z.x0-0.5, Z.x0+0.5, Z.z0, Z.z1, -40, 300);
    addCol(Z.x1-0.5, Z.x1+0.5, Z.z0, Z.z1, -40, 300);
    // The two down the median stand open at the crossovers, and the strip of woods between them is
    // closed off either side of each, so the way across is the paving and not a walk up the median.
    // They duck under US 6N's deck at Edinboro. The two on the outside stop where Edinboro's fields
    // begin, and the fields have their own fence (a run is open over `gaps` and low over `lows`).
    const cut=CROSSOVERS.map(c=>[c.z-c.hw-1, c.z+c.hw+1]).filter(g=>g[1]<Z.z0 || g[0]>Z.z1);
    const EP=EDIN.plain, deck=[[EDIN.z-6.5, EDIN.z+6.5, EDIN.y-1.5]];
    const wall=(ex, a, b, gaps, lows)=>{
      const ev=[]; for(const g of gaps) if(g[1]>a && g[0]<b) ev.push([g[0], g[1], null]);
      for(const g of lows) if(g[1]>a && g[0]<b) ev.push(g);
      ev.sort((p,q)=>p[0]-q[0]);
      let z=a;
      for(const g of ev){ if(g[0]>z) addCol(ex-0.4, ex+0.4, z, g[0], -40, 300);
        if(g[2]!==null) addCol(ex-0.4, ex+0.4, g[0], g[1], -40, g[2]);
        z=Math.max(z, g[1]); }
      if(z<b) addCol(ex-0.4, ex+0.4, z, b, -40, 300); };
    for(const ex of [HWY.nb+19.5, HWY.nb-19.5, HWY.sb+19.5, HWY.sb-19.5]){
      const med=ex===HWY.nb-19.5 || ex===HWY.sb+19.5;
      wall(ex, -1700, Z.z0, med ? cut : [[EP.z0, EP.z1]], med ? deck : []);
      wall(ex, Z.z1, 1700, med ? cut : [], []);
    }
    for(const g of cut) for(const zz of g) addCol(HWY.sb+19.1, HWY.nb-19.1, zz-0.4, zz+0.4, -40, 300);
    // round the fields: north and south from the woods' edge to the cut, and the two far ends
    for(const zz of [EP.z0, EP.z1]){
      addCol(EP.x0, HWY.sb-19.1, zz-0.4, zz+0.4, -40, 300);
      addCol(HWY.nb+19.1, EP.x1, zz-0.4, zz+0.4, -40, 300);
    }
    // (open at the east end where US 6N goes on through the woods: 14m walls its way from there)
    addCol(EP.x0-0.4, EP.x0+0.4, EP.z0, EP.z1, -40, 300);
    addCol(EP.x1-0.4, EP.x1+0.4, EP.z0, EAST.corr.z0, -40, 300); addCol(EP.x1-0.4, EP.x1+0.4, EAST.corr.z1, EP.z1, -40, 300);
  })();

  /* ---- build the instanced chunks ---------------------------------------- */
  const CHUNKS=[];
  const CH=96, CHO=320;
  function finish(){
    const map=new Map();
    for(const it of INST){
      const out=!it.zone;
      const cx=Math.floor(it.x/CH), cz=Math.floor(it.z/(out?CHO:CH));
      const k=(out?"o":"z")+cx+":"+cz;
      let c=map.get(k);
      if(!c){ c={key:k, x0:cx*CH, x1:cx*CH+CH, z0:cz*(out?CHO:CH), z1:cz*(out?CHO:CH)+(out?CHO:CH),
                 lists:new Map(), near:[], far:[], ymin:1e9, ymax:-1e9, mode:-1}; map.set(k,c); }
      let L=c.lists.get(it.v.idx); if(!L){ L=[]; c.lists.set(it.v.idx, L); }
      L.push(it);
      c.ymin=Math.min(c.ymin,it.y); c.ymax=Math.max(c.ymax,it.y+26*it.s);
      // a trunk you can walk into is a trunk you cannot walk through
      if(it.solid && it.zone && it.v.trunkR>0){
        const rr2=it.v.trunkR*it.s+0.04;
        addCol(it.x-rr2, it.x+rr2, it.z-rr2, it.z+rr2, it.y-1, it.y+7);
      }
    }
    const m4=new T.Matrix4(), q=new T.Quaternion(), e=new T.Euler(), p=new T.Vector3(), s=new T.Vector3();
    for(const c of map.values()){
      const cx=(c.x0+c.x1)/2, cz=(c.z0+c.z1)/2, cy=(c.ymin+c.ymax)/2;
      const rad=Math.hypot(c.x1-c.x0, c.z1-c.z0, c.ymax-c.ymin)/2+12;
      c.sphere=new T.Sphere(new T.Vector3(cx,cy,cz), rad);
      for(const [vi, list] of c.lists){
        const V=VARIANTS[vi];
        const make=(base, mat, cast)=>{
          const g=new T.BufferGeometry();
          for(const k2 in base.attributes) g.setAttribute(k2, base.attributes[k2]);
          g.setIndex(base.index);
          g.boundingSphere=c.sphere;
          const im=new T.InstancedMesh(g, mat, list.length);
          for(let i=0;i<list.length;i++){
            const it=list[i];
            e.set(it.rx, it.ry, it.rz, "YXZ"); q.setFromEuler(e);
            p.set(it.x, it.y, it.z); s.set(it.s, it.s, it.s);
            m4.compose(p,q,s); im.setMatrixAt(i, m4);
            im.setColorAt(i, autumn ? it.ca : it.cs);
          }
          im.instanceMatrix.needsUpdate=true;
          if(im.instanceColor) im.instanceColor.needsUpdate=true;
          im.castShadow=cast; im.receiveShadow=true;
          im.userData.list=list;
          im.visible=false;
          scene.add(im);
          return im;
        };
        const nm=make(V.near, NEAR_MAT, true);
        nm.customDepthMaterial=DEPTH_MAT;
        c.near.push(nm);
        // shrubs and ferns have no far set worth drawing: past the near
        // distance they are simply not there, under the trees' far set
        if(V.sp!=="fern" && V.sp!=="shrub" && V.sp!=="bush" && V.sp!=="sapling") c.far.push(make(V.far, FAR_MAT, false));
        if(V.sp==="fern"||V.sp==="shrub"||V.sp==="bush"||V.sp==="sapling") nm.userData.small=true;
      }
      CHUNKS.push(c);
    }
  }
  /* Which set each chunk shows. Near within 58 m of the chunk's footprint
     (more from the air, where a chunk's crowns are all you see), far
     beyond; the small stuff only within 40 m of the camera's chunk edge.
     The back woods (east of DEEP_X) are not drawn at all from the site at
     eye height: a hundred metres and more of trees stand in front of them. */
  const DEEP_X=176;
  /* The two radii, and how far anything is drawn at all, come from the
     draw-distance setting (03-scene); FAR is what they always were. */
  function update(cam){
    const alt=Math.max(0, cam.y-30), hideDeep=cam.x<60 && cam.y<25;
    const D=DRAW_LEVELS[GFX.draw];
    for(const c of CHUNKS){
      const dx=Math.max(c.x0-cam.x, 0, cam.x-c.x1), dz=Math.max(c.z0-cam.z, 0, cam.z-c.z1);
      const d=Math.hypot(dx,dz,alt*0.6);
      const mode = (hideDeep && c.x0>=DEEP_X && c.key[0]==="z") ? 2 : d<D.tree ? 1 : d>D.cull ? 2 : 0;
      const small = d<D.small;
      if(mode!==c.mode || small!==c.small){
        c.mode=mode; c.small=small;
        for(const m of c.near) m.visible = mode===1 && (!m.userData.small || small);
        for(const m of c.far)  m.visible = mode===0;
      }
    }
  }
  function setSeason(a){
    autumn=!!a;
    for(const c of CHUNKS) for(const m of c.near.concat(c.far)){
      const list=m.userData.list;
      for(let i=0;i<list.length;i++) m.setColorAt(i, autumn ? list[i].ca : list[i].cs);
      m.instanceColor.needsUpdate=true;
    }
    for(let i=0;i<CAN.meshes.length;i++){
      const a2=CAN.meshes[i].geometry.attributes.color;
      a2.array.set(autumn ? CAN.colA[i] : CAN.colS[i]); a2.needsUpdate=true;
    }
  }
  function canopyAt(x,z){ return inZone(x,z) ? -1e9 : canopyY(x,z,true); }
  return {plant:plant, finish:finish, update:update, setSeason:setSeason, isAutumn:()=>autumn,
          inst:INST, chunks:CHUNKS, variants:VARIANTS, atlas:ATLAS, canopyAt:canopyAt, canopy:CAN, barkCyl:barkCyl,
          nearMat:NEAR_MAT, farMat:FAR_MAT};
})();
