"use strict";
/* REST AREA · 16c-screens.js
   the things in the building that change: the television over the desk,
   the camera monitor in the office (and CAM 5, the trail camera out back),
   and what is pinned to the bulletin board
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   16c · SCREENS AND NOTICES
   Each screen is a canvas redrawn a few times a second and nothing more:
   the television runs the state's travel channel, weather and traffic in
   turn, out of what the world is actually doing (the sky, the wreck on
   I-79, a power cut); the office monitor runs the four building cameras
   and the trail camera's pictures, which are taken as things go past it.
   The board's notices come and go a few a day.
   ---------------------------------------------------------------------- */
const _wxIcon=(x,cx,cy,s,kind,night)=>{
  x.save(); x.translate(cx,cy);
  const sun=()=>{ x.fillStyle="#ffd34a"; x.beginPath(); x.arc(0,0,s*0.30,0,7); x.fill();
    x.strokeStyle="#ffd34a"; x.lineWidth=s*0.06; for(let k=0;k<8;k++){ const a=k*0.785; x.beginPath();
      x.moveTo(Math.cos(a)*s*0.40,Math.sin(a)*s*0.40); x.lineTo(Math.cos(a)*s*0.52,Math.sin(a)*s*0.52); x.stroke(); } };
  const moon=()=>{ x.fillStyle="#e8ecf6"; x.beginPath(); x.arc(0,0,s*0.30,0,7); x.fill();
    x.fillStyle="#13305a"; x.beginPath(); x.arc(s*0.13,-s*0.08,s*0.26,0,7); x.fill(); };
  const cloud=(dx,dy,k,c)=>{ x.fillStyle=c; x.beginPath(); x.arc(dx-s*0.18*k,dy,s*0.18*k,0,7); x.arc(dx,dy-s*0.10*k,s*0.24*k,0,7);
    x.arc(dx+s*0.20*k,dy,s*0.17*k,0,7); x.rect(dx-s*0.36*k,dy,s*0.72*k,s*0.17*k); x.fill(); };
  if(kind==="clear"){ night?moon():sun(); }
  else if(kind==="cloudy"){ x.translate(-s*0.12,-s*0.10); night?moon():sun(); x.translate(s*0.12,s*0.10); cloud(s*0.05,s*0.06,1,"#d9dee6"); }
  else if(kind==="fog"){ cloud(0,-s*0.06,0.9,"#c9ced6"); x.fillStyle="#aab1bb"; for(let k=0;k<3;k++) x.fillRect(-s*0.40,s*0.16+k*s*0.10,s*0.80,s*0.05); }
  else { cloud(0,-s*0.08,1,kind==="storm"?"#8e96a4":"#c4cbd6");
    x.strokeStyle="#5ab0ff"; x.lineWidth=s*0.05; for(let k=0;k<4;k++){ x.beginPath(); x.moveTo(-s*0.24+k*s*0.16,s*0.20); x.lineTo(-s*0.30+k*s*0.16,s*0.38); x.stroke(); }
    if(kind==="storm"){ x.fillStyle="#ffd34a"; x.beginPath(); x.moveTo(s*0.02,s*0.10); x.lineTo(-s*0.10,s*0.32); x.lineTo(0,s*0.30);
      x.lineTo(-s*0.06,s*0.50); x.lineTo(s*0.12,s*0.24); x.lineTo(s*0.02,s*0.26); x.closePath(); x.fill(); } }
  x.restore();
};
const _wxKind=k=>k==="rainfog"?"rain":k;
const _hhmm=h=>{ h=((h%24)+24)%24; const hi=Math.floor(h), mi=Math.floor((h-hi)*60), h12=((hi+11)%12)+1; return h12+":"+(mi<10?"0":"")+mi+(hi<12?" AM":" PM"); };

