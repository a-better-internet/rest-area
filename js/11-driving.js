"use strict";
/* REST AREA · 11-driving.js
   rigid body, four springs, bicycle handling model
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   10b · DRIVING — rigid body, four springs, and a bicycle handling model
   Adapted from the Project 76 vehicle engine. The split it draws is the
   useful one: the suspension owns everything vertical (gravity, spring,
   damper, and therefore pitch and roll, because a force applied AT a wheel
   is a torque about the centre of mass), and the handling model owns
   everything planar (traction, drag, lateral grip, yaw). The two never
   argue because the handling model never touches Y.
   The one thing it leaves to the game is the ground, which here is
   surfaceY() — the same function the player walks on, so a car drives up
   onto the lot slabs and the forecourt rather than through them.
   ---------------------------------------------------------------------- */
const _cv=(x,y,z)=>new T.Vector3(x||0,y||0,z||0);
// scratch for the airborne solver, so a jump allocates nothing either
const _airA=_cv(), _airB=_cv(), _airC=_cv(), _WUP=_cv(0,1,0);
const _GRAV=_cv(0, -CARC.gravity*CARC.mass, 0);
class CarBody{
  constructor(mass,size){
    this.mass=mass; this.invMass=1/mass;
    this.position=_cv(); this.velocity=_cv();
    this.quaternion=new T.Quaternion();
    this.angularVel=_cv();                       // world space
    const w=size.x,h=size.y,l=size.z,m=mass;
    this.invInertiaLocal=_cv(1/((1/12)*m*(h*h+l*l)), 1/((1/12)*m*(w*w+l*l)),
                             1/((1/12)*m*(w*w+h*h)*1.4));   // roll stiffened
    this._force=_cv(); this._torque=_cv();
    this._t1=_cv(); this._t2=_cv(); this._t3=_cv();
    /* up(), forward() and right() are read a dozen times a step between the
       four wheels, the handling model and the lights, and each one used to
       hand back a fresh Vector3 — about fourteen hundred throwaway objects a
       second while you drive. They each own one vector now and recompute it
       in place. They are DIFFERENT vectors, so the usual
       `const f=b.forward(), r=b.right()` still works; what is no longer safe
       is holding a result across a later call to the SAME accessor. */
    this._axU=_cv(); this._axF=_cv(); this._axR=_cv();
    this._dq=new T.Quaternion();
  }
  addForce(f){ this._force.add(f); }
  addForceAtPosition(f,wp){
    this._force.add(f);
    this._torque.add(this._t1.copy(wp).sub(this.position).cross(f));
  }
  worldInvInertia(v,out){
    const iq=this._q0||(this._q0=new T.Quaternion());
    iq.copy(this.quaternion).invert();
    return out.copy(v).applyQuaternion(iq).multiply(this.invInertiaLocal)
              .applyQuaternion(this.quaternion);
  }
  integrate(dt){
    this.velocity.addScaledVector(this._force, this.invMass*dt);
    const sp=this.velocity.length();
    if(sp>140) this.velocity.multiplyScalar(140/sp);
    this.position.addScaledVector(this.velocity, dt);
    const aa=this.worldInvInertia(this._torque, this._t2);
    this.angularVel.addScaledVector(aa, dt);
    const as=this.angularVel.length();
    if(as>14) this.angularVel.multiplyScalar(14/as);
    const w=this.angularVel, q=this.quaternion;
    const dq=this._dq.set(w.x*dt*0.5, w.y*dt*0.5, w.z*dt*0.5, 0).multiply(q);
    q.set(q.x+dq.x, q.y+dq.y, q.z+dq.z, q.w+dq.w).normalize();
    this._force.set(0,0,0); this._torque.set(0,0,0);
  }
  up(){ return this._axU.set(0,1,0).applyQuaternion(this.quaternion); }
  forward(){ return this._axF.set(0,0,1).applyQuaternion(this.quaternion); }
  right(){ return this._axR.set(1,0,0).applyQuaternion(this.quaternion); }
}
class CarWheel{
  constructor(body, local, steers){
    this.body=body; this.local=local.clone(); this.steers=steers;
    this.grounded=false; this.len=CARC.restLength; this.worldPos=_cv();
    this._r=_cv(); this._pv=_cv(); this._f=_cv(); this._w=_cv();
  }
  update(dt){
    const b=this.body;
    this.worldPos.copy(this.local).applyQuaternion(b.quaternion).add(b.position);
    const up=b.up();
    const gy=surfaceY(this.worldPos.x, this.worldPos.z, this.worldPos.y);
    const clearance=this.worldPos.y-gy;
    const maxLen=CARC.restLength+CARC.wheelRadius;
    let len=maxLen;
    if(clearance<=maxLen){ this.grounded=true; len=Math.max(0, clearance); }
    else this.grounded=false;
    // push the wheel up and the spring shortens, so displacement grows
    const disp=CARC.restLength-(len-CARC.wheelRadius);
    if(this.grounded){
      this._r.copy(this.worldPos).sub(b.position);
      this._pv.copy(b.velocity).add(this._w.copy(b.angularVel).cross(this._r));
      const sv=up.dot(this._pv);
      this._f.copy(up).multiplyScalar(CARC.springK*disp - CARC.damping*sv);
      // applied AT the wheel: a difference front to back or side to side is
      // what makes the body pitch and roll, with no extra code for either
      b.addForceAtPosition(this._f, this.worldPos);
    }
    this.len=len;
    this.groundY=gy;
  }
}
class Vehicle{
  constructor(){
    this.body=new CarBody(CARC.mass, _cv(2.0,1.0,4.3));
    const FX=0.90*0.98, FZ=1.56;
    this.wheels=[ new CarWheel(this.body,_cv(-FX,CAR_WHEEL_Y, FZ),true),
                  new CarWheel(this.body,_cv( FX,CAR_WHEEL_Y, FZ),true),
                  new CarWheel(this.body,_cv(-FX,CAR_WHEEL_Y,-FZ),false),
                  new CarWheel(this.body,_cv( FX,CAR_WHEEL_Y,-FZ),false) ];
    this.b=FZ; this.c=FZ;
    this.throttle=0; this.brake=0; this.steer=0; this.ebrake=false;
    this._steer=0; this.steerAngle=0; this.speed=0; this.accelLong=0;
    this.allGrounded=false; this.anyGrounded=false;
    this.airPitch=0; this.airRoll=0;
    // exactly one step of history, for drawing between two of them
    this.prevPos=_cv().copy(this.body.position);
    this.prevQuat=new T.Quaternion();
    this.prevLen=[CARC.restLength,CARC.restLength,CARC.restLength,CARC.restLength];
    this.prevSteer=0;
  }
  handling(dt){
    const b=this.body;
    if(!this.allGrounded) return;              // in the air the springs have it
    const fwd=b.forward(), rgt=b.right(), up=b.up();
    let vf=b.velocity.dot(fwd), vl=b.velocity.dot(rgt);
    let speed=Math.hypot(vf,vl);
    // steering washes out with speed, or it is undriveable above walking pace
    const sb=Math.min(speed, CARC.steerSpeedBias);
    this.steerAngle=this.steer*(1-sb/CARC.steerSpeedBias)*CARC.maxSteer;
    if(Math.abs(this.throttle)<0.1 && speed<0.5){      // kill the creep
      b.velocity.x=0; b.velocity.z=0; vf=0; vl=0; speed=0;
      b.angularVel.addScaledVector(up, -b.angularVel.dot(up));
    }
    if(speed<1e-5) this.steerAngle=0;
    const yawRate=b.angularVel.dot(up);
    let rot=0, slip=0;
    if(speed>0.5){
      rot =Math.atan2(yawRate, Math.abs(vf)||0.001);
      slip=Math.atan2(vl,      Math.abs(vf)||0.001);
    }
    const sF=slip+rot-this.steerAngle, sR=slip-rot;
    const axle=CARC.mass*CARC.gravity*0.5;
    const cl=(v,a,z)=>Math.max(a,Math.min(z,v));
    let latF=cl(CARC.corneringFront*sF, -CARC.maxGrip, CARC.maxGrip)*axle;
    let latR=cl(CARC.corneringRear *sR, -CARC.maxGrip, CARC.maxGrip)*axle;
    if(this.ebrake) latR*=0.5;                 // the whole of "the back steps out"
    let trac=CARC.engineForce*this.throttle;
    if(speed>0 && this.brake>0)
      trac=-CARC.brakeConstant*this.brake*Math.sign(vf);
    const drag=-CARC.dragConstant*vf*Math.abs(vf);
    const roll=-CARC.rollingResist*vf;
    const latRoll=-CARC.rollingResist*vl;
    // front and rear tyre forces act at different distances from the centre
    // of mass, and that difference is the yaw
    b.angularVel.addScaledVector(up, (this.b*latF - this.c*latR)/CARC.mass*dt);
    const dvf=(trac+drag+roll)/CARC.mass*dt;
    const dvl=(latF+latR+latRoll)/CARC.mass*dt;
    b.velocity.addScaledVector(fwd, dvf);
    b.velocity.addScaledVector(rgt, dvl);
    this.accelLong=dvf/dt; this.speed=speed;
  }
  /* Airborne. With nothing acting on it, whatever spin the suspension
     imparted on the lip of a jump — and it is always some, because the
     front wheels unload before the rear — just keeps going, and the car
     tumbles end over end for the whole flight. Rush's answer, and it is the
     right one for a car that is meant to land and keep driving: split the
     spin into yaw and everything else, damp everything else hard, hold on
     to yaw, and run a damped torque that brings the roof back up. The
     result arcs rather than tumbles, and you can still adjust the attitude
     on the way down. */
  airborne(dt){
    const b=this.body, up=b.up();
    const spin=b.angularVel.dot(up);
    const yaw=_airA.copy(up).multiplyScalar(spin);
    const rest=_airB.copy(b.angularVel).sub(yaw);
    rest.multiplyScalar(Math.exp(-3.6*dt));      // pitch and roll bleed off fast
    yaw.multiplyScalar(Math.exp(-0.45*dt));      // a spin round the roof persists
    b.angularVel.copy(rest).add(yaw);
    // torque about (up x worldUp) is exactly what rolls the roof back up
    const ax=_airC.copy(up).cross(_WUP);
    const sn=ax.length();
    if(sn>1e-5){
      ax.multiplyScalar(1/sn);
      const ang=Math.atan2(sn, up.y);            // how far over it is
      b.angularVel.addScaledVector(ax, Math.min(ang,1.3)*4.6*dt);
    }
    // and a little attitude control, which is all Rush ever gave you
    b.angularVel.addScaledVector(b.right(),   this.airPitch*1.25*dt);
    b.angularVel.addScaledVector(b.forward(), -this.airRoll*1.25*dt);
    const cap=2.3;
    if(b.angularVel.length()>cap) b.angularVel.setLength(cap);
  }
  savePrev(){
    this.prevPos.copy(this.body.position);
    this.prevQuat.copy(this.body.quaternion);
    for(let i=0;i<4;i++) this.prevLen[i]=this.wheels[i].len;
    this.prevSteer=this.steerAngle;
  }
  step(dt){
    let n=0;
    for(const w of this.wheels){ w.update(dt); if(w.grounded) n++; }
    this.allGrounded = n===4;
    this.anyGrounded = n>0;
    this.body.addForce(_GRAV);                   // constant, so not rebuilt
    this.body.integrate(dt);
    this.handling(dt);
    if(!this.anyGrounded) this.airborne(dt);
    else if(n<4) this.body.angularVel.multiplyScalar(Math.exp(-1.2*dt));
  }
}
/* A car is wider than a person, so it gets its own broad-phase rather than
   borrowing blocked(); and it slides along a wall on the axis that is still
   clear, the same way walking does. */
