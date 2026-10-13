"use strict";
/* REST AREA · 06-collision.js
   colliders, walking surfaces, the paved map, zones, seats, the collider grid
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   6 · COLLISION & WALKABLE SURFACES
   Colliders are AABBs with a vertical span. Walkable surfaces are flat
   plates or ramps; the player picks the highest one within step-up reach of
   where they already are. The ground under everything is groundY: the
   paving if there is paving, otherwise the terrain as it is DRAWN.
   ---------------------------------------------------------------------- */
const COL=[];    // static, indexed into a grid below
const COL_DYN=[];// colliders that move: parked cars, and only those
const COL_BIG=[], CG=12, CPAD=1.4;
// ground you may cross and people do not: the flower beds. Only the people
// (14b) read it; a bed has no collider, and you can walk through one.
const KEEP_OFF=[];
// The traffic is solid to a car and not to a pedestrian: a truck doing
// sixty sweeps its box over you in a third of a second, and blocked()
// would simply hold you inside it, which reads as stuck rather than hit.
const COL_TRAF=TRAFFIC.map(v=>v.col);
let COLG=null;
function buildColGrid(){
  COLG=new Map(); COL_BIG.length=0;
  for(let i=0;i<COL.length;i++){
    const c=COL[i];
    const gx0=Math.floor((c.x0-CPAD)/CG), gx1=Math.floor((c.x1+CPAD)/CG);
    const gz0=Math.floor((c.z0-CPAD)/CG), gz1=Math.floor((c.z1+CPAD)/CG);
    if((gx1-gx0+1)*(gz1-gz0+1)>64){ COL_BIG.push(c); continue; }
    for(let gx=gx0;gx<=gx1;gx++) for(let gz=gz0;gz<=gz1;gz++){
      const k=gx*131071+gz;
      let a=COLG.get(k); if(!a){ a=[]; COLG.set(k,a); }
      a.push(c);
    }
  }
}
const _noCols=[];
function colsNear(x,z){
  if(!COLG) return COL;
  return COLG.get(Math.floor(x/CG)*131071+Math.floor(z/CG)) || _noCols;
}
const SEATS=[];
function addSeat(x,z,y,yaw,label,lie){
  SEATS.push({x:x, z:z, y:y, yaw:yaw, label:label, lie:!!lie});
}
// things you can press E at that are neither a door nor a car
const USES=[];
function addUse(x,z,y,label,fn,r){ USES.push({x:x, z:z, y:y, label:label, fn:fn, r:r}); }
const SURF=[];   // flat {x0,x1,z0,z1,y} | ramp {axis,a0,a1,y0,y1}
const ZONES=[];  // {x0,x1,z0,z1,y0,y1,name,indoor}

function addCol(x0,x1,z0,z1,y0,y1){
  COL.push({x0:Math.min(x0,x1), x1:Math.max(x0,x1),
            z0:Math.min(z0,z1), z1:Math.max(z0,z1),
            y0:(y0===undefined?-2:y0), y1:(y1===undefined?60:y1)});
}
function addFlat(x0,x1,z0,z1,y){ SURF.push({flat:true,x0:x0,x1:x1,z0:z0,z1:z1,y:y}); }
function addRamp(x0,x1,z0,z1,axis,a0,a1,y0,y1){
  SURF.push({flat:false,x0:x0,x1:x1,z0:z0,z1:z1,axis:axis,a0:a0,a1:a1,y0:y0,y1:y1});
}
// `indoor` marks a roof overhead: the fireflies and the falling leaves are
// drawn round the camera and must not follow you inside
function addZone(x0,x1,z0,z1,y0,y1,name,indoor){
  ZONES.push({x0:x0,x1:x1,z0:z0,z1:z1,y0:y0,y1:y1,name:name,indoor:!!indoor});
}
function indoorsAt(x,z,y){
  for(let i=0;i<ZONES.length;i++){
    const q=ZONES[i];
    if(q.indoor && x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1&&y>=q.y0&&y<q.y1) return true;
  }
  return false;
}
// kept from the engine: nothing here is underground, but the loop asks
const BURIED=[];
function addBuried(x0,x1,z0,z1,y0,y1,amb){ BURIED.push({x0,x1,z0,z1,y0,y1,amb}); }
function buriedVolAt(x,z,y){
  for(let i=0;i<BURIED.length;i++){
    const q=BURIED[i];
    if(x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1&&y>=q.y0&&y<q.y1) return q;
  }
  return null;
}
function buriedAt(x,z,y){ return !!buriedVolAt(x,z,y); }

/* ---- the paving ----------------------------------------------------------
   Asphalt is a surface a few centimetres over the graded ground, drawn with
   a polygon offset so it always wins the depth test against the terrain
   under it — and it is a surface you stand on, so it is registered here,
   not left to the terrain three centimetres below. Rectangles are tested
   directly; anything that curves (the ramps, the drive) is rasterised onto
   a one-metre grid over the woods' zone when it is laid. */
