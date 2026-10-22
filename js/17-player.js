"use strict";
/* REST AREA · 17-player.js
   movement, collision response, doors, seats
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14 · PLAYER
   ---------------------------------------------------------------------- */
const player={ pos:new T.Vector3(SPAWN.x, 0, SPAWN.z), yaw:SPAWN.yaw, pitch:-0.02,
               feetY:0, bob:0, step:0, swim:0, sit:0, moving:0 };
player.feetY=surfaceY(player.pos.x, player.pos.z, 0);

const keys={};
let started=false, hudOn=true, leaving=false;
// Three gaits. Q is held like Shift is held, and nothing else in the world
// reads KeyQ, so it cannot collide with a modifier the way the "/" report did.
const WALK=3.05, RUN=5.6, SPRINT=10.4;

addEventListener("keydown",e=>{
  // at a vending machine the keys are its keypad's (18b-vending)
  if(VEND.open){ e.preventDefault(); VEND.key(e); return; }
  // on the oche the keys are the game's (18d-darts)
  if(typeof DARTS!=="undefined" && DARTS.on){ e.preventDefault(); DARTS.key(e); return; }
  // at the air hockey table and the hoops machine, theirs (18e-games)
  if(typeof HOCKEY!=="undefined" && HOCKEY.on){ e.preventDefault(); HOCKEY.key(e); return; }
  if(typeof HOOPS!=="undefined" && HOOPS.on){ e.preventDefault(); HOOPS.key(e); return; }
  // at the Astro Raiders cabinet, the cabinet's (18f-raiders)
  if(typeof RAIDERS!=="undefined" && RAIDERS.on){ e.preventDefault(); RAIDERS.key(e); return; }
  // and in the graphics menu, the menu's (18c-settings)
  if(window.GFXMENU && GFXMENU.open){ e.preventDefault(); if(!e.repeat || e.code.startsWith("Arrow")) GFXMENU.key(e); return; }
  if(e.code==="Tab"){ e.preventDefault(); return; }
  if(e.code==="KeyG" && !e.repeat && window.GFXMENU){ GFXMENU.show(); return; }
  const held=keys[e.code];                  // keydown repeats while a key is down
  keys[e.code]=true;
  if(e.code==="KeyQ" && !held) toast("SPRINT","#ffd48a");
  if(e.code==="KeyH"){ hudOn=!hudOn; document.querySelectorAll("#mast,#keys,#cluster,#plan").forEach(el=>el.style.display=hudOn?"":"none"); }
  if(e.code==="KeyY"){ const h=DayNight.state.hour; FOREST.setSeason(!FOREST.isAutumn()); DayNight.setHour(h);   // same clock, the autumn sun
    toast(FOREST.isAutumn()?"OCTOBER":"JULY", FOREST.isAutumn()?"#f0a040":"#9fd36a"); }
  if(e.code==="KeyU" && typeof AUDIO!=="undefined"){ AUDIO.toggle(); toast(AUDIO.on()?"SOUND ON":"SOUND OFF","#cfe0d4"); }
  if(e.code==="KeyO"){ view=(view==="fp"?"plan":"fp"); }
  if(e.code==="KeyN"){ DayNight.setHour(22.4); toast("NIGHTFALL","#8fb4ff"); }
  if(e.code==="KeyM"){ DayNight.setHour(12.5); toast("MIDDAY","#f4c430"); }
  if(e.code==="BracketLeft")  DayNight.nudge(-0.02);
  if(e.code==="BracketRight") DayNight.nudge( 0.02);
  if(e.code==="KeyC" && !droneMode && !driving) sitToggle();
  if(e.code==="KeyF" && !driving) setDrone(!droneMode);   // no driverless cars
  if(e.code==="KeyL"){ torchOn=!torchOn; toast(torchOn?"FLASHLIGHT ON":"FLASHLIGHT OFF","#ffe9a8"); }
  // the weather, for testing: it comes on its own, now and then, otherwise
  if(e.code==="KeyR" && !held){ const on=WEATHER.kind!=="rainfog"; WEATHER.set(on?"rainfog":"clear", true);
    toast(on?"RAIN AND FOG":"CLEARING","#9fb8d8"); }
  if(e.code==="KeyT" && !held){ const on=WEATHER.kind!=="storm"; WEATHER.set(on?"storm":"clear", true);
    toast(on?"THUNDERSTORM":"CLEARING","#b9a8ff"); }
  if(e.code==="KeyP" && !held){ if(GRID.phase==="normal"||GRID.phase==="cool"){ if(WEATHER.kind!=="storm") WEATHER.set("storm", true);
      WEATHER.cover=Math.max(WEATHER.cover,0.9); WEATHER.storm=Math.max(WEATHER.storm,0.8); WEATHER.rain=Math.max(WEATHER.rain,0.6); strike(true, true); }
    else toast("THE POWER IS ALREADY OUT","#ff8a6a"); }
  if(e.code==="KeyX" && !held){ CRASH.toggle(); toast(CRASH.on?"I-79 NORTH · CLEARED":"WRECK ON I-79 NORTH","#ff9a5a"); }
  // Space is the handbrake once you are in a car, so it must not also be
  // the key that gets you out of it
  if((e.code==="KeyE" || (e.code==="Space" && !driving)) && !droneMode) interact();
});
addEventListener("keyup",e=>{ keys[e.code]=false; });
// Alt-tab away mid-stride and the keyup for whatever you were holding never
// arrives, so the key stays down for good. Drop everything when the window
// stops listening.
function clearKeys(){ for(const k in keys) keys[k]=false; }
addEventListener("blur", clearKeys);
addEventListener("contextmenu", clearKeys);
document.addEventListener("visibilitychange",()=>{ if(document.hidden) clearKeys(); });

