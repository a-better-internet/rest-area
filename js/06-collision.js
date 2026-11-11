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
// y is the floor under it; drop is how far your eyes come down as you sit (a chair's 0.66 unless it says; a bar
// stool, its seat at 0.79 and not 0.46, takes 0.34)
function addSeat(x,z,y,yaw,label,lie,drop){
  const s={x:x, z:z, y:y, yaw:yaw, label:label, lie:!!lie, drop:drop};
  SEATS.push(s); return s;
}
// things you can press E at that are neither a door nor a car
const USES=[];
/* Ladders: straight up a face, climbed with W and S (17's climb). Each is the rung's line (x, z, from y0 to y1), the way
   you face on it (yaw), where you step off at the bottom (out) and at the top (top). addLadder puts a use at each end
   to get on it. */
const LADDERS=[];
const ROOF_WALKS=[];          // the roofs the ladders go up to (roofLadder's walk): the dead are never put down on one (21)
function addLadder(x, z, y0, y1, yaw, out, top, label){
  const L={x:x, z:z, y0:y0, y1:y1, yaw:yaw, out:out, top:top, label:label||"THE LADDER"};
  LADDERS.push(L);
  addUse(out.x, out.z, y0, "CLIMB "+L.label, ()=>climbOn(L, "up"), 1.3);
  addUse(top.x, top.z, top.y, "CLIMB DOWN "+L.label, ()=>climbOn(L, "down"), 1.2);
  return L;
}
/* A FIXED LADDER UP A WALL TO A FLAT ROOF (the fuel stop's, the fireworks outlet's, the scale house's, the control
   house's): galvanised rails and round rungs on brackets off the wall, up past the edge and over it in a goose-neck
   that comes down on the roof; a cage round it from head height when it is tall. o: x, z where the ladder's middle
   meets the wall's outer face; nx, nz the face's outward normal (along x or along z); g the ground at its foot; edge
   the top of what you climb over (a parapet's coping, a roof's edge); roof what you stand on up there; off how far out
   the rungs stand from the face (clear of any eave); soffit the underside of an eave, which the brackets stay under;
   land where the rails come down on the roof, along the normal from the face (less than 0 is inside it); label.
   It adds the ladder (addLadder) and the colliders of its rails, and with walk ([x0, x1, z0, z1]) the roof's flat at
   roof, kept in ROOF_WALKS; the roof's zone and anything standing on the roof are the building's to add. The rails' faces are kept off each other's planes: the goose-neck's bars are
   thicker than the rails and run past them, and the rails stop inside the bars. */