/* ---- the television ------------------------------------------------------- */
const TV=(function(){
  const W=512, H=384, c=cvs(W,H), x=c.getContext("2d");
  const tex=setSRGB(new T.CanvasTexture(c));
  const R=LOBBY, cx=-3.9, cy=FL+2.66, cz=R.z1-0.075;
  const bez=new T.Mesh(new T.BoxGeometry(1.04,0.80,0.06), new T.MeshStandardMaterial({color:0x151618, roughness:0.4, metalness:0.2}));
  bez.position.set(cx, cy, cz+0.02); scene.add(bez);
  const arm=new T.Mesh(new T.BoxGeometry(0.20,0.20,0.06), bez.material); arm.position.set(cx, cy, cz+0.05); scene.add(arm);
  const mat=new T.MeshBasicMaterial({map:tex, toneMapped:false});
  const scr=new T.Mesh(new T.PlaneGeometry(0.96,0.72), mat); scr.position.set(cx, cy, cz-0.012); scr.rotation.y=Math.PI; scene.add(scr);
  const led=new T.Mesh(new T.SphereGeometry(0.006,6,4), new T.MeshBasicMaterial({color:0x40ff60, toneMapped:false}));
  led.position.set(cx+0.46, cy-0.37, cz-0.012); scene.add(led);
  addUse(cx, R.z1-1.4, FL, "WATCH THE WEATHER", ()=>{ TV.seg=(TV.seg+1)%TV.nseg; TV.t=0; toast("CHANNEL 511 · "+TV.names[TV.seg],"#9fd3ff"); }, 1.6);
  // a station picture, if one has been hosted for the slot
  let ident=null;
  if(IMAGES.tv){ const im=new Image(); im.crossOrigin="anonymous";
    im.onload=()=>{ ident=im; }; im.src=(typeof IMAGE_PROXY!=="undefined" && IMAGE_PROXY) ? IMAGE_PROXY+encodeURIComponent(IMAGES.tv) : IMAGES.tv; }
  // the radar's echoes: a field of noise the weather sets the level of
  const RN=(function(){ const N=128, d=new Float32Array(N*N);
    const h=(i,j)=>{ const k=Math.sin(i*127.1+j*311.7)*43758.5453; return k-Math.floor(k); };
    const vn=(u,v,f)=>{ const uu=u*f, vv=v*f, i0=Math.floor(uu), j0=Math.floor(vv), fu=uu-i0, fv=vv-j0, w=a=>((a%f)+f)%f;
      const su=fu*fu*(3-2*fu), sv=fv*fv*(3-2*fv), a=h(w(i0),w(j0)), b=h(w(i0+1),w(j0)), cc=h(w(i0),w(j0+1)), dd=h(w(i0+1),w(j0+1));
      return (a+(b-a)*su)+((cc+(dd-cc)*su)-(a+(b-a)*su))*sv; };
    for(let j=0;j<N;j++) for(let i=0;i<N;i++) d[j*N+i]=vn(i/N,j/N,4)*0.55+vn(i/N,j/N,8)*0.28+vn(i/N,j/N,16)*0.17;
    return {N:N, d:d}; })();
  const rc=cvs(128,96), rx=rc.getContext("2d"), rimg=rx.createImageData(128,96);
  const M={c:c, x:x, tex:tex, mat:mat, led:led, seg:0, t:0, acc:0, crawl:0, nseg:5, ident:()=>ident, rc:rc, rx:rx, rimg:rimg, RN:RN, sig:0,
           names:["I-79 TRAFFIC","LOCAL CONDITIONS","DOPPLER RADAR","FORECAST","TRAFFIC ALERTS"]};
  return M;
})();
function _tvHeader(x,W,title,col){
  x.fillStyle=col||"#1f4fa0"; x.fillRect(0,0,W,46);
  x.fillStyle="#f4c430"; x.fillRect(0,46,W,4);
  x.fillStyle="#ffffff"; x.font="600 22px Oswald, 'Arial Narrow', sans-serif"; x.textAlign="left"; x.textBaseline="middle";
  x.fillText(title, 16, 24);
  x.font="500 16px 'JetBrains Mono', monospace"; x.textAlign="right"; x.fillText(_hhmm(DayNight.state.hour), W-14, 24);
}
function _tvTraffic(x,W,H){
  x.fillStyle="#0e1a2b"; x.fillRect(0,0,W,H);
  _tvHeader(x,W,"511PA · I-79 TRAFFIC");
  const ex=[["182","ERIE · I-90"],["166","EDINBORO"],["154","SAEGERTOWN"],["147","MEADVILLE"],["141","CONNEAUT LAKE"],
            ["130","SANDY LAKE"],["116","I-80 · MERCER"],["105","SLIPPERY ROCK"],["99","NEW CASTLE"],["78","CRANBERRY"]];
  const top=70, bot=H-70, lx=120;
  const yOf=i=>top+(bot-top)*i/(ex.length-1);
  // the road, coloured by how it is moving
  for(let i=0;i<ex.length-1;i++){
    let col="#2fbf5a";
    if(CRASH.on && i===4) col="#e8332a";
    else if(CRASH.on && i===3) col="#f2a51c";
    else if(WEATHER.fog>0.6 && i>=2 && i<=6) col="#f2d21c";
    else if(WEATHER.storm>0.5 && i>=3 && i<=5) col="#f2a51c";
    x.fillStyle=col; x.fillRect(lx-7, yOf(i)+4, 14, yOf(i+1)-yOf(i)-8);
  }
  x.font="500 13px 'JetBrains Mono', monospace"; x.textBaseline="middle";
  ex.forEach((e,i)=>{ const y=yOf(i);
    x.fillStyle="#f2f0e6"; x.beginPath(); x.arc(lx,y,5,0,7); x.fill();
    x.textAlign="right"; x.fillStyle="#9fb3c8"; x.fillText(e[0], lx-16, y);
    x.textAlign="left"; x.fillStyle="#e8ecf2"; x.fillText(e[1], lx+16, y); });
  // you are here, between 141 and 130
  const yh=(yOf(4)+yOf(5))/2+8;
  x.fillStyle="#f4c430"; x.beginPath(); for(let k=0;k<10;k++){ const a=k*Math.PI/5-Math.PI/2, r=k%2?4:9; x.lineTo(lx+Math.cos(a)*r, yh+Math.sin(a)*r); } x.fill();
  x.fillStyle="#f4c430"; x.textAlign="left"; x.fillText("◄ REST AREA", lx+16, yh);
  // the panel: travel times, and what is going on
  const px=300; x.fillStyle="rgba(255,255,255,0.06)"; x.fillRect(px,70,W-px-14,H-140);
  x.fillStyle="#f4c430"; x.font="600 16px Oswald, sans-serif"; x.textAlign="left"; x.fillText("TRAVEL TIMES", px+12, 92);
  const del=(CRASH.on?9:0)+(WEATHER.fog>0.6?6:0)+(WEATHER.storm>0.5?7:(WEATHER.rain>0.3?3:0));
  x.font="500 14px 'JetBrains Mono', monospace"; x.fillStyle="#e8ecf2";
  x.fillText("ERIE ........ "+(41+(CRASH.on?del:0))+" MIN", px+12, 120);
  x.fillText("PITTSBURGH .. 1 HR "+(24+Math.max(0,del-4))+" MIN", px+12, 142);
  x.fillStyle=del?"#f2a51c":"#2fbf5a"; x.fillText(del?"DELAYS "+del+" MIN":"NO DELAYS", px+12, 168);
  x.fillStyle="#cfd6e0"; x.font="500 12px 'JetBrains Mono', monospace";
  const notes=[];
  if(CRASH.on) notes.push("CRASH · I-79 NB","RIGHT LANE CLOSED","PAST EXIT 141");
  if(WEATHER.fog>0.6) notes.push("DENSE FOG","USE LOW BEAMS");
  if(WEATHER.storm>0.5) notes.push("T-STORMS IN AREA","PONDING ON ROAD");
  else if(WEATHER.rain>0.3) notes.push("WET PAVEMENT");
  notes.push("ROADWORK MILE 105","SHOULDER CLOSED");
  notes.slice(0,7).forEach((n,i)=>x.fillText(n, px+12, 196+i*18));
}
function _tvNow(x,W,H){
  const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,"#13305a"); g.addColorStop(1,"#0b1a33"); x.fillStyle=g; x.fillRect(0,0,W,H);
  _tvHeader(x,W,"MEADVILLE, PA · CONDITIONS");
  const night=DayNight.state.dark>0.5, k=_wxKind(WEATHER.kind);
  _wxIcon(x, 130, 190, 170, k, night);
  x.fillStyle="#ffffff"; x.font="600 92px Oswald, sans-serif"; x.textAlign="left"; x.textBaseline="alphabetic";
  x.fillText(WEATHER.temp()+"°", 250, 215);
  x.font="600 24px Oswald, sans-serif"; x.fillStyle="#f4c430"; x.fillText(WEATHER.label(), 256, 252);
  const wind=Math.round(4+Wind.gust*18+WEATHER.storm*12), hum=Math.round(58+WEATHER.rain*38+WEATHER.fog*30-(1-DayNight.state.dark)*10);
  const vis=WEATHER.fog>0.6?"1/4 MI":WEATHER.fog>0.3?"2 MI":WEATHER.rain>0.5?"4 MI":"10 MI";
  x.font="500 15px 'JetBrains Mono', monospace"; x.fillStyle="#d8dee8";
  [["WIND","WSW "+wind+" MPH"],["HUMIDITY",Math.min(100,hum)+"%"],["VISIBILITY",vis],["PRESSURE",(29.92-WEATHER.storm*0.31-WEATHER.rain*0.08).toFixed(2)+" IN"]]
    .forEach((r,i)=>{ x.fillStyle="#9fb3c8"; x.fillText(r[0], 40, 300+i*20); x.fillStyle="#ffffff"; x.fillText(r[1], 190, 300+i*20); });
  if(GRID.phase!=="normal"){ x.fillStyle="#e8332a"; x.font="600 15px Oswald, sans-serif"; x.fillText("POWER OUTAGES REPORTED · CRAWFORD CO.", 40, 296-24); }
}
function _tvRadar(x,W,H,now){
  const M=TV, rx=M.rx, img=M.rimg, d=img.data, N=M.RN.N, F=M.RN.d;
  _tvHeader(x,W,"DOPPLER RADAR · NW PENNSYLVANIA","#203a1f");
  x.fillStyle="#2b3a2a"; x.fillRect(0,50,W,H-50);
  // Lake Erie up in the corner, the state line, the roads, the towns
  x.fillStyle="#1d4a78"; x.beginPath(); x.moveTo(0,50); x.lineTo(270,50); x.lineTo(150,110); x.lineTo(0,150); x.closePath(); x.fill();
  x.strokeStyle="#6a7a66"; x.lineWidth=2; x.setLineDash([6,4]); x.beginPath(); x.moveTo(70,130); x.lineTo(70,H); x.stroke(); x.setLineDash([]);
  x.strokeStyle="#c9b04a"; x.lineWidth=3; x.beginPath(); x.moveTo(200,92); x.lineTo(214,190); x.lineTo(206,260); x.lineTo(222,H); x.stroke();
  x.strokeStyle="#8a9a86"; x.lineWidth=2; x.beginPath(); x.moveTo(70,300); x.lineTo(W,292); x.stroke();
  // the echoes: noise moving east, as much of it as there is rain about
  const amt=Math.min(1, Math.max(WEATHER.rain*0.75, WEATHER.cover>0.7?0.2:0)+WEATHER.storm*0.25), ox=now*0.006, oy=now*0.002;
  for(let j=0;j<96;j++) for(let i=0;i<128;i++){
    const u=(i/128*0.9-ox+5)%1, v=(j/96*0.7+oy+5)%1, n=F[((v*N)|0)*N+((u*N)|0)];
    let e=(n-(0.98-amt*0.50))*3.6, o=(j*128+i)*4;
    if(e<=0){ d[o+3]=0; continue; }
    e=Math.min(1.6,e);
    const col=e<0.45?[60,200,70]:e<0.8?[30,150,40]:e<1.05?[235,220,40]:e<1.3?[240,140,30]:[230,40,30];
    d[o]=col[0]; d[o+1]=col[1]; d[o+2]=col[2]; d[o+3]=Math.min(220, 110+e*90);
  }
  rx.putImageData(img,0,0);
  x.imageSmoothingEnabled=true; x.drawImage(M.rc, 0, 50, W, H-50);
  x.fillStyle="#ffffff"; x.font="600 13px Oswald, sans-serif"; x.textAlign="left"; x.textBaseline="middle";
  for(const [n,px,py] of [["ERIE",205,96],["MEADVILLE",220,196],["FRANKLIN",318,262],["OIL CITY",360,236],["SHARON",92,282],["TITUSVILLE",352,180]]){
    x.beginPath(); x.arc(px,py,3.5,0,7); x.fill(); x.fillText(n, px+7, py); }
  x.fillStyle="#f4c430"; x.beginPath(); x.arc(212,240,5,0,7); x.fill(); x.fillText("YOU", 220, 240);
  x.fillStyle="rgba(0,0,0,0.5)"; x.fillRect(W-150,H-34,140,24); x.fillStyle="#ffffff"; x.font="500 11px 'JetBrains Mono', monospace";
  x.fillText("LOOP "+_hhmm(DayNight.state.hour-0.08), W-144, H-22);
}
function _tvForecast(x,W,H){
  x.fillStyle="#13305a"; x.fillRect(0,0,W,H);
  _tvHeader(x,W,"FORECAST · CRAWFORD COUNTY");
  const h=DayNight.state.hour, now=_wxKind(WEATHER.kind), next=_wxKind(WEATHER.after||WEATHER.kind);
  const cols=[["NOW",now,WEATHER.temp(),h],["NEXT HOUR",next,WEATHER.temp()-1,h+1],["LATER",next==="storm"?"rain":next,WEATHER.temp()-3,h+3],
              ["TOMORROW","clear",FOREST.isAutumn()?57:80,13]];
  cols.forEach((cc,i)=>{
    const px=14+i*124;
    x.fillStyle="rgba(255,255,255,0.07)"; x.fillRect(px,66,116,H-120);
    x.fillStyle="#f4c430"; x.font="600 15px Oswald, sans-serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(cc[0], px+58, 86);
    const nt=((cc[3]%24)+24)%24, night=nt<6.3 || nt>20.6;
    _wxIcon(x, px+58, 160, 84, cc[1], night);
    x.fillStyle="#ffffff"; x.font="600 36px Oswald, sans-serif"; x.fillText(cc[2]+"°", px+58, 236);
    x.font="500 12px 'JetBrains Mono', monospace"; x.fillStyle="#cfd6e0";
    x.fillText({clear:night?"CLEAR":"SUNNY",cloudy:"CLOUDY",rain:"SHOWERS",fog:"FOG",storm:"T-STORMS"}[cc[1]]||"", px+58, 268);
    const pop={clear:0,cloudy:10,rain:70,fog:10,storm:80}[cc[1]]||0;
    x.fillStyle="#5ab0ff"; x.fillText("RAIN "+pop+"%", px+58, 288);
  });
}
function _tvAlerts(x,W,H){
  x.fillStyle="#1a0e0e"; x.fillRect(0,0,W,H);
  const any=CRASH.on || WEATHER.storm>0.4 || WEATHER.fog>0.6;
  _tvHeader(x,W,any?"TRAFFIC & WEATHER ALERTS":"511PA · TRAVEL ADVISORIES", any?"#a8211b":"#1f4fa0");
  const L=[];
  if(CRASH.on) L.push(["CRASH","I-79 NORTHBOUND PAST EXIT 141","RIGHT LANE CLOSED · EMERGENCY CREWS ON SCENE","#e8332a"]);
  if(WEATHER.storm>0.4) L.push(["SEVERE T-STORM WARNING","CRAWFORD · MERCER · VENANGO","DAMAGING WINDS · FREQUENT LIGHTNING","#f2a51c"]);
  if(WEATHER.fog>0.6) L.push(["DENSE FOG ADVISORY","VISIBILITY 1/4 MILE OR LESS","SLOW DOWN · USE LOW BEAMS","#f2d21c"]);
  if(GRID.phase!=="normal") L.push(["POWER OUTAGES","STORM DAMAGE · CRAWFORD COUNTY","CREWS RESPONDING","#f2a51c"]);
  L.push(["ROADWORK","I-79 MILE 103-107 BOTH DIRECTIONS","SHOULDER CLOSED · 9 AM - 3 PM","#5ab0ff"]);
  if(!FOREST.isAutumn()) L.push(["TRAVEL TIP","HEAT AND HUMIDITY THIS WEEK","CHECK YOUR TIRES AND COOLANT","#2fbf5a"]);
  else L.push(["DEER CROSSING","PEAK SEASON OCT - DEC","DUSK AND DAWN ESPECIALLY","#2fbf5a"]);
  L.slice(0,4).forEach((a,i)=>{ const y=68+i*72;
    x.fillStyle=a[3]; x.fillRect(14,y,8,60);
    x.textAlign="left"; x.textBaseline="alphabetic"; x.fillStyle=a[3]; x.font="600 19px Oswald, sans-serif"; x.fillText(a[0], 32, y+20);
    x.fillStyle="#ffffff"; x.font="500 13px 'JetBrains Mono', monospace"; x.fillText(a[1], 32, y+40); x.fillStyle="#bfc6d0"; x.fillText(a[2], 32, y+57); });
}
function _tvCrawl(x,W,H,dt){
  const parts=["511PA.COM FOR CONDITIONS STATEWIDE"];
  if(CRASH.on) parts.unshift("CRASH ON I-79 NB PAST EXIT 141 · RIGHT LANE CLOSED");
  if(WEATHER.storm>0.4) parts.unshift("SEVERE THUNDERSTORM WARNING UNTIL "+_hhmm(DayNight.state.hour+1));
  parts.push("REST AREA OPEN 24 HOURS · NO OVERNIGHT CAMPING","DON'T DRIVE DROWSY","CRAWFORD COUNTY FAIR · AUGUST","BUCKLE UP, PA");
  const s=parts.join("   ◆   ")+"   ◆   ";
  x.fillStyle="#0a0a0a"; x.fillRect(0,H-28,W,28); x.fillStyle="#f4c430"; x.fillRect(0,H-28,W,2);
  x.font="500 14px 'JetBrains Mono', monospace"; x.fillStyle="#ffffff"; x.textAlign="left"; x.textBaseline="middle";
  const w=x.measureText(s).width; TV.crawl=(TV.crawl+dt*70)%w;
  x.fillText(s, -TV.crawl, H-13); x.fillText(s, w-TV.crawl, H-13);
}
function updateTV(dt, now){
  const M=TV, on=GRID.bldg>0.5;
  M.led.material.color.setHex(on?0x40ff60:0x2a0a08);
  if(!on){ M.sig=0; M.mat.color.setScalar(0.02); return; }
  M.mat.color.setScalar(1);
  M.acc+=dt; M.t+=dt; M.sig+=dt;
  if(M.t>10){ M.t=0; M.seg=(M.seg+1)%M.nseg; }
  if(M.acc<0.2) return;
  if(Math.hypot(camera.position.x+3.9, camera.position.z-5.2)>40){ M.acc=0; return; }   // nobody to watch it
  const d=M.acc; M.acc=0;
  const x=M.x, W=512, H=384;
  if(M.sig<5){                                           // back from a power cut: the set hunting for the signal
    x.fillStyle="#0a0b10"; x.fillRect(0,0,W,H);
    for(let i=0;i<900;i++){ const v=(Math.random()*255)|0; x.fillStyle="rgb("+v+","+v+","+v+")"; x.fillRect(Math.random()*W, Math.random()*H, 3, 2); }
    x.fillStyle="#1d4fd8"; x.fillRect(W/2-110,H/2-24,220,48); x.fillStyle="#fff"; x.font="600 22px Oswald, sans-serif";
    x.textAlign="center"; x.textBaseline="middle"; x.fillText("NO SIGNAL", W/2, H/2);
    M.tex.needsUpdate=true; return;
  }
  const id=M.ident();
  if(M.seg===0) _tvTraffic(x,W,H);
  else if(M.seg===1) _tvNow(x,W,H);
  else if(M.seg===2) _tvRadar(x,W,H,now);
  else if(M.seg===3) (id && M.t>6) ? (x.drawImage(id,0,0,W,H)) : _tvForecast(x,W,H);
  else _tvAlerts(x,W,H);
  _tvCrawl(x,W,H,d);
  M.tex.needsUpdate=true;
}