/* --- look: pointer lock when it is allowed, drag everywhere else ------ */
const dom=renderer.domElement;
let dragging=false, lastX=0, lastY=0;
dom.addEventListener("mousedown",e=>{ dragging=true; lastX=e.clientX; lastY=e.clientY; });
addEventListener("mouseup",()=>{ dragging=false; });
addEventListener("mousemove",e=>{
  if(document.pointerLockElement===dom){ look(e.movementX, e.movementY); return; }
  if(!dragging) return;
  look(e.clientX-lastX, e.clientY-lastY); lastX=e.clientX; lastY=e.clientY;
});
function look(dx,dy){
  if(typeof HOCKEY!=="undefined" && HOCKEY.on){ HOCKEY.move(dx,dy); return; }   // the mouse is the mallet
  if(typeof RAIDERS!=="undefined" && RAIDERS.on) return;                          // your eyes stay on the screen
  if(driving){                       // orbit the car rather than turn a head
    carCamYaw   -= dx*0.0042;
    carCamPitch  = clamp(carCamPitch - dy*0.0032, -0.18, 1.05);
    return;
  }
  if(droneMode){                       // the same stick, pointed at the drone
    droneYaw  -= dx*0.0026;
    dronePitch = clamp(dronePitch - dy*0.0026, -0.15, 1.35);
    return;
  }
  player.yaw   -= dx*0.0026;
  player.pitch  = clamp(player.pitch - dy*0.0024, -1.15, 1.15);
}
dom.addEventListener("click",()=>{ if(document.pointerLockElement!==dom && dom.requestPointerLock) dom.requestPointerLock(); });
// the wheel zooms in (to 24° tighter) or opens the view a little (6° wider)
addEventListener("wheel",e=>{ fovZoom=clamp(fovZoom+Math.sign(e.deltaY)*3, -24, 6); applyFov(); },
                 {passive:true});

// touch: drag to look, on-screen pad to walk
const touchPad=document.getElementById("touch");
if(matchMedia("(pointer:coarse)").matches){
  touchPad.classList.add("on");
  const map={f:"KeyW",b:"KeyS",l:"KeyA",r:"KeyD"};
  touchPad.querySelectorAll("button[data-k]").forEach(b=>{
    const k=map[b.dataset.k];
    const on=e=>{e.preventDefault(); keys[k]=true;}, off=e=>{e.preventDefault(); keys[k]=false;};
    b.addEventListener("touchstart",on); b.addEventListener("touchend",off); b.addEventListener("touchcancel",off);
  });
}
let tId=null;
dom.addEventListener("touchstart",e=>{ const t=e.changedTouches[0]; tId=t.identifier; lastX=t.clientX; lastY=t.clientY; },{passive:true});
dom.addEventListener("touchmove",e=>{
  for(const t of e.changedTouches) if(t.identifier===tId){
    look((t.clientX-lastX)*1.5,(t.clientY-lastY)*1.5); lastX=t.clientX; lastY=t.clientY;
  }
},{passive:true});

