"use strict";
/* REST AREA · 18-hud.js
   compass, clock, location, season, the painted site plan
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18 · HUD — small and quiet; the world is the interface
   ---------------------------------------------------------------------- */
(function compass(){
  const svg=document.getElementById("gaugeSvg"), NS="http://www.w3.org/2000/svg";
  const cx=100, cy=100, R=82, mk=(n,a)=>{const e=document.createElementNS(NS,n);
    for(const k in a) e.setAttribute(k,a[k]); svg.appendChild(e); return e;};
  mk("circle",{cx:cx,cy:cy,r:R+6,fill:"#14563a",stroke:"#f1f1ea","stroke-width":3});
  mk("circle",{cx:cx,cy:cy,r:R-26,fill:"none",stroke:"rgba(241,241,234,0.18)","stroke-width":1});
  for(let a=0;a<360;a+=15){
    const big=a%45===0, rad=(a-90)*Math.PI/180;
    mk("line",{x1:cx+Math.cos(rad)*(R-2), y1:cy+Math.sin(rad)*(R-2),
               x2:cx+Math.cos(rad)*(R-(big?13:7)), y2:cy+Math.sin(rad)*(R-(big?13:7)),
               stroke:big?"#f1f1ea":"rgba(241,241,234,0.5)","stroke-width":big?2:1});
  }
  const g=mk("g",{id:"rose"});
  ["N","E","S","W"].forEach((L,i)=>{
    const rad=(i*90-90)*Math.PI/180;
    const t=document.createElementNS(NS,"text");
    t.setAttribute("x",cx+Math.cos(rad)*(R-26)); t.setAttribute("y",cy+Math.sin(rad)*(R-26)+5);
    t.setAttribute("text-anchor","middle"); t.setAttribute("fill", L==="N"?"#f4c430":"#cfe0d4");
    t.setAttribute("font-family","Oswald, sans-serif"); t.setAttribute("font-size","16");
    t.textContent=L; g.appendChild(t);
  });
  mk("polygon",{id:"needle",points:"100,52 94,70 106,70",fill:"#f4c430"});
})();
const hud={ hdg:document.getElementById("hdgNum"), card:document.getElementById("hdgCard"), wx:document.getElementById("wx"),
            where:document.getElementById("where"), clock:document.getElementById("clock"),
            season:document.getElementById("season"), rose:document.getElementById("rose") };
const CARD=["N","NE","E","SE","S","SW","W","NW"];

let _toastT=null;
function toast(text,color){
  const el=document.getElementById("toast");
  el.textContent=text; el.style.color=color||"#f1f1ea"; el.classList.add("show");
  clearTimeout(_toastT); _toastT=setTimeout(()=>el.classList.remove("show"),1600);
}
// where you are when no zone says otherwise
function placeName(x,z){
  if(Math.abs(x-HWY.nb)<8.5) return "I-79 NORTH";
  if(Math.abs(x-HWY.sb)<8.5) return "I-79 SOUTH";
  if(distToPath(RAMP_EXIT,x,z).d<6) return "EXIT RAMP";
  if(distToPath(RAMP_ENTRY,x,z).d<6) return "ON-RAMP · I-79 N";
  if(distToPath(DRIVE,x,z).d<4) return "SERVICE DRIVE";
  if(Math.hypot(x-CAMP.x, z-CAMP.z)<CAMP.r+4) return "THE FIRE RING";
  if(Math.hypot(x-HOMESTEAD.x, z-HOMESTEAD.z)<HOMESTEAD.r+4) return "AN OLD HOMESTEAD";
  if(x>20 && distToPath(TRAIL,x,z).d<3) return "A PATH IN THE WOODS";
  if(Terrain.siteDist(x,z)>4) return x>150 ? "THE BACK WOODS" : "THE WOODS";
  return "REST AREA";
}
function updateHUD(){
  let head=player.yaw;
  if(droneMode) head=droneYaw+Math.PI;
  else if(driving) head=carYaw(driving.veh.body.quaternion)+Math.PI;
  let deg=(-head*180/Math.PI)%360; if(deg<0) deg+=360;
  hud.hdg.textContent=Math.round(deg).toString().padStart(3,"0");
  hud.card.textContent=CARD[Math.round(deg/45)%8];
  hud.rose.setAttribute("transform","rotate("+(-deg)+" 100 100)");
  const h=DayNight.state.hour, hi=Math.floor(h), mi=Math.floor((h-hi)*60);
  const h12=((hi+11)%12)+1;
  hud.clock.textContent=h12+":"+(mi<10?"0":"")+mi+(hi<12?" AM":" PM");
  hud.season.textContent=FOREST.isAutumn() ? "AUTUMN · PEAK COLOR" : "SUMMER";
  const wx=WEATHER.label()+" · "+WEATHER.temp()+"°F", out=GRID.phase!=="normal" && GRID.phase!=="cool";
  if(hud.wx._s!==wx+out){ hud.wx._s=wx+out; hud.wx.textContent=out ? "POWER OUT · "+WEATHER.temp()+"°F" : wx; hud.wx.style.color=out?"#ff8a6a":""; }
  const hx=droneMode?dronePos.x:player.pos.x, hz=droneMode?dronePos.z:player.pos.z;
  if(droneMode){ hud.where.textContent="DRONE · "+Math.round(dronePos.y-surfaceY(hx,hz,dronePos.y))+" M"; return; }
  const z=zoneAt(hx, hz, player.feetY+0.5);
  const name=z||placeName(hx,hz);
  hud.where.textContent = driving ? name+" · "+Math.round(driving.veh.speed*2.237)+" MPH" : name;
}