/* ---- the trail camera and CAM 5 -------------------------------------------
   The camera on the tree out past the fire takes a picture when something
   moves in front of it: a picture is a little canvas drawn once, in the
   style those cameras have — washed-out colour by day; at night the grey
   of the infrared flash, bright in the middle and gone at the edges, eyes
   lit — with the strip along the bottom: camera, moon, temperature, date
   and time. Deer mostly, a bear once in a while, the fox, turkeys, a
   raccoon, the kids going by with a phone for a light, a hiker, and you,
   if you walk past it. The office monitor shows CAM 5 between the
   building's four. */
const TRAILCAM={photos:[], cap:16, next:40, lastYou:-1e9, view:0};
const _TRAIL_SUBJ={
  deer:"A DOE", deer2:"A DOE AND TWO FAWNS", buck:"A BUCK, EIGHT POINTS", bear:"A BLACK BEAR", fox:"A RED FOX", coyote:"A COYOTE",
  turkey:"TURKEYS", raccoon:"A RACCOON", kids:"TWO OF THE KIDS FROM THE FIRE", hiker:"A HIKER", owl:"A BARRED OWL ON THE BRANCH",
  you:"YOU", blank:"NOTHING — THE WIND IN A BRANCH"};
function _trailDraw(sub, night, hour, day, seed){
  const W=320, H=200, c=cvs(W,H), x=c.getContext("2d"), r=_trng(seed);
  const gy=H*0.80;
  // the woods: ground, brush, trunks at different depths
  x.fillStyle=night?"#3a3a3a":"#6b7350"; x.fillRect(0,0,W,H);
  x.fillStyle=night?"#4a4a4a":"#8a8a62"; x.fillRect(0,gy-20,W,H-gy+20);
  for(let k=0;k<22;k++){ const tx=r()*W, tw=4+r()*22*(r()<0.3?2:1), sh=(night?45+r()*40:40+r()*35)|0;
    x.fillStyle=night?"rgb("+sh+","+sh+","+sh+")":"rgb("+(sh+10)+","+(sh+5)+","+(sh-8)+")"; x.fillRect(tx,0,tw,gy-8+r()*10); }
  for(let k=0;k<140;k++){ const bx=r()*W, by=gy-30+r()*50, br=3+r()*9, sh=(night?70+r()*60:60+r()*60)|0;
    x.fillStyle=night?"rgba("+sh+","+sh+","+sh+",0.6)":"rgba("+(sh-10)+","+(sh+20)+","+(sh-25)+",0.6)"; x.beginPath(); x.arc(bx,by,br,0,7); x.fill(); }
  // the animal or person
  const body=night?"#c9c9c9":"#7a5a3a", dark=night?"#9a9a9a":"#4a3a2a";
  const eye=(ex,ey)=>{ if(!night) return; const g=x.createRadialGradient(ex,ey,0,ex,ey,5); g.addColorStop(0,"rgba(255,255,255,1)"); g.addColorStop(1,"rgba(255,255,255,0)"); x.fillStyle=g; x.fillRect(ex-5,ey-5,10,10); };
  const deer=(cx,s,face,buck,col)=>{ x.save(); x.translate(cx,gy); x.scale(face,1); x.fillStyle=col||body;
    x.beginPath(); x.ellipse(0,-58*s,38*s,17*s,0,0,7); x.fill();
    for(const lx of [-26,-18,20,28]) x.fillRect(lx*s,-50*s,4.5*s,50*s);
    x.beginPath(); x.moveTo(28*s,-66*s); x.lineTo(44*s,-98*s); x.lineTo(54*s,-94*s); x.lineTo(40*s,-58*s); x.fill();
    x.beginPath(); x.ellipse(54*s,-98*s,13*s,7*s,0.35,0,7); x.fill();
    x.beginPath(); x.ellipse(45*s,-108*s,4*s,9*s,-0.5,0,7); x.fill(); x.beginPath(); x.ellipse(52*s,-109*s,4*s,9*s,0.2,0,7); x.fill();
    x.fillStyle=night?"#ffffff":"#e8e2d0"; x.beginPath(); x.ellipse(-38*s,-62*s,5*s,7*s,0,0,7); x.fill();
    if(buck){ x.strokeStyle=col||body; x.lineWidth=2.5*s; x.beginPath(); x.moveTo(48*s,-106*s); x.quadraticCurveTo(30*s,-130*s,50*s,-138*s);
      x.moveTo(52*s,-106*s); x.quadraticCurveTo(70*s,-128*s,60*s,-140*s); x.moveTo(38*s,-122*s); x.lineTo(34*s,-132*s); x.moveTo(64*s,-122*s); x.lineTo(70*s,-131*s); x.stroke(); }
    x.restore(); eye(cx+face*58*s, gy-100*s); };
  if(sub==="deer"||sub==="deer2"){ deer(W*0.45,1,1,false); if(sub==="deer2"){ deer(W*0.70,0.62,-1,false); deer(W*0.22,0.58,1,false); } }
  else if(sub==="buck") deer(W*0.5,1.1,-1,true);
  else if(sub==="bear"){ const cx=W*0.5; x.fillStyle=night?"#7a7a7a":"#1a1716";
    x.beginPath(); x.ellipse(cx,gy-46,58,34,0,0,7); x.fill(); x.beginPath(); x.ellipse(cx+58,gy-52,20,17,0,0,7); x.fill();
    x.beginPath(); x.arc(cx+52,gy-70,6,0,7); x.arc(cx+66,gy-68,6,0,7); x.fill(); x.fillRect(cx+64,gy-52,18,10);
    for(const lx of [-44,-24,22,40]) x.fillRect(cx+lx,gy-30,15,30); eye(cx+70,gy-56); }
  else if(sub==="fox"||sub==="coyote"){ const cx=W*0.46, s=sub==="fox"?0.8:1.05, col=night?"#bdbdbd":(sub==="fox"?"#b5552a":"#8a7a66");
    x.save(); x.translate(cx,gy); x.fillStyle=col;
    x.beginPath(); x.ellipse(0,-34*s,32*s,12*s,0,0,7); x.fill();
    for(const lx of [-22,-14,16,24]) x.fillRect(lx*s,-28*s,3.5*s,28*s);
    x.beginPath(); x.moveTo(26*s,-38*s); x.lineTo(46*s,-50*s); x.lineTo(60*s,-42*s); x.lineTo(30*s,-28*s); x.fill();
    x.beginPath(); x.moveTo(40*s,-50*s); x.lineTo(42*s,-62*s); x.lineTo(48*s,-50*s); x.fill(); x.beginPath(); x.moveTo(46*s,-50*s); x.lineTo(50*s,-61*s); x.lineTo(54*s,-48*s); x.fill();
    x.beginPath(); x.ellipse(-44*s,-30*s,20*s,7*s,0.4,0,7); x.fill();
    if(sub==="fox"){ x.fillStyle=night?"#ffffff":"#f2efe6"; x.beginPath(); x.ellipse(-60*s,-24*s,6*s,4*s,0.4,0,7); x.fill(); }
    x.restore(); eye(cx+50*s, gy-46*s); }
  else if(sub==="turkey"){ for(const [cx,s] of [[W*0.35,1],[W*0.6,0.9],[W*0.78,0.85]]){ x.fillStyle=night?"#8d8d8d":"#2e2620";
    x.beginPath(); x.ellipse(cx,gy-36*s,20*s,16*s,0,0,7); x.fill(); x.fillRect(cx-6*s,gy-22*s,2.5*s,22*s); x.fillRect(cx+4*s,gy-22*s,2.5*s,22*s);
    x.fillRect(cx+14*s,gy-62*s,4*s,26*s); x.beginPath(); x.arc(cx+17*s,gy-64*s,5*s,0,7); x.fill();
    if(!night){ x.fillStyle="#b8312a"; x.fillRect(cx+18*s,gy-62*s,3*s,8*s); } } }
  else if(sub==="raccoon"){ const cx=W*0.5; x.fillStyle=night?"#b0b0b0":"#6a6460";
    x.beginPath(); x.ellipse(cx,gy-22,26,15,0,0,7); x.fill(); x.beginPath(); x.ellipse(cx+26,gy-26,11,9,0,0,7); x.fill();
    for(let k=0;k<5;k++){ x.fillStyle=k%2?(night?"#e0e0e0":"#bdb6ac"):(night?"#707070":"#2a2522"); x.beginPath(); x.ellipse(cx-30-k*7,gy-18+k*2,5,6,0,0,7); x.fill(); }
    x.fillStyle=night?"#606060":"#1a1716"; x.fillRect(cx+20,gy-30,14,4); eye(cx+28,gy-28); eye(cx+33,gy-28); }
  else if(sub==="owl"){ const cx=W*0.62; x.fillStyle=night?"#6a6a6a":"#3a2a1c"; x.fillRect(0,46,W,7);
    x.fillStyle=night?"#bdbdbd":"#8a7a62"; x.beginPath(); x.ellipse(cx,30,16,22,0,0,7); x.fill(); x.beginPath(); x.arc(cx,12,13,0,7); x.fill();
    eye(cx-5,12); eye(cx+5,12); }
  else if(sub==="kids"||sub==="hiker"||sub==="you"){
    const fig=(cx,s,col,pack,light)=>{ x.fillStyle=col; x.fillRect(cx-7*s,gy-60*s,6*s,60*s); x.fillRect(cx+1*s,gy-60*s,6*s,58*s);
      x.fillRect(cx-11*s,gy-112*s,22*s,54*s); x.beginPath(); x.arc(cx,gy-122*s,10*s,0,7); x.fill();
      if(pack){ x.fillRect(cx-19*s,gy-108*s,10*s,34*s); }
      if(light){ const g=x.createRadialGradient(cx+14*s,gy-82*s,0,cx+14*s,gy-82*s,26*s); g.addColorStop(0,"rgba(255,255,255,1)"); g.addColorStop(1,"rgba(255,255,255,0)");
        x.fillStyle=g; x.fillRect(cx-12*s,gy-108*s,52*s,52*s); } };
    const pc=night?"#a8a8a8":"#3b4a66";
    if(sub==="kids"){ fig(W*0.38,0.9,night?"#9a9a9a":"#6d1f2a",false,night); fig(W*0.55,0.86,pc,false,false); }
    else if(sub==="hiker") fig(W*0.5,0.95,night?"#aaaaaa":"#4a5a3a",true,false);
    else { x.filter="blur(1.2px)"; fig(W*0.62,1.05,night?"#b0b0b0":"#2b3d63",false,night && typeof torchOn!=="undefined" && torchOn); x.filter="none"; }
  }
  // the infrared flash's falloff, the grain, the strip along the bottom
  if(night){ const g=x.createRadialGradient(W*0.5,H*0.55,20,W*0.5,H*0.55,W*0.7); g.addColorStop(0,"rgba(255,255,255,0.12)"); g.addColorStop(0.55,"rgba(0,0,0,0)"); g.addColorStop(1,"rgba(0,0,0,0.75)");
    x.fillStyle=g; x.fillRect(0,0,W,H); }
  else { x.fillStyle="rgba(160,170,120,0.12)"; x.fillRect(0,0,W,H); }
  const im=x.getImageData(0,0,W,H), dd=im.data;
  for(let i=0;i<dd.length;i+=4){ const n=(r()-0.5)*(night?38:20);
    if(night){ const v=(dd[i]*0.3+dd[i+1]*0.59+dd[i+2]*0.11)+n; dd[i]=dd[i+1]=dd[i+2]=v; }
    else { dd[i]+=n; dd[i+1]+=n; dd[i+2]+=n; } }
  x.putImageData(im,0,0);
  x.fillStyle="#000"; x.fillRect(0,H-16,W,16);
  x.fillStyle="#fff"; x.font="600 10px 'JetBrains Mono', monospace"; x.textBaseline="middle"; x.textAlign="left";
  const dt=new Date(Date.now()+day*86400000), hh=Math.floor(hour), mm=Math.floor((hour%1)*60), ss=Math.floor(r()*60);
  const temp=Math.round((FOREST.isAutumn()?40:61)+((FOREST.isAutumn()?58:81)-(FOREST.isAutumn()?40:61))*(0.5+0.5*Math.cos((hour-15)/24*Math.PI*2)));
  x.fillText("TRAILCAM 05", 5, H-8);
  x.fillText((night?"☾ ":"☀ ")+temp+"°F", 104, H-8);
  x.textAlign="right";
  x.fillText((dt.getMonth()+1+"").padStart(2,"0")+"/"+(dt.getDate()+"").padStart(2,"0")+"/"+dt.getFullYear()+"  "+
             (((hh+11)%12)+1+"").padStart(2,"0")+":"+(mm+"").padStart(2,"0")+":"+(ss+"").padStart(2,"0")+(hh<12?" AM":" PM"), W-5, H-8);
  return c;
}
function trailPhoto(sub, hour, day){
  hour=((hour%24)+24)%24;
  const night=hour<6.2 || hour>20.4;
  const p={sub:sub, hour:hour, day:day, night:night, c:_trailDraw(sub, night, hour, day, (Math.random()*1e6)|0)};
  TRAILCAM.photos.push(p); if(TRAILCAM.photos.length>TRAILCAM.cap) TRAILCAM.photos.shift();
  TRAILCAM.view=TRAILCAM.photos.length-1;
  return p;
}
function _trailPick(h){
  const night=h<6 || h>20.5, dusk=(h>5 && h<8.5) || (h>18.5 && h<22);
  const w={deer:dusk?3:(night?2:0.6), deer2:dusk?1.2:0.6, buck:dusk?0.8:0.4, bear:night?0.35:0.05, fox:night?0.9:0.2, coyote:night?0.5:0.05,
           turkey:night?0:1.4, raccoon:night?1:0, owl:night?0.4:0, kids:(h>19 || h<1.5)?1.2:0, hiker:(h>8 && h<18)?0.7:0, blank:0.6};
  let tot=0; for(const k in w) tot+=w[k];
  let r=Math.random()*tot; for(const k in w){ r-=w[k]; if(r<=0) return k; }
  return "blank";
}
// what it caught the last couple of nights, before you got here
(function seedTrail(){
  for(const [s,h,d] of [["deer2",21.2,-2],["raccoon",1.6,-1],["kids",23.3,-1],["deer",5.8,-1],["turkey",8.9,-1],["hiker",11.2,-1],["fox",2.4,0],["buck",6.1,0]])
    trailPhoto(s,h,d);
})();

