"use strict";
/* REST AREA · 11-driving.js
   rigid body, four springs, bicycle handling model
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   11 · DRIVING — rigid body, four springs, and a bicycle handling model
   Adapted from the Project 76 vehicle engine. The split it draws is the
   useful one: the suspension owns everything vertical (gravity, spring,
   damper, and therefore pitch and roll, because a force applied AT a wheel
   is a torque about the centre of mass), and the handling model owns
   everything planar (traction, drag, lateral grip, yaw). The two never
   argue because the handling model never touches Y.
   The one thing it leaves to the game is the ground, which here is
   surfaceY() — the same function the player walks on, so a car drives up
   onto the lot slabs and the forecourt rather than through them.

   What the handling model is (CARC and GRIP, 10, are its numbers):
   * TYRES. Each axle holds a share of the car's weight, and what it can
     push sideways with is that weight times the grip of what it stands on:
     paving, gravel or grass (15's GROUND_KIND), less on a wet day. The push
     builds with the slip angle, peaks at about fourteen degrees and falls
     off a little past it, so a car that is pushed too hard slides and can
     be caught, where it used to hold 2.6 g and then hold nothing. Braking
     and hard throttle use up some of the same grip.
   * WEIGHT MOVES. Braking loads the front axle and unloads the rear,
     throttle the other way; and the same forces lean the body on its
     springs: it dips under the brakes, sits back under power and rolls in
     a bend, because they are fed to the springs as a torque.
   * STEERING. Full lock at walking pace is a tight circle for the lots; as
     the speed rises full lock becomes whatever asks the tyres for a little
     more than they have at that speed, so at seventy the wheel still turns
     the car and never spins it. (It used to fade to nothing at 90 mph.)
   * ENGINE. All its push off the line, then as much as its power gives:
     sixty in about six and a half seconds and a hundred flat out. Lift off
     and it slows on the engine. S brakes, and backs up once you have
     stopped; W does the same going the other way. SPACE locks the rear
     wheels: they brake, and let go sideways.
   * NOT ALL FOUR WHEELS. With one wheel over a kerb or a crest the other
     three still steer and drive; each axle does what its grounded wheels
     can.
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
    const up=b.up(), x=this.worldPos.x, z=this.worldPos.z;
    // what it stands on, and how rough that is: grass is never level under a wheel
    const kind=this.kind=GROUND_KIND.at(x, z), rough=GRIP[kind].rough;
    let gy=surfaceY(x, z, this.worldPos.y);
    if(rough>0) gy+=rough*Math.sin(x*1.7+z*0.9)*Math.sin(z*2.1-x*0.6);
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
      // a spring pushes and never pulls (over a crest the wheel hangs, it does not hold the car down); and with
      // the travel all but used up it is on the bump stop, three times as stiff
      let f=CARC.springK*disp - CARC.damping*sv;
      const stop=disp-(CARC.restLength-0.05); if(stop>0) f+=CARC.springK*3*stop;
      if(f<0) f=0;
      this._f.copy(up).multiplyScalar(f);
      // applied AT the wheel: a difference front to back or side to side is
      // what makes the body pitch and roll, with no extra code for either
      b.addForceAtPosition(this._f, this.worldPos);
    }
    this.len=len;
    this.groundY=gy;
  }
}
const _hF=_cv(), _hR=_cv(), _hU=_cv();
class Vehicle{
  // spec: the car's own (04b): where its axles and wheels are, how long and wide its shell is
  constructor(spec){
    this.body=new CarBody(CARC.mass, _cv(2.0,1.0,4.3));
    const S=spec||{track:0.88, axles:[1.56,-1.56], hw:0.95, nose:2.1, tail:-2.1, wr:CARC.wheelRadius};
    const FX=S.track, ZF=S.axles[0], ZR=S.axles[1];
    this.wheels=[ new CarWheel(this.body,_cv(-FX,CAR_WHEEL_Y, ZF),true),
                  new CarWheel(this.body,_cv( FX,CAR_WHEEL_Y, ZF),true),
                  new CarWheel(this.body,_cv(-FX,CAR_WHEEL_Y, ZR),false),
                  new CarWheel(this.body,_cv( FX,CAR_WHEEL_Y, ZR),false) ];
    this.b=ZF; this.c=-ZR; this.wr=S.wr||CARC.wheelRadius;
    // the shell, as points round it: ten rather than six, so a post cannot slip between two of them
    const hw=S.hw+0.02, n=S.nose-0.25, t=S.tail+0.25;
    this.pts=[[0,n],[0,t],[-hw,n-0.25],[hw,n-0.25],[-hw,t+0.25],[hw,t+0.25],
              [-hw-0.05,n*0.36],[hw+0.05,n*0.36],[-hw-0.05,t*0.36],[hw+0.05,t*0.36]];
    this.throttle=0; this.brake=0; this.steer=0; this.ebrake=false;
    this._steer=0; this.steerAngle=0; this.speed=0; this.vf=0; this.accelLong=0; this.accelLat=0;
    this.allGrounded=false; this.anyGrounded=false;
    this.airPitch=0; this.airRoll=0;
    this.slide=0;                    // how far past their grip the tyres are, 0 to 1 (the squeal, 20)
    this.mu=1; this.kind=1;          // what it is standing on
    this.hit=0;                      // the speed of the last knock against something solid, fading (20)
    // exactly one step of history, for drawing between two of them
    this.prevPos=_cv().copy(this.body.position);
    this.prevQuat=new T.Quaternion();
    this.prevLen=[CARC.restLength,CARC.restLength,CARC.restLength,CARC.restLength];
    this.prevSteer=0;
  }
  // a tyre's push for its slip angle, as a share of the weight on it times its grip: up to a peak, then a little less
  static tyre(a){ const B=CARC.stiff/CARC.shape; return Math.sin(CARC.shape*Math.atan(B*a)); }
  handling(dt){
    const b=this.body, W=this.wheels, C=CARC;
    const nF=(W[0].grounded?1:0)+(W[1].grounded?1:0), nR=(W[2].grounded?1:0)+(W[3].grounded?1:0), n=nF+nR;
    const fwd=_hF.copy(b.forward()), rgt=_hR.copy(b.right()), up=_hU.copy(b.up());
    let vf=b.velocity.dot(fwd), vl=b.velocity.dot(rgt);
    let speed=Math.hypot(vf,vl);
    this.speed=speed; this.vf=vf;
    // full lock: all of it at walking pace, then what asks the tyres for a little more than they have
    const lock=Math.min(C.maxSteer, C.steerOver*Math.atan((this.b+this.c)*C.mu*C.gravity/Math.max(speed*speed, 1)));
    this.steerAngle=this.steer*lock;
    if(n===0){ this.slide+=(0-this.slide)*Math.min(1, dt*6); return; }       // in the air the springs have it
    // what the grounded wheels stand on
    let mu=0, roll=0, kdrag=0, kind=0;
    for(let i=0;i<4;i++){ const w=W[i]; if(!w.grounded) continue; const G=GRIP[w.kind];
      mu+=G.mu*(1-G.wet*WEATHER.wet); roll+=G.roll; kdrag+=G.k; if(w.kind) kind=w.kind; }
    mu=mu/n*C.mu; roll/=n; kdrag/=n; this.mu=mu; this.kind=kind;
    if(Math.abs(this.throttle)<0.1 && speed<0.5){      // kill the creep
      b.velocity.x=0; b.velocity.z=0; vf=0; vl=0; speed=0;
      b.angularVel.addScaledVector(up, -b.angularVel.dot(up));
    }
    const m=C.mass, g=C.gravity, L=this.b+this.c;
    // the weight on each axle: its share at rest, moved by how hard the car is pulling or stopping
    const shift=clamp(this.accelLong*C.cgH/L, -0.3*g, 0.3*g)*m;
    const NF=Math.max(0, m*g*this.c/L - shift)*(nF/2), NR=Math.max(0, m*g*this.b/L + shift)*(nR/2);
    // ---- along the car: engine, brakes, drag ----
    const av=Math.abs(vf), dir=vf>=0 ? 1 : -1, share=n/4;
    let drive=0;
    if(this.throttle>0) drive=Math.min(C.driveForce, C.power/Math.max(av, 1))*this.throttle*(vf<-0.5 ? 0.6 : 1);
    else if(this.throttle<0) drive=C.revForce*this.throttle*clamp(1+vf/C.revSpeed, 0, 1);
    drive=clamp(drive, -mu*m*g*0.6, mu*m*g*0.6)*share;                   // (no more than the tyres can put down)
    let stop=0;
    if(av>0.01){
      stop =this.brake*C.brakeG*mu*m*g*share;
      if(this.ebrake) stop+=0.45*mu*NR;
      if(this.throttle===0 && !this.brake) stop+=(C.engineBrake+4*av)*share;
      stop+=(C.roll*roll+(C.rollK+kdrag)*av)*share;
    }
    const air=C.drag*vf*av;
    let dvf=(drive-air)/m*dt;
    // (what only ever slows it brings it to rest and no further)
    const ds=stop/m*dt; if(ds>0){ const v1=vf+dvf; dvf+= Math.abs(v1)<=ds ? -v1 : -Math.sign(v1)*ds; }
    // ---- across it: the tyres ----
    const yawRate=b.angularVel.dot(up);
    // grip already spent along the car is not there to turn it with
    const used=Math.min(1, (Math.abs(drive)+this.brake*C.brakeG*mu*m*g*share)/Math.max(1, mu*m*g));
    const circ=Math.sqrt(1-0.55*used*used);
    const vref=Math.max(av, 2.5);                       // (below a walk the angle is taken as at a walk: no shudder at rest)
    // how fast each end is going sideways across its own wheels: the front's are turned, so rolling where they
    // point is no slip at all (and that holds backing up, when the nose swings the other way)
    const latVF=vl+yawRate*this.b-vf*Math.tan(this.steerAngle), latVR=vl-yawRate*this.c;
    const aF=Math.atan2(latVF, vref), aR=Math.atan2(latVR, vref);
    let latF=-mu*NF*circ*Vehicle.tyre(aF);
    let latR=-mu*NR*circ*C.rearBias*(this.ebrake ? 0.42 : 1)*Vehicle.tyre(aR);
    // (and never more in a step than would stop that end's sideways drift dead: it damps, it does not bounce)
    const capF=Math.abs(latVF)*(m*this.c/L)/dt*0.6, capR=Math.abs(latVR)*(m*this.b/L)/dt*0.6;
    latF=clamp(latF, -capF, capF); latR=clamp(latR, -capR, capR);
    // front and rear tyre forces act at different distances from the centre
    // of mass, and that difference is the yaw
    const IZ=m*(this.b*this.c)*1.05;
    b.angularVel.addScaledVector(up, (this.b*latF - this.c*latR)/IZ*dt);
    const dvl=(latF+latR)/m*dt;
    b.velocity.addScaledVector(fwd, dvf);
    b.velocity.addScaledVector(rgt, dvl);
    // ---- and the body leans on its springs with it ----
    const k=Math.min(1, dt*14);
    this.accelLong+=(dvf/dt-this.accelLong)*k; this.accelLat+=(dvl/dt-this.accelLat)*k;
    if(n===4){
      b._torque.addScaledVector(rgt, -m*clamp(this.accelLong, -12, 12)*C.cgH*1.6);
      b._torque.addScaledVector(fwd,  m*clamp(this.accelLat,  -12, 12)*C.cgH);
    }
    // how far past their grip the tyres are: the squeal, and the dust
    const over=Math.max(Math.abs(aF), Math.abs(aR)*(this.ebrake ? 2.5 : 1));
    const want=speed>4 ? clamp((over-0.16)/0.22, 0, 1) : 0;
    this.slide+=(want-this.slide)*Math.min(1, dt*10);
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
    if(this.hit>0) this.hit=Math.max(0, this.hit-dt*30);
  }
}
/* A car is wider than a person, so it gets its own broad-phase rather than
   borrowing blocked(); and it slides along a wall on the axis that is still
   clear, the same way walking does. */