/* --- the site plan ----------------------------------------------------
   Painted once over everything from the interstate to the back of the woods
   at one scale, and shown through a window the size of the canvas that
   follows you, so the path and the camp are on it when you are out there. */
const planCv=document.getElementById("planCv"), planX=planCv.getContext("2d");
const PLAN_ALL={x0:-190, x1:420, z0:-240, z1:250}, PLAN_W=300, PLAN_H=348;
const PLAN_S=planCv.width/PLAN_W;                            // pixels to the metre
const planBase=(function(){
  const W=Math.round((PLAN_ALL.x1-PLAN_ALL.x0)*PLAN_S), H=Math.round((PLAN_ALL.z1-PLAN_ALL.z0)*PLAN_S);
  const c=cvs(W, H), x=c.getContext("2d");
  const px=wx=>(wx-PLAN_ALL.x0)*PLAN_S, pz=wz=>(wz-PLAN_ALL.z0)*PLAN_S;
  x.fillStyle="#1d3a24"; x.fillRect(0,0,W,H);
  // the clearings, lighter
  for(let j=0;j<H;j+=2) for(let i=0;i<W;i+=2){
    const wx=PLAN_ALL.x0+i/PLAN_S, wz=PLAN_ALL.z0+j/PLAN_S;
    if(Terrain.siteDist(wx,wz)<0){ x.fillStyle="#46663a"; x.fillRect(i,j,2,2); }
  }
  const R=(x0,x1,z0,z1,f)=>{ x.fillStyle=f; x.fillRect(px(x0),pz(z0),px(x1)-px(x0),pz(z1)-pz(z0)); };
  const L=(P,w,col,dash)=>{ x.beginPath(); x.moveTo(px(P[0].x),pz(P[0].z)); for(const p of P) x.lineTo(px(p.x),pz(p.z));
    x.strokeStyle=col; x.lineWidth=w; x.lineCap="round"; x.setLineDash(dash||[]); x.stroke(); x.setLineDash([]); };
  R(NB_X0, NB_X1, PLAN_ALL.z0, PLAN_ALL.z1, "#77787a");
  R(SB_X0, SB_X1, PLAN_ALL.z0, PLAN_ALL.z1, "#77787a");
  L(RAMP_EXIT, 2.6, "#77787a"); L(RAMP_ENTRY, 2.6, "#77787a"); L(DRIVE, 1.6, "#6d6e70");
  R(SITE.truck.x0,SITE.truck.x1,SITE.truck.z0,SITE.truck.z1,"#8a8b8d");
  R(SITE.car.x0,SITE.car.x1,SITE.car.z0,SITE.car.z1,"#8a8b8d");
  R(SITE.island.x0,SITE.island.x1,SITE.island.z1,SITE.truck.z1,"#8a8b8d");
  R(SITE.island.x0,SITE.island.x1,SITE.truck.z0,SITE.island.z0,"#8a8b8d");
  R(SITE.island.x0,SITE.island.x1,SITE.island.z0,SITE.island.z1,"#4f7040");
  R(SITE.walk.x0,SITE.walk.x1,SITE.walk.z0,SITE.walk.z1,"#c9c6be");
  R(SITE.plaza.x0,-5,SITE.plaza.z0,SITE.plaza.z1,"#c9c6be");
  R(-6,6,-5.5,5.5,"#a94a34"); R(-5,7,-14.5,14.5,"#8e3c2c");                 // the pavilion
  R(SITE.sub.x0,SITE.sub.x1,SITE.sub.z0,SITE.sub.z1,"#6c6a64");
  // the maintenance garage on its yard, and its track off through the woods
  L(SERVICE, 1.4, "#7c786c");
  R(GARAGE.yard.x0,GARAGE.yard.x1,GARAGE.yard.z0,GARAGE.yard.z1,"#7c786c");
  R(GARAGE.x0,GARAGE.x1,GARAGE.z0,GARAGE.z1,"#b0a68e");
  x.strokeStyle="#c9ccce"; x.lineWidth=1; x.strokeRect(px(SITE.sub.x0),pz(SITE.sub.z0),
    px(SITE.sub.x1)-px(SITE.sub.x0), pz(SITE.sub.z1)-pz(SITE.sub.z0));
  // the path out back, dashed, and the clearing at the end of it
  L(TRAIL, 1.2, "#b39a72", [3,2]);
  x.fillStyle="#46663a"; x.beginPath(); x.arc(px(CAMP.x),pz(CAMP.z),CAMP.r*PLAN_S,0,7); x.fill();
  x.fillStyle="#e07a2a"; x.beginPath(); x.arc(px(CAMP.x),pz(CAMP.z),1.8,0,7); x.fill();
  x.fillStyle="#4f6a3a"; x.beginPath(); x.arc(px(HOMESTEAD.x),pz(HOMESTEAD.z),HOMESTEAD.r*PLAN_S,0,7); x.fill();
  if(typeof HOUSE!=="undefined" && HOUSE.x0!==undefined){ x.fillStyle="#8a8478"; x.fillRect(px(HOUSE.x0),pz(HOUSE.z0),(HOUSE.x1-HOUSE.x0)*PLAN_S,(HOUSE.z1-HOUSE.z0)*PLAN_S); }
  // picnic tables, as dots
  x.fillStyle="#d8c49a";
  for(const t of (typeof PICNIC!=="undefined"?PICNIC:[])){ x.beginPath(); x.arc(px(t.x),pz(t.z),1.6,0,7); x.fill(); }
  x.fillStyle="#f1f1ea"; x.font="8px 'JetBrains Mono', monospace";
  x.fillText("I-79", px(HWY.nb)-8, pz(-220)+12);
  return c;
})();
function drawPlan(){
  const sx=droneMode?dronePos.x:player.pos.x, sz=droneMode?dronePos.z:player.pos.z;
  // the window: the site as it always was while you are on it, following you once you leave
  const keep=(d0,s,W,lo,hi)=>clamp(clamp(d0, s-(W-40), s-40), lo, hi-W);
  const wx0=keep(-190, sx, PLAN_W, PLAN_ALL.x0, PLAN_ALL.x1), wz0=keep(-220, sz, PLAN_H, PLAN_ALL.z0, PLAN_ALL.z1);
  planX.clearRect(0,0,planCv.width,planCv.height);
  planX.drawImage(planBase, -(wx0-PLAN_ALL.x0)*PLAN_S, -(wz0-PLAN_ALL.z0)*PLAN_S);
  const X=clamp((sx-wx0)*PLAN_S,5,planCv.width-5), Z=clamp((sz-wz0)*PLAN_S,5,planCv.height-5);
  planX.save(); planX.translate(X,Z);
  let yaw=player.yaw; if(droneMode) yaw=droneYaw+Math.PI; else if(driving) yaw=carYaw(driving.veh.body.quaternion)+Math.PI;
  planX.rotate(-yaw);
  planX.beginPath(); planX.moveTo(0,-6); planX.lineTo(4.4,5); planX.lineTo(-4.4,5); planX.closePath();
  planX.fillStyle=droneMode?"#8fd0ff":"#f4c430"; planX.fill();
  planX.strokeStyle="#07120c"; planX.lineWidth=1; planX.stroke();
  planX.restore();
}