/* ---- the office monitor ------------------------------------------------------ */
const CCTV=(function(){
  const W=512, H=320, c=cvs(W,H), x=c.getContext("2d");
  const b=BUCKETS.get("cctv"), m=b && b.mat;
  const tex=setSRGB(new T.CanvasTexture(c));
  if(m){ m.emissiveMap=tex; m.map=null; m.needsUpdate=true; }
  addUse(5.9, 7.3, FL, "WATCH CAM 5", ()=>{
    const P=TRAILCAM.photos; if(!P.length) return;
    CCTV.mode="cam5"; CCTV.t=0; TRAILCAM.view=(TRAILCAM.view+P.length-1)%P.length;
    const p=P[TRAILCAM.view]; toast("CAM 5 · "+_hhmm(p.hour)+" · "+_TRAIL_SUBJ[p.sub], "#9fd3ff"); }, 1.3);
  return {c:c, x:x, tex:tex, mode:"quad", t:0, acc:0};
})();
function _camView(x, ox, oy, w, h, k, now){
  x.save(); x.beginPath(); x.rect(ox,oy,w,h); x.clip(); x.translate(ox,oy); x.scale(w/128,h/80);
  const night=DayNight.state.dark>0.5, f=night?0.45:1;
  const col=(r,g,b)=>"rgb("+(r*f|0)+","+(g*f|0)+","+(b*f|0)+")";
  if(k===0){ x.fillStyle=col(108,114,118); x.fillRect(0,0,128,80); x.fillStyle=col(154,160,162); x.fillRect(0,50,128,30);
    for(let i=0;i<6;i++){ x.fillStyle=["#3a3c40","#7a7e82","#2c2e30","#7c1c1c","#9fa3a8","#273a5c"][i]; x.fillRect(8+i*20,40,15,9); }
    if(CRASH.on){ x.fillStyle=(now*2.1)%1<0.5?"#ff2a1a":"#2a5cff"; x.fillRect(2,20,4,3); } }
  else if(k===1){ x.fillStyle=col(138,106,88); x.fillRect(0,0,128,80); x.fillStyle=col(181,101,74); x.fillRect(0,45,128,35);
    x.fillStyle="#2a2a2c"; x.fillRect(90,20,16,40); x.fillRect(18,26,30,30);
    if(Math.abs(player.pos.x)<5.7 && Math.abs(player.pos.z)<5.3){ x.fillStyle="#1d1f22"; x.fillRect(64+player.pos.z*5,34,6,24); } }
  else if(k===2){ x.fillStyle=col(127,132,134); x.fillRect(0,0,128,80); x.fillStyle=col(90,94,96); x.fillRect(0,30,128,14);
    const u=(now*0.18)%1; x.fillStyle="#d8d8d4"; x.fillRect(-30+u*190,28,26,10); }
  else { x.fillStyle=col(93,106,90); x.fillRect(0,0,128,80); x.fillStyle=col(138,142,136); x.fillRect(30,30,60,40);
    if(GRID.rpm>0.3){ x.fillStyle="rgba(200,200,200,0.5)"; x.beginPath(); x.arc(40+Math.sin(now)*3,22,8,0,7); x.fill(); } }
  if(WEATHER.rain>0.2){ x.strokeStyle="rgba(220,225,235,0.35)"; x.lineWidth=0.6; for(let i=0;i<30;i++){ const rx=Math.random()*128, ry=Math.random()*80; x.beginPath(); x.moveTo(rx,ry); x.lineTo(rx-1.5,ry+6); x.stroke(); } }
  x.restore();
}
function updateCCTV(dt, now){
  const M=CCTV; M.acc+=dt; M.t+=dt;
  if(M.acc<0.25) return; M.acc=0;
  if(Math.hypot(camera.position.x-5.9, camera.position.z-8.0)>14) return;          // only drawn when you could see it
  const x=M.x, W=512, H=320, on=GRID.bldg>0.5;
  if(!on){ x.fillStyle="#000"; x.fillRect(0,0,W,H); M.tex.needsUpdate=true; return; }
  // eight seconds of the four, then CAM 5 for twelve
  if(M.mode==="quad" && M.t>8){ M.mode="cam5"; M.t=0; }
  else if(M.mode==="cam5" && M.t>12){ M.mode="quad"; M.t=0; }
  x.fillStyle="#0d0f10"; x.fillRect(0,0,W,H);
  const stamp=_hhmm(DayNight.state.hour);
  x.font="600 13px 'JetBrains Mono', monospace"; x.textBaseline="top"; x.textAlign="left";
  if(M.mode==="quad"){
    for(let k=0;k<4;k++){ const ox=(k%2)*256, oy=((k/2)|0)*160; _camView(x, ox+1, oy+1, 254, 158, k, now);
      x.fillStyle="#e8e8e0"; x.fillText(["CAM 1 LOT","CAM 2 LOBBY","CAM 3 RAMP","CAM 4 SUBSTA"][k], ox+6, oy+5); }
    x.fillStyle="#0d0f10"; x.fillRect(255,0,2,H); x.fillRect(0,159,W,2);
  }else{
    const P=TRAILCAM.photos, v=Math.max(0,Math.min(P.length-1, TRAILCAM.view)), p=P[v];
    if(p) x.drawImage(p.c, 0, 0, W, H);
    x.fillStyle="rgba(0,0,0,0.55)"; x.fillRect(0,0,W,22);
    x.fillStyle="#e8e8e0"; x.fillText("CAM 5 TRAIL · "+(v+1)+"/"+P.length+(p?" · "+_TRAIL_SUBJ[p.sub]:""), 6, 5);
    x.textAlign="right"; x.fillText("◄ E ►", W-6, 5);
  }
  x.textAlign="right"; x.fillStyle="#e8e8e0"; x.fillText(stamp, W-6, H-18);
  M.tex.needsUpdate=true;
}
function updateTrail(dt){
  // something walks past it every couple of minutes of play
  TRAILCAM.next-=dt;
  if(TRAILCAM.next<=0){ TRAILCAM.next=90+Math.random()*120; trailPhoto(_trailPick(DayNight.state.hour), DayNight.state.hour, DayNight.state.day); }
  // and you, if you go by
  const C=BACKWOODS.cam;
  if(C && !droneMode && !driving){ const d=Math.hypot(player.pos.x-C.x, player.pos.z-C.z);
    if(d<8 && TRAILCAM.clock-TRAILCAM.lastYou>60){ TRAILCAM.lastYou=TRAILCAM.clock; C.t=4; trailPhoto("you", DayNight.state.hour, DayNight.state.day); } }
  TRAILCAM.clock=(TRAILCAM.clock||0)+dt;
}

