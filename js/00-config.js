"use strict";
/* REST AREA · 00-config.js
   scene config, the site plan, image slots
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* =========================================================================
   REST AREA — a first-person walkable Pennsylvania highway rest stop.
   Built on the Low Desert engine (hand-rolled, three.js r128, canvas-drawn
   textures, layered lighting, AABB colliders, fixed 1/60 timestep). The
   engine is the motel's; the content — the woods, the interstate, the
   brick pavilion, the substation in the trees — is this world's own.
   ========================================================================= */

/* ----------------------------------------------------------------------
   0 · SCENE CONFIG
   World: metres; +y up; +x east; +z SOUTH (yaw 0 looks down -z, which the
   compass calls north). I-79 runs north-south along z, west of the site.
   ---------------------------------------------------------------------- */
const NEXT_SCENE_URL = null;
// in the car lot, a few stalls south of the walk, looking across the lot
// at the pavilion with the woods behind it — the view in the photographs
const SPAWN   = { x: -36.2, z: 24.0, yaw: -0.98 };
const EYE     = 1.66;
const PLAYER_R= 0.34;

/* ----------------------------------------------------------------------
   THE SITE PLAN, taken off the overhead at about 5.3 px a metre.
   Read west to east: the northbound carriageway, a mown strip, the truck
   lot with its angled stalls, a planted island, the car lot, the walk, the
   plaza and the pavilion, then lawn and the picnic grove running back to
   the trees. Everything is flat at y = 0 inside the pad; the woods rise
   away from it on every side.
   ---------------------------------------------------------------------- */
const HWY = {
  nb:-112,          // northbound centre line (traffic runs toward -z)
  sb:-158,          // southbound centre line, beyond a wooded median
  lane:3.65,        // two lanes each way
  shR:3.0,          // right (outside) shoulder
  shL:1.2,          // left (median) shoulder
  len:3600,         // drawn length, well past the far haze
  wrap:1560,        // traffic wraps here
  flat:560,         // the road is level at y = 0 for |z| < flat
};
const SITE = {
  truck: {x0:-90, x1:-60,  z0:-150, z1:108},   // the truck lot
  island:{x0:-60, x1:-46,  z0:-128, z1:84},    // planted median between the lots
  car:   {x0:-46, x1:-26,  z0:-150, z1:108},   // the car lot (stalls -104..60)
  walk:  {x0:-26, x1:-21.5,z0:-108, z1:74},    // raised walk along the car lot
  plaza: {x0:-21.5,x1:-6.0,z0:-19,  z1:19},    // in front of the pavilion
  pad:   {x0:-98, x1:34,   z0:-162, z1:118},   // graded flat at y = 0
  sub:   {x0:60,  x1:90,   z0:-184, z1:-154, y:2.6},   // the substation compound
  // everything inside here is real, walkable, instanced woods; outside it
  // the forest is a canopy seen from the road and the air
  zone:  {x0:-240, x1:176, z0:-328, z1:248},
};
// the car-lot aisle, and the stall rows either side of it
const CARLOT = { aisle0:-40.5, aisle1:-32.0, stallZ0:-104, stallZ1:60, stallW:2.75 };
// the truck lot: an aisle down the east side, stalls angled off it
const TRUCKLOT = { aisle0:-70, aisle1:-60, stallZ0:-138, stallZ1:94, angle:0.52, pitch:8.4 };

/* ----------------------------------------------------------------------
   0b · IMAGE SLOTS
   Printed surfaces are drawn on canvases at build time. Any slot can be
   replaced by a hosted picture: put a URL against the key and it is loaded
   at run time, if the host allows cross-origin reads, with the canvas art
   as the fallback. Each slot has a FIXED aspect ratio (w:h).
     brochure  4:9   the rack in the lobby
     poster    3:4   the bulletin board's notices
     map       3:2   the framed state map
     vend      1:2   vending machine fronts
   ---------------------------------------------------------------------- */
const SLOT = { brochure:[4,9], poster:[3,4], map:[3,2], vend:[1,2], tv:[4,3] };
const IMAGE_PROXY="";
const IMAGES = {};
