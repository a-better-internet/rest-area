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
/* ---- Edinboro: exit 166 ---------------------------------------------
   Two thirds of a mile north, US 6N crosses over the interstate on a
   bridge, level with farm country that has been cleared and graded flat on
   both sides (EDIN.plain), I-79 in a cut beneath it. Half a diamond: the
   northbound off-ramp leaves the right lane, climbs along the cut and
   merges into US 6N eastbound; its mirror on the west side takes you from
   US 6N back down onto southbound. US 6N runs out east and west to where
   the fields end, for now (08b). */
const EDIN=(function(){
  const z=-1200, y=roadY(z)+7.0;                 // the crossroad, level, 7 m over the interstate
  // (the bridge's ends, bw0 and bw1, are on the 8 m ground's lattice past the top of the cut, where it is level)
  const E={z:z, y:y, hw:5.2, rw:2.45, x0:-330, x1:610, bw0:-192, bw1:-80, piers:[-167.0, -135.0, -103.2],
           plain:{x0:-330, x1:610, z0:z-260, z1:z+340}};
  // the northbound off-ramp's centre line, from the highway to the crossroad (x, z from the crossroad)
  const nb=[[-106.4,560],[-104.2,470],[-100.0,380],[-94.0,290],[-87.5,200],[-81.0,120],[-74.0,60],[-63.0,22],
            [-46.0,7.5],[-26.0,3.0],[-6.0,1.8]];
  // along the highway at its grade until it has parted from it (the gore's nose is 185 m or so out), then up to
  // the crossroad's, level for the last 70; climbing any sooner, it would stand on the shoulder's edge in a step
  const mk=(pts, fromHwy)=>{
    const P=smoothPath(pts.map(p=>({x:p[0], z:z+p[1]})), 2.0), L=P[P.length-1].s;
    for(const p of P){ const d=fromHwy ? p.s : L-p.s; p.y=lerp(roadY(p.z), y, smoothstep(190, L-70, d)); }
    return P; };
  E.off=mk(nb, true);
  E.on=mk(nb.slice().reverse().map(p=>[-270-p[0], p[1]]), false);   // the mirror across the median, crossroad first
  // the fields either side of US 6N, clear of its right of way and the ramps; hedgerows between (07)
  const F=(x0,x1,z0,z1,crop)=>({x0:x0, x1:x1, z0:z+z0, z1:z+z1, crop:crop});
  // (strips a hundred metres or so wide, corn and beans and hay turn about, the way the county farms them;
  //  north of the road the corner by the bridge is the fuel stop's, south a farmstead sits back off the road
  //  with its own pasture behind it: 14k builds both. Field 3 is the hay field with the oak in it.)
  E.fields=[F(48,128,-250,-16,"corn"), F(140,248,-250,-16,"soy"), F(260,368,-250,-16,"hay"),
            F(-30,100,16,330,"hay"), F(262,388,16,330,"corn"), F(400,500,16,330,"soy"),
            F(512,600,16,330,"pasture"), F(380,488,-250,-16,"corn"), F(500,600,-250,-16,"hay"),
            F(-322,-200,-250,-16,"soy"), F(-322,-236,16,330,"hay"), F(112,250,140,330,"pasture")];
  E.station={x0:-56, x1:32, z0:z-66, z1:z-E.hw+0.05};                  // the fuel stop's lot, north of the road by the bridge
  E.farm={x0:104, x1:258, z0:z+E.hw+1, z1:z+130};                      // the farmstead, south of it
  return E;
})();
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
/* and further in, north-east of the fire and past where anybody goes, a
   house nobody has lived in for thirty-odd years, in what is left of its
   yard: a slight clearing the woods are taking back. 14f builds it. The
   house box is its footprint and porch; its floor is levelled, the yard
   is not. The old two-track to it comes in from the north. */
const HOMESTEAD={x:312, z:160, r:17, y:0, box:{x0:312-7.2, x1:312+7.2, z0:160-8.0, z1:160+5.8}};
/* east of the building, past the loop walk and the two spruces on the lawn,
   the maintenance garage: a block building on a gravel yard, graded level
   with the pad, and a gravel track out of the back corner of the yard,
   through a pipe gate and away south-east through the woods to the township
   road. Well clear of the pet area, which is south of it across the lawn.
   14g builds it; 14h is the custodian who works out of it. The track rides
   the ground as it lies, smoothed along its length and level across it. */