// Ten points round the shell rather than six, so a post cannot slip between
// two of them, and every query goes through the collider grid.
const CAR_PTS=[[0,2.1],[0,-2.1],[-0.95,1.9],[0.95,1.9],[-0.95,-1.9],[0.95,-1.9],
               [-1.00,0.7],[1.00,0.7],[-1.00,-0.7],[1.00,-0.7]];
function carHits(px,pz,yaw,lo,hi,skip){
  const cy=Math.cos(yaw), sy=Math.sin(yaw);
  for(let k=0;k<CAR_PTS.length;k++){
    const p=CAR_PTS[k];
    const x=px+p[0]*cy+p[1]*sy, z=pz-p[0]*sy+p[1]*cy;
    if(hitsAny(colsNear(x,z), x,z,0.12,lo,hi,skip) ||
       hitsAny(COL_BIG,       x,z,0.12,lo,hi,skip) ||
       hitsAny(COL_DYN,       x,z,0.12,lo,hi,skip) ||
       hitsAny(COL_TRAF,      x,z,0.12,lo,hi,skip)) return true;
  }
  return false;
}
const _carP=new T.Vector3();
// Heading about Y from a quaternion. The denominator is 1-2(y^2+z^2): with
// x^2 in place of z^2 it happens to agree for a car sitting flat and drifts
// as soon as the body pitches or rolls, which is exactly when it is used.
const carYaw=q=>Math.atan2(2*(q.w*q.y+q.x*q.z), 1-2*(q.y*q.y+q.z*q.z));
function updateCars(dt){
  const car=driving; if(!car) return;
  const v=car.veh, b=v.body;
  // ---- input ----
  const fwd=keys.KeyW||keys.ArrowUp, rev=keys.KeyS||keys.ArrowDown;
  const vfwd=b.velocity.dot(b.forward());
  let th=0, br=0;
  if(fwd) th=1;
  if(rev){ if(vfwd>0.8) br=1; else th=-0.55; }      // S brakes, then reverses
  v.throttle=th; v.brake=br;
  const want=(keys.KeyA||keys.ArrowLeft?1:0)-(keys.KeyD||keys.ArrowRight?1:0);
  v._steer += (want-v._steer)*0.18;                 // smoothed, not snapped
  v.steer=v._steer;
  v.ebrake=!!keys.Space;
  v.airPitch=(fwd?1:0)-(rev?1:0);               // attitude while airborne
  v.airRoll=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
  // ---- integrate, then push back out of anything solid ----
  const px=b.position.x, pz=b.position.z;
  v.step(dt);
  const yaw=carYaw(b.quaternion);
  const lo=b.position.y-CAR_RIDE+0.25, hi=b.position.y-CAR_RIDE+1.45;
  if(carHits(b.position.x, pz, yaw, lo, hi, car.col)){
    b.position.x=px; b.velocity.x*=-0.18;
  }
  if(carHits(b.position.x, b.position.z, yaw, lo, hi, car.col)){
    b.position.z=pz; b.velocity.z*=-0.18;
  }
  // A heightfield sampled straight down cannot catch a slope that arrives
  // faster than the spring can react: at 38 m/s the car covers two thirds of
  // a metre a step, and a hillside can be well above the wheel before any
  // force is applied. Once that happens the spring is pushing up from inside
  // the mountain and it never gets out. So after every step, lift the body
  // clear of the deepest wheel that has gone under.
  let pen=0;
  for(const w of v.wheels){
    _carP.copy(w.local).applyQuaternion(b.quaternion).add(b.position);
    pen=Math.max(pen, surfaceY(_carP.x,_carP.z,_carP.y)+CARC.wheelRadius*0.4-_carP.y);
  }
  if(pen>0){
    b.position.y += Math.min(pen, 4.0*dt*60);
    if(b.velocity.y<0) b.velocity.y=0;
  }
  /* Being blocked by the traffic is not the same as being hit by it. The
     axis revert above holds the car still while a truck doing thirty sweeps
     its box across it, which reads as sticking rather than as a collision.
     So an actual overlap also lands one impulse — down the road the way the
     thing was going, plus a shove off the centre line and a little spin —
     and then that vehicle is marked until it is clear again, or it would
     hand out the same impulse sixty times a second. */
  const cy0=b.position.y-CAR_RIDE;
  for(let i=0;i<TRAFFIC.length;i++){
    const tv=TRAFFIC[i], c=tv.col;
    const over = b.position.x>c.x0-1.2 && b.position.x<c.x1+1.2 &&
                 b.position.z>c.z0-1.4 && b.position.z<c.z1+1.4 &&
                 cy0+1.4>c.y0 && cy0<c.y1;
    if(!over){ tv.struck=false; continue; }
    if(tv.struck) continue;
    tv.struck=true;
    // the interstate runs along z here, so "down the road" is z and the
    // shove off the centre line is x
    const heavy=(tv.big?1.9:1.0);
    const off=b.position.x-(c.x0+c.x1)/2;
    const hit=Math.min(1.4, b.velocity.length()/24);
    b.velocity.z += tv.dir*tv.speed*0.30*heavy;
    b.velocity.x += (off>=0?1:-1)*(3.2+2.6*heavy);
    b.velocity.y += 1.1;
    b.angularVel.y += -(off>=0?1:-1)*tv.dir*1.5;
    /* AND IT GOES BOTH WAYS: the struck vehicle runs wide, away from the
       side you came in on, and loses a little speed; updateTraffic springs
       it back into its lane and points it down its own velocity. */
    tv.swayV += (off>=0 ? -1 : 1)*(5.2*hit)/heavy;
    tv.slow   = Math.max(0.46, tv.slow - 0.30*hit/heavy);
    const sp=b.velocity.length();
    if(sp>44) b.velocity.multiplyScalar(44/sp);
    const tx=(off>=0 ? c.x1+2.6 : c.x0-2.6);
    if(!carHits(tx, b.position.z, yaw, lo, hi, car.col)) b.position.x=tx;
  }
  car.spin += (b.velocity.dot(b.forward())/CARC.wheelRadius)*dt;
}
/* Put the shell where the physics says it is. Parked cars never come through
   here — they keep the transform they were built with. */