/* --- doors ------------------------------------------------------------ */
let nearestDoor=null;
let seated=null, nearestSeat=null, sitGuard=false, sitDrop=0.66;
// Getting up used to try one spot — straight ahead, tested at seat height —
// and if that was blocked it left you standing inside the chair with every
// direction blocked, which is what "stuck" was. Now it fans out from the way
// you were facing, at three distances, and tests each candidate standing on
// the floor rather than sitting on the cushion.
/* The nearest place you could actually be standing. A ring search outward
   from wherever you are: the first unblocked spot at a height you could have
   got to wins. Nothing in the world needs to guarantee an exit any more,
   because this always finds one.                                          */
/* `tol` is how far the spot may be above or below the height you asked
   for. It defaulted to 1.3 m for everything, which is fine for standing up
   out of a chair and wrong for getting out of a car: step out beside a kerb
   or on the shoulder of the lot and it would happily drop you a metre and a
   quarter, so you came back from a drive standing noticeably lower than you
   got in. The car passes a much tighter one. */
function nearestFree(x, z, base, maxR, tol){
  const T=tol||1.3;
  for(let r=0.45; r<=(maxR||4.2); r+=0.35){
    const n=Math.max(8, Math.round(r*14));
    for(let k=0;k<n;k++){
      const a=(k/n)*Math.PI*2 + r;                 // rotate each ring a little
      const nx=x+Math.cos(a)*r, nz=z+Math.sin(a)*r;
      const fy=surfaceY(nx, nz, base+0.45);
      if(Math.abs(fy-base)<T && !blocked(nx, nz, fy)) return [nx, nz, fy];
    }
  }
  return null;
}
function standUp(){
  if(!seated) return;
  const s=seated, base=surfaceY(s.x, s.z, s.y);
  let stood=false;
  for(const d of (s.lie ? [1.45, 1.85, 1.15, 2.25] : [0.95, 1.35, 0.65])){
    for(let k=0;k<13;k++){
      const a=s.yaw + ((k%2)?1:-1)*Math.ceil(k/2)*0.52;
      const nx=s.x - Math.sin(a)*d, nz=s.z - Math.cos(a)*d;
      const fy=surfaceY(nx, nz, base+0.45);
      if(Math.abs(fy-base)<0.9 && !blocked(nx, nz, fy)){
        player.pos.x=nx; player.pos.z=nz; player.feetY=fy; stood=true; break;
      }
    }
    if(stood) break;
  }
  // The fan used to give up and leave you standing in the furniture — in a
  // motel room the bed, the nightstand and the chair make pockets under
  // 0.68 m across, which is narrower than the player, so once you were in
  // one you could not walk out of it in any direction.
  if(!stood){
    const e=nearestFree(s.x, s.z, base);
    if(e){ player.pos.x=e[0]; player.pos.z=e[1]; player.feetY=e[2]; }
    else player.feetY=base;
  }
  seated=null; sitGuard=false;
}
function updateSeats(){
  if(seated){ nearestSeat=null; return; }
  let best=null, bd=1e9;
  for(const s of SEATS){
    const d=Math.hypot(player.pos.x-s.x, player.pos.z-s.z);
    if(Math.abs(player.feetY-s.y)<1.7 && d<2.0 && d<bd){ bd=d; best=s; }
  }
  nearestSeat=best;
}
// Sitting used to share E with the doors, and lost: in a room the chair and
// the front door are both in reach, so E swung the door instead. It has its
// own key now, and nothing else is bound to it.
function sitToggle(){
  if(!started) return;
  if(seated){ standUp(); toast("ON YOUR FEET","#ffb324"); return; }
  updateSeats();
  if(!nearestSeat){ toast("NOTHING TO SIT ON","#8fa0ad"); return; }
  seated=nearestSeat; player.yaw=nearestSeat.yaw;
  sitDrop = nearestSeat.lie ? 1.34 : 0.66;
  // on your back you are looking at the ceiling, not down the bed
  if(nearestSeat.lie) player.pitch=Math.max(player.pitch, 0.86);
  // You almost always arrive at a chair still holding W. Standing up is only
  // armed once the movement keys have been let go of, or you would pop back
  // up on the very next tick and think the key did nothing.
  sitGuard=true;
  toast(nearestSeat.lie ? "LYING DOWN  ·  C TO GET UP" : "SITTING  ·  C TO GET UP",
        "#ffb324");
}
function interact(){
  if(!started) return;
  if(driving){ exitCar(); return; }
  { const c=nearestCar(); if(c){ enterCar(c); return; } }
  { const u=nearestUse(); if(u && u.pri){ u.fn(); return; } }
  if(nearestDoor && nearestDoor.occ && nearestDoor.occBy && nearestDoor.occBy.cust){
    toast(["\u201cGIVE ME A MINUTE ON THIS ONE.\u201d","\u201cYOU DON'T WANT THIS ONE. TRY THE NEXT.\u201d"][(Math.random()*2)|0],"#cfe0d4"); return; }
  if(nearestDoor && nearestDoor.occ){
    toast(["OCCUPIED","SOMEBODY CLEARS THEIR THROAT","\u201cSOMEONE'S IN HERE\u201d"][(Math.random()*3)|0],"#cfe0d4"); return; }
  if(nearestDoor){
    nearestDoor.manual = (nearestDoor.target>0.5) ? -1 : 1;
    if(nearestDoor.partner) nearestDoor.partner.manual=nearestDoor.manual;
    if(nearestDoor.manualOnly && nearestDoor.manual>0 && !nearestDoor.told){
      nearestDoor.told=true; if(nearestDoor.partner) nearestDoor.partner.told=true;
      toast(nearestDoor.openMsg||"THE PADLOCK IS HANGING OPEN ON ITS HASP","#cfe0d4");
    }
    return;
  }
  // anything else within reach that does something when you press E
  const u=nearestUse();
  if(u){ u.fn(); }
}
/* Things you can use: a vending machine, the fountain, the hand dryer, the
   brochure rack. Each is a point, a reach and a line of prompt; content
   files register them with addUse. */