const GARAGE={x0:32.5, x1:41.5, z0:24.0, z1:38.0, y:0, yard:{x0:23.5, x1:42.5, z0:18.5, z1:45.0}};
const SERVICE=smoothPath([
  {x:40.5,z:43.5},{x:48,z:47.5},{x:57,z:54},{x:65,z:64},{x:72,z:78},{x:79,z:97},{x:86,z:122},
  {x:93,z:152},{x:99,z:184},{x:104,z:218},{x:108,z:252},{x:110.5,z:276},{x:110.5,z:298}], 2.0);
// where it ends: a gravel turnaround in the woods, a gate across the old track on, the game lands past it (13c)
const TURN={x:110.5, z:304.5, r:7.5};
const TRAIL=smoothPath([
  {x:17.4,z:1.2},{x:24,z:3.5},{x:34,z:5.2},{x:48,z:8.5},{x:62,z:7.2},{x:78,z:4.6},{x:94,z:7.2},
  {x:110,z:12.4},{x:126,z:13.2},{x:142,z:10.2},{x:158,z:12.2},{x:174,z:18.2},{x:190,z:24},
  {x:206,z:27.2},{x:222,z:31.4},{x:238,z:36.2},{x:254,z:41.2},{x:267,z:46},{x:278,z:49.6}], 2.0, true);
/* ---- water in, water out -------------------------------------------
   No city water or sewer comes out this far. The water comes up a well
   into a pressure tank in a little block well house (WELLH) west of the
   service track. From there it is pumped up into a steel tank on a short
   tower on the rise above (WTOWER), which gives the building its pressure.
   What goes down the drains runs by gravity under the lawn to a small
   treatment plant in a fenced compound (WWTP) downhill from everything,
   east of the track. The cleaned water goes out a pipe into the creek in
   the bottom of the woods (CREEK, upstream to down: off the hills to the
   south, past the plant and away east). 13c builds them. The tracks to
   all three ride the ground smoothed along their length and level across
   it, as the service track does. */
const WWTP={x0:118, x1:160, z0:90, z1:128, y:0.3, gate:{x:118, z0:105.0, z1:107.9}};
const WELLH={x0:65.6, x1:68.8, z0:97.6, z1:101.2, y:4.15};
const WTOWER={x:70, z:140, y:5.7};
const PLANT_TRACKS=[
  smoothPath([{x:86.4,z:121.6},{x:96,z:116},{x:106,z:110.6},{x:113.5,z:107.2},{x:120.5,z:106.45}], 2.0),   // the spur down to the gate
  smoothPath([{x:79.6,z:97.4},{x:74.5,z:98.4},{x:69.6,z:99.4}], 1.5),                                       // a path to the well house
  smoothPath([{x:88.4,z:129.0},{x:81,z:133.5},{x:74.6,z:138.2}], 1.5)];                                     // and to the tower