const _shPos=new T.Vector3(), _shQ=new T.Quaternion();
function showCar(car){
  const v=car.veh, b=v.body, a=stepAlpha;
  // Drawn where it was a fraction of a step ago, not where the last fixed
  // step happened to leave it. Physics runs at 60 Hz whatever the display
  // does, so without this the car advances in visible increments.
  _shPos.lerpVectors(v.prevPos, b.position, a);
  car.g.position.copy(_shPos);
  _shQ.copy(v.prevQuat).slerp(b.quaternion, a);
  car.g.quaternion.copy(_shQ);
  const st=v.prevSteer+(v.steerAngle-v.prevSteer)*a;
  for(let i=0;i<4;i++){
    const w=v.wheels[i], m=car.wheels[i];
    const ln=v.prevLen[i]+(w.len-v.prevLen[i])*a;
    m.position.y = CAR_WHEEL_Y-(ln-CARC.wheelRadius);
    m.rotation.y = w.steers ? st : 0;
    m.rotation.x = car.spin;
  }
}
function nearestCar(){
  if(driving) return null;
  let best=null, bd=3.6;
  for(const c of CARS){
    const d=Math.hypot(player.pos.x-c.g.position.x, player.pos.z-c.g.position.z);
    if(d<bd && Math.abs(player.feetY-(c.g.position.y-CAR_RIDE))<2.2){ bd=d; best=c; }
  }
  return best;
}
function enterCar(c){
  if(seated) standUp();
  c.veh=c.veh||new Vehicle();
  const b=c.veh.body;
  b.position.set(c.g.position.x, c.g.position.y, c.g.position.z);
  b.quaternion.copy(c.g.quaternion);
  b.velocity.set(0,0,0); b.angularVel.set(0,0,0);
  c.veh._steer=0; c.veh.steer=0;
  c.col.y1=c.col.y0-1;                       // it cannot block itself
  c.veh.savePrev();
  driving=c; carCamYaw=0; carCamPitch=0.24; _carLook.set(0,0,0);
  toast("W A S D  ·  SPACE HANDBRAKE  ·  E TO GET OUT","#ffd48a");
}
function exitCar(){
  const c=driving; if(!c) return;
  driving=null;
  const b=c.veh.body;
  b.velocity.set(0,0,0); b.angularVel.set(0,0,0);
  c.veh.throttle=0; c.veh.brake=0;
  // step out on the driver's side, or wherever near it is actually standable
  // nearestFree hands back [x, z, y] or null — not an object
  const left=new T.Vector3(-1,0,0).applyQuaternion(b.quaternion);
  const gy0=b.position.y-CAR_RIDE;
  const gx=b.position.x+left.x*1.9, gz=b.position.z+left.z*1.9;
  /* Tight first, loose only if that finds nothing. Your eye height is a
     fixed distance over whatever you are standing on, so the only way to
     step out of a car and end up lower is to be PUT somewhere lower — and
     at the old blanket 1.3 m tolerance the first free spot it found beside
     a kerb or off the edge of the lot was often exactly that. */
  const sp=nearestFree(gx, gz, gy0, 4, 0.45)
        || nearestFree(b.position.x, b.position.z, gy0, 6, 0.45)
        || nearestFree(gx, gz, gy0, 7);
  if(sp){ player.pos.set(sp[0], 0, sp[1]); player.feetY=sp[2]; }
  else  { player.pos.set(gx, 0, gz);       player.feetY=surfaceY(gx, gz, gy0+0.5); }
  player.sit=0; player.bob=0;        // whatever you got in with, you get out standing
  const yaw=carYaw(b.quaternion);
  const hx=Math.abs(Math.cos(yaw))*1.03+Math.abs(Math.sin(yaw))*2.28;
  const hz=Math.abs(Math.sin(yaw))*1.03+Math.abs(Math.cos(yaw))*2.28;
  const gy=gy0;
  c.col.x0=b.position.x-hx; c.col.x1=b.position.x+hx;
  c.col.z0=b.position.z-hz; c.col.z1=b.position.z+hz;
  c.col.y0=gy; c.col.y1=gy+1.5;
}
/* Headlights. One spotlight and a target, made once and moved to whichever
   car you are in — a light per parked car would be seventeen lights for a
   renderer that runs seven. */