function nearestUse(){
  let best=null, bd=1e9;
  for(const u of USES){
    if(u.when && !u.when()) continue;
    const d=Math.hypot(player.pos.x-u.x, player.pos.z-u.z);
    if(d<(u.r||1.6) && Math.abs(player.feetY-u.y)<1.2 && d<bd){ bd=d; best=u; }
  }
  return best;
}
function updateDoors(dt){
  const px=player.pos.x, pz=player.pos.z, py=player.feetY;
  let best=null, bestD=1e9;
  for(const d of DOORS){
    const dist=Math.hypot(px-d.x, pz-d.z);
    const sameFloor=Math.abs(py-d.y)<1.8;
    if(sameFloor && dist<3.4 && dist<bestD){ bestD=dist; best=d; }
    // a gate opens when you open it and stays as you leave it
    let want = (!d.manualOnly && ((sameFloor && dist<(d.reach||2.5)) || npcNearDoor(d))) ? 1 : 0;
    if(d.manual!==0){
      if(!d.sticky && (dist>4.6 || !sameFloor)) d.manual=0; else want=(d.manual>0?1:0);
    }
    d.target=Math.max(want, d.ajar);
    // a stall somebody is in: shut, and latched, until they come out
    if(d.occ){ d.manual=0; d.target=npcNearDoor(d) ? 1 : 0; }
    if(d.stall){
      const gc=d.stall.gap, i=COL_DYN.indexOf(gc), shut=d.occ && d.open<0.3;
      if(shut && i<0) COL_DYN.push(gc); else if(!shut && i>=0) COL_DYN.splice(i,1);
    }
    d.open += (d.target-d.open)*Math.min(1, dt*(d.manualOnly?1.6:5.2));
    d.g.rotation.y = d.base + d.swing*d.open;
    // and while it is shut it is solid, which a leaf on its own never is
    if(d.blockCol){
      const shut=d.open<0.35 && (!d.partner || d.partner.open<0.35);
      d.blockCol.y1 = shut ? d.blockTop : d.blockCol.y0-1;
    }
  }
  nearestDoor=best;
  updateSeats();
  // Doors and chairs are on different keys now, so both prompts can stand.
  const el=document.getElementById("prompt");
  if(droneMode){ el.classList.remove("show"); return; }
  const bits=[];
  if(driving) bits.push("E  ·  GET OUT");
  else if(seated) bits.push("C  ·  "+(seated.lie?"GET UP":"STAND UP"));
  else{
    const nc=nearestCar();
    if(nc) bits.push("E  ·  DRIVE");
    if(nearestSeat) bits.push("C  ·  "+(nearestSeat.lie?"LIE DOWN":"SIT")+"  ·  "+nearestSeat.label);
    const u=nc ? null : nearestUse();
    if(u && u.pri) bits.push("E  ·  "+u.label);                      // cleaning up beats the stall door
    else if(best && !nc) bits.push(best.occ ? "OCCUPIED" : "E  ·  "+(best.manualOnly ? (best.target>0.5?"CLOSE ":"OPEN ")+best.label : best.label));
    else if(u) bits.push("E  ·  "+u.label);
  }
  if(bits.length){ el.textContent=bits.join("      "); el.classList.add("show"); }
  else el.classList.remove("show");
}