function roofLadder(o){
  const nx=o.nx, nz=o.nz, tx=-nz, tz=nx, off=o.off||0.18, land=o.land, g=o.g, edge=o.edge, roof=o.roof;
  const HW=0.23, col=o.color||"#8e9497", ry=Math.atan2(nx, nz), top=edge+1.07, soffit=o.soffit===undefined ? 1e9 : o.soffit;
  const P=(n, t)=>[o.x+nx*n+tx*t, o.z+nz*n+tz*t];
  for(const s of [-1,1]){
    // the rail, from a little into the ground to just inside the goose-neck's bar
    let [x,z]=P(off, s*HW); bx("steel", 0.014, top+0.02-(g-0.08), 0.065, x, (top+0.02+g-0.08)/2, z, 1, ry, col);
    // over the edge: a bar from just past the rail to just past where it comes down
    const n0=off+0.0425, n1=land-0.0425; [x,z]=P((n0+n1)/2, s*HW); bx("steel", 0.018, 0.065, n0-n1, x, top, z, 1, ry, col);
    // and down to the roof, a centimetre into it
    [x,z]=P(land, s*HW); bx("steel", 0.014, top+0.02-(roof-0.01), 0.065, x, (top+0.02+roof-0.01)/2, z, 1, ry, col);
    // the brackets: from a little into the wall to past the rail, between the rungs, under any eave
    for(let y=g+0.75; y<Math.min(edge, soffit)-0.25; y+=1.5){ [x,z]=P((off+0.03)/2, s*HW); bx("steel", 0.03, 0.05, off+0.09, x, y, z, 1, ry, col); }
    // the landing's posts are solid
    [x,z]=P(land, s*HW); addCol(x-0.04, x+0.04, z-0.04, z+0.04, roof, top+0.04);
  }
  // the rungs, round, every 30 cm to the edge, their ends in the rails
  const [rx, rz]=P(off, 0);
  for(let y=g+0.3; y<=edge+0.02; y+=0.3) cyl("steel", 0.0125, 0.0125, 2*HW, 8, rx, y, rz, col, nx ? Math.PI/2 : 0, 0, nz ? Math.PI/2 : 0);
  // a tall one has a cage: hoops from over your head to the top of the rails, open to the wall, and straps up them
  if(edge-g>4.2){
    const R=0.38, cn=off+0.30, A=2*Math.acos(-0.30/R), hoop=new T.TorusGeometry(R, 0.011, 5, 22, A);
    hoop.rotateX(Math.PI/2); hoop.rotateY(A/2-Math.atan2(nz, nx));
    const [cx, cz]=P(cn, 0), y0=g+2.3;
    for(let y=y0; y<top-0.1; y+=0.9) push("steel", hoop, cx, y, cz, 0, col);
    push("steel", hoop, cx, top-0.03, cz, 0, col);
    for(const a of [-2.0, -1.0, 0, 1.0, 2.0]){ const qx=cx+(nx*Math.cos(a)+tx*Math.sin(a))*(R+0.004), qz=cz+(nz*Math.cos(a)+tz*Math.sin(a))*(R+0.004);
      cyl("steel", 0.008, 0.008, top-y0+0.02, 6, qx, (top+y0-0.03)/2, qz, col); }
  }
  // the rails are solid, from the ground to the edge
  const [ax, az]=P(off-0.035, -HW-0.02), [bxx, bzz]=P(off+0.035, HW+0.02);
  addCol(Math.min(ax, bxx), Math.max(ax, bxx), Math.min(az, bzz), Math.max(az, bzz), g-1, edge);
  const [ox, oz]=P(off+0.95, 0), [px, pz]=P(land-0.55, 0);
  if(o.walk){ const [w0, w1, w2, w3]=o.walk; addFlat(w0, w1, w2, w3, roof); ROOF_WALKS.push({x0:w0, x1:w1, z0:w2, z1:w3, y:roof, label:o.label||""}); }
  return addLadder(rx, rz, g, o.y1===undefined ? edge : o.y1, ry, {x:ox, z:oz}, {x:px, z:pz, y:roof}, o.label);
}
/* A ROOFTOP UNIT, for a roof you can now walk on: the air handler's cabinet on its curb (sunk into the curb, the curb
   a centimetre into the roof), louvres along one long side standing a little proud of it, the condenser's fan on top
   with its grille, and a collider round the lot. y is the roof's top; side +1/-1 puts the louvres on the +z/-z face. */
function roofUnit(x, z, y, w, d, h, col, side){
  const sd=side||1, top=y+0.19+h;
  bx("paintm", w+0.12, 0.22, d+0.12, x, y+0.10, z, 0.5, 0, "#8d8a85");
  bx("paintm", w, h, d, x, y+0.19+h/2, z, 0.5, 0, col||"#c9ccc8");
  for(let k=0;k<Math.floor((h-0.3)/0.09);k++) bx("paintm", w*0.62, 0.025, 0.03, x-w*0.12, y+0.36+k*0.09, z+sd*(d/2+0.012), 0.5, 0, "#9a9d9a");
  cyl("metal", 0.40, 0.40, 0.15, 22, x+w*0.22, top+0.065, z, "#a4a6a4");
  cyl("metal", 0.34, 0.34, 0.02, 22, x+w*0.22, top+0.14, z, "#2a2c2c");
  addCol(x-w/2-0.08, x+w/2+0.08, z-d/2-0.08, z+d/2+0.08, y, top+0.15);
}
// when: optional test, for things that are only sometimes there
function addUse(x,z,y,label,fn,r,when){ const u={x:x, z:z, y:y, label:label, fn:fn, r:r, when:when}; USES.push(u); return u; }
const SURF=[];   // flat {x0,x1,z0,z1,y} | ramp {axis,a0,a1,y0,y1}
const ZONES=[];  // {x0,x1,z0,z1,y0,y1,name,indoor}

