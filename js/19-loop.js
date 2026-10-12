"use strict";
/* REST AREA · 19-loop.js
   fixed-timestep loop, cameras, day/night, wind, the REST debug handle
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   19 · FIXED-TIMESTEP LOOP
   ---------------------------------------------------------------------- */
const bootEl=document.getElementById("boot");
function begin(){
  if(started) return;
  started=true; bootEl.classList.add("hidden");
  if(typeof AUDIO!=="undefined") AUDIO.start();
  setTimeout(()=>toast("Y FOR OCTOBER  ·  N FOR NIGHTFALL","#cfe0d4"), 2400);
}
bootEl.addEventListener("click", begin);
addEventListener("keydown",e=>{ if(!started && (e.code==="Space"||e.code==="Enter")) begin(); });

/* --- the wind ------------------------------------------------------------
   Three slow beats multiplied together: mostly a breeze, and every couple of
   minutes a gust comes through the woods for half a minute and the crowns
   all lean the same way at once. */
const Wind={gust:0, hold:false};
function updateWind(t, dt){
  if(Wind.hold) return;
  const a=Math.sin(t*0.055+1.7)*0.5+0.5, b=Math.sin(t*0.021+4.2)*0.5+0.5, c=Math.sin(t*0.013)*0.5+0.5;
  const raw=Math.max(0,(a*b*c-0.12)/0.88);
  Wind.gust += (Math.pow(raw,0.8)-Wind.gust)*Math.min(1, dt*0.55);
}

