"use strict";
/* REST AREA · 04-terrain.js
   the height field, the clearings, the LOD rings, groundAt
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   4 · TERRAIN — the Allegheny plateau, cut flat for a rest stop
   Northwestern Pennsylvania is a dissected plateau: long wooded ridges
   trending north-east, broad valleys, nothing sharp. The interstate was
   graded through it in a corridor, and the rest area is a pad cut into the
   east side of the cut, with the woods rising behind it.
   ---------------------------------------------------------------------- */

// the road level along the corridor: dead flat past the rest area, then
// riding the country's grain at a few per cent either way
function roadY(z){
  const w=smoothstep(HWY.flat, HWY.flat+520, Math.abs(z));
  if(w<=0) return 0;
  return w*(9.5*Math.sin(z*0.0024+0.4)+5.2*Math.sin(z*0.0061+1.9)-4.1);
}
function roadSlope(z){ return (roadY(z+1)-roadY(z-1))/2; }
// pavement edges: northbound has its wide shoulder on the east (its right),
// southbound on the west (its right); both have a narrow one on the median
const NB_X0=HWY.nb-HWY.lane-HWY.shL, NB_X1=HWY.nb+HWY.lane+HWY.shR;
const SB_X0=HWY.sb-HWY.lane-HWY.shR, SB_X1=HWY.sb+HWY.lane+HWY.shL;

/* ---- the ramps, the service drive, the power line -------------------
   Centre lines, smoothed. The exit leaves the northbound right lane a long
   way south of the lots, the way a deceleration lane does, and arrives at
   the south end of the truck lot; the entrance leaves the north end and
   merges back in. Both are at y = 0, because the road is.            */
const RAMP_EXIT=smoothPath([
  {x:-107.4,z:500},{x:-106.4,z:430},{x:-104.6,z:360},{x:-100.4,z:292},{x:-93.0,z:232},
  {x:-84.6,z:182},{x:-78.6,z:146},{x:-75.6,z:118},{x:-75.0,z:104}], 2.0);
const RAMP_ENTRY=smoothPath([
  {x:-75.0,z:-146},{x:-75.6,z:-170},{x:-78.6,z:-202},{x:-84.6,z:-240},{x:-93.0,z:-284},
  {x:-100.4,z:-338},{x:-104.6,z:-404},{x:-106.4,z:-470},{x:-107.4,z:-540}], 2.0);
// the drive up to the substation: off the north end of the car lot, east
// through the trees, climbing a couple of metres to the compound's gate
const DRIVE=smoothPath([
  {x:-29,z:-140,y:0},{x:-14,z:-146,y:0},{x:4,z:-151,y:0.35},{x:22,z:-154,y:1.05},
  {x:38,z:-159,y:1.85},{x:52,z:-166,y:2.45},{x:60.5,z:-169,y:SITE.sub.y}], 2.0);
// a cleared right-of-way north from the compound, poles every ninety metres
const POWER={x0:84, z0:-184, x1:136, z1:-1500};
/* ---- the back woods: a path, and a camp at the end of it ---------------
   Behind the building a path the kids have worn runs east off the loop walk,
   a quarter of a kilometre through the trees to a clearing where somebody
   keeps a fire ring. Nobody graded either: the path rides the ground as it
   lies, and only the clearing is a little levelled, the way feet and fires
   level a place. 14d puts the camp in it. */
const CAMP={x:286, z:52, r:9.5, y:0};
const TRAIL=smoothPath([
  {x:17.4,z:1.2},{x:24,z:3.5},{x:34,z:5.2},{x:48,z:8.5},{x:62,z:7.2},{x:78,z:4.6},{x:94,z:7.2},
  {x:110,z:12.4},{x:126,z:13.2},{x:142,z:10.2},{x:158,z:12.2},{x:174,z:18.2},{x:190,z:24},
  {x:206,z:27.2},{x:222,z:31.4},{x:238,z:36.2},{x:254,z:41.2},{x:267,z:46},{x:278,z:49.6}], 2.0, true);