/* --- movement --------------------------------------------------------- */
// the edge of the walkable woods: push against it and you are told so, once
let _edgeToast=0;
function nearEdge(x,z){
  const I=SITE.walkInset, Z={x0:SITE.zone.x0+I, x1:SITE.zone.x1-(SITE.walkInsetE||I), z0:SITE.zone.z0+I, z1:SITE.zone.z1-I}, m=1.4;
  return x<Z.x0+m || x>Z.x1-m || z<Z.z0+m || z>Z.z1-m ||
         ((z<Z.z0 || z>Z.z1) && Math.min(Math.abs(Math.abs(x-HWY.nb)-19.5),Math.abs(Math.abs(x-HWY.sb)-19.5))<1.4);
}
function fixedUpdate(dt){
  if(driving){                       // you are in the car; the car is driving
    updateCars(dt);
    const b=driving.veh.body;
    player.pos.set(b.position.x, 0, b.position.z);
    player.feetY=b.position.y-CAR_RIDE;
    /* and the body keeps settling while you drive. eyeY is feetY + EYE +
       bob - sit*sitDrop, so a sit or a bob left part way through when you
       got in stays there for the whole journey and you climb out of the
       car lower than you got in. They decay here as they would on foot. */
    player.sit += (0-player.sit)*Math.min(1,dt*6);
    player.bob += (0-player.bob)*Math.min(1,dt*6);
    return;
  }
  const f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
  const r=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
  if(seated){                       // sitting: look where you like, go nowhere
    if(sitGuard && !f && !r) sitGuard=false;      // keys released — you may leave
    if((f||r) && !sitGuard) standUp();
    else{
      player.pos.x += (seated.x-player.pos.x)*Math.min(1,dt*7);
      player.pos.z += (seated.z-player.pos.z)*Math.min(1,dt*7);
      player.feetY += (seated.y-player.feetY)*Math.min(1,dt*7);
      player.sit   += (1-player.sit)*Math.min(1,dt*5);
      player.bob   += (0-player.bob)*Math.min(1,dt*6);
      return;
    }
  }
  player.sit += (0-player.sit)*Math.min(1,dt*6);
  /* If you are inside something, get out of it. Movement below is two
     axis-separated slide tests, and both of them fail from every direction
     once your own position is blocked — so whatever put you there (standing
     up into furniture, a door swinging shut on you, the ground moving under
     you), you would stay there for good with no way to walk out. One ring
     search a step, and only while actually stuck, so it costs nothing the
     rest of the time. */
  if(blocked(player.pos.x, player.pos.z, player.feetY)){
    const e=nearestFree(player.pos.x, player.pos.z, player.feetY, 6.0);
    if(e){ player.pos.x=e[0]; player.pos.z=e[1]; player.feetY=e[2]; }
  }
  // Physical Shift, by e.code, and nothing else. This briefly also consulted
  // e.getModifierState("Shift"), which reads true for any keystroke that needs
  // Shift to produce its character — so on a layout that types "/" as a
  // shifted key, "/" was a sprint button.
  let sp=(keys.KeyQ ? SPRINT
          : (keys.ShiftLeft||keys.ShiftRight) ? RUN : WALK);
  if(f||r){
    const len=Math.hypot(f,r)||1;
    const sinY=Math.sin(player.yaw), cosY=Math.cos(player.yaw);
    // forward is -Z at yaw 0, matching the camera's lookAt below
    const dx=(-sinY*f + cosY*r)/len*sp*dt;
    const dz=(-cosY*f - sinY*r)/len*sp*dt;
    const nx=player.pos.x+dx, nz=player.pos.z+dz;
    const bx1=blocked(nx, player.pos.z, player.feetY);
    if(!bx1) player.pos.x=nx;                                        // slide on X…
    const bz1=blocked(player.pos.x, nz, player.feetY);
    if(!bz1) player.pos.z=nz;                                        // …then on Z
    if((bx1||bz1) && nearEdge(nx,nz) && performance.now()-_edgeToast>6000){
      _edgeToast=performance.now();
      // out back, the edge is somebody's line, and they have said so
      toast(nx>SITE.zone.x1-(SITE.walkInsetE||0)-6 ? "POSTED. THIS IS AS FAR AS YOU GO" : "THE WOODS ARE TOO THICK TO GO ON. YOU CAN'T WALK ANY FURTHER THIS WAY","#cfe0d4");
    }
    player.step += sp*dt;
    player.bob   = Math.sin(player.step*3.1)*0.025;
    player.moving = 1;
  }else{
    player.bob += (0-player.bob)*Math.min(1,dt*6);
    player.moving = 0;
  }
  const target=surfaceY(player.pos.x, player.pos.z, player.feetY);
  const rate = target>player.feetY ? 14 : 9;               // step up snappy, drop softly
  player.feetY += (target-player.feetY)*Math.min(1, dt*rate);
  // running up a flight the eased feet fall behind the treads; past a step's
  // reach the stair is lost and you drop through to the floor beneath it
  if(target-player.feetY>0.3) player.feetY=target-0.3;
}