const CREEK=smoothPath([{x:175,z:380},{x:173,z:330},{x:171,z:296},{x:170,z:262},{x:168,z:232},{x:167,z:204},{x:171,z:176},{x:178,z:148},{x:182,z:120},{x:190,z:96},
  {x:210,z:84},{x:240,z:92},{x:272,z:104},{x:306,z:114},{x:340,z:120},{x:376,z:124},{x:412,z:128},{x:450,z:134}], 3.0);

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
  HOMESTEAD.y=natural(HOMESTEAD.x, HOMESTEAD.z);

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
  const EXIT_B=pathBox(RAMP_EXIT,60), ENTRY_B=pathBox(RAMP_ENTRY,60), DRIVE_B=pathBox(DRIVE,40), TRAIL_B=pathBox(TRAIL,16),
        SERV_B=pathBox(SERVICE,12);
  const SUBPAD={x0:SITE.sub.x0-8, x1:SITE.sub.x1+8, z0:SITE.sub.z0-8, z1:SITE.sub.z1+8};
  const EOFF_B=pathBox(EDIN.off,16), EON_B=pathBox(EDIN.on,16);
  const CREEK_B=pathBox(CREEK,12), PT_B=PLANT_TRACKS.map(P=>pathBox(P,8));

  // pull h towards level y with full weight inside `half` and none past half+blend
  const toward=(h,y,d,half,blend)=>{ const t=smoothstep(half, half+blend, d); return y+(h-y)*t; };

  function baseHeight(x,z){
    let h=natural(x,z);
    // Edinboro's farmland, graded level with the crossroad
    const pd=boxDist(EDIN.plain,x,z);
    if(pd<60) h=toward(h, EDIN.y, pd, 0, 60);
    // the interstate corridors, cut and filled to the road's own grade (a steep cut through the plain)
    const ry=roadY(z), wI=pd<40 ? 1-smoothstep(0,40,pd) : 0, hh=19-2*wI, hb=34-24*wI;
    h=toward(h, ry, Math.abs(x-HWY.nb), hh, hb);
    h=toward(h, ry, Math.abs(x-HWY.sb), hh, hb);
    // a shallow swale down the middle of the median, where the water goes
    const mid=(HWY.nb+HWY.sb)/2, md=Math.abs(x-mid);
    if(md<16) h-=1.1*(1-smoothstep(0,16,md))*smoothstep(0,8,Math.abs(x-HWY.nb)-8)*smoothstep(0,8,Math.abs(x-HWY.sb)-8);
    // and a level berm across it at each crossover, wide enough that the coarse ground (8 m) is level under the paving
    if(x>SB_X1-6 && x<NB_X0+6) for(const c of CROSSOVERS){ const dz=Math.abs(z-c.z); if(dz<c.hw+24) h=toward(h, roadY(c.z), dz, c.hw+5, 14); }
    // the pad
    h=toward(h, 0, boxDist(SITE.pad,x,z), 0, 42);
    // ramps and the drive, cut in along their centre lines
    if(x>EXIT_B.x0 && x<EXIT_B.x1 && z>EXIT_B.z0 && z<EXIT_B.z1)
      h=toward(h, 0, distToPath(RAMP_EXIT,x,z).d, 9, 22);
    if(x>ENTRY_B.x0 && x<ENTRY_B.x1 && z>ENTRY_B.z0 && z<ENTRY_B.z1)
      h=toward(h, 0, distToPath(RAMP_ENTRY,x,z).d, 9, 22);
    // Edinboro's ramps, a ledge up the side of the cut; and between a ramp and the interstate, where the ramp
    // has begun to climb, a bank from the one's paving up to the other's, each with a 2 m cell of level ground
    // past its edge, so the ground's grid never comes up through the shoulder in teeth
    for(const [P,B,X,s] of [[EDIN.off,EOFF_B,NB_X1,1],[EDIN.on,EON_B,SB_X0,-1]])
      if(x>B.x0 && x<B.x1 && z>B.z0 && z<B.z1){ const q=distToPath(P,x,z); h=toward(h, q.y, q.d, 4.4, 10);
        const dr=s*(x-X), gp=s*(q.x-X)-EDIN.rw, a=2.2, b=Math.max(a, gp-a);       // past the road's edge; the ramp's near edge
        // (only while the two are close: farther apart, the cut's own slope stands between them as before)
        if(dr>-12 && dr<gp && gp<16){ const hk=dr<=a ? ry : dr>=b ? q.y : ry+(q.y-ry)*smoothstep(a, b, dr);
          h=lerp(hk, h, smoothstep(12, 16, gp)); } }
    // the compound: a level shelf of fill with the woods running up to it
    h=toward(h, SITE.sub.y, boxDist(SUBPAD,x,z), 0, 16);
    // and the drive cut through the edge of that fill, all the way to the gate
    // (after the shelf, or the fill buries the drive's last twenty metres)
    if(x>DRIVE_B.x0 && x<DRIVE_B.x1 && z>DRIVE_B.z0 && z<DRIVE_B.z1){
      const q=distToPath(DRIVE,x,z);
      h=toward(h, q.y, q.d, 4.2, 12);
    }
    // the camp's clearing, trodden level round the fire
    h=toward(h, CAMP.y, Math.hypot(x-CAMP.x, z-CAMP.z), 6.5, 9);
    // the house's ground, graded once and long since settled
    if(Math.abs(x-HOMESTEAD.x)<40 && Math.abs(z-HOMESTEAD.z)<40) h=toward(h, HOMESTEAD.y, boxDist(HOMESTEAD.box,x,z), 0.5, 8);
    // the garage yard, level with the pad
    if(x>GARAGE.yard.x0-30 && x<GARAGE.yard.x1+30 && z>GARAGE.yard.z0-30 && z<GARAGE.yard.z1+30)
      h=toward(h, GARAGE.y, boxDist(GARAGE.yard,x,z), 0, 14);
    // the plant's compound, a shelf cut and filled level; the well house's pad, the tower's
    if(x>WWTP.x0-20 && x<WWTP.x1+20 && z>WWTP.z0-20 && z<WWTP.z1+20) h=toward(h, WWTP.y, boxDist(WWTP,x,z), 0, 9);
    if(Math.abs(x-67)<14 && Math.abs(z-99)<14) h=toward(h, WELLH.y, boxDist(WELLH,x,z), 1.2, 4);
    { const dt=Math.hypot(x-WTOWER.x, z-WTOWER.z); if(dt<14) h=toward(h, WTOWER.y, dt, 4.6, 5); }
    // the creek, cut down into whatever it runs through: a bed half a metre under the water, the banks up from it
    if(CREEK.ready && x>CREEK_B.x0 && x<CREEK_B.x1 && z>CREEK_B.z0 && z<CREEK_B.z1){
      const q=distToPath(CREEK,x,z);
      if(q.d<10) h=Math.min(h, q.y-0.5+0.5*smoothstep(0,1.4,q.d)+Math.max(0,q.d-1.4)*0.55);
    }
    return h;
  }
  function heightAt(x,z){
    let h=baseHeight(x,z);
    // the service track: a level strip across, following its own smoothed grade
    // (its turnaround first, level at the track's end, so the track's own strip, after it, is never under it)
    { const dt=Math.hypot(x-TURN.x, z-TURN.z); if(dt<TURN.r+8) h=toward(h, SERVICE[SERVICE.length-1].y, dt, TURN.r+0.6, 6); }
    if(x>SERV_B.x0 && x<SERV_B.x1 && z>SERV_B.z0 && z<SERV_B.z1){
      const q=distToPath(SERVICE,x,z); h=toward(h, q.y, q.d, 2.6, 5); }
    for(let k=0;k<PLANT_TRACKS.length;k++){ const B=PT_B[k];
      if(x>B.x0 && x<B.x1 && z>B.z0 && z<B.z1){ const q=distToPath(PLANT_TRACKS[k],x,z); h=toward(h, q.y, q.d, k?1.0:2.0, k?2.5:4); } }
    return h;
  }
  { for(const p of SERVICE) p.y=baseHeight(p.x,p.z);
    for(let pass=0;pass<8;pass++){ const y=SERVICE.map(p=>p.y);
      for(let i=1;i<SERVICE.length-1;i++) SERVICE[i].y=y[i-1]*0.25+y[i]*0.5+y[i+1]*0.25; } }
  // the tracks off it: from the service track's own level at one end to the pad's at the other
  { const ends=[WWTP.y, WELLH.y, WTOWER.y];
    PLANT_TRACKS.forEach((P,k)=>{ for(const p of P) p.y=baseHeight(p.x,p.z);
      P[0].y=distToPath(SERVICE,P[0].x,P[0].z).y; P[P.length-1].y=ends[k];
      for(let pass=0;pass<8;pass++){ const y=P.map(p=>p.y); for(let i=1;i<P.length-1;i++) P[i].y=y[i-1]*0.25+y[i]*0.5+y[i+1]*0.25; } }); }
  // the creek's water: a little under the lowest ground beside it, and never running uphill
  { let lo=1e9;
    CREEK.forEach((p,i)=>{ const n=pathSide(CREEK,i); let g=baseHeight(p.x,p.z);
      for(const o of [-1.6,1.6]) g=Math.min(g, baseHeight(p.x+n.x*o, p.z+n.z*o));
      lo=Math.min(lo, g-0.35); p.y=lo; });
    for(let pass=0;pass<4;pass++){ const y=CREEK.map(p=>p.y); for(let i=1;i<CREEK.length-1;i++) CREEK[i].y=y[i-1]*0.25+y[i]*0.5+y[i+1]*0.25; }
    CREEK.ready=true; }

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
    const dh=Math.hypot(x-HOMESTEAD.x, (z-HOMESTEAD.z)*0.85);
    if(dh<HOMESTEAD.r+40) d=Math.min(d, dh-HOMESTEAD.r+(fbm(x*0.07+5, z*0.07+1, 2)-0.5)*7);
    // the garage yard and its track: no tree within a couple of metres of either
    d=Math.min(d, boxSD(GARAGE.yard,x,z)-2.0);
    if(x>SERV_B.x0 && x<SERV_B.x1 && z>SERV_B.z0 && z<SERV_B.z1) d=Math.min(d, distToPath(SERVICE,x,z).d-2.4);
    d=Math.min(d, Math.hypot(x-TURN.x, z-TURN.z)-TURN.r-1.2);
    // the water and sewage works: round the compound, the well house, the tower, the tracks to them;
    // and no tree in the creek, though they come down to its banks
    d=Math.min(d, boxSD(WWTP,x,z)-3.0, boxSD(WELLH,x,z)-2.5, Math.hypot(x-WTOWER.x, z-WTOWER.z)-6.5);
    for(let k=0;k<PLANT_TRACKS.length;k++){ const B=PT_B[k];
      if(x>B.x0 && x<B.x1 && z>B.z0 && z<B.z1) d=Math.min(d, distToPath(PLANT_TRACKS[k],x,z).d-(k?1.4:2.4)); }
    if(x>CREEK_B.x0 && x<CREEK_B.x1 && z>CREEK_B.z0 && z<CREEK_B.z1) d=Math.min(d, distToPath(CREEK,x,z).d-1.8);
    return d;
  }
  function siteDist(x,z){
    let d=boxSD(CLEAR_SITE,x,z);
    d=Math.min(d, Math.abs(x-HWY.nb)-18.5, Math.abs(x-HWY.sb)-18.5);
    if(x>SB_X1-2 && x<NB_X0+2) for(const c of CROSSOVERS) d=Math.min(d, Math.abs(z-c.z)-c.hw-2.5);
    if(x>EXIT_B.x0 && x<EXIT_B.x1 && z>EXIT_B.z0 && z<EXIT_B.z1) d=Math.min(d, distToPath(RAMP_EXIT,x,z).d-13);
    if(x>ENTRY_B.x0 && x<ENTRY_B.x1 && z>ENTRY_B.z0 && z<ENTRY_B.z1) d=Math.min(d, distToPath(RAMP_ENTRY,x,z).d-13);
    if(x>DRIVE_B.x0 && x<DRIVE_B.x1 && z>DRIVE_B.z0 && z<DRIVE_B.z1) d=Math.min(d, distToPath(DRIVE,x,z).d-4.6);
    d=Math.min(d, boxSD(SUBPAD,x,z)+1);
    d=Math.min(d, boxSD(EDIN.plain,x,z));
    for(const [P,B] of [[EDIN.off,EOFF_B],[EDIN.on,EON_B]])
      if(x>B.x0 && x<B.x1 && z>B.z0 && z<B.z1) d=Math.min(d, distToPath(P,x,z).d-9);
    d=Math.min(d, boxSD(GARAGE.yard,x,z)+2);
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
  return {heightAt:heightAt, natural:natural, SERV_B:SERV_B, fbm:fbm, clearDist:clearDist, siteDist:siteDist, pathDist:pathDist,
          mask:mask, boxDist:boxDist, boxSD:boxSD};
})();