let acc=0, last=performance.now()/1000;
const _sunDir=new T.Vector3();
function frame(){
  requestAnimationFrame(frame);
  const now=performance.now()/1000;
  let delta=now-last; last=now;
  if(delta>0.1) delta=0.1;

  if(started){
    acc+=delta; const STEP=1/60; let guard=0;
    while(acc>=STEP && guard++<6){
      if(droneMode){ dronePrev.copy(dronePos); droneUpdate(STEP); }
      else{
        if(driving) driving.veh.savePrev();
        fixedUpdate(STEP);
      }
      acc-=STEP;
    }
    stepAlpha=clamp(acc/STEP, 0, 1);
    updateDoors(delta);
  }
  updateWind(now, delta);
  WIND_U.uTime.value=now;
  WIND_U.uGust.value=0.25+Wind.gust*0.9;

  /* ---- camera ---- */
  if(droneMode){
    droneShown.lerpVectors(dronePrev, dronePos, stepAlpha);
    drone.position.copy(droneShown);
    drone.rotation.set(droneTiltX, droneYaw, droneTiltZ);
    for(const r of drone.userData.rotors) r.rotation.y += delta*55;
    const sp2=Math.min(1, Math.hypot(droneVel.x,droneVel.z)/26);
    const horiz=(3.6+sp2*2.9)*Math.cos(dronePitch), camY=0.7+(3.2+sp2*1.4)*Math.sin(dronePitch);
    _dtmp.set(droneShown.x-Math.sin(droneYaw)*horiz, droneShown.y+camY,
              droneShown.z-Math.cos(droneYaw)*horiz);
    camera.position.lerp(_dtmp, 1-Math.exp(-11*delta));
    if(droneLook.lengthSq()===0) droneLook.copy(droneShown);
    droneLook.lerp(droneShown, 1-Math.exp(-16*delta));
    camera.up.set(0,1,0);
    camera.lookAt(droneLook.x, droneLook.y+0.25, droneLook.z);
  }else if(driving){
    showCar(driving);
    const cp=driving.g.position;
    const a2=carYaw(driving.g.quaternion)+Math.PI+carCamYaw;
    const sp3=Math.min(1, Math.abs(driving.veh.speed)/28);
    const horiz=(7.6+sp3*3.0)*Math.cos(carCamPitch);
    _carTmp.set(cp.x+Math.sin(a2)*horiz,
                cp.y+2.20+(3.4+sp3*1.3)*Math.sin(carCamPitch),
                cp.z+Math.cos(a2)*horiz);
    const gy=surfaceY(_carTmp.x, _carTmp.z, _carTmp.y)+0.9;
    if(_carTmp.y<gy) _carTmp.y=gy;
    camera.position.lerp(_carTmp, 1-Math.exp(-10*delta));
    if(_carLook.lengthSq()===0) _carLook.copy(cp);
    _carLook.lerp(cp, 1-Math.exp(-15*delta));
    camera.up.set(0,1,0);
    camera.lookAt(_carLook.x, _carLook.y+0.85, _carLook.z);
  }else{
    droneLook.set(0,0,0);
    _carLook.set(0,0,0);
    const eyeY=player.feetY+EYE+player.bob-player.sit*sitDrop;
    camera.position.set(player.pos.x, eyeY, player.pos.z);
    const cp=Math.cos(player.pitch);
    camera.lookAt(player.pos.x - Math.sin(player.yaw)*cp,
                  eyeY + Math.sin(player.pitch),
                  player.pos.z - Math.cos(player.yaw)*cp);
  }

  /* ---- the flashlight follows the eye ---- */
  {
    torchLvl += ((torchOn?1:0)-torchLvl)*Math.min(1, delta*9);
    const lit=torchLvl>0.003;
    torch.visible=lit; torchSpill.visible=lit;
    if(lit){
      torch.position.copy(camera.position);
      camera.getWorldDirection(_torchDir);
      torchSpill.position.copy(camera.position).addScaledVector(_torchDir, 0.5);
      torchTarget.position.copy(camera.position).addScaledVector(_torchDir, 12);
      torch.intensity      = 2.45*torchLvl;
      torchSpill.intensity = 0.26*torchLvl;
    }
  }

  /* ---- day / night ---- */
  const dn=DayNight.tick(started?delta:delta*0.25);
  const dark=dn.dark;
  DayNight.paint();
  skyDome.position.copy(camera.position);
  starPivot.position.copy(camera.position);
  const ang=dn.t*Math.PI*2, R=190;
  const kx=Math.round(camera.position.x/SHADOW_SNAP)*SHADOW_SNAP,
        kz=Math.round(camera.position.z/SHADOW_SNAP)*SHADOW_SNAP;
  const kty=camera.position.y*0.3;
  _sunDir.set(Math.cos(ang)*R, Math.max(14, Math.sin(ang)*R+6)-kty, 70).normalize();
  key.position.set(kx+_sunDir.x*KEY_D, kty+_sunDir.y*KEY_D, kz+_sunDir.z*KEY_D);
  key.target.position.set(kx, kty, kz);
  key.intensity=dn.sunIntensity;
  key.castShadow = dn.sunHeight > 0.04;
  key.color.copy(DayNight.P.dayLight)
    .lerp(DayNight.P.setLight, Math.min(1,dn.sunsetAmount*1.2))
    .lerp(DayNight.P.nightLight, dn.nightAmount);
  const discY=placeCelestial(sunDisc, ang, 1, 70/R);
  placeCelestial(moonDisc, ang, -1, 70/R);
  const lowW=1-clamp((dn.sunHeight+0.06)/0.45,0,1);
  sunDisc.material.color.copy(SUN_HIGH).lerp(SUN_LOW, lowW);
  sunDisc.material.opacity=clamp((discY+0.10)/0.10,0,1);
  const ss=320+lowW*260; sunDisc.scale.set(ss,ss,1);
  moonDisc.material.opacity=0.9*dn.nightAmount;
  starPivot.visible=dn.nightAmount>0.01;
  starSky.rotation.y=DayNight.state.hour*(Math.PI/12);
  for(const L of STAR_LAYERS)
    L.p.material.opacity=dn.nightAmount*L.base*(0.88+0.12*Math.sin(now*L.sp+L.ph));
  hemi.intensity=dn.hemiIntensity;
  hemi.color.copy(DayNight.P.dayHemi).lerp(DayNight.P.nightHemi, dn.nightAmount);
  hemi.groundColor.copy(DayNight.P.dayGround).lerp(DayNight.P.nightGround, dn.nightAmount);
  amb.intensity=0.13+dn.nightAmount*0.06;
  // indoors the sky still lights the room through the glass, but less of it
  const inside=indoorsAt(camera.position.x, camera.position.z, camera.position.y);
  _indoorMix += ((inside?1:0)-_indoorMix)*Math.min(1, delta*3);
  if(_indoorMix>0.002){
    hemi.intensity *= 1-_indoorMix*0.35;
    hemi.groundColor.lerp(_INDOOR_BOUNCE, _indoorMix*0.8);   // indoors the light comes up off a pale floor, not the grass
    key.intensity  *= 1-_indoorMix*0.25;
    amb.intensity  += _indoorMix*0.10;
  }
  // haze: by day the horizon's own colour, at night darker than the sky
  scene.fog.color.copy(skyImg.hz).lerp(NIGHT_HAZE, dn.nightAmount*0.72);
  scene.fog.near=150+dn.nightAmount*50;
  scene.fog.far =1250+dn.nightAmount*300;
  scene.background=skyImg.hz;

  /* ---- artificial light: emissives ramp, real lights follow the player -- */
  for(const g of GLOW){
    if(g.basic){
      let a=(g.always?1:(g.day?(1-dark):dark))*(g.max===undefined?1:g.max);
      if(g.blink){
        const u=(now/g.blink)%1, d2=g.duty===undefined?0.16:g.duty;
        a *= u<d2 ? Math.sin(Math.PI*(u/d2)) : 0;
      }
      g.m.opacity=a;
      continue;
    }
    const k=g.kind==="indoor" ? 1.25+dark*0.6
          : g.kind==="always" ? 2.0
          : 0.10+dark*3.0;
    if(g.base) g.m.emissive.copy(g.base);
    // NOTHING CLIPS TO WHITE: the intensity goes through a soft knee
    const want=g.baseInt*k;
    const pk=Math.max(g.base?g.base.r:1, g.base?g.base.g:1, g.base?g.base.b:1)*want;
    const cap=pk<=0.55 ? pk : 0.55+0.37*(1-Math.exp(-(pk-0.55)/0.42));
    g.m.emissiveIntensity = pk>1e-5 ? want*(cap/pk) : want;
  }
  for(const n of NEON) n.material.color.setScalar(0.42+0.58*dark);
  tickFlicker(delta);
  updateLights(dark, camera.position);
  FOREST.update(camera.position);

  // clouds drift downwind and are tinted by whatever the sky is doing
  for(let i=0;i<CLOUDS.length;i++){
    const c=CLOUDS[i];
    c.ox += c.sp*delta;
    if(c.ox>2100) c.ox=-2100;
    c.s.position.set(camera.position.x+c.ox, c.s.position.y, camera.position.z+c.oz);
    const far=clamp((Math.abs(c.oz)-380)/1700, 0, 1);
    c.s.material.opacity = (0.22+0.74*(1-dn.nightAmount))*(0.80+0.20*Math.sin(i*1.7))*(1-far*0.30);
    c.s.material.color.copy(skyImg.mid).lerp(WHITE_C, 0.74-dn.nightAmount*0.62)
       .lerp(scene.fog.color, far*0.46*(1-dn.nightAmount*0.7));
  }
  for(let i=0;i<ALTO.length;i++){
    const c=ALTO[i];
    c.ox += c.sp*delta; if(c.ox>2200) c.ox=-2200;
    c.s.position.set(camera.position.x+c.ox, c.s.position.y, camera.position.z+c.oz);
    c.s.material.opacity = 0.40*(1-dn.nightAmount*0.88)*(0.62+0.38*Math.sin(i*1.9));
    c.s.material.color.copy(skyImg.mid).lerp(WHITE_C, 0.80-dn.nightAmount*0.6);
  }
  for(let i=0;i<CIRRUS.length;i++){
    const c=CIRRUS[i];
    c.ox += c.sp*delta; if(c.ox>2200) c.ox=-2200;
    c.s.position.set(camera.position.x+c.ox, c.s.position.y, camera.position.z+c.oz);
    c.s.material.opacity = 0.26*(1-dn.nightAmount*0.85)*(0.6+0.4*Math.sin(i*2.3));
    c.s.material.color.copy(skyImg.low).lerp(WHITE_C, 0.74-dn.nightAmount*0.6);
  }
  updateTraffic(delta, dark);
  for(const b of BIRDS){
    b.a += b.sp*delta;
    b.s.position.set(camera.position.x+b.cx+Math.cos(b.a)*b.r, b.y+Math.sin(b.a*2.3)*3.0,
                     camera.position.z+b.cz+Math.sin(b.a)*b.r);
    b.s.material.opacity = 0.75*(1-dn.nightAmount);
    b.s.visible = dn.nightAmount<0.85;
  }
  // the turkey vulture: on a thermal for a couple of minutes, then gone
  if(VULTURE){
    const V=VULTURE, day=1-dn.nightAmount;
    V.t-=delta;
    if(V.t<=0){
      V.on=!V.on;
      if(V.on){
        V.t=70+Math.random()*90; V.r=80+Math.random()*70; V.y=110+Math.random()*70;
        V.sp=(0.055+Math.random()*0.045)*(Math.random()<0.5?-1:1);
        V.a=Math.random()*6.28;
        V.cx=camera.position.x+(Math.random()-0.5)*260;
        V.cz=camera.position.z+(Math.random()-0.5)*260;
        V.drift=Math.random()*6.28;
      } else V.t=90+Math.random()*160;
    }
    const want=(V.on && day>0.35) ? 1 : 0;
    V.fade += (want-V.fade)*Math.min(1, delta*0.45);
    if(V.fade>0.004){
      V.a += V.sp*delta; V.drift += delta*0.11;
      const rr2=V.r*(1+Math.sin(V.drift*0.7)*0.16);
      const vx=V.cx+Math.cos(V.drift*0.3)*40+Math.cos(V.a)*rr2;
      const vz=V.cz+Math.sin(V.drift*0.4)*40+Math.sin(V.a)*rr2;
      const vy=V.y+Math.sin(V.drift*0.5)*18;
      V.s.position.set(vx, vy, vz);
      const view2=Math.atan2(vx-camera.position.x, vz-camera.position.z);
      const head2=V.a+(V.sp>0?Math.PI/2:-Math.PI/2);
      const side=Math.abs(Math.sin(head2-view2));
      const teeter=1+Math.sin(V.drift*2.3)*0.10;
      V.s.scale.set(16*(0.22+0.78*side)*teeter, 16*0.5/(teeter*0.6+0.5), 1);
      V.s.material.opacity=0.80*V.fade*day;
      V.s.visible=true;
    } else V.s.visible=false;
  }
  // moths orbit whichever outdoor fixtures the light pool is driving
  for(let i=0;i<MOTHS.length;i++){
    const m=MOTHS[i], L=LIGHT_POOL[i%LIGHT_POOL.length];
    if(!L || !L.userData.mothy || L.intensity<0.02 || dark<0.25){ m.s.material.opacity=0; continue; }
    m.a += m.sp*delta;
    m.s.position.set(L.position.x + Math.cos(m.a)*m.r,
                     L.position.y - 0.18 + Math.sin(m.a*2.7+m.ph)*0.16,
                     L.position.z + Math.sin(m.a)*m.r);
    m.s.material.opacity = 0.75*Math.min(1,(dark-0.25)*3);
  }
  if(typeof updateGrounds==="function") updateGrounds(delta, now, dark);
  if(typeof updateLife==="function") updateLife(delta, now, dark, dn);
  if(typeof AUDIO!=="undefined") AUDIO.update(delta, dark);
  if(ANIM.length) tickAnim(now);

  if(driving && (droneMode || view==="plan")) showCar(driving);
  updateCarLights(dark, delta);
  updateHUD();
  drawPlan();

  if(view==="plan"){
    const half=70, aspect=innerWidth/innerHeight;
    ortho.left=-half*aspect; ortho.right=half*aspect; ortho.top=half; ortho.bottom=-half;
    ortho.position.set(player.pos.x, 260, player.pos.z+0.01);
    ortho.up.set(0,0,-1); ortho.lookAt(player.pos.x, 0, player.pos.z);
    ortho.updateProjectionMatrix();
    renderer.render(scene, ortho);
  }else{
    renderer.render(scene, camera);
  }
}
let _indoorMix=0;
const _INDOOR_BOUNCE=new THREE.Color(0x9c9a94);
requestAnimationFrame(frame);