/* --- drone (F) -------------------------------------------------------- */
// A little quadcopter you fly in third person. Free flight, no collision but
// the ground: it will not sink through the desert, the roofs or the deck.
let droneMode=false, droneYaw=0, dronePitch=0.5, droneTiltX=0, droneTiltZ=0;
const dronePos=new T.Vector3(), droneVel=new T.Vector3(), _dtmp=new T.Vector3();
// The drone moves on the fixed 1/60 step but the camera is drawn every frame,
// and a frame takes five steps as often as six. Rendering it at its raw
// stepped position made the whole view surge and stall — these hold the
// position before this frame's steps and the interpolated one drawn from it.
const dronePrev=new T.Vector3(), droneShown=new T.Vector3(), droneLook=new T.Vector3();
let stepAlpha=0;
const DRONE_CEIL=240;                     // high enough to see the whole site
const drone=(function(){
  const g=new T.Group();
  const bodyMat=mat(0x2b2f36,{roughness:0.5,metalness:0.35});
  const body=new T.Mesh(new T.BoxGeometry(0.30,0.12,0.42), bodyMat); g.add(body);
  const nose=new T.Mesh(new T.SphereGeometry(0.055,10,8),
                        mat(0x0a0a0a,{roughness:0.25,metalness:0.3}));
  nose.position.set(0,-0.03,0.23); g.add(nose);    // the camera looks over its tail
  for(const rotY of [Math.PI/4,-Math.PI/4]){
    const arm=new T.Mesh(new T.BoxGeometry(0.05,0.04,0.86), bodyMat);
    arm.rotation.y=rotY; g.add(arm);
  }
  const ROTORS=[], d=0.30;
  for(const c of [[d,d],[-d,d],[d,-d],[-d,-d]]){
    const motor=new T.Mesh(new T.CylinderGeometry(0.05,0.05,0.09,10), bodyMat);
    motor.position.set(c[0],0.02,c[1]); g.add(motor);
    const rotor=new T.Mesh(new T.CylinderGeometry(0.21,0.21,0.012,18),
                mat(0x80868e,{roughness:0.4,transparent:true,opacity:0.45}));
    rotor.position.set(c[0],0.09,c[1]); g.add(rotor); ROTORS.push(rotor);
  }
  for(const sx of [-0.11,0.11]){
    const skid=new T.Mesh(new T.BoxGeometry(0.02,0.02,0.36), bodyMat);
    skid.position.set(sx,-0.11,0); g.add(skid);
    for(const sz of [0.13,-0.13]){
      const leg=new T.Mesh(new T.BoxGeometry(0.02,0.09,0.02), bodyMat);
      leg.position.set(sx,-0.06,sz); g.add(leg);
    }
  }
  for(const m of g.children) m.castShadow=true;
  g.userData.rotors=ROTORS; g.visible=false; scene.add(g); return g;
})();
function setDrone(on){
  droneMode=on; drone.visible=on;
  if(on){
    if(seated) standUp();
    view="fp";
    dronePos.set(player.pos.x, player.feetY+6, player.pos.z); droneVel.set(0,0,0);
    // the chase camera looks along +(sin,cos) — the opposite of the way you
    // walk — so the drone's yaw is your yaw turned round. Take off looking
    // where you were already looking.
    droneYaw=player.yaw+Math.PI; dronePitch=0.5; droneTiltX=0; droneTiltZ=0;
    dronePrev.copy(dronePos); droneShown.copy(dronePos); droneLook.copy(dronePos);
    camera.position.set(dronePos.x-Math.sin(droneYaw)*3.5, dronePos.y+2.2,
                        dronePos.z-Math.cos(droneYaw)*3.5);
    document.getElementById("prompt").classList.remove("show");
    toast("DRONE  ·  WASD FLY  ·  SPACE UP  ·  SHIFT DOWN  ·  F TO LAND","#6fe3ff");
  }else{
    player.yaw=droneYaw+Math.PI;
    toast("BACK ON YOUR FEET","#ffb324");
  }
}
function droneUpdate(dt){
  const sy=Math.sin(droneYaw), cy=Math.cos(droneYaw);
  let ax=0, az=0, ay=0;
  // W is the way the camera is pointing, which is +(sin,cos) — the chase view
  // sits behind the drone, so this is forward on the screen.
  if(keys.KeyW||keys.ArrowUp)    { ax+=sy; az+=cy; }
  if(keys.KeyS||keys.ArrowDown)  { ax-=sy; az-=cy; }
  // Screen-right for a camera looking along f=(sin,cos) with up +Y is
  // f x up = (-cos, 0, sin) — I had taken the cross product the other way
  // round, so D strafed left and A strafed right.
  if(keys.KeyD||keys.ArrowRight) { ax-=cy; az+=sy; }
  if(keys.KeyA||keys.ArrowLeft)  { ax+=cy; az-=sy; }
  if(keys.Space) ay+=1;
  if(keys.ShiftLeft||keys.ShiftRight) ay-=1;
  // The point of it is to get somewhere. Drag caps the speed at accel/drag,
  // so 62 against 2.3 settles around 27 m/s — nine times walking pace, and
  // the far side of the desert in half a minute.
  const accel=keys.KeyQ?128:62, ACCEL_Y=34;   // Q opens it up out here too
  droneVel.x+=ax*accel*dt; droneVel.z+=az*accel*dt; droneVel.y+=ay*ACCEL_Y*dt;
  droneVel.multiplyScalar(Math.max(0, 1-2.3*dt));                     // air drag
  dronePos.x+=droneVel.x*dt; dronePos.y+=droneVel.y*dt; dronePos.z+=droneVel.z*dt;
  dronePos.x=clamp(dronePos.x, -1500, 1500);
  dronePos.z=clamp(dronePos.z, -1500, 1500);
  // past the walkable woods the canopy is a surface, and the drone treats it as one
  const deck=Math.max(surfaceY(dronePos.x, dronePos.z, dronePos.y), FOREST.canopyAt(dronePos.x, dronePos.z))+0.30;
  if(dronePos.y<deck){ dronePos.y=deck; if(droneVel.y<0) droneVel.y=0; }
  if(dronePos.y>DRONE_CEIL){ dronePos.y=DRONE_CEIL; if(droneVel.y>0) droneVel.y=0; }
  const localF=droneVel.x*sy+droneVel.z*cy,                      // lean into motion
        localR=-(droneVel.x*cy-droneVel.z*sy);
  droneTiltX += (-localF*0.013 - droneTiltX)*Math.min(1,dt*6);
  droneTiltZ += ( localR*0.013 - droneTiltZ)*Math.min(1,dt*6);
}