// The points round the shell are the car's own (Vehicle.pts, from its spec), and every query goes through the
// collider grid.
function carHits(px,pz,yaw,lo,hi,skip,pts){
  const cy=Math.cos(yaw), sy=Math.sin(yaw);
  for(let k=0;k<pts.length;k++){
    const p=pts[k];
    const x=px+p[0]*cy+p[1]*sy, z=pz-p[0]*sy+p[1]*cy;
    if(hitsAny(colsNear(x,z), x,z,0.12,lo,hi,skip) ||
       hitsAny(COL_BIG,       x,z,0.12,lo,hi,skip) ||
       hitsAny(COL_DYN,       x,z,0.12,lo,hi,skip) ||
       hitsAny(COL_TRAF,      x,z,0.12,lo,hi,skip)) return true;
  }
  return false;
}
const _carP=new T.Vector3(), _carQ0=new T.Quaternion();
// Heading about Y from a quaternion. The denominator is 1-2(y^2+z^2): with
// x^2 in place of z^2 it happens to agree for a car sitting flat and drifts
// as soon as the body pitches or rolls, which is exactly when it is used.
const carYaw=q=>Math.atan2(2*(q.w*q.y+q.x*q.z), 1-2*(q.y*q.y+q.z*q.z));
function updateCars(dt){
  const car=driving; if(!car) return;
  const v=car.veh, b=v.body;
  // ---- input ----
  // W goes forward and S back; whichever is against the way the car is rolling is the brake first
  const fwd=keys.KeyW||keys.ArrowUp, rev=keys.KeyS||keys.ArrowDown;
  const vfwd=b.velocity.dot(b.forward());
  let th=0, br=0;
  if(fwd){ if(vfwd<-0.8) br=1; else th=1; }
  if(rev){ if(vfwd>0.8) br=1; else if(!fwd) th=-1; }
  v.throttle += (th-v.throttle)*(th===0 ? 1 : 0.22);        // (the pedal goes down over a moment, and comes up at once)
  v.brake=br;
  const want=(keys.KeyA||keys.ArrowLeft?1:0)-(keys.KeyD||keys.ArrowRight?1:0);
  // smoothed, not snapped: quick in the lot, steadier the faster it is going, and quicker back to centre than off it
  v._steer += (want-v._steer)*(want===0 ? 0.20 : lerp(0.18, 0.085, clamp(v.speed/32, 0, 1)));
  v.steer=v._steer;
  v.ebrake=!!keys.Space;
  v.airPitch=(fwd?1:0)-(rev?1:0);               // attitude while airborne
  v.airRoll=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
  // ---- integrate, then push back out of anything solid ----
  const px=b.position.x, pz=b.position.z;
  _carQ0.copy(b.quaternion);
  v.step(dt);
  let yaw=carYaw(b.quaternion);
  const lo=b.position.y-CAR_RIDE+0.25, hi=b.position.y-CAR_RIDE+1.45, P=v.pts;
  /* Each axis on its own, so a wall met at a slant is slid along. What is lost is the speed INTO the wall (given
     back a little, the other way) and a share of the speed along it that grows with how square the hit was: a
     scrape down a guardrail costs a little, a post met head on stops the car. */
  let knock=0;
  if(carHits(b.position.x, pz, yaw, lo, hi, car.col, P)){
    knock=Math.max(knock, Math.abs(b.velocity.x));
    b.position.x=px; b.velocity.z*=1-Math.min(0.5, Math.abs(b.velocity.x)*0.03); b.velocity.x*=-0.18;
  }
  if(carHits(b.position.x, b.position.z, yaw, lo, hi, car.col, P)){
    knock=Math.max(knock, Math.abs(b.velocity.z));
    b.position.z=pz; b.velocity.x*=1-Math.min(0.5, Math.abs(b.velocity.z)*0.03); b.velocity.z*=-0.18;
  }
  /* And the turn. With both axes put back the car is where it stood a step ago, where it was clear; if it is in
     something now, it is the swing of its own nose or tail that put it there. So the turn is put back too and its
     spin stopped: it used to stay wedged, every step undone, until the wheel was turned the other way. */
  if(knock>0 && carHits(b.position.x, b.position.z, yaw, lo, hi, car.col, P)){
    b.quaternion.copy(_carQ0); b.angularVel.y*=-0.2; yaw=carYaw(b.quaternion);
    if(carHits(b.position.x, b.position.z, yaw, lo, hi, car.col, P)){ b.position.x=px; b.position.z=pz; }
  }
  if(knock>v.hit) v.hit=knock;
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
    if(!carHits(tx, b.position.z, yaw, lo, hi, car.col, P)) b.position.x=tx;
  }
  car.spin += (b.velocity.dot(b.forward())/v.wr)*dt;
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
    m.position.y = CAR_WHEEL_Y-ln+v.wr;                       // (its tyre on the ground, whatever its size)
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
  c.veh=c.veh||new Vehicle(c.spec);
  const b=c.veh.body;
  b.position.set(c.g.position.x, c.g.position.y, c.g.position.z);
  b.quaternion.copy(c.g.quaternion);
  b.velocity.set(0,0,0); b.angularVel.set(0,0,0);
  c.veh._steer=0; c.veh.steer=0; c.veh.throttle=0; c.veh.brake=0; c.veh.accelLong=0; c.veh.accelLat=0; c.veh.slide=0; c.veh.hit=0;
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
  const S=c.spec, hw=S ? S.hw+0.08 : 1.03, hl=S ? S.len/2 : 2.28;
  const hx=Math.abs(Math.cos(yaw))*hw+Math.abs(Math.sin(yaw))*hl;
  const hz=Math.abs(Math.sin(yaw))*hw+Math.abs(Math.cos(yaw))*hl;
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
    // (a car's own cone: the boat (14p) widens and lengthens these two when they are its lights)
    if(on){ const L=carBeams[i]; L.angle=Math.PI/6; L.penumbra=0.55; L.distance=90; L.decay=1.5; }
  }
  LENS_MAT.opacity=0.80*k;
  TAIL_MAT.opacity=0.78*k;
  // out on the boat (14p) the two beams are its docking lights
  if(!driving && typeof BOAT!=="undefined" && BOAT.beams) BOAT.beams(dark, delta, carBeams);
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