const Terrain=(function(){
  const fract=x=>x-Math.floor(x);
  const hash=(x,y)=>fract(Math.sin(x*127.1+y*311.7)*43758.5453123);
  function vnoise(x,y){
    const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi;
    const a=hash(xi,yi), b=hash(xi+1,yi), c=hash(xi,yi+1), d=hash(xi+1,yi+1);
    const u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
    return a*(1-u)*(1-v)+b*u*(1-v)+c*(1-u)*v+d*u*v;
  }
  function fbm(x,y,o){ let f=0,a=0.5,fr=1; for(let i=0;i<(o||5);i++){ f+=a*vnoise(x*fr,y*fr); fr*=2; a*=0.5; } return f; }

  // the country before anyone graded it
  function natural0(x,z){
    const d=Math.hypot(x+30, z+20);
    const amp=0.30+0.70*smoothstep(60,900,d);
    let h=(fbm(x*0.0031+11, z*0.0031+5)-0.5)*74
         +(fbm(x*0.011+3,  z*0.011+9)-0.5)*15
         +(fbm(x*0.043,    z*0.043, 3)-0.5)*2.2;
    // the plateau's grain: long ridges trending north-east
    const rq=(x*0.62+z*0.78)*0.0042 + fbm(x*0.0021+4, z*0.0021+2, 3)*2.2;
    h += Math.sin(rq*6.283)*17*smoothstep(160,760,d);
    return h*amp;
  }
  const NAT0=natural0(-30,-20);
  const natural=(x,z)=>natural0(x,z)-NAT0*(1-smoothstep(200,700,Math.hypot(x+30,z+20)));
  CAMP.y=natural(CAMP.x, CAMP.z);

  function boxDist(B,x,z){
    return Math.hypot(Math.max(B.x0-x, 0, x-B.x1), Math.max(B.z0-z, 0, z-B.z1));
  }
  // a signed distance to a box: negative inside
  function boxSD(B,x,z){
    const dx=Math.max(B.x0-x, x-B.x1), dz=Math.max(B.z0-z, z-B.z1);
    return dx>0||dz>0 ? Math.hypot(Math.max(dx,0),Math.max(dz,0)) : Math.max(dx,dz);
  }
  const pathBox=(P,pad)=>{
    let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
    for(const p of P){ x0=Math.min(x0,p.x); x1=Math.max(x1,p.x); z0=Math.min(z0,p.z); z1=Math.max(z1,p.z); }
    return {x0:x0-pad, x1:x1+pad, z0:z0-pad, z1:z1+pad};
  };
  const EXIT_B=pathBox(RAMP_EXIT,60), ENTRY_B=pathBox(RAMP_ENTRY,60), DRIVE_B=pathBox(DRIVE,40), TRAIL_B=pathBox(TRAIL,16);
  const SUBPAD={x0:SITE.sub.x0-8, x1:SITE.sub.x1+8, z0:SITE.sub.z0-8, z1:SITE.sub.z1+8};

  // pull h towards level y with full weight inside `half` and none past half+blend
  const toward=(h,y,d,half,blend)=>{ const t=smoothstep(half, half+blend, d); return y+(h-y)*t; };

  function heightAt(x,z){
    let h=natural(x,z);
    // the interstate corridors, cut and filled to the road's own grade
    const ry=roadY(z);
    h=toward(h, ry, Math.abs(x-HWY.nb), 19, 34);
    h=toward(h, ry, Math.abs(x-HWY.sb), 19, 34);
    // a shallow swale down the middle of the median, where the water goes
    const mid=(HWY.nb+HWY.sb)/2, md=Math.abs(x-mid);
    if(md<16) h-=1.1*(1-smoothstep(0,16,md))*smoothstep(0,8,Math.abs(x-HWY.nb)-8)*smoothstep(0,8,Math.abs(x-HWY.sb)-8);
    // the pad
    h=toward(h, 0, boxDist(SITE.pad,x,z), 0, 42);
    // ramps and the drive, cut in along their centre lines
    if(x>EXIT_B.x0 && x<EXIT_B.x1 && z>EXIT_B.z0 && z<EXIT_B.z1)
      h=toward(h, 0, distToPath(RAMP_EXIT,x,z).d, 9, 22);
    if(x>ENTRY_B.x0 && x<ENTRY_B.x1 && z>ENTRY_B.z0 && z<ENTRY_B.z1)
      h=toward(h, 0, distToPath(RAMP_ENTRY,x,z).d, 9, 22);
    if(x>DRIVE_B.x0 && x<DRIVE_B.x1 && z>DRIVE_B.z0 && z<DRIVE_B.z1){
      const q=distToPath(DRIVE,x,z);
      h=toward(h, q.y, q.d, 4.2, 12);
    }
    // the compound: a level shelf of fill with the woods running up to it
    h=toward(h, SITE.sub.y, boxDist(SUBPAD,x,z), 0, 16);
    // the camp's clearing, trodden level round the fire
    h=toward(h, CAMP.y, Math.hypot(x-CAMP.x, z-CAMP.z), 6.5, 9);
    return h;
  }

  /* ---- where the woods are -------------------------------------------
     A signed distance to the nearest clearing: negative inside one,
     positive in the trees. Everything that cares — the ground's colour,
     which trees grow where, the canopy seen from the road — asks this one
     function, so the edge of the woods is the same edge for all of them. */
  const CLEAR_SITE={x0:-101, x1:28, z0:-166, z1:120};
  // siteDist: the clearings the state made (the site, the road, the ramps,
  // the drive, the compound, the power line). pathDist: the path and the
  // camp, which are narrow and must stay open, so their edge is not left
  // to wander the way a mown edge does. clearDist is the nearer of the two.
  function clearDist(x,z){ return Math.min(siteDist(x,z), pathDist(x,z)); }
  function pathDist(x,z){
    let d=1e9;
    if(x>TRAIL_B.x0 && x<TRAIL_B.x1 && z>TRAIL_B.z0 && z<TRAIL_B.z1) d=distToPath(TRAIL,x,z).d-1.3;
    const dc=Math.hypot(x-CAMP.x, z-CAMP.z);
    if(dc<CAMP.r+40) d=Math.min(d, dc-CAMP.r+(fbm(x*0.09+2, z*0.09+8, 2)-0.5)*3);
    return d;
  }
  function siteDist(x,z){
    let d=boxSD(CLEAR_SITE,x,z);
    d=Math.min(d, Math.abs(x-HWY.nb)-18.5, Math.abs(x-HWY.sb)-18.5);
    if(x>EXIT_B.x0 && x<EXIT_B.x1 && z>EXIT_B.z0 && z<EXIT_B.z1) d=Math.min(d, distToPath(RAMP_EXIT,x,z).d-13);
    if(x>ENTRY_B.x0 && x<ENTRY_B.x1 && z>ENTRY_B.z0 && z<ENTRY_B.z1) d=Math.min(d, distToPath(RAMP_ENTRY,x,z).d-13);
    if(x>DRIVE_B.x0 && x<DRIVE_B.x1 && z>DRIVE_B.z0 && z<DRIVE_B.z1) d=Math.min(d, distToPath(DRIVE,x,z).d-4.6);
    d=Math.min(d, boxSD(SUBPAD,x,z)+1);
    // the power line's right of way, a straight cut north through everything
    {
      const ex=POWER.x1-POWER.x0, ez=POWER.z1-POWER.z0, L2=ex*ex+ez*ez;
      const t=clamp(((x-POWER.x0)*ex+(z-POWER.z0)*ez)/L2, 0, 1);
      d=Math.min(d, Math.hypot(x-(POWER.x0+ex*t), z-(POWER.z0+ez*t))-8);
    }
    // the edge is never a ruler line: it wanders by a few metres
    return d + (fbm(x*0.045+7, z*0.045+3, 3)-0.5)*9;
  }
  function mask(x,z){ return smoothstep(0, 5, clearDist(x,z)); }
  return {heightAt:heightAt, natural:natural, fbm:fbm, clearDist:clearDist, siteDist:siteDist, pathDist:pathDist,
          mask:mask, boxDist:boxDist, boxSD:boxSD};
})();