/* Two real projected beams, one per lamp, aimed at a common point well down
   the road so the cones converge the way a car's do. What they replaced was
   a single beam plus a pair of three-metre glow sprites, and the sprites
   were the problem: a headlamp is a small bright thing that throws a large
   dim thing, not a large bright thing. So the lamp itself is now a lens the
   size of a lamp, and all the size is in the beam. */
const carBeams=[0,1].map(()=>{
  // tungsten, not daylight: a sealed-beam lamp on a car of this age is
  // around 2800K, and 2.2 of it on asphalt two metres away blew the road
  // out to white every night
  const L=new T.SpotLight(0xffd68c, 0, 90, Math.PI/6, 0.55, 1.5);
  L.castShadow=false; L.target=new T.Object3D();
  scene.add(L); scene.add(L.target);
  return L;
});
/* The lens itself is amber and never fully opaque. At 0xfff0c8 and 0.92 it
   was a solid near-white rectangle — an unlit basic material with tone
   mapping off cannot go above white, so the only way to keep a headlamp
   warm is to not ask it to be brighter than one. */
const LENS_MAT=new T.MeshBasicMaterial({color:0xffcf82, transparent:true, opacity:0,
  depthWrite:false, fog:false, toneMapped:false});
const TAIL_MAT=new T.MeshBasicMaterial({color:0xff2a12, transparent:true, opacity:0,
  depthWrite:false, fog:false, toneMapped:false});