/* ---- the rings ------------------------------------------------------
   Cell sizes are exact multiples of one another and each inner ring's box
   lands on the outer ring's lattice at all four edges, so every coarse cell
   is wholly in a hole or wholly out, and the border nodes are shared.
     far    16 m   ±2400                        the haze and the far ridges
     mid     8 m   x -512..640, z ±1600         the corridor and its cuts
     near    2 m   x -256..448, z -336..344     the site and its woods
     hwyN    2 m   x -272..-48, z -1328..-336   the interstate north: the entry ramp's merge, two crossovers, Edinboro
     hwyS    2 m   x -272..-48, z 344..568      the interstate south: the exit ramp's diverge, the third crossover */
const RING_MID ={x0:-512, x1:640, z0:-1600, z1:1600};
const RING_NEAR={x0:-256, x1:448, z0:-336,  z1:344};
// and two more at 2 m along the interstate, so the ground under every ramp's merge, the crossovers and
// Edinboro's interchange follows the paving instead of an 8 m triangle cutting up through its edge
const RING_HWYN={x0:-272, x1:-48, z0:-1328, z1:-336}, RING_HWYS={x0:-272, x1:-48, z0:344, z1:568};
const TERRAIN_RINGS=[];
let TERRAIN_MAT=null, TERRAIN_TINT=null;      // (the ground's colour at a point, for whatever grows on it: 14z)
(function buildTerrain(){
  const campC=new T.Color(0x5a4a38), yardC=new T.Color(0x6e7440), rutC=new T.Color(0x5e5240);
  // (greens a mown Pennsylvania lawn has in August: olive, not lime; dry patches straw, low spots darker)
  const lawnC=new T.Color(0x506f38), mowC=new T.Color(0x5a713c), vergeC=new T.Color(0x67723f),
        dryC=new T.Color(0x7c7848), lushC=new T.Color(0x3f5a2e),
        litterC=new T.Color(0x5f4d35), mossC=new T.Color(0x4d5a30), deepC=new T.Color(0x3d3729),
        gravelC=new T.Color(0x8e8a7e), rockC=new T.Color(0x6f6a5c), bedC=new T.Color(0x5a5446);
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
    // and never one green: clumps at a couple of scales, thinner and drier on the rises, lusher where it is low
    const g1=Terrain.fbm(x*0.045+3.1, z*0.045+7.7, 3), g2=Terrain.fbm(x*0.23+11.0, z*0.23+2.0, 2);
    out.lerp(dryC, smoothstep(0.52,0.74,g1)*0.38);
    out.lerp(lushC, smoothstep(0.44,0.22,g2)*0.28);
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
    // the yard: rank grass and goldenrod gone to seed, and the two ruts of the old drive
    const dh=Math.hypot(x-HOMESTEAD.x, (z-HOMESTEAD.z)*0.85);
    if(dh<HOMESTEAD.r+8){ out.lerp(yardC, (1-smoothstep(HOMESTEAD.r-5, HOMESTEAD.r+6, dh))*(0.55+0.3*Terrain.fbm(x*0.3,z*0.3,2)));
      if(z>HOMESTEAD.z+6) for(const rx of [-0.8,0.8]){ const q=Math.abs(x-(HOMESTEAD.x+2.6+rx+Math.sin(z*0.05)*1.2)); if(q<0.45) out.lerp(rutC, (1-q/0.45)*0.55); } }
    else if(z>HOMESTEAD.z+6 && Math.abs(x-HOMESTEAD.x-2.6)<5) for(const rx of [-0.8,0.8]){ const q=Math.abs(x-(HOMESTEAD.x+2.6+rx+Math.sin(z*0.05)*1.2)); if(q<0.45) out.lerp(rutC, (1-q/0.45)*0.35); }
    // the garage yard's gravel, spilling a little past its edge; the track's verges
    const ys=Terrain.boxSD(GARAGE.yard,x,z);
    if(ys<2) out.lerp(gravelC, (1-smoothstep(-0.8,1.6,ys))*0.55);
    const SB=Terrain.SERV_B;
    if(x>SB.x0 && x<SB.x1 && z>SB.z0 && z<SB.z1){ const q=distToPath(SERVICE,x,z).d;
      if(q<3.4) out.lerp(vergeC, (1-smoothstep(1.4,3.4,q))*0.55); }
    // the plant's compound is crushed stone to the fence and a little past it; the creek's bed is stones and silt
    const ws=Terrain.boxSD(WWTP,x,z);
    if(ws<2) out.lerp(gravelC, (1-smoothstep(-0.5,1.8,ws))*0.7);
    if(x>155 && z>70 && z<275){ const cq=distToPath(CREEK,x,z).d; if(cq<3.4) out.lerp(bedC, (1-smoothstep(1.0,3.4,cq))*0.85); }
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
        if(h.bare) continue;
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
  TERRAIN_TINT=tint;
  grid({x0:-2400,x1:2400,z0:-2400,z1:2400}, 16, [RING_MID], "ground-far", 40);      // (16 m: the hills' skylines round, not faceted)
  grid(RING_MID, 8, [RING_NEAR, RING_HWYN, RING_HWYS], "ground-mid", 24);
  grid(RING_NEAR, 2, [GEN_HOLE], "ground-near", 6);
  grid(RING_HWYN, 2, [], "ground-hwyn", 6);
  grid(RING_HWYS, 2, [], "ground-hwys", 6);
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