/* ---- the rings ------------------------------------------------------
   Cell sizes are exact multiples of one another and each inner ring's box
   lands on the outer ring's lattice at all four edges, so every coarse cell
   is wholly in a hole or wholly out, and the border nodes are shared.
     far    32 m   ±2400                        the haze and the far ridges
     mid     8 m   x -512..640, z ±1600         the corridor and its cuts
     near    2 m   x -256..448, z -336..256     the site and its woods      */
const RING_MID ={x0:-512, x1:640, z0:-1600, z1:1600};
const RING_NEAR={x0:-256, x1:448, z0:-336,  z1:256};
const TERRAIN_RINGS=[];
let TERRAIN_MAT=null;
(function buildTerrain(){
  const campC=new T.Color(0x5a4a38);
  const lawnC=new T.Color(0x5b8034), mowC=new T.Color(0x67853a), vergeC=new T.Color(0x76883f),
        litterC=new T.Color(0x5f4d35), mossC=new T.Color(0x4d5a30), deepC=new T.Color(0x3d3729),
        gravelC=new T.Color(0x8e8a7e), rockC=new T.Color(0x6f6a5c);
  const _c2=new T.Color();
  // the colour of the ground at (x,z): mown lawn, verge, or the forest floor
  function tint(x,z,y,slope,out){
    // the lawn runs a few metres into the trees before the litter wins
    const sd=Terrain.siteDist(x,z), m=smoothstep(1.5, 10, sd);
    const hd=Math.min(Math.abs(x-HWY.nb), Math.abs(x-HWY.sb));
    // lawn in the pad, verge grass along the road, litter under the trees
    out.copy(lawnC);
    if(Terrain.boxDist(SITE.pad,x,z)>2) out.lerp(mowC, smoothstep(2,30,Terrain.boxDist(SITE.pad,x,z)));
    out.lerp(vergeC, (1-smoothstep(6,22,hd))*0.75);
    // a band of gravel at the pavement's edge
    if(hd<7.2) out.lerp(gravelC, smoothstep(7.2,6.1,hd)*(Math.abs(x-HWY.nb)<7.2||Math.abs(x-HWY.sb)<7.2?1:0));
    // the floor of the woods: litter, moss in the damp, darker further in
    const patch=Terrain.fbm(x*0.07+5,z*0.07+1,3);
    _c2.copy(litterC).lerp(mossC, smoothstep(0.42,0.62,patch));
    _c2.lerp(deepC, smoothstep(8,40,sd)*0.7);
    out.lerp(_c2, m);
    // the camp: bare trodden dirt round the fire, going to litter at the edge
    const dc=Math.hypot(x-CAMP.x, z-CAMP.z);
    if(dc<CAMP.r+3) out.lerp(campC, (1-smoothstep(3.0, CAMP.r+1.5, dc))*0.8);
    out.lerp(rockC, smoothstep(0.35,0.8,slope)*0.6);
  }
  function grid(R,cell,holes,name,skirt){
    const x0=R.x0, x1=R.x1, z0=R.z0, z1=R.z1;
    const nx=Math.round((x1-x0)/cell), nz=Math.round((z1-z0)/cell);
    TERRAIN_RINGS.push({x0:x0, x1:x1, z0:z0, z1:z1, cell:cell, holes:holes||[], name:name});
    const N=(nx+1)*(nz+1);
    const H=new Float32Array(N);
    for(let j=0;j<=nz;j++) for(let i=0;i<=nx;i++) H[j*(nx+1)+i]=Terrain.heightAt(x0+i*cell, z0+j*cell);
    const P=[], C=[], U=[], IDX=[], c=new T.Color();
    for(let j=0;j<=nz;j++) for(let i=0;i<=nx;i++){
      const k=j*(nx+1)+i, x=x0+i*cell, z=z0+j*cell, y=H[k];
      const hx=H[j*(nx+1)+Math.min(nx,i+1)]-H[j*(nx+1)+Math.max(0,i-1)];
      const hz=H[Math.min(nz,j+1)*(nx+1)+i]-H[Math.max(0,j-1)*(nx+1)+i];
      const slope=Math.min(1, Math.hypot(hx,hz)/(cell*2));
      tint(x,z,y,slope,c);
      const micro=(hash2(x*0.37,z*0.37)-0.5)*0.10;
      const g=0.94+micro;
      P.push(x,y,z); U.push(x*0.25, z*0.25); C.push(c.r*g, c.g*g, c.b*g);
    }
    const inHole=(cx0,cx1,cz0,cz1)=>{
      for(const h of holes||[]) if(cx0>=h.x0 && cx1<=h.x1 && cz0>=h.z0 && cz1<=h.z1) return true;
      return false;
    };
    for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){
      const cx0=x0+i*cell, cz0=z0+j*cell;
      if(inHole(cx0, cx0+cell, cz0, cz0+cell)) continue;
      const a=j*(nx+1)+i, b=a+1, d=a+nx+1, e=d+1;
      IDX.push(a,d,b, b,d,e);
    }
    // a single-wound apron off every border and round every hole: two
    // windings sum their normals to zero and shade black
    const hangSkirt=(ring,drop)=>{
      const base=P.length/3;
      for(let pass=0;pass<2;pass++) for(const v of ring){
        P.push(P[v*3], P[v*3+1]-(pass?drop:0), P[v*3+2]);
        C.push(C[v*3]*(pass?0.8:1), C[v*3+1]*(pass?0.8:1), C[v*3+2]*(pass?0.8:1));
        U.push(U[v*2], U[v*2+1]+(pass?drop*0.25:0));
      }
      const n=ring.length;
      for(let k=0;k<n-1;k++){
        const a1=base+k, b1=base+k+1, a2=base+n+k, b2=base+n+k+1;
        IDX.push(a1,a2,b1, b1,a2,b2);
      }
    };
    if(skirt){
      const border=[];
      for(let i=0;i<=nx;i++) border.push(i);
      for(let j=1;j<=nz;j++) border.push(j*(nx+1)+nx);
      for(let i=nx-1;i>=0;i--) border.push(nz*(nx+1)+i);
      for(let j=nz-1;j>=1;j--) border.push(j*(nx+1));
      border.push(0);
      hangSkirt(border, skirt);
      for(const h of holes||[]){
        const i0=Math.round((h.x0-x0)/cell), i1=Math.round((h.x1-x0)/cell);
        const j0=Math.round((h.z0-z0)/cell), j1=Math.round((h.z1-z0)/cell);
        if(i0<0 || j0<0 || i1>nx || j1>nz || i1-i0<1 || j1-j0<1) continue;
        const ring=[];
        for(let i=i0;i<=i1;i++) ring.push(j0*(nx+1)+i);
        for(let j=j0+1;j<=j1;j++) ring.push(j*(nx+1)+i1);
        for(let i=i1-1;i>=i0;i--) ring.push(j1*(nx+1)+i);
        for(let j=j1-1;j>=j0;j--) ring.push(j*(nx+1)+i0);
        hangSkirt(ring, skirt);
      }
    }
    const g=new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(P,3));
    g.setAttribute("color",    new T.Float32BufferAttribute(C,3));
    g.setAttribute("uv",       new T.Float32BufferAttribute(U,2));
    g.setIndex(IDX); g.computeVertexNormals();
    if(!TERRAIN_MAT) TERRAIN_MAT=new T.MeshStandardMaterial({vertexColors:true, map:TEX.ground,
                          roughness:0.97, metalness:0, side:T.DoubleSide});
    const mesh=new T.Mesh(g,TERRAIN_MAT); mesh.receiveShadow=true; mesh.name=name;
    scene.add(mesh); return mesh;
  }
  grid({x0:-2400,x1:2400,z0:-2400,z1:2400}, 32, [RING_MID], "ground-far", 40);
  grid(RING_MID, 8, [RING_NEAR], "ground-mid", 24);
  grid(RING_NEAR, 2, [], "ground-near", 6);
  TERRAIN_RINGS.sort((a,b)=>a.cell-b.cell);        // finest ring wins
})();