const carLamps=[], carTails=[];
for(let i=0;i<2;i++){
  const h=new T.Mesh(new T.PlaneGeometry(0.30,0.20), LENS_MAT);
  scene.add(h); carLamps.push(h);
  const t=new T.Mesh(new T.PlaneGeometry(0.34,0.15), TAIL_MAT);
  scene.add(t); carTails.push(t);
}
function updateCarLights(dark, delta){
  const on=!!driving && dark>0.12;
  const k=on ? Math.min(1,(dark-0.12)*3) : 0;
  for(let i=0;i<2;i++){
    carBeams[i].intensity=1.65*k;
    carLamps[i].visible=on; carTails[i].visible=on;
  }
  LENS_MAT.opacity=0.80*k;
  TAIL_MAT.opacity=0.78*k;
  if(!on) return;
  const b=driving.veh.body;
  const f=b.forward(), r=b.right(), u=b.up();
  // one aim point well down the road, so the two cones converge
  const tx=b.position.x+f.x*40-u.x*0.4, ty=b.position.y+f.y*40-u.y*0.4,
        tz=b.position.z+f.z*40-u.z*0.4;
  for(let i=0;i<2;i++){
    const q=(i?1:-1)*0.62;
    carBeams[i].position.set(b.position.x+f.x*2.35+r.x*q-u.x*0.2,
                             b.position.y+f.y*2.35+r.y*q-u.y*0.2,
                             b.position.z+f.z*2.35+r.z*q-u.z*0.2);
    carBeams[i].target.position.set(tx,ty,tz);
    // the lenses sit in the bodywork and face the way the car does
    carLamps[i].position.set(b.position.x+f.x*2.20+r.x*0.66*(i?1:-1)-u.x*0.16,
                             b.position.y+f.y*2.20+r.y*0.66*(i?1:-1)-u.y*0.16,
                             b.position.z+f.z*2.20+r.z*0.66*(i?1:-1)-u.z*0.16);
    carLamps[i].quaternion.copy(b.quaternion);
    carTails[i].position.set(b.position.x-f.x*2.20+r.x*0.68*(i?1:-1)-u.x*0.16,
                             b.position.y-f.y*2.20+r.y*0.68*(i?1:-1)-u.y*0.16,
                             b.position.z-f.z*2.20+r.z*0.68*(i?1:-1)-u.z*0.16);
    carTails[i].quaternion.copy(b.quaternion);
    carTails[i].rotateY(Math.PI);
  }
}
let carCamYaw=0, carCamPitch=0.24;
const _carTmp=new T.Vector3(), _carLook=new T.Vector3();