const PAVE_T=0.03;
const PAVED_RECTS=[];
function addPaveRect(x0,x1,z0,z1,y){ PAVED_RECTS.push({x0,x1,z0,z1,y:(y||0)+PAVE_T}); }
const PRAST={x0:SITE.zone.x0, z0:SITE.zone.z0, nx:SITE.zone.x1-SITE.zone.x0, nz:SITE.zone.z1-SITE.zone.z0};
PRAST.a=new Float32Array(PRAST.nx*PRAST.nz).fill(NaN);
function addPaveRibbon(P, o0, o1){
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(const p of P){ x0=Math.min(x0,p.x); x1=Math.max(x1,p.x); z0=Math.min(z0,p.z); z1=Math.max(z1,p.z); }
  const w=Math.max(Math.abs(o0),Math.abs(o1))+1;
  const i0=Math.max(0,Math.floor(x0-w-PRAST.x0)), i1=Math.min(PRAST.nx-1,Math.ceil(x1+w-PRAST.x0));
  const j0=Math.max(0,Math.floor(z0-w-PRAST.z0)), j1=Math.min(PRAST.nz-1,Math.ceil(z1+w-PRAST.z0));
  const half=(Math.abs(o1-o0))/2, ctr=(o0+o1)/2;
  for(let j=j0;j<=j1;j++) for(let i=i0;i<=i1;i++){
    const x=PRAST.x0+i+0.5, z=PRAST.z0+j+0.5;
    // the offset of this cell from the centre line, along its side normal
    let best=1e9, by=0, bo=0;
    for(let k=1;k<P.length;k++){
      const a=P[k-1], b=P[k], ex=b.x-a.x, ez=b.z-a.z, L2=ex*ex+ez*ez;
      if(Math.abs(x-a.x)>half+8+Math.abs(ex) || Math.abs(z-a.z)>half+8+Math.abs(ez)) continue;
      const t=L2>0 ? clamp(((x-a.x)*ex+(z-a.z)*ez)/L2,0,1) : 0;
      const px=a.x+ex*t, pz=a.z+ez*t, d=Math.hypot(x-px, z-pz);
      if(d<best){ best=d; by=lerp(a.y||0,b.y||0,t);
        const L=Math.sqrt(L2)||1; bo=((x-px)*(ez/L)+(z-pz)*(-ex/L)); }
    }
    if(best<1e8 && Math.abs(bo-ctr)<=half+0.5) PRAST.a[j*PRAST.nx+i]=by+PAVE_T;
  }
}
function pavedY(x,z){
  if((x>NB_X0-0.2 && x<NB_X1+0.2) || (x>SB_X0-0.2 && x<SB_X1+0.2)) return roadY(z)+PAVE_T;
  for(let i=0;i<PAVED_RECTS.length;i++){
    const r=PAVED_RECTS[i];
    if(x>r.x0 && x<r.x1 && z>r.z0 && z<r.z1) return r.y;
  }
  const i=Math.floor(x-PRAST.x0), j=Math.floor(z-PRAST.z0);
  if(i>=0 && j>=0 && i<PRAST.nx && j<PRAST.nz){
    const v=PRAST.a[j*PRAST.nx+i];
    if(v===v) return v;
  }
  return null;
}
function groundY(x,z){
  const p=pavedY(x,z);
  if(p!==null) return p;
  return Terrain.groundAt(x,z);
}
const STEP_UP=0.62;
const VOIDS=[];
function addVoid(x0,x1,z0,z1,y0,y1,floor){ VOIDS.push({x0,x1,z0,z1,y0,y1,floor}); }
function voidAt(x,z,y){
  for(let i=VOIDS.length-1;i>=0;i--){
    const v=VOIDS[i];
    if(x>v.x0&&x<v.x1&&z>v.z0&&z<v.z1&&y>=v.y0&&y<v.y1) return v;
  }
  return null;
}
function surfaceY(x,z,curY){
  const _v=voidAt(x,z,curY);
  let best=_v ? _v.floor : groundY(x,z);
  for(let i=0;i<SURF.length;i++){
    const s=SURF[i];
    if(x<=s.x0||x>=s.x1||z<=s.z0||z>=s.z1) continue;
    let y;
    if(s.flat) y=s.y;
    else{
      const a=(s.axis==="x"?x:z);
      y=lerp(s.y0, s.y1, clamp((a-s.a0)/(s.a1-s.a0),0,1));
    }
    if(y>best && y<=curY+STEP_UP) best=y;
  }
  return best;
}
function hitsAny(list,x,z,r,lo,hi,skip){
  for(let i=0;i<list.length;i++){
    const c=list[i]; if(c===skip) continue;
    if(x>c.x0-r && x<c.x1+r && z>c.z0-r && z<c.z1+r && hi>c.y0 && lo<c.y1) return true;
  }
  return false;
}
function blocked(x,z,feetY){
  const r=PLAYER_R, lo=feetY+0.12, hi=feetY+1.72;
  return hitsAny(colsNear(x,z), x,z,r,lo,hi) ||
         hitsAny(COL_BIG,       x,z,r,lo,hi) ||
         hitsAny(COL_DYN,       x,z,r,lo,hi);
}
function zoneAt(x,z,y){
  let hit=null;
  for(let i=0;i<ZONES.length;i++){
    const q=ZONES[i];
    if(x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1&&y>=q.y0&&y<q.y1) hit=q;
  }
  return hit?hit.name:null;
}