/* The height of the ground you can SEE: find the finest ring that actually
   draws a triangle here and interpolate it. On a slope the drawn triangle and
   the field it was sampled from differ, and you stand on what is drawn. */
function groundAt(x,z){
  for(let r=0;r<TERRAIN_RINGS.length;r++){
    const R=TERRAIN_RINGS[r];
    if(x<R.x0 || x>R.x1 || z<R.z0 || z>R.z1) continue;
    const c=R.cell;
    let i=Math.floor((x-R.x0)/c), j=Math.floor((z-R.z0)/c);
    const nx=Math.round((R.x1-R.x0)/c), nz=Math.round((R.z1-R.z0)/c);
    if(i<0) i=0; if(j<0) j=0; if(i>=nx) i=nx-1; if(j>=nz) j=nz-1;
    const cx0=R.x0+i*c, cz0=R.z0+j*c;
    let holed=false;
    for(let k=0;k<R.holes.length;k++){
      const h=R.holes[k];
      if(cx0>=h.x0 && cx0+c<=h.x1 && cz0>=h.z0 && cz0+c<=h.z1){ holed=true; break; }
    }
    if(holed) continue;
    const u=Math.min(1,Math.max(0,(x-cx0)/c)), v=Math.min(1,Math.max(0,(z-cz0)/c));
    const ha=Terrain.heightAt(cx0, cz0);
    if(u+v<=1){
      const hb=Terrain.heightAt(cx0+c, cz0), hd=Terrain.heightAt(cx0, cz0+c);
      return ha + (hb-ha)*u + (hd-ha)*v;
    }
    const he=Terrain.heightAt(cx0+c, cz0+c);
    const hb=Terrain.heightAt(cx0+c, cz0), hd=Terrain.heightAt(cx0, cz0+c);
    return he + (hd-he)*(1-u) + (hb-he)*(1-v);
  }
  return Terrain.heightAt(x,z);
}
Terrain.groundAt=groundAt;