function addCol(x0,x1,z0,z1,y0,y1){
  const c={x0:Math.min(x0,x1), x1:Math.max(x0,x1),
           z0:Math.min(z0,z1), z1:Math.max(z0,z1),
           y0:(y0===undefined?-2:y0), y1:(y1===undefined?60:y1)};
  COL.push(c); return c;
}
// What stopped you, if it was the edge of the world: one of the walls that stand from far under the ground to far over
// the trees (07's round the site and the fields, 14m's and 14n's round the woods, the town and the shore). Never a
// chair, a car or a house. A wall may carry its own `msg`.
function edgeWall(x,z,feetY){
  const r=PLAYER_R, lo=feetY+0.12, hi=feetY+1.72;
  const t=c=>c.y0<=-39 && c.y1>=299 && x>c.x0-r && x<c.x1+r && z>c.z0-r && z<c.z1+r && hi>c.y0 && lo<c.y1;
  for(const c of colsNear(x,z)) if(t(c)) return c;
  for(const c of COL_BIG) if(t(c)) return c;
  return null;
}
function addFlat(x0,x1,z0,z1,y){ SURF.push({flat:true,x0:x0,x1:x1,z0:z0,z1:z1,y:y}); }
/* A BOX TURNED ABOUT THE VERTICAL, for the one place a wall stands at an
   angle you can walk along: the trailer whose back doors open (10b). Its
   bounds are the turned box's own AABB, so the grid and the quick tests
   find it as they find any other; ob is the turn, which the tests then
   check (yaw as a group's rotation.y, hx and hz half-sizes across and along). */