// a handle for tooling: move the player, step the simulation, set the hour
window.REST={ player:player, doors:DOORS, dayNight:DayNight, keys:keys, renderer:renderer, scene:scene,
              camera:camera, forest:FOREST, terrain:Terrain, traffic:TRAFFIC, cars:CARS,
              go:(x,z,yaw,y,pitch)=>{ player.pos.set(x,0,z); if(yaw!==undefined) player.yaw=yaw;
                                 if(pitch!==undefined) player.pitch=pitch;
                                 player.feetY=surfaceY(x,z, y===undefined?0:y); },
              sim:n=>{ for(let i=0;i<n;i++){ fixedUpdate(1/60); updateDoors(1/60); } },
              hour:h=>DayNight.setHour(h), pause:p=>{ DayNight.state.paused=p!==false; },
              start:begin, season:a=>{ const h=DayNight.state.hour; FOREST.setSeason(a); DayNight.setHour(h); }, seats:SEATS, uses:USES,
              cols:COL, colsDyn:COL_DYN, zoneAt:zoneAt, surf:surfaceY, probe:blocked,
              drone:setDrone, droneSet:(x,y,z,yaw,pitch)=>{ dronePos.set(x,y,z); droneVel.set(0,0,0);
                 droneYaw=yaw; if(pitch!==undefined) dronePitch=pitch; dronePrev.copy(dronePos);
                 droneShown.copy(dronePos); droneLook.copy(dronePos);
                 camera.position.set(x-Math.sin(yaw)*4, y+3, z-Math.cos(yaw)*4); },
              enterCar:enterCar, exitCar:exitCar, nearestCar:nearestCar, sit:sitToggle,
              wind:Wind, view:(v)=>{ view=v; }, torch:()=>{ torchOn=!torchOn; },
              stepTraffic:(dt,n)=>{ for(let i=0;i<(n||1);i++) updateTraffic(dt, DayNight.state.dark); } };

addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight; applyFov();
  renderer.setSize(innerWidth,innerHeight);
});