/* ---- the bulletin board ------------------------------------------------------
   Twenty-odd things that get pinned up — printed flyers with a coloured
   band, handwritten index cards, a lost dog with its picture, the ones
   with the phone number cut into tear-off tabs along the bottom, some
   already torn — and six places on the cork. A couple change every day,
   and now and then one changes while you are there. */
const NOTES=[
  {k:"flyer", h:"LOST DOG", c:"#b3151b", b:["'BISCUIT' · BEAGLE MIX","LAST SEEN NEAR EXIT 147","FRIENDLY · WEARS RED COLLAR"], tel:"814-555-0142", pic:"dog"},
  {k:"flyer", h:"CHICKEN BBQ", c:"#c3562f", b:["SATURDAY 11 AM TIL SOLD OUT","SAEGERTOWN FIRE HALL","HALF CHICKEN $12"]},
  {k:"flyer", h:"SPOTTED LANTERNFLY", c:"#5a1f6a", b:["SEE IT? SQUASH IT.","DON'T MOVE FIREWOOD","REPORT: 1-888-422-3359"], pic:"bug"},
  {k:"card", h:"RIDE NEEDED", b:["To Erie on Thursday","will split gas","ask for Dana"], tel:"814-555-0118"},
  {k:"flyer", h:"HELP WANTED", c:"#1f4fa0", b:["OVERNIGHT ATTENDANT","THIS REST AREA · FULL TIME","APPLY AT THE DESK"]},
  {k:"flyer", h:"CRAWFORD COUNTY FAIR", c:"#2f7a3c", b:["AUGUST · MEADVILLE","TRUCK & TRACTOR PULL","DEMOLITION DERBY"]},
  {k:"card", h:"FREE KITTENS", b:["4 of them, litter trained","orange + one gray","good homes only!!"], tel:"814-555-0177"},
  {k:"flyer", h:"TICKS", c:"#6a4a2a", b:["CHECK YOURSELF","AFTER THE WOODS","LYME IS COMMON IN PA"]},
  {k:"card", h:"FOUND: CAR KEYS", b:["by the water fountain","Toyota key + a bottle opener","they're at the desk"]},
  {k:"flyer", h:"PANCAKE BREAKFAST", c:"#e0a52a", b:["SUNDAY 7-11 · VFW POST 2257","ALL YOU CAN EAT · $8","KIDS UNDER 6 FREE"]},
  {k:"card", h:"GUITAR LESSONS", b:["all ages, all styles","I come to you","$20 / half hour"], tel:"814-555-0163"},
  {k:"flyer", h:"MISSING CAT", c:"#b3151b", b:["'SMOKEY' · GRAY TABBY","SHY · DON'T CHASE","REWARD"], tel:"814-555-0109", pic:"cat"},
  {k:"flyer", h:"DEER PROCESSING", c:"#3f5a2a", b:["DROP OFF 24 HRS","BOLOGNA · JERKY · STICKS","CONNEAUT LAKE RD"]},
  {k:"card", h:"FIREWOOD FOR SALE", b:["seasoned oak + maple","$5 a bundle, honor box","2 mi east on 198"]},
  {k:"flyer", h:"DRIVE SAFE", c:"#24408e", b:["DROWSY DRIVING KILLS","PULL OVER · REST · RECHARGE","THANK YOU FOR STOPPING"]},
  {k:"flyer", h:"BAND SATURDAY", c:"#2b2b2b", b:["THE LOW DESERT","LIVE AT THE LEGION · 8 PM","NO COVER"]},
  {k:"card", h:"WHOOPIE PIES", b:["Amish baked goods","Saturdays, the farm stand","past the Sunoco"]},
  {k:"flyer", h:"KNOW BEFORE YOU GO", c:"#1f4fa0", b:["DIAL 511 OR VISIT 511PA.COM","ROAD CONDITIONS · CAMERAS","WINTER: PLOW TRACKER"]},
  {k:"card", h:"LOST: SUNGLASSES", b:["black, kind of expensive","picnic table by the shelter","Tues. afternoon"], tel:"814-555-0130"},
  {k:"flyer", h:"LITTER", c:"#2f7a3c", b:["FINE UP TO $300","KEEP PA BEAUTIFUL","PACK IT IN · PACK IT OUT"]},
  {k:"flyer", h:"PYMATUNING SPILLWAY", c:"#2a8ad0", b:["WHERE THE DUCKS","WALK ON THE FISH","LINESVILLE · 30 MIN"]},
  {k:"card", h:"WHOEVER TOOK MY", b:["PILLOW from the picnic","shelter, I KNOW it was","you. Bring it back."]},
];
function _noteDraw(n, torn){
  const W=200, H=240, c=cvs(W,H), x=c.getContext("2d"), r=_trng(n.h.length*31+(torn||0));
  x.clearRect(0,0,W,H);
  if(n.k==="card"){
    x.fillStyle="#fbf8ec"; x.fillRect(4,40,W-8,H-80);
    x.strokeStyle="#9ab8d8"; x.lineWidth=1; for(let k=0;k<7;k++){ x.beginPath(); x.moveTo(4,72+k*18); x.lineTo(W-4,72+k*18); x.stroke(); }
    x.strokeStyle="#e08a8a"; x.beginPath(); x.moveTo(4,58); x.lineTo(W-4,58); x.stroke();
    x.fillStyle="#1f2a6a"; x.textAlign="center"; x.textBaseline="alphabetic";
    fitText(x, n.h, W*0.86, 18, W/2, 54, "700", "'Comic Sans MS', 'Segoe Print', cursive");
    n.b.forEach((t,i)=>fitText(x, t, W*0.86, 14, W/2, 86+i*18, "500", "'Comic Sans MS', 'Segoe Print', cursive"));
    if(n.tel){ x.fillStyle="#1f2a6a"; fitText(x, n.tel, W*0.8, 14, W/2, 158, "700", "'Comic Sans MS', cursive"); }
  }else{
    x.fillStyle="#f6f4ec"; x.fillRect(0,0,W,n.tel?H-46:H);
    x.fillStyle=n.c; x.fillRect(0,0,W,44);
    x.fillStyle="#fff"; fitText(x, n.h, W*0.9, 26, W/2, 23, "700");
    let y=60;
    if(n.pic){ x.fillStyle="#d8d4c8"; x.fillRect(W*0.2,52,W*0.6,64); x.fillStyle="#3a3530";
      if(n.pic==="dog"){ x.beginPath(); x.ellipse(W/2,92,30,14,0,0,7); x.fill(); x.beginPath(); x.ellipse(W/2+30,76,12,10,0,0,7); x.fill();
        x.fillStyle="#8a5a2a"; x.beginPath(); x.ellipse(W/2+24,74,5,10,0.3,0,7); x.fill(); x.fillStyle="#3a3530"; x.fillRect(W/2-24,98,5,14); x.fillRect(W/2+18,98,5,14); }
      else if(n.pic==="cat"){ x.fillStyle="#6a6a6a"; x.beginPath(); x.ellipse(W/2,96,22,16,0,0,7); x.fill(); x.beginPath(); x.arc(W/2+4,72,12,0,7); x.fill();
        x.beginPath(); x.moveTo(W/2-6,66); x.lineTo(W/2-3,54); x.lineTo(W/2+2,64); x.fill(); x.beginPath(); x.moveTo(W/2+6,64); x.lineTo(W/2+11,54); x.lineTo(W/2+14,66); x.fill(); }
      else { x.fillStyle="#5a4a3a"; x.beginPath(); x.ellipse(W/2,84,26,13,0,0,7); x.fill(); x.fillStyle="#c8202a"; x.beginPath(); x.ellipse(W/2-8,86,10,7,0,0,7); x.fill();
        x.fillStyle="#1a1a1a"; for(let k=0;k<6;k++){ x.beginPath(); x.arc(W/2+6+(k%3)*6,80+((k/3)|0)*7,2,0,7); x.fill(); } }
      y=130; }
    x.fillStyle="#2a2a2a"; n.b.forEach((t,i)=>fitText(x, t, W*0.88, 15, W/2, y+i*21, i===0?"700":"500"));
    if(n.tel){ x.fillStyle="#f6f4ec";
      const tabs=8; for(let k=0;k<tabs;k++){ if(torn && (k*7+torn)%3===0) continue;
        x.save(); x.translate(8+k*(W-16)/tabs+(W-16)/tabs/2, H-24); x.fillRect(-(W-16)/tabs/2+1, -22, (W-16)/tabs-2, 46);
        x.rotate(-Math.PI/2); x.fillStyle="#2a2a2a"; x.font="500 9px Arial"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(n.tel, 0, 0); x.fillStyle="#f6f4ec"; x.restore(); } }
  }
  const t=setSRGB(new T.CanvasTexture(c)); t.anisotropy=4;
  return t;
}
const BOARD_NOTES=(function(){
  const B=BOARD, slots=[];
  if(B.x0===undefined) return slots;
  const pinM=[0xc8202a,0x2b5aa8,0xe0b52a,0x3a8a3a].map(c=>new T.MeshStandardMaterial({color:c, roughness:0.4}));
  for(let i=0;i<6;i++){
    const nx=B.x0+0.30+(i%3)*0.88, ny=B.y0+0.32+Math.floor(i/3)*0.60;
    const m=new T.Mesh(new T.PlaneGeometry(0.30,0.36), new T.MeshStandardMaterial({transparent:true, alphaTest:0.5, roughness:0.85,
      polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    m.position.set(nx+(i%2?0.06:-0.05), ny, B.z-0.016-i*0.0004); m.rotation.y=Math.PI; m.rotation.z=(Math.random()-0.5)*0.12; scene.add(m);
    const pin=new T.Mesh(new T.SphereGeometry(0.010,8,6), pinM[i%4]); pin.position.set(m.position.x, ny+0.15, B.z-0.024); scene.add(pin);
    slots.push({m:m, pin:pin, note:-1});
  }
  addUse((B.x0+B.x1)/2, B.z-1.0, FL, "READ THE BOARD", ()=>{
    const s=slots[(Math.random()*slots.length)|0], n=NOTES[s.note]; if(!n) return;
    toast(n.h+" · "+n.b.join(" · ")+(n.tel?" · "+n.tel:""), "#cfe0d4"); }, 1.4);
  return slots;
})();
const _noteTex={};
function pinNote(i, ni){
  const s=BOARD_NOTES[i]; if(!s) return;
  const key=ni+":"+(i%3);
  s.m.material.map=_noteTex[key] || (_noteTex[key]=_noteDraw(NOTES[ni], i%3)); s.m.material.needsUpdate=true; s.note=ni;
}
let _boardDay=-1, _boardT=240;
function updateBoard(dt){
  const day=DayNight.state.day;
  if(day!==_boardDay){
    // a new day: most of it stays up, a couple come down and new ones go up
    const r=_trng(day*7919+17), used=new Set();
    for(let i=0;i<BOARD_NOTES.length;i++){
      let ni=(r()*NOTES.length)|0; while(used.has(ni)) ni=(ni+1)%NOTES.length;
      used.add(ni); if(_boardDay<0 || r()<0.35) pinNote(i, ni);
    }
    _boardDay=day;
  }
  _boardT-=dt;
  if(_boardT<=0){ _boardT=300+Math.random()*300;
    const i=(Math.random()*BOARD_NOTES.length)|0, shown=new Set(BOARD_NOTES.map(s=>s.note));
    let ni=(Math.random()*NOTES.length)|0; while(shown.has(ni)) ni=(ni+1)%NOTES.length;
    pinNote(i, ni); }
}
function updateScreens(dt, now){
  updateTV(dt, now); updateTrail(dt); updateCCTV(dt, now); updateBoard(dt);
}