function _ob(cx,cz,yaw,hx,hz){
  const c=Math.cos(yaw), s=Math.sin(yaw);
  return {cx:cx, cz:cz, c:c, s:s, hx:hx, hz:hz, ex:Math.abs(c)*hx+Math.abs(s)*hz, ez:Math.abs(s)*hx+Math.abs(c)*hz};
}
function obNear(o,x,z,r){
  const dx=x-o.cx, dz=z-o.cz, lx=dx*o.c-dz*o.s, lz=dx*o.s+dz*o.c;
  const qx=lx-clamp(lx,-o.hx,o.hx), qz=lz-clamp(lz,-o.hz,o.hz);
  return qx*qx+qz*qz<r*r;
}
function obIn(o,x,z){
  const dx=x-o.cx, dz=z-o.cz;
  return Math.abs(dx*o.c-dz*o.s)<o.hx && Math.abs(dx*o.s+dz*o.c)<o.hz;
}
function addColOB(cx,cz,yaw,hx,hz,y0,y1,list){
  const o=_ob(cx,cz,yaw,hx,hz);
  const e={x0:cx-o.ex, x1:cx+o.ex, z0:cz-o.ez, z1:cz+o.ez, y0:y0, y1:y1, ob:o};
  (list||COL).push(e); return e;
}
function addFlatOB(cx,cz,yaw,hx,hz,y){
  const o=_ob(cx,cz,yaw,hx,hz);
  const e={flat:true, x0:cx-o.ex, x1:cx+o.ex, z0:cz-o.ez, z1:cz+o.ez, y:y, ob:o};
  SURF.push(e); return e;
}
function addRamp(x0,x1,z0,z1,axis,a0,a1,y0,y1){
  SURF.push({flat:false,x0:x0,x1:x1,z0:z0,z1:z1,axis:axis,a0:a0,a1:a1,y0:y0,y1:y1});
}
// `indoor` marks a roof overhead: the fireflies and the falling leaves are
// drawn round the camera and must not follow you inside
function addZone(x0,x1,z0,z1,y0,y1,name,indoor){
  ZONES.push({x0:x0,x1:x1,z0:z0,z1:z1,y0:y0,y1:y1,name:name,indoor:!!indoor});
}
// a roof with open sides (a canopy, a porch, a shed): it keeps the rain off what is under it (16b) without
// being an indoor zone. top: the height of the roof's underside, near enough
const ROOF_EXTRA=[];
function addRoof(x0,x1,z0,z1,top){ ROOF_EXTRA.push([x0,z0,x1,z1,top]); }
// a zone turned with its box (10b's trailer): its bounds, and ob to check
function addZoneOB(cx,cz,yaw,hx,hz,y0,y1,name,indoor){
  const o=_ob(cx,cz,yaw,hx,hz);
  ZONES.push({x0:cx-o.ex,x1:cx+o.ex,z0:cz-o.ez,z1:cz+o.ez,y0:y0,y1:y1,name:name,indoor:!!indoor,ob:o});
}
function indoorsAt(x,z,y){
  const ix=_rgAt(_ZONE_G, x, z);                  // (06's rect grid, further on)
  for(let k=0;k<ix.length;k++){
    const q=ZONES[ix[k]];
    if(q.indoor && x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1&&y>=q.y0&&y<q.y1 && (!q.ob || obIn(q.ob,x,z))) return true;
  }
  return false;
}
// underground: the basement under the generator house (12b), where the loop turns the sky down
const BURIED=[];
// (a ninth argument [yTop, yBottom] grades it: a stairwell going down is underground by degrees, none of it at yTop and
// all of it at yBottom, so the light changes as you go down rather than all at once at some line)
// (a graded one goes first, so a stairwell is asked before the basement it goes down into, however they overlap)
function addBuried(x0,x1,z0,z1,y0,y1,amb,tint,grad){ const q={x0,x1,z0,z1,y0,y1,amb,tint:tint ? new T.Color(tint) : null, grad:grad||null}; if(grad) BURIED.unshift(q); else BURIED.push(q); }
function buriedShare(q, y){ if(!q) return 0; if(!q.grad) return 1; const t=(q.grad[0]-y)/(q.grad[0]-q.grad[1]); return t<=0 ? 0 : t>=1 ? 1 : t*t*(3-2*t); }
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
   a one-metre grid when it is laid: the one over the woods' zone, and one
   each for anywhere else a curve is paved (Edinboro's ramps, 08b). */
const PAVE_T=0.03;
const PAVED_RECTS=[];
function addPaveRect(x0,x1,z0,z1,y){ PAVED_RECTS.push({x0,x1,z0,z1,y:(y||0)+PAVE_T}); }
const PRASTS=[];
function addPaveRaster(x0,z0,x1,z1){
  const R={x0:x0, z0:z0, nx:Math.ceil(x1-x0), nz:Math.ceil(z1-z0)};
  R.a=new Float32Array(R.nx*R.nz).fill(NaN); PRASTS.push(R); return R;
}
const PRAST=addPaveRaster(SITE.zone.x0, SITE.zone.z0, SITE.zone.x1, SITE.zone.z1);
addPaveRaster(-280, EDIN.z-12, 4, EDIN.z+572);
function addPaveRibbon(P, o0, o1){
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(const p of P){ x0=Math.min(x0,p.x); x1=Math.max(x1,p.x); z0=Math.min(z0,p.z); z1=Math.max(z1,p.z); }
  const w=Math.max(Math.abs(o0),Math.abs(o1))+1;
  for(const R of PRASTS) _paveInto(R, P, o0, o1, x0, x1, z0, z1, w);
}
function _paveInto(PRAST, P, o0, o1, x0, x1, z0, z1, w){
  const i0=Math.max(0,Math.floor(x0-w-PRAST.x0)), i1=Math.min(PRAST.nx-1,Math.ceil(x1+w-PRAST.x0));
  const j0=Math.max(0,Math.floor(z0-w-PRAST.z0)), j1=Math.min(PRAST.nz-1,Math.ceil(z1+w-PRAST.z0));
  if(i0>i1 || j0>j1) return;
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
  for(let k=0;k<PRASTS.length;k++){
    const R=PRASTS[k], i=Math.floor(x-R.x0), j=Math.floor(z-R.z0);
    if(i>=0 && j>=0 && i<R.nx && j<R.nz){
      const v=R.a[j*R.nx+i];
      if(v===v) return v;
    }
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
/* RECT GRIDS. SURF, ZONES and VOIDS run to thousands across the world, and the walker, the people, the cars and the
   dead ask after them many times a frame. Each list keeps a 32 m grid of indices into it, filled in as the list grows
   (they only ever grow; a rect's bounds never change after it is added, only a surface's height). Whatever covers
   more than 400 cells is kept in the grid's own short list, which every query also walks. A query returns the
   indices in the order they were added, so "the last one that holds you" stays the last one. */
function _rgrid(list){ return {list:list, n:0, map:new Map(), big:[], tmp:[]}; }
function _rgSync(G){
  const L=G.list;
  for(; G.n<L.length; G.n++){ const r=L[G.n], i0=Math.floor(r.x0/32), i1=Math.floor(r.x1/32), j0=Math.floor(r.z0/32), j1=Math.floor(r.z1/32);
    if((i1-i0+1)*(j1-j0+1)>400){ G.big.push(G.n); continue; }
    for(let i=i0;i<=i1;i++) for(let j=j0;j<=j1;j++){ const k=i*100003+j; let a=G.map.get(k); if(!a){ a=[]; G.map.set(k, a); } a.push(G.n); } }
}
const _RG_NONE=[];
function _rgAt(G, x, z){
  _rgSync(G);
  const a=G.map.get(Math.floor(x/32)*100003+Math.floor(z/32)) || _RG_NONE;
  if(!G.big.length) return a;
  const t=G.tmp; t.length=0; let i=0, j=0;                  // (merged in order: the cell's and the big ones')
  while(i<a.length || j<G.big.length) t.push(j>=G.big.length || (i<a.length && a[i]<G.big[j]) ? a[i++] : G.big[j++]);
  return t;
}
const _SURF_G=_rgrid(SURF), _ZONE_G=_rgrid(ZONES), _VOID_G=_rgrid(VOIDS);
function voidAt(x,z,y){
  const ix=_rgAt(_VOID_G, x, z);
  for(let k=ix.length-1;k>=0;k--){
    const v=VOIDS[ix[k]];
    if(x>v.x0&&x<v.x1&&z>v.z0&&z<v.z1&&y>=v.y0&&y<v.y1) return v;
  }
  return null;
}
function surfaceY(x,z,curY){
  const _v=voidAt(x,z,curY);
  let best=_v ? _v.floor : groundY(x,z);
  const ix=_rgAt(_SURF_G, x, z);
  for(let k=0;k<ix.length;k++){
    const s=SURF[ix[k]];
    if(x<=s.x0||x>=s.x1||z<=s.z0||z>=s.z1) continue;
    if(s.ob && !obIn(s.ob,x,z)) continue;
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
    if(x>c.x0-r && x<c.x1+r && z>c.z0-r && z<c.z1+r && hi>c.y0 && lo<c.y1 && (!c.ob || obNear(c.ob,x,z,r))) return true;
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
  const ix=_rgAt(_ZONE_G, x, z);
  for(let k=0;k<ix.length;k++){
    const q=ZONES[ix[k]];
    if(x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1&&y>=q.y0&&y<q.y1 && (!q.ob || obIn(q.ob,x,z))) hit=q;
  }
  return hit?hit.name:null;
}
