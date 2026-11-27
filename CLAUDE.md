# Working on Rest Area

A walkable I-79 rest area in three.js r128. There is no build step. The
scripts in `js/` are classic scripts that share one global scope, and they
load in the order `index.html` lists them. A file can use anything defined
by a file before it, and nothing defined after it, at load time. The README
describes the world. The comment block at the top of each file describes
that file.

## Standing rules

These hold for everything already built and everything added from now on.

### 1. No two faces in one plane (no z-fighting)

The depth buffer cannot sort two faces that lie in the same plane. It draws
them as flicker, worst at a distance and at a grazing angle. So:

- **Nothing sits exactly on another surface.** Lift it clear by at least
  5 mm, more for anything seen from more than a few metres. Examples are a
  label on a box, a mat on a floor, a card on a table, or a chip on felt.
  Paper-thin things such as cards, decals and screens should be a real
  thickness or sit a real gap above the surface.
- **Thin baked boxes grow.** At bake, `01` grows every bucket box (`bx`, or
  a box `push`ed into a bucket) thinner than 19.5 cm by up to about 5 mm a
  side, so trim stands proud of the walls it meets. Anything on the face
  of one, such as a sign on its plate, needs at least 1 cm of clearance
  from the face as drawn, or the grown box swallows it. Boxes merged by hand
  (`mergeEntries`) are not grown.
- **Nothing is flush with the face it meets.** A trim piece, frame or
  baseboard either stands proud of the wall or stops short of it. When two
  boxes butt together, make one of them a few millimetres longer, or sink it
  into the other, so that no face of one lies in a face of the other. The
  frame code in `09` (`frameX` / `frameZ`) shows how this is done.
- **Stacked flat layers use polygon offset.** This covers paving over
  ground, paint over paving, a lot over a ramp, and a field over the plain.
  Each layer is one polygon-offset step stronger than the one under it, and
  sits a few centimetres above it. `08-site.js` sets out the ladder: terrain,
  road (-1), ramps and asphalt (-2), lots (-3), paint (-4). Sign faces use
  `signPanel` (02), which carries its own offset. Those buckets (`road`,
  `asphalt`, `gravelbed`, `lotpave`, `paint`, `mulch`) are for flat planes.
  Never use one for a box whose sides can be seen. The offset grows with
  how edge-on a face is, so a side face seen at a grazing angle jumps
  through walls metres in front of it. A raised bed or a strip of stone
  is a box in a plain bucket (14l's `kirk_gravel`).
- **Round walls seen from inside** need their inside faces. Turn a copy of
  the geometry inside out (the `inward` helper in `13c`), not a material set
  to DoubleSide that z-fights with the outside.
- **Wall liners share their corners.** `lineX` / `lineZ` cut every piece
  at every opening's sill and head, so two pieces meeting along a vertical
  edge share its corners. A corner of one partway along the other's edge
  leaves a hairline crack with the wall showing through.
- **Check new work with `tools/zfight.js`** over a box around it before you
  commit. It lists coplanar, overlapping, same-facing faces from different
  pieces. It cannot see faces inside one hand-merged mesh (a door leaf, a
  vehicle, a `mergeEntries` group), so space those by hand.

### 2. Underground is not on the day/night cycle

Anything built below ground keeps the same light at noon and at midnight.
The basement under the generator house, its corridor and the arcade are
examples, and so is anything dug later. For anything underground:

- If it is dug under the ground's surface, the terrain must not run
  through it. Hole the ring it is in, on that ring's lattice (`GEN_HOLE`,
  or `KIRK_RING` / `KIRK_HOLES` in 00, a 2 m patch let into the 8 m ground
  with holes over the chapel's hall and its outside stair). Fill whatever
  the hole leaves open with something solid. Also add a VOID (06) so that
  you stand on its floor and not on the ground above.
- Register the volume with `addBuried(x0,x1,z0,z1,y0,y1)` (06). While the
  camera is inside one, `19-loop` holds the sky, sun and ambient at the
  fixed `UNDER_LIGHT`, and the glow materials and lamps run as though it
  were night. A seventh argument, when it is not 0, holds that fill at a
  fraction of `UNDER_LIGHT` (12d's sub-basement uses 0.22, the stair down
  to it 0.5). An eighth tints it (12e's boiler hall is red).
- Give its lamps `under:true` (12b's `lamp()` does this). Under lamps run at
  full strength regardless of the hour. They are only considered while the
  camera is underground, and lamps above ground are dropped while it is.
- Do not tie underground light to `dark`, `DayNight` or the weather.

### 3. Sign text always fits, with padding

No lettering touches or runs past the edge of its board or its border.

- Draw sign text with `fitText` / `fitHwy` (02), not a bare `fillText`.
  These shrink the text until it fits inside 84% of the board's width and
  62% of its height. Give each line a `maxW` that also clears the sign's own
  border, about 0.8 of the board's width for a bordered sign.
- When several lines should match, size them together: measure each, take
  the smallest size any line needs, and draw them all at that size (the
  `xSign` builder in `08b` does this).
- Raw `fillText` is for things that are not signs, such as a screen's game
  graphics or scribbles. Even there, keep the text inside the canvas.
- **Check with `tools/signaudit.js`.** It reports every piece of canvas
  lettering that comes within 3% of its canvas's edge, and the line that
  drew it.

### 4. People face the way their seat faces

Anyone put down sitting (14q's crowd, mode `sit`) faces the way the seat
they sit on faces: a person turned by `yaw` faces (sin yaw, cos yaw), a seat
(`addSeat`) faces (−sin yaw, −cos yaw), so a person on a seat of yaw `s`
takes yaw `s + π`. Never sit anyone backwards on a bench or sideways on a
stool. **Check with `tools/sitters.js`**, which fails on anyone turned more
than 60° from the nearest seat under them, and lists sitters with no seat
at all (a bench with no `addSeat`) to look at by eye.

### 5. A pair of doors swings the same way

A double door is two `makeDoor`s, the second hung turned half round
(`ry + π`), which also turns which way it opens. So the second leaf takes
the opposite `opensIn` to the first, and both swing into the building
(14md's store doors, 14m's fireworks store).

## Building notes

- `runX` / `runZ` / `lineX` / `lineZ` (09) take one row of openings. A wall
  with windows on two storeys is built as one band per storey, each given
  only its own storey's openings (the farmhouse in `14k` does this).
  Otherwise the upstairs window's wall fills in the one below it.
- A doorway needs a walkable surface across the wall's thickness
  (`addFlat`), as well as on the floors either side of it.
- `FaceGeo().slab(pts, t)` treats `pts` as a face and builds the slab
  behind it. A flat or sloped one always hangs `t` below its points, so a
  roof's points are its top and its underside is `t` lower. A standing one
  (a gable, a cheek wall) is pushed back against its winding, that is,
  opposite to (b−a)×(c−a). Work out which side it lands on before placing
  anything against it.
- Things that lie on the ground everywhere (14y's leaves) are placed
  after everything that stands, and keep clear of colliders, floors and
  indoor zones. Anything you add before them is avoided automatically.
- The lawn is the terrain's own shader (04): a `grass` vertex attribute
  says how much is lawn and how much of that is mown in stripes. Grass is
  not modelled as separate blades or tufts.
- A ramp joins the interstate through `rampPave` (08). It paves the
  speed-change lane over the shoulder beside the through lane, lays the
  gore and the ramp's lines, and records a `MERGE_ZONES` entry that
  `interstateEdges` (called once, at the end of 08b) uses to dot the edge
  line and leave out the rumble strips. Give any new ramp a terrain
  grading and `siteDist` entry in 04 as the Edinboro ones have, and keep
  it inside the 2 m terrain rings.
- Close to, a car's glass is see-through (`VEH_GLASS_CAR`) onto the cabin
  `carParts` builds (04b). Anything added inside a car stands clear of the
  glass and the roof, and a truck's cab keeps the dark glass.
- The cows (14k) take the hide texture `COW_HIDE`. Its top-left corner is
  kept white, and parts in a flat colour take their uv from it.
- The sub-basement's walls (12d) are not placed by hand. They are worked
  out from its `RECTS` on a 20 cm grid: a wall wherever open floor meets
  rock, carried round outside corners and stopped at openings so no two
  faces meet. To add a hallway or a room down there, add a rectangle on
  the grid. The stair's own walls are built with it and left out of the
  grid.
- A roof with open sides (a canopy, a porch, a carport, a pavilion) is
  registered with `addRoof(x0,x1,z0,z1,top)` (06) so it keeps the rain off.
  Indoor zones do this on their own. The rain mask takes the 23 roofs
  nearest the camera each frame (16b), so there is no limit on how many
  there are.
- Rounded furniture and fittings use `rboxGeo(w,h,d,r,seg)` (01), a box
  with eased edges and box-projected UVs in metres, cached by size. The
  farmhouse's `RW` / `RF` / `RP` (14k) take a grain or a weave on it.
- Cars put down with `parked` (14k) or `parkCar` (10) are drivable
  anywhere, not only in the rest area's lot. Trucks are not.
- East of Edinboro's fields everything hangs off `EAST` (04). It sets out
  the road's clearing, the fireworks outlet's, the street and park, and
  the lake. `Terrain.lakeSD` is the signed distance to the lake's shore
  (negative over the water), and `EAST.wy` is the water's level. The ground
  there is its own 4 m ring (`RING_EAST`) and the canopy its own 8 m shell
  (`EAST.can`, 07). A drive or a lot mouth that the wires along the road
  must miss goes in `EAST.noPole` before 14y builds them.
- The street's houses are 14n's `house()`. It takes a footprint square to
  the street, the way the front faces, an eave height, a pitch and which
  way the ridge runs, and returns `win`, `door` and `fp` for placing
  things on its faces. The four kinds (`capeCod`, `ranch`, `bungalow`,
  `twoStorey`) are built on it. `house()` builds only the outside: its
  `win` and `door` put the trim on the face and record an opening in
  `h.ops`. 14o builds the walls round those openings, glazes them, hangs
  the doors, and lays out the rooms.
- 14o's plans are in a house's own terms: `p` across it (world x is
  `x + sx*p`, with `sx` the ranch's garage side or the two-storey's carport
  side) and `d` back from the front wall's face. A room runs to an outside
  wall's inner face or to a partition's middle. A partition is a line,
  `{ax:"d"|"p", at, from, to, doors}`. To change a house, change its rooms
  and its lines. A window must not run into a partition: 14o warns when
  one meets a room's corner. The rooms upstairs in a cape or a bungalow
  are `attic()`'s, cut to the roof's slopes.
- Far from the origin a float has a tenth of a millimetre of play. Lake
  Street is a kilometre east, and at that distance two pieces of one wall,
  each built as a plane or box centred and turned into place, open hairline
  cracks where they meet, worst at T-junctions. 14o builds each wall, gable
  and liner as one outline less its openings, cut into a grid at every
  opening's sides, sill and head (`pieces`). It puts the grid straight into
  world coordinates (`vslab`, `vliner`). Build anything out there the same
  way.
- A collider upstairs must not be sunk below its floor (14o's furniture,
  the attic's partitions). A stair under it would catch your head on the
  way up.
- The haze is tinted by distance. `HAZE_U` (03) darkens and blues the fog
  colour at middle distances and eases back to the horizon's colour at the
  far end. 19-loop sets how much (`HAZE_U.w`) each frame: less in weather
  fog and at night. The ground mist is capped on long sight lines, and by
  the lake it lies on the water (14c).
- `zoneAt` names the last zone added that holds you, so add the general
  zone first and the particular ones (a dock, a pavilion) after it.
- An overhead door (a house's garage, a bay, a roll-up) is 01's
  `makeLiftDoor(xf, y0, w, h, col, label, colBox, kind)`: sections that
  run up their tracks and back under the ceiling, or with `kind` "roll" a
  curtain that winds into its drum. It is a `DOORS` entry with `lift`
  (what draws it at an opening), `onUse` (what `E` does instead of a swing)
  and a `blockCol` that is solid while it is down. A door can also carry
  `promptFn` for its prompt (12e's wheel door does both).
- People out of doors are a crowd (14q): `crowdGroup(name, cx, cz, reach)`
  and `crowdAdd(G, {look, x, z, yaw, mode, job, path, held, prop, ...})`.
  A walker's `path` may be rounded with `crowdRound`; `yAt` gives it its
  own floors, `tick` runs each frame, `yield` holds it (the baler stops for
  you), `onShow` hears when it is shown or hidden. Props are `crowdProp`.
  They are not solid: give anything big that moves its own `COL_DYN` box.
- A transformer that hums but has no standby set by it goes in `HUM_POS`
  (14s), not `GEN_POS`, which also carries the diesel.
- The lake's shore is a wall (14n) a step short of the water, open where a
  dock goes out. Anything else built out over the water opens it the way
  14r's deck does.
- A door that slides (the arcade's pair, 12c) is a `DOORS` entry with
  `slide` (each leaf's group, its shut `x0` and how far it runs, `dx`) and
  a `rate`. `updateDoors` moves the leaves along x instead of swinging
  them. Its `blockCol` makes it solid while shut, and `tools/walk.js`
  opens any door that opens itself before walking a route.

- A door that should stay shut until you open it (a corridor's steel door,
  a door down in the sub-basement) is `makeDoor` then `latchDoor(col)` (01):
  manual only, sticky, and solid across `col` while it is shut.
- The world's edge is walls of colliders from y −40 to 300. Only walking
  into one of those puts up the edge toast (`edgeWall`, 06). A wall that
  should say something else carries it as `.msg` (14n's lake bank does),
  and a piece cut from it keeps the `.msg`.
- Every person's pose ends in `_idle` (14b) for `sit` and `stand`: breath,
  a look round, the weight going from foot to foot, a hand now and then.
  A job that sets its own bones does it after `poseP`, so it wins.
  `poseP` sets the root's whole position every frame. Anything that adds
  to a bone's position, not only its rotation, must start from there, or
  it adds up frame on frame and the body walks off its feet.
- A crowd's walkers (14q `_crowdWalk`) steer as 14b's do: `_crowdHit`
  is `_hitAt` plus the rest of the crowd, the lake and the group's
  `bounds` (14r sets the brewery's). Give a group that must keep to its
  ground a `bounds`. A seated person's `sitY` is the seat's top plus
  about 5.5 cm (a chair's 0.46 takes 0.515, a stool's 0.79 from 0.30 up
  takes 0.545).
- 14o dresses each house after building it. Every room's walls are noted
  as `storey()` lines them (`h.walls`), and pictures hang on the stretches
  clear of the openings, of this house's tall colliders and of `WALLX`:
  cupboards and hoods on the wall that have no collider of their own. Add
  anything like that with `wallx` (or `upper`) so no picture goes behind
  it. A lamp with `mod` (a TV that is on) is as bright as `mod.v` (16).
- The radio you hear is the nearest one (20's `nearRadio`): the garage's,
  a kitchen's (`LAKE_HOUSES.radios`, station −1 for off) or the brewery's
  speakers (`BREWERY.radio`). One with `open` is out of doors and heard
  without a wall in the way; `vol` and `reach` set how loud and how far. A house's
  rooms are zones named `No. n · ROOM`; inside one the tubes' hum is off
  and its fridges and clock are heard instead.
- A game played out in the world (18i's disc golf) takes keys through the
  early-return chain in 17-player's keydown and its frame through
  `updateGames` (18e), the way the darts and the cabinets do.
  Its aids use the same flight as the throw (18i's `DGOLF.aero` and
  `DGOLF.predict`), so what the card says is what the disc does.
- The lake's wakes are in the water's shader (14n), not meshes laid on it.
  `LAKESIDE.wakeDrop(x, z, s)` starts a ring of waves at a point, of
  strength 0–1. The newest 40 are kept, and the boat (14p) drops one
  every metre or so behind its stern. Anything else that should leave a
  wake calls it as it goes. Nothing flat and pale goes on the water: it
  would not be lit like it and shows up white at night.
- Anything a person holds that must stand as it would in a hand (a glass,
  a can, a mug, a rod) rides on the forearm's bone and is turned back each
  frame, after the pose, by 14b's `levelHeld(obj, P, ax)`: up in the world
  and facing the way the body faces, then `ax` about the body's x
  (`DRINK_TIP*sip` tips a drink to the lips). 14q does it for the crowd's
  drinks (`_HELD_UP`) and the fisherman's rod. Never leave a drink to the
  forearm's own angle: a forearm brought up level lays it on its side.
- `addSeat(x, z, y, yaw, label, lie, drop)` (06): `y` is the floor under
  the seat and `drop` how far a seated person's eyes are below a standing
  one's, a chair's 0.66 unless given. 17 takes `SEAT_EYE` (0.18) off it, so
  your eyes sit at a seated person's height, not slumped below it. A stool's seat at 0.79 takes 0.34, one at 0.85 0.265,
  a low Adirondack 0.76.
- A crowd's `sway` turns them from the waist (their spine and head), never
  the whole body: a person in a chair or on a stool stays square to it.
- The dog park (14t) runs off its thrower's `tick` (14q), so its dogs are
  only worked while the park's crowd is shown. Its gates are plain `DOORS`
  entries that open as you come up and fall shut behind you, not latched.
- The canopy's shell (07) is only ever meant to be seen behind real trees.
  It stands up to full height within 11 m of a clearing's edge, so wherever
  you can stand within forty-odd metres of woods that are only shell, it
  reads as a smooth green hill. Plant real trees there several rows deep
  and keep the shell low under them, the way 07's `canopyY` and 14n do at
  both ends of Lake Street by the shore.
- A stain, damp, dirt or oil on a wall or floor is a soft-edged decal: a
  transparent blotch texture in its own bucket (14f's `smudge`, 14y's
  `oilspot`), coloured by the vertex colour. A hard-edged flat ellipse or
  polygon in a dim room reads as a thing standing there, or a hole.
- Every texture on a material in the scene gets the card's anisotropic
  filtering once the world is built (19-loop), except normal maps. The
  lake's ripples tile hundreds of times across it, and filtered they stay
  sharp to the far shore and read as a busy, fractal-like pattern instead of
  calm water. A texture made later, at run time, sets its own `anisotropy`.
- A crowd walker's dog (14q `_crowdDog`) keeps to whichever heel position is
  clear of colliders and never steps into one, so a walker's path may run
  close to a fence.
- The brewery's cornhole boards (`BREWERY.boards`, 14r) each carry their
  own frame: `O` the face's middle, `ex` across, `ez` up the slope, `n`
  out of the face, and `hy` how far up it the hole is. 18j's bags work in
  it. A person tossing (14q's `toss` job) runs its swing on its own clock
  unless `cornSwing` (0–1 through the swing) is set, which 18j does for
  Danny while you play.
- I-79 runs from `HWY.zN` to `HWY.zS` (00), with walls across the corridor
  at `HWY.endN` / `HWY.endS` that carry the edge message. Anything laid
  along the interstate (paint, rumble strips, mile markers, road edges)
  runs between those, not fixed numbers. The traffic loop is
  `2·HWY.wrap` long and centred on the camera (05's `trafficMid`), so the
  traffic is wherever you are.
- The ground's outer rings: 32 m out to `GROUND_EDGE` (00), 16 m inside
  `RING_FAR`, 8 m in `RING_MIDN` up the interstate north, and 2 m in
  `RING_WEIGH` round the weigh station. Each finer ring is a hole in the
  one outside it, on that ring's lattice. The far terrain's rim fades
  against `GROUND_EDGE`, so nothing near the edge looks cut off. The fog
  shader (03) thickens to the sky's colour over the last 200 m before
  `GROUND_EDGE` and toward the camera's far plane, so a far hill fades
  out rather than being clipped. The sky dome is drawn first
  (`renderOrder` −1000): three sorts the opaque list by program before
  depth, and a dome drawn after the terrain painted over the far hills.
- The weigh station is set out by `WEIGH` (04: its ramps `off` / `on`, the
  lanes, the scale, the house, the apron, the graded pad). 08w lays its road
  through `rampPave` like any ramp, before 08b's `interstateEdges`; 14w
  builds the rest. Its trucks are 05's traffic: `updateWeighTrucks` (14w,
  from 14's `updateVisitors`) flags a rig and gives it a route at the ramp,
  and 14's `stepVisitor` drives it. A leg with `y` rides the road's grade
  on a ramp and the station's paving off it. A route with `weigh` counts
  against `WEIGH_RT.active`, not `VISIT.active`, and a truck stopped on the
  scale holds up the one behind it.
- The Perky Loon's roastery (14u) is under the house. The ground there is a
  0.5 m patch (`LOON_RING`, 04) let into `RING_EAST`, holed (`LOON_HOLES`)
  over the basement and its stair, so the house and the stair's walls and
  apron cover the holes' edges.
- A crowd person's arm can be set to reach a point with 14q's two-bone
  `_armTo(P, sh, el, target, pole)` after the pose (Dave's guitar does).
  The `R` bones are on the body's left.
- The dog park's ball you throw is 14t's `DOGBALL`: keys through 17's
  keydown chain, its frame through 18e's `updateGames`, the fetch in the
  thrower's tick.
- The boat's lights (14p) borrow 11's two `carBeams` spot lights whenever
  you are not driving a car (`BOAT.beams`, from `updateCarLights`); `L` at
  the helm sets `BOAT.lights`.
- The fuel stop's shelves (14k) are one atlas of named products (`GOODS`,
  its `L0` list); add a product to the list and put it with `put`.
- Coming out of a chase view (a car, the boat, the drone), 19-loop eases
  the camera from where it was down to your eyes over half a second
  (`_handT`). Your eyes are always `EYE` over your feet; only the view
  is eased.
- Every pontoon is a `LAKESIDE.boats` entry with `pont` and its own
  outboard (14n). `E` by one (14p's TAKE THIS BOAT) is `BOAT.takeOver`:
  the rig's hull and that boat's swap places (the rig keeps its working
  outboard, and the still one moves to the hull left behind),
  and the boat you last took stays where you left it, its lines out if
  it is at a dock. `_dockBerth` finds a berth
  along the open-water edges of `LAKESIDE.docks` (each dock's walkable
  rects), square to the edge, and `_tieRopes` hangs the bow and stern
  lines to it. A new dock goes in `LAKESIDE.docks` so boats can tie up
  to it.
- The woods behind Lake Street's south side are `EAST.woods` (04), built
  in 14v with its trail and the boats left in it. 07's canopy shell climbs
  slowly there so the real trees stand in front of it. Trees planted
  outside `SITE.zone` get no trunk colliders on their own: 14n and 14v
  plant with a `tree()` that adds one. Keep any tree clear of a trail
  head or a path.
- The weigh station's shed (well out back since round 21: its literal
  coordinates in 14w go through `zq`, the shift from where it was) stands on a hole in `RING_WEIGH`
  (`WEIGH_HOLES`, on its 2 m lattice), and the listening room
  (`WEIGH.den`) is under it, a VOID, BURIED at 0.6 and lit by under
  lamps. Its record plays the radio's station 3, the jazz trio (20).
  The man in the recliner holds a `rocks` glass (14q's held kinds, kept
  upright by `levelHeld`) and takes 14q's `recline` job, which lays a
  seated person back with the legs out along a footrest.
- The pretzel cart (14v's `PRETZEL`) shuts after dark: `updatePretzel`
  (from 14's `updateLife`) covers its case and stops the steam, and the
  vendor is `dayOnly`.
- Nothing stands on the road. Every ramp's paving, taper and all, is in
  `RAMP_PAVE` (08's `rampPave`), and `onPave(x, z, m)` says whether a point
  is on it or on the interstate. Mile markers are placed by `mileMarkers()`
  after every ramp is laid (from 08b, after `interstateEdges`) and skip any
  spot on paving; `checkRoadSigns()` warns of any `guideSign` with a post
  or face on paving. A gore sign goes just past the nose that `rampPave`
  returns, in the grass between road and ramp. The corridor's edge walls
  (07) are kept off the ramps by their paving (`paveOf`), not fixed gaps.
- A visiting vehicle's heading (14's `stepVisitor`) is `_chordHead`: the
  chord between its axles along the way, across a leg's seam, so a rig
  tracks a bend smoothly; `_turnTo` limits how fast it can come round. It
  slows gently for a slower next leg or a stop, and hard only for
  something in the way.
- A crowd person with `when(p)` (14q) is shown only while it says so; 14w's
  listener decides only while you are well away, so nobody appears or
  vanishes in front of you. His record plays while he is there
  (`WEIGH_RT.here`), or while you have put one on (`WEIGH_RT.spin`).
- Zombie mode is 21-zombies.js (`ZOMBIE`). Its hooks: 17's keydown chain
  (`ZOMBIE.key`, Z toggles it), the wheel, `look`'s scale and
  `fixedUpdate` (nothing moves you while you are down); 19 calls
  `ZOMBIE.atmos` after the haze is set (the gloom: fog, sky and light, and
  never underground), skips `updateTraffic`, calls `ZOMBIE.frame` before
  the draw and `ZOMBIE.render` after it (the gun is its own scene, drawn
  over the view with the depth cleared); 16b holds the `dread` weather; 20
  exposes `AUDIO.ctx`, `master`, `outLP` and `noise` for its sounds and
  mutes birds, dogs, flushes and the jake brake while it is on.
- The dead are 14b's `buildPerson` with `mat` (their own material, so the
  living, all on `PEOPLE_MAT`, can be hidden by theirs), `eyes` and
  `extra` (parts on the same bones: the blood, the bite, the mouth). Their
  looks are 14q's crowd looks, zombified. Anything new built on
  `PEOPLE_MAT` is hidden in zombie mode on its own.
- In zombie mode a shot is a ray against the colliders (not the world's
  edge walls, y up to 300) and the ground, and against each zombie's head
  sphere and body cylinder. A zombie steers with `zHit` (the colliders,
  and the lake it will not wade) and follows your trail (`ZOMBIE.trail`,
  a point every 3 m you walk) when it cannot see you; they spawn on that
  trail or in a ring round you, never in view and never across an edge
  wall. Caches are `CACHES` (x, z, a height to look near, a kind); the
  gun's flash is `FLASH`, a lamp in 16's pool lit by its `mod`. A pickup
  is let go of with `dropMesh` (its own geometry and materials freed, the
  shared `MAT` and `PMAT` kept), never a bare `scene.remove`: each one
  builds its own, and a long run would leak them.
- A ladder is 06's `addLadder(x, z, y0, y1, yaw, out, top, label)`: the
  foot of its climbing line at (x, z), `yaw` the way a climber faces it,
  `out` where you stand at its foot and `top` (with its `y`) where you step
  off. It adds the two `E` uses; 17's `climbOn` puts you on it and
  `climbStep` (from `fixedUpdate`, before anything else moves you) runs
  `W` / `S` up and down it and steps you off at either end. The water
  tower's (14x `WATERTOWER`) is the first: its catwalk is an `addFlat` ring
  inside OB colliders for the tank and the rail.
- In zombie mode `ZOMBIE.ts` scales time (19 scales `acc` by it, and
  `ZOMBIE.frame` its own `dt`): a car's hit drops it to 0.15 for a moment.
  `carVsDead` (21) works the car against the dead every frame: fast, a kill
  that flings the body (`zb.fly`, integrated in `frame` till it lands);
  slower, a knockdown (`zb.down`, the body lies, then gets up); slow, a
  push and a drag on the car that grows with how many are against it.
  Pipe bombs (`F`) are `BOMBS`; while one beeps the dead within 30 m go to
  it (`lureFor`), and it goes off with the `BOOM` lamp (a `fire` lamp in
  16's pool). `atmos` thins the fog with the camera's height over the
  ground, so a high place sees far even in the gloom. The score's best is
  kept in `localStorage` (`restarea.zombies.best`), read and written in
  try/catch.
- Zombie mode hides the traffic, and a hidden vehicle's collider is put
  out of the way with it (`hideTraffic`, 21): a hidden thing must never
  keep a collider where it stood. A thrown body (`fling`, `flyStep`) flies
  as its middle, turning about a level axis across the throw, and its
  pose is that turn on its heading (`zb.fq`, `zb.fpos`), not Euler angles
  about its feet. The cruisers on I-79 (`COPS`) are 14e's
  `standingVehicle` + `cruiserKit`, each with a `COL_DYN` box while it
  runs and a `LAMPS` entry whose colour flips red and blue with its bar.
- `E` (17's `interact`) takes a car within reach before anything else,
  unless a `pri` use is nearer than the car: a game set up by a parked car
  (14n's hoops over the drives, 18k) still gets its `E`.
- Every hoop 14n puts up is in `YARD_HOOPS` (rim, board, facing, ground)
  and 18k's `YARDHOOP` plays all of them.
- The warp list (18l `WARP`, the backquote key) is for testing: add a place
  to its list with its floor (a global that holds it, or a height to find
  it under). `tools/walk.js` puts you down at every one of them and fails
  any that is in something or does not hold you (`ONLY=warps`).
- The arcade's cabinets are 12c's `NAMES` (eight, the marquee a cell each)
  and 18g's `_CBG` by cabinet index: a game is an object with `newGame`,
  `step`, `draw`, `attract`, `lean` and optionally `key`, `mouse` and
  `done` (called once it is over, to keep its best scores, 18m's
  `_cbAddTop`). 18m registers Brickyard Breakout (2), Groundhog Gulch (4)
  and Turnpike Turtle (5); 18g's loop runs whatever is registered.

- A ladder up a wall to a flat roof is 06's `roofLadder({x, z, nx, nz, g,
  edge, roof, off, soffit, land, label})`: (x, z) where its middle meets
  the wall's outer face, (nx, nz) that face's outward normal, `off` how far
  out the rungs stand (past any eave), `land` where the goose-neck comes
  down on the roof. It builds the rails, rungs, brackets and (over 4.2 m) a
  cage, and calls `addLadder`. Its `walk: [x0, x1, z0, z1]` lays the roof's
  flat at `roof` and records it in `ROOF_WALKS`, where 21 never puts one of
  the dead down. The rest of the roof is the building's: a `· ROOF` zone
  added after the general one, and colliders for what stands on it (06's
  `roofUnit` is an air handler with its own). A parapet's wall colliders already run to its top; a roof with
  no parapet lets you walk off it and drop. The fuel stop (14k), the
  fireworks store (14m), the scale house (14w) and the control house (14s)
  have them; the dead cannot climb one.
- Every pane baked into the `glass` or `tint` bucket is in 01's
  `GLASS_PANES` (its middle, normal, half sizes, and its run of vertices in
  the merged mesh), so anything glazed with `push("glass", ...)` can be shot
  out in zombie mode with no more work. A pane is a plane or a box no more
  than 8 cm thick and at least 12 cm each way. 21 collapses a broken pane's
  vertices and puts them back (`mendGlass`) when the mode ends or restarts.
- The flamethrower (21's `FL`) is two sprite pools, the flame added and the
  soot drawn over, and two `fire` lamps in 16's pool. A zombie's `burn` is
  seconds left alight; `hurtZombie`'s sixth argument marks fire (no blood,
  no knockback, and a kill pays `bonus`).
  The jet starts at the nozzle as you see it: the muzzle in the gun's own
  scene is projected by `vm.cam` and the jet starts on the world camera's
  ray through that pixel, aimed at the point under the crosshair. What it
  reaches is tested as a line from the nozzle (widening with distance)
  against each zombie as a capsule (`segSeg`), and the jet's particles in
  flight set alight whatever they pass through (`ignite`).
- A ramp that runs into a crossroad along x (US 6N's four) is given a
  `stop` carrying `mouth: {z, e, meet}` (08b's `onX()`, one per ramp).
  `rampPave` then paves it only to the crossroad's edge line, runs its
  lines on until they meet that line (or eases the one that never does
  onto it along the road), and puts where they meet in `mouth.meet`. 08b
  lays US 6N's edge lines after the ramps, from those: solid, and dotted
  across each mouth. Never break an edge line by hand.
- The canopy shell (07) draws its crowns per pixel (`canCrown`, two sizes,
  faded by `fwidth` so far off it is the mean and does not shimmer, and off
  on steep faces). The terrain (04) leans its normal on a few long swells
  and hummocks the same way. Both use `fwidth`, so their materials set
  `extensions.derivatives`.
- Where a road meets a lot's edge, its lines stop at that edge exactly
  (the ramps pass `rampPave` a `stop` whose `mouth` has `linesOnly`, so
  the paving runs on under the lot and only the lines are cut). The
  corners are rounded with 08's `filletPave` / `filletPaveX`, paved over
  the road's layer and up to the lot's edge, never over the lot. The curbs
  start where the rounding ends, and lot markings keep 6 m clear of the
  way in.
- A use that starts an arcade game is marked `.game` (12c's cabinets, the
  air hockey and the hoops, 18h's dozer). 17's `nearestUse(true)` finds
  those and `ENTER` starts one. `E` (`nearestUse()`) never does, so `E`
  by the arcade's sliding doors is always the doors. A game's own keys
  must not take a mid-game `ENTER` as "start again": that is `N`, or
  `Space` / `Enter` once it is over.
- Suds Patrol is 18n's `_SP` on cabinet 6 (12c's seventh, `NAMES` and
  the marquee's cells run to `NAMES.length`). A stage is platforms as
  `[row, c0, c1]` on its 42 × 32 grid of 8 px tiles (one-way: you land on
  them from above and jump up through them), bugs as `[kind, column, row
  stood on]`, and its colours. The floor and ceiling have a gap in the
  middle that wraps you from the bottom to the top.
- Route 6 Rally is 18o's `_RR` on cabinet 7 (back wall, by the hoops). Its
  road is `PLAN`'s stretches `[segments, bend, rise]` built into 200-unit
  segments with roadside sprites, drawn by projecting segment after
  segment to the horizon. Billboard lettering is only drawn while the
  whole board face is on the screen.
- In zombie mode the gun is put away while you are at any game (21's
  `atGame()`, also `ZOMBIE.stowed()`): not drawn, no crosshair, no
  firing, no aiming. A new game with an `on` flag goes in its list.
- Zombie mode's blasts are 21's `blast(x, y, z, R, d0, d1, pr, pd)`: the
  pipe bomb's and the rocket's. Anything else that explodes should use
  it. It throws or knocks down the dead, hurts you within `pr`, and
  shatters every pane in `GLASS_PANES` within 0.8 R. Rockets (`ROCKETS`,
  a pool of four meshes from `rocketBuild`, built with the rest at
  `build()` so the warm-up sees them) fly straight at the crosshair's
  point and test the world, the glass and the dead along each frame's
  stretch.
- The zoom is per gun (`S.zoomBy`, steps `ZOOMS`). `aimFov(g)` is the
  aimed view as a fraction of the open one, and `lookScale` follows it.
  The wheel zooms while the right button is held and changes guns
  otherwise.
- Codes: `/` opens 21's box (`Z.codeKey`, early in 17's keydown chain,
  every key its own while it is open). `CODES` maps a word to a flag on
  `ZOMBIE`: `NINELIVES` sets `god`, which `hurtPlayer` checks first, and
  `BOTTOMLESS` sets `infAmmo`, so `fire` uses nothing and `throwBomb`
  nothing. A run with either on sets `S.cheated`, and `die()` does not
  save it as the best.
- Never change which lights are in the scene, or whether one casts a
  shadow, while the game runs. Hiding or showing a light, or flipping
  `castShadow`, makes every lit shader compile again: a freeze of a second
  or more on a Mac. Turn a light down to intensity 0 instead (03's torch,
  16's lamp pool). The sun's shade goes and comes through `keyShadeWant` /
  `keyShadow()` (03), which draw the shadow camera's far plane in rather
  than stop it casting. Changing the light count or shadows in the menu is
  the only exception.
- 19's `gfxWarm(scene, camera, draw)` compiles every material in a scene,
  hidden ones too, once at load. With `draw` it also does one unculled draw
  into a small target, which sends the meshes and textures to the card.
  Anything a mode builds when it starts gets the same treatment right
  after it is built (21 warms the dead and the gun's own scene the first
  time zombie mode starts).

- West of the interchange is `WEST` (04): the road's clearing (`corr`),
  French Creek Pines (`park`, its `lane` and the drive at `gate`) and the
  hall's footprint (`hall`). Its ground is its own 4 m ring (`RING_WEST`),
  holed over the hall's basement (`WEST_HOLES`), and the canopy its own
  8 m shell (`WEST.can`). The west fields (08b's grape, pumpkin,
  sunflower and xmas crops) are `EDIN.fields` like the east's.
- 14z builds the park in world coordinates with its own copies of 14o's
  `pieces` / `vslab` / `vliner` (`wall`, `liner`). `WESTPARK.trailers`
  holds each trailer's frame, and `WESTPARK.routes` its walk routes, which
  `tools/walk.js` takes from the page. The Pine Knot under the hall is
  BURIED, a VOID and lit by under lamps.
- The slot machines are `ARCADE.cabs[8..11]` (14z builds them, `slot:true`)
  and 18p's one game on all four `_CBG` entries. Their credits are one
  wallet, `SLOTS.credits`, kept in `localStorage` (`restarea.slots.credits`).
  `SLOTS.sim(n)` plays n spins of nine lines and returns what comes back per
  credit bet (about 0.94); check it after changing a pay or a weight.
- 14z's dressing pass runs over `WESTPARK.trailers` (each keeps its frame:
  `sd(d)` back from the lane end, `rng`, the deck `dk`, `inX0`/`inX1`, `xb`).
  Fires are 14z's `campfire(x, z, scale, always)` (14d's flame, coals, halo
  and a `fire` lamp) in `WESTPARK.fires`; `updateWestPark` (from 14's
  `updateLife`) flickers them, lights the lots' fires after dark, turns the
  ceiling fans (`WESTPARK.fans`) and sets `WESTPARK.nightCrowd` only while
  you are well away. `WESTPARK.radios` join 20's `nearRadio`. Wall signs in
  the trailers are one atlas (`homeSign`, bucket `wp_homesign`).
- US 6N now runs west to `EDIN.x0` (−1600), and `WEST.ranch` (04) is the
  stone house's lot. 14z2 builds it with 14z's wall kit (`WESTPARK.kit`:
  `pieces`, `vslab`, `vliner`, `holesIn`, `addFace`, `flush`), its basement
  and its pool each a `WEST_HOLES` entry on `RING_WEST`'s 4 m lattice
  (x −1440..−1420, z −1164..−1152, and the pool's x −1440..−1424, z
  −1152..−1140), covered by the foundation and the deck. `RANCH` holds the
  routes, the pool's mesh and the `flow` its normals drift by (`updateRanch`,
  from 14's `updateLife`), and the radio in the garage. The pool's water
  reuses the lake's normal map (14n) through `onBeforeCompile`, transparent
  over the plaster. The inside of the oval is solid, so you walk round it.
- Keep every fire clear of crowns: 14z plants no tree within 8.5 m of a
  lot's fire ring or 11 m of the common fire.

## The machine it must run on

The owner plays in Chrome on a refurbished MacBook Pro: a 2.4 GHz 8-core
Intel Core i9 with Intel UHD Graphics 630 (1536 MB shared), 32 GB of
2667 MHz DDR4, macOS 14.7.1. Treat the Intel chip as the floor, at Retina
resolution, and keep High and Ultra for faster cards. 03 asks for the
high-performance GPU and reads which one it got (`GFX.gpu`, `GFX.tier`).
On a first run on an integrated chip it starts at Medium with resolution
on AUTO (`GFX.res` −1, 18c's `_autoResStep` moves `GFX.auto`). Anything
costly per pixel or per frame should scale with a menu setting, not be
fixed.

## Tools

Run them with `NODE_PATH` pointing at a global Playwright, for example
`NODE_PATH=/opt/node22/lib/node_modules node tools/walk.js`.

- `tools/shot.js shots.json outDir [w] [h]` renders screenshots from the
  game itself (see its header for the shot format). A `drone` shot is the
  drone's chase view, about 4 m behind the drone looking at it, with the
  drone left out of the picture.
- `tools/walk.js` walks every route and seat with keys held at walk, run and
  sprint, and fails if you get stuck anywhere. Add a route for any new place
  you can walk to. `ONLY=regex` walks just the routes, seats and stair
  tests whose names match. A route with `gate:true` has every manual door
  open (the gates, the garage doors) and the rest shut. It also takes routes and stairs from the page:
  `LAKE_HOUSES.routes` and `.stairs` (14o) are laid out by each house
  through its own plan as it builds. The walker is a square ±0.34 m across,
  not a circle, so give corners room.
- `tools/zfight.js '{"x0":..,"x1":..,"z0":..,"z1":..,"y0":..,"y1":..}'`
  finds coplanar faces in a box.
- `tools/signaudit.js [pad]` finds sign text too close to an edge.
- `tools/drive.js` drives the first car in the lot with the keys, headless
  and without drawing, and fails any figure (0–60, top speed, braking,
  lateral g dry, wet and on grass, the lane change, the wall) outside its
  `LIMITS`. Run it after touching `CARC`, `GRIP` or 11's handling.

## Round 28 notes

- A place's own hand-merged detail (its `ME` list of fittings, furniture,
  odds and ends) goes through 01's `detailMesh(ents, mat, name, cast)`, not
  `new T.Mesh(mergeEntries(ME), …)`. It cuts the entries into 64 m tiles,
  so the camera can cull what is behind it, and 18c's `cullBaked` hides a
  tile further off than the draw distance's `detail` (`DRAW_LEVELS`, 03).
  A landmark that must be seen from far off (14x's water tower) stays a
  plain mesh.
- Instanced crops (08b's west farms) are tiled the same way: `CROP_TILES`,
  each kind with its own `far`, shown by `updateCrops` (from 19). An
  InstancedMesh spread over a field must never be `frustumCulled=false`
  with a world-sized reach: it is drawn whole from everywhere.
- `SURF`, `ZONES` and `VOIDS` are looked up through 06's rect grids
  (`_rgAt`). They only ever grow, and a rect's bounds never change once it
  is added (a surface's height may). Never splice one or move a rect.
- `Terrain.groundAt` remembers its rings' corner heights (`_GH`, 04). The
  field is fixed once the ground is built; never change what `heightAt`
  returns after load.
- `updateDoors` (17) skips drawing a door at rest. Anything that moves a
  door's leaf itself sets `d.open`, never the leaf's transform.
- Lit colours above 0.60 are eased halfway back (03, in
  `lights_physical_fragment`): this renderer takes hex as painted, so a pale
  slab in full sun would otherwise clip. Concrete wants about `#a8a49a`
  to `#b8b4aa`, not `#d0ccc2`.
- The sun's shadows fade out over the outer 13% of the shadow map (03), so
  their reach never shows as a line moving with you.
- `addBuried`'s ninth argument `[yTop, yBottom]` grades a stairwell:
  `buriedShare` runs 0 at the top to 1 at the bottom, and 19 and 16 follow
  it. A stair down from daylight gets one, with a dim under lamp part way.
- Paving made of several shapes (a ring of drive and its mouths, an apron,
  a walk) is laid as one surface with 01's `sdPaveGeo(sdUnion([...], r),
  x0, x1, z0, z1, cell, uvm)`: each piece an `SD_rect` / `SD_ring` /
  `SD_ellipse`, joined with a fillet of radius r, its uvs in world metres
  so the texture's joints run on across the pieces (14z2's drive). Never
  lay overlapping rectangles and a ring as separate planes: their ends
  leave notches and their textures do not line up.
- Where a ramp's line is carried along a crossroad onto its edge line
  (08's `lineRun` tail), it eases from the ramp's heading to land on the
  edge line exactly, so the solid line carries straight on from it.
- Zombie mode's fog is 03's `GLOOM_U` (21's `atmos` sets it each frame;
  19 clears it first, so it is off whenever the mode is): exponential,
  thinner with height over the ground under the camera, in drifting
  banks, its colour graded darker and greener near and low to paler grey
  far and high, and never above 0.78 on anything short of the world's
  edge, so a far ridge keeps its own light and shade. Never fog anything
  in that mode to one flat colour.
- The dead move as a swarm (21's `flockPass`, once a frame before
  `stepZombie`): each notes its neighbours (a push from any within 1.6 m,
  the heading of those within 5, where those within 6 stand, one in its
  way in front, the nearest alert one). Unalerted herds drift and pause
  together and stop to stare when one nearby has seen you; chasers fan
  out (`fan`) while they can see you, gone within 7 m, keep a little
  apart, surge and drag about their own pace and slow behind one in
  front; they lean into turns and roll with the stride (`lean`, `jost`).
  None of it may make them faster, keener or more of them: check arrival
  times against the old code when changing it.
- Anything that hangs on a door (a wreath, a sign, a knocker) is added to
  the group `makeDoor` returns, so it swings with the leaf (14z2's front
  door). Never merge it into a place's static mesh in front of the door.
- 14o's `dress()` finishes every house's rooms: a baseboard along each
  wall in `h.walls` (stopped 7.5 cm past each doorway's opening, short of
  its casing; an x wall's 2 mm taller than a z wall's), and curtains on a
  rod either side of the windows of living, dining and bedrooms. Pictures
  keep 0.36 m clear of every opening (`clearRuns`) so they miss the
  curtains.

## Round 30 notes

- The stone house's basement stair (14z2) is 15 risers at a 23 cm run
  from `SWZ0`, ending at `STZ1` with a 0.95 m landing before the back wall; the
  well upstairs stays `SWZ0`..`SWZ1`. Its rec-room side is closed (the
  steps' painted bodies) under a stringer and a guard that stops two steps
  up, so you can step off sideways at the foot.
- The old mechanical room is the game room, open to the rec room; the
  furnace and the rest are in the pocket east of the stair, behind a door
  in the `x = -1157` wall.
- A house door stands shut (`ajar` 0) or well open (0.95), never a few
  degrees ajar. 14z2's `doorIn` takes 0 as shut.
- 14z2 trims its rooms with `trim` (upstairs: baseboard and crown, each run
  stopped 7.5 cm past a doorway, the crown at any opening reaching the
  ceiling), `wains` (the basement's oak wainscot) and `based` (its
  baseboards). An x wall's pieces sit 2 mm taller or deeper than a z wall's
  so where two runs cross at a corner no faces share a plane. Add a wall's
  run when you add a wall.
- 14z's woods camp kit: `campChair`, `picnic`, `cooler`, `fireRing` (with a
  grate and logs) and `tent` (an inner dome, a fly with its door open, poles,
  guylines). The canned-ham camper is a side profile extruded across it, cream
  over a turquoise skirt; anything on its sides sits within 3 cm of the body
  (x = ±1.0 cream, ±1.012 skirt).
- Video poker (18q, `POKER`) is cabinet 12 in `ARCADE.cabs` / `_CBG` (its `fov`
  closes the view in on the screen while you play, 18g; its canvas is
  drawn at twice the arcade's size through a scaled context), a
  machine set into the Pine Knot's bar (14z, where the fifth stool was),
  Jacks or Better on the full-pay table. It takes and pays the slots'
  wallet (`SLOTS.credits`). `POKER.evaluate(hand)` gives the table's line
  (0 royal … 8 jacks or better, −1 nothing); a card is `rank*4+suit`.
- Guide signs' legends are 02's `hwyLegend`: one letter height per sign,
  even spacing, wide margins, `"Place   12"` (three spaces) as a name and a
  right-hand column of miles. A sign that needs its own layout (the speed
  limit) passes `draw` to `guideSign`.
- Zombie mode's screen blood (`hud.splat`) is a few faint flecks toward the
  edges; keep it light.
- Lawn darts are 18r's `LDARTS`, on Lakeside Park's level lawn behind the
  lot (14n's `LAKESIDE.darts`: the yellow ring `A` you throw from, the
  blue `B` 35 ft out, and Walt, 14q's `opp`, on the `toss` job with
  `cornSwing`). Keys through 17's chain, the frame through 18e's
  `updateGames`, and 21's `atGame` puts the gun away while you play.
  Darts stand nose down where they land (`stick`). Walt's spread in
  `himThrow` gives a ringer about three throws in ten.
- The radio station is 14s2 (`RADIO` in 04: its pad, graded level and
  cut into the rise north of the substation; the tower's footing ring at
  `RADIO.ty`; the feed line's cut). A mown bank and meadow round both
  (`siteDist`), real trees ringed round them several rows deep, and 07's
  `canopyY` holds the shell low there. The tower (a guyed mast, 124 m, a
  triangle of lattice 1.8 m a face on its base insulator, guyed at four
  heights to one anchor on each of `RADIO.guys`' bearings at `RADIO.gr`, each
  guy's line cleared) is one plain mesh, a landmark;
  its lamps are balls close to and fixed-size points far off, flashed by
  `updateRadioStation` (from 14's `updateLife`), which also lights the
  glass block after dark. Its guys run north-east, south and north-west,
  clear of the power cut. The fields' north wall (07) goes out round
  `RADIO.walk`, so all of it is walkable.
- The radio station is hollow (14s2): its straight walls are pieces round
  each opening (`wallX` / `wallZ`, colliders with them), the round end a
  ring with turned box colliders; the base, speed lines and coping are
  rings outside the wall, the roof deck's underside the ceiling (`CEIL`),
  the floor at `FL`. Inside: the lobby, Studio A (a viewing window from the
  lobby), the control room (its window into the studio), the office and
  record library, the transmitter room in the round end; each room an
  indoor zone `FRENCH CREEK BROADCASTING · ROOM`. Its people (the night man
  at the board, the receptionist by day) are added in 14s2 itself, since
  14q's crowd is built before it; `RADIO_ST.radios` joins 20's `nearRadio`
  (the lobby's monitor, the jazz trio), and `RADIO_ST.routes` joins
  `tools/walk.js`.
- Paving's edges are softened at bake (15's `verges`): every up-facing
  triangle of the paving buckets (`road`, `asphalt`, `lotpave`, `wp_road`,
  `rn_drive`, `gravelbed`, `wp_gravel`) is looked at as laid; an edge only
  one of its triangles has, with no visible paving, no indoor zone and no
  water just past it, gets a strip of worn ground (bucket `verge`,
  transparent, its own polygon offset) from just inside the edge out over
  the grass, starting where the ground actually meets the paving. Paving
  the ground has grown over does not count. A canvas texture laid along a
  strip sets `flipY=false` if its rows are drawn top-down. A new paving
  bucket that should blend goes in its `SRC` list with its width.
- The sun's shadow is a two-map cascade (03): `key` (light 0, all the
  light, the wide map) and `keyNear` (light 1, intensity 0, only a near
  map a third the width or less, about a centimetre a texel on ULTRA).
  The patched `lights_fragment_begin` takes the key's shade from the near
  map inside the middle of its square and eases to the wide map outside
  it; keyNear adds no light. Both are added to the scene in that order and
  both cast while shadows are on, so the light count never changes in
  play; 19 moves keyNear with the camera on its own texels (`NEAR_SNAP`),
  `keyShadow` draws in both far planes. Every level filters with plain
  PCF and its `radius`: three's PCFSoft smeared the texel steps into blobs.

## Round 31 notes

- A big flat sheet (a ground ring, a canopy shell) is cut with 01's
  `tileSheet(geo, tile, make)`: tiles that share the sheet's vertex buffers,
  each with its own index list and bounding sphere, so the frustum culls
  them. Never add a sheet hundreds of metres across as one mesh.
- Anything that never moves sets `matrixAutoUpdate=false` (the baked tiles,
  the detail tiles, the ground, the canopy and every tree mesh do).
- 03 steps over a light's shading wherever its light at the pixel is
  nothing. A light turned down to intensity 0 is free; one out of range of
  a pixel is free at that pixel. Keep a lamp's `dist` honest: it is what
  bounds its cost.
- 03's cascade reads each shadow map only where it is used. On LOW and
  MEDIUM the wide map is drawn every other frame (`SHADOW_LEVELS.every`,
  19's `_keyTurn`), but only while nothing in it is quick: with you
  driving, at the boat's helm, or traffic at speed within its reach it is
  drawn every frame, or a fast thing's shadow is a frame behind it every
  other frame and flashes. The key is only moved on a frame its map is
  drawn, so map and matrix stay a pair. Anything that must force the wide
  map to be drawn sets `key.shadow.needsUpdate=true` (`keyShadow` does).
- Both shadow maps are centred on what you are looking at (19's `_shF`:
  the car or the boat from a chase view, the camera on foot), never on a
  chase camera, and each is moved in whole texels of its own measured
  across the sun's line (`_shX`, `_shY`), not along world x and z.
- A tree is ONE model at every distance (07): there is no near and far
  set to swap, so nothing pops. Every card has a rank (`aLodC.w`, dealt
  evenly within each clump), and the vertex shader keeps as much of a
  crown as the tree's own distance from `uEye` allows (`lodKeep`: all of
  it to `tree*0.45`, 28% at `tree*1.9`, a tenth far off), shrinking a card
  to nothing as its turn comes and growing the rest to fill in. Limbs thin
  away, a plain four-sided trunk stands in for the whole one, and the
  leaf's alpha cut-off falls with distance so a far crown is soft masses.
  The understory grows out of the ground over the last third of its own
  distance (`aGone`, the species' `gone`). The index list is in rank order
  and a group draws a prefix of it (`LEVELS`, `userData.levels`). Chunks
  are 48 m everywhere; groups of 2, 4 and 8 chunks a side (`TIERS`) hold
  the same trees and draw in place of their chunks further off, which is
  only ever fewer draws: it is the same model under the same shader. Only
  chunk meshes cast shadows. Never add a second look for a tree at a
  distance, and never show or hide plants by chunk: thin or shrink them in
  the shader by their own distance.
- The same goes for anything else spread over the ground: 08b's instanced
  crops shrink away over the last third of their `far` (`CROP_U`), never
  appear by the tile.
- Loose meshes (anything in the scene that is not baked, instanced, a
  sprite or a light) are culled by distance in 18c's `cullLoose`: past
  `max(70, radius × LOOSE_K)` metres, never past the draw distance's
  `cull`. It moves a mesh to layer 1 and back, and never touches
  `visible`. A thing that must be seen from any distance sets
  `userData.noCull` on its top-level object; glowing materials (`GLOW`,
  `NEON`, emissive, `toneMapped:false`) are left alone already. Only what
  is in the scene at the first frame is on the list. No camera here may
  enable layer 1.
- A parked car far off is its coarse shell with the plain wheels merged in
  (two draws); the four wheels that steer and roll show only with the full
  shell (10's `updateParkedLOD`).
- `GFX.fx` (the menu's SURFACE DETAIL) is the uniform `FX_U` (03). A
  material that works something costly out for every pixel (07's canopy
  crowns, 04's lawn) reads `uFx` and, at 0, steps over
  it and takes the mean it would have come to. New per-pixel work of that
  kind does the same.
- The car (10's `CARC` and `GRIP`, 11): each axle's grip is the weight on
  it times what it stands on (15's `GROUND_KIND.at(x, z)`: 0 grass, 1
  paving, 2 gravel, from the paving buckets as laid; a new paving bucket
  goes in its `KIND`), through a curve that peaks and falls a little.
  Full lock is `maxSteer` at a walk and `steerOver` times the tyres' limit
  at speed. The forces along and across the car are fed to the springs as
  a torque, which is all the lean and dive there is. A `Vehicle` is built
  from its car's own `spec` (04b): wheelbase, track, and the points round
  its shell that `carHits` tests. Do not change `mass`, `springK`,
  `restLength` or `wheelRadius` without `CAR_SAG` / `CAR_RIDE`.
- The car's sound is 20's `car` voice: it reads `driving.veh` (`vf`,
  `throttle`, `slide`, `kind`, `hit`, `anyGrounded`).
- A standing crop (08b's corn) is a block: its outer rows real cards
  (`card`, one up-and-out normal on both faces, colour held down like
  `FIELD_TINT`), a wall of the same behind them, a lid of the crop seen
  from above over the middle, and a collider under the lid. Never fill a
  field with cards from edge to edge: seen across the rows that is a
  hundred layers of alpha-tested leaf on every pixel. A low crop (the
  beans) is a lid at its height and a skirt round its edge, not solid.
- The edge of the farm country (`EDIN.plain`) is ringed with real trees
  forty metres deep (07's `hedgerows`), and `canopyY` holds the shell low
  over the same ground. A tree in the open is an `edge` or a `lawn`, never
  a `hard`: the woods' tall bare trunk with a tuft on top is a lollipop
  in a field.
- A pattern finer than the pixels it is drawn with crawls and buzzes under
  a moving eye. So: a field's texture (08b's `fieldMat`), the ground's
  grain (04) and a crop card's picture (`leafy`) each ease to their own
  average colour with distance, and a card's alpha cut-off falls until a
  far row is a solid band. Textures of rows set `soft=true` and a low
  `anisotropy` (19 leaves a `soft` texture alone). Anything thinner than
  a pixel at twenty metres (a fence's wire: bucket `fencewire`) fades out
  with distance. New ground cover, crops and wire do the same.
- The haze starts at 60 m by day (19), not 150: the middle distance is
  where a view gets its depth.

## Round 32 notes

- In zombie mode the sights are a toggle (`X`, 21's `aimToggle`) as well
  as the right button held; `+` brings them up if they are down. The wheel
  goes through `wheelStep`, which adds a trackpad's stream of events up
  into steps. Anything new that takes the wheel does the same.
- At a cabinet the view narrows onto its screen (18g's `updateCabs`, from
  the screen mesh's size and the eye's distance; a cabinet's own `fov`
  wins). 21 leaves `camera.fov` alone while `atGame()`.
- Pole heights: the substation's line is `POWER.H` (04; 12 builds it, 14s
  taps it), the roadside poles 14y's `PH`, with the street lights `LD`
  below their tops. A lamp or a can on a pole goes at its own real height,
  not a fixed drop from the top.
- The radio tower (14s2) is three meshes: the lattice (`radio-tower`), its
  guys (`radio-guys`, fading with distance) and a sheet to each face and
  band that is clear close to and fills in far off (`radio-tower-far`), so
  a lattice finer than a pixel reads as a banded line. Its beacons (top,
  and a pair half way up) flash; its side lights (a quarter and three
  quarters up) burn steady; all are out by day.
- A crown is PUFFS (07's `TG.puff`), not flat cards: four corners at the
  puff's middle with `aPuff` (which corner, half its size), put out in view
  space by the vertex shader so the puff faces you (`PUFF_GLSL`; in the
  shadow pass, `PUFF_DEPTH`, it faces the sun). The fragment shader leans
  its normal out from the puff's own middle, darkens its underside, takes
  only a third of the sun's cast shadow (or near trees go dull and far
  ones bright) and adds light through the leaf from behind. Each puff's
  tone carries the crown's own shade (inside and low darker), set in the
  builder. Never build foliage from fixed planes at angles again: seen
  edge on they read as boards.
- The leaf atlas is a `DataTexture` made from the canvas's pixels with
  every clear pixel given its region's average leaf colour (alpha kept),
  so filtering an edge never blends leaf with black: that was the dark
  border round every plane. Any other alpha-cut picture that shows a dark
  rim wants the same.
- Leaf greens are deep and a little grey (`SPECIES.summer`, around
  `#40602e`). A per-plant `color` passed to `FOREST.plant` should sit in
  the same range; anything like `#7e9e4a` comes out lime in full sun.
- The arcade (12c) is twenty metres and a half by eight and a half (`A.x1` 88.1; it was 79.5, then 84.5):
  the east wall and everything on it (the changer, the can, 18h's dozer,
  the house rules) go by `A.x1`. `cab(i, x, z, ry, id)`: `i` is the place
  in `NAMES` (the marquee's cell) and `id` the cabinet's number in
  `ARCADE.cabs` and `_CBG` when that is not the same: 8 to 12 are the
  Pine Knot's machines (14z), so the arcade's ninth and tenth are 13
  (18s, Hornworm Havoc) and 14 (18t, Exit 166 Rumble), and its eleventh
  and twelfth 15 (18w, Slippery Rock) and 16 (18x, Silo Scramble).
- A cabinet's game takes a KIND of game's way of playing and nothing
  more: its name, people, stages and pictures are made here and are its
  own, never another game's, whatever a reference offered to work from
  has in it. Nothing is drawn from image files: every cabinet draws
  itself.
- 18t's street: a stage is `{n, sub, len, paint, props, waves}`, a wave
  `{x0, f:[[kind, side, depth, delay], ...]}` where the street stops; a
  body is `body(kind, x, z, dir)` and its picture `figure()`, limbs as
  strokes from a table of poses (`POSES`). `turns()` lets two of them
  come at Dale at once. 18s's bed is a grid of plants (`hp`, `ripe`);
  `burst()` is the ripe tomato going off.

## Round 33 notes

- A machine you stand at (18u's Whack-a-Chuck, 18v's Alley Roll) is built
  the way 18h's dozer is: its own group and meshes in its own file, an
  object with `on`, `start`, `stop`, `key`, `mouse`, an `update…` called
  from 18e's `updateGames`, a `.game` use, and its hooks in 17 (the keydown
  chain, `look`, the prompt) and 21's `atGame`. Both stand against the
  front wall turned to face the room (`rotation.y = π`), so the machine's
  own +x is the player's right and its +z is toward the player.
- 18v's ball is worked out, not played back: `SKEE.land(x, a, s)` gives
  where a roll comes down on the board and what it scores, and the mark
  on the board while you hold the gauge is the same call. Change `SK`
  (the lane, the hump's `LIFT`, the board's `TILT`, the `RINGS`) and print
  `SKEE.land(0, 0, s)` across `S0`..`S1` to see every ring can still be
  reached.
- 18t's street is two pictures (`backdrop(k)` gives `far` and `near`):
  the stage's `sky` colours, its `far(x, Lf, S)` and `beacons` go on the
  far one, which slides at `PX` of the camera; `paint` is the near one,
  and leaves the sky clear. A stage's `live(x, cam, t, layer)` draws what
  moves, after each picture. A prop is `[x, depth, kind, what is in it]`.
  A kind with `thrower` throws along Dale's row (`G.shots`), one with
  `floor` puts him down, `drop` is what it leaves, `wpn` what it is drawn
  holding, `boss` and `sub` make it a boss with its own title.
- 18w's courses are `COURSES`: stretches `[way, cells, width, drop, {ice,
  rail, tilt, gap:[at, n], turtles}]` laid end to end by `build`. The
  first and last three cells of a stretch are level; kerbs are laid in a
  second pass so one never stands across the next stretch's way in.
- 18x's floors are `layout(kind)`: `segs` (each end's height, the way a
  bale rolls, `wl` / `wr` for a wall at an end), `lads` (x, the seg above,
  the seg below, broken), forks, Bandit, the pie on a seg marked `shelf`.

## Round 34 notes

- The map (`B`) is 18y's `MAP`: drawn from the world's own data, never a
  render, in time-boxed slices after load (`MAP.pump` from 19's
  `updateMap`, about 4 ms a frame): the ground sampled every 6 m and shaded
  (woods eased in by `clearDist`, water by `lakeSD`), contours, the fields
  in their crops, the creek, `GROUND_KIND`'s paving cells, indoor zones at
  the ground as roofs and walls of 2 m and more. The underworld (`U` /
  Tab) is vectors kept in `MAP.vec` (BURIED, underground rooms, floors
  below ground, walls) drawn at the zoom over the surface faded back.
  Names are the warp list's (`WARP.places`), so a place added there is on
  the map; a room's name below ground comes from its zone's last part.
  Keep any new pass sliced: no frame may stall on it.
- 18t's stages are finished at bake by `finish` (contact shade under
  everything at the street's edge, a depth grade, grain, and a pool of
  light on the street under every warm lit pixel above it), so a new
  stage's lamps and windows light the ground on their own.
- 18u's hits: a chuck you hit is `st` 4 (squashed and flashing on its own
  `fm` material for `bonk` seconds), with 18u's `FX` pools (stars, a ring,
  the points rising, dust on a miss); nothing is made per hit.
- 18v's Alley Roll is simulated (`SKEE.sim(x, a, s)`, 1/240 s): lane,
  hump, flight, then bounces and rolling on the tilted board against the
  cups' lips, the walls and the bullseye's rings (the 10 open at its top,
  the 20 and 30 taken from the air, nothing climbs out of a ring). It
  returns the path the game plays back, its sounds (`ev`) and the score:
  a cup, a ring's slot (`SKEE.slot`), the gutter or short. A slow ball on
  a cup's upper lip tips in. Check the spread over x, a and `S0`..`S1`
  after changing anything in `SK` or the sim. Back-to-back 40s and up are a HOT HAND,
  the ninth ball scores double, and the tickets (`g.tix`, one for every
  ten) feed out of the slot as one plane whose texture repeats. Each ring
  has its own glow torus and the bulbs three materials: colours change,
  nothing is shown or hidden.
- The tuning house by the tower is 14s3 (`TUNE`: `FL`, `BF`, `SF`): its
  pad levelled by `RADIO.hut` (04), on `TUNE_RING`, a 2 m patch let into
  the 8 m ground and holed over the cellar (`TUNE_HOLES`). The shelter
  under that is deeper than any hole needs. The hut's VOID runs to head
  height (over the stair's well the ground must not hold you), and each
  stair's ramp overlaps the floors at its ends by 2 cm. The feed line
  (14s2) ends at a pole off the hut's south-west corner. The steel door
  to the shelter is latched; its route is `gate:true`.
- The warp list has pages of thirty (arrows or Tab turn them over).
- Darts (18d) is played on a board object: `DARTS.start(board)` with
  `HANGOUT.dart` (the dug-out, against Dale) or `WESTPARK.dart` (the Pine
  Knot, against Gus). A board carries its face's middle, radius, oche,
  floor `fy`, idle darts, chalkboard, `opp` and the game left on it, and
  hangs on a wall facing +x. 12b's `HANGOUT.dartTex` is the face both use.
- The velvet room (12f, `VELVET`) is behind the poker room's south wall
  under the generator house, through the old frame of the house's front
  door. Its door is latched with an `onUse`: locked, `E` opens the keypad
  (`VELVET.ask`, a typed box; 17's keydown returns at once while
  `VELVET.typing`), and only TERRY opens it; after that it is a latched
  door driven by `d.manual` (never set a latched door's `target`, which
  `updateDoors` works out). The doorway has its own VOID, or the yard's
  ground over the wall's thickness lifts you onto it. Its record console
  is `VELVET.radios` in 20's `nearRadio`; its route is in `VELVET.routes`.
- Zombie mode's roof gun (21's `RG`): a `roofgun` cache gives the kit
  (`S.roofKit`, a belt `S.belt`, the second crate more belt). Behind the
  wheel with the kit it rides the car's roof (the car's bounds measured
  once level, `c._rgY`), is laid on the point under the middle of the
  chase view, fires on the mouse (`rgFire`: the guns' own `rayWorld`,
  `glassRay`, `rayZombie`, `hurtZombie`), runs hot (`S.rgHeat`), and
  borrows `FLASH` at its muzzle. Built in `build()` with the rest, so the
  warm-up sees it.
- Hollow Road and Edinboro Beer (14mb, `BEER`; loaded after 14s3 so its
  clerk can be one of 14q's crowd): `EAST.beer` (04) holds the road's
  centre, its clearing, the lot's clearing and where the road runs off the
  map; 04 grades both level and makes them meadow, 07 holds the shell low
  round them, 14m keeps its trees out and opens its corridor wall at the
  mouth, `EAST.noPole` keeps the wires off the mouth. The road, its mouth's
  fillets and the lot are one `sdPaveGeo` surface with the building cut
  out. The stock is one atlas (`BR`, laid out inside a margin) mapped onto
  each stacked block. Drive through the aisle slowly and `updateBeer`
  (from 14's `updateLife`) has the kid put a case in.

## Round 36 notes

- A sign goes in front of what holds it up: its face is never behind a post,
  pole or leg from the side it is read from. Posts stand behind the board or
  beyond its ends; a two-sided board's posts go beyond its ends; street
  blades sit on top of their pole, which stops under them. 02 keeps every
  `signPanel` in `SIGN_FACES`, and under `?zdebug` 01's `detailMesh` reports
  its entries to `ZDBG` too, so a checker can find thin uprights against
  every face.
- The arcade's marquees (12c) are one atlas of cells shaped like the panel
  they show on (448 × 128 for 0.56 × 0.16, three across), each game in its
  own face, colours and tracking (`MQ`, by place in `NAMES`), one line where
  it sits at 30 px or more, else two matched lines.
- Edinboro Beer's counter is the cashier's office (14mb): a booth with its
  own ceiling, a sliding window and ledges onto the lane, its door on the
  west side, its own indoor zone (`EDINBORO BEER · THE OFFICE`).
- Hollow Road runs on to `EAST.beer.end` (−1700). 14mb paves it to its old
  end (`PEND`, −1338) and 14mc on from there. The pretzel works (14mc,
  `PRETZ`) is `EAST.pretz` (04): its `site` (graded, `siteDist`) and its
  `mouth` (where Hollow Road's east edge line breaks), on `RING_PRETZ`
  (4 m, holed out of `RING_FAR`), under its own 8 m canopy shell
  (`EAST.pcan`, holed out of the 32 m one). The building's floor is
  `PRETZ.FLS`, 1.2 m up on a plinth at dock height; the trailer at the open
  dock is walkable. The belts' texture scrolls and the pretzels on them are
  three InstancedMeshes, both run by `updatePretzelWorks` (from 14's
  `updateLife`) only within 110 m. The forklift is a crowd driver with a
  forklift `prop` and its own `COL_DYN` box, like the baler.

## Round 37 notes

- A finer ground patch let into a coarser ring with no apron of its own
  is stitched to it: `grid(..., stitch)` (04) gives its border the coarse
  lattice's heights, straight between the coarse corners as the coarse
  triangles draw them, and `groundAt` takes the same through `_ringH`. The
  tuning house's and the chapel's 2 m patches are. Without it a crest
  opens slivers of sky along the seam.
- `frameX` / `frameZ` (09) take the floor their jambs stand on as a last
  argument; left out it is the visitor centre's `FL`, and a frame on a
  floor up a storey runs its jambs down into any room under it.
- The velvet room (12f) runs to z −168.4: the lounge to the partition at
  z −171.4, the back room through the beads (`BA`..`BB`) behind it. From
  the poker room its door is not to be seen: the leaf carries a face of
  `TEX.block` with world uvs, so its courses run on from the wall's. `E`
  at it while locked says A LOOSE BLOCK and brings up the keypad. Violet
  on the chaise is 14q's crowd, added by `VELVET.people()`, which 14q
  calls at its end (12f loads before it); her pose is 14q's `lounge` job
  and she holds 14q's `coupe`.
- Past the pretzel works a trail (`EAST.pretz.trail`, a clearing a path
  wide in `siteDist`) runs east through `EAST.pretz.woods` to a clearing
  on the shore (`EAST.pretz.lake`); real trees either side, walls round
  both, and the bank a chain of colliders a step short of the water,
  worked out from `lakeSD` (14mc, and 14md the same).
- Hollow Road now ends at −1880. 14mc paves it to −1660; 14md the rest.
  The office park (14md, `OFFICE`) is `EAST.office` (04): its site, out
  to the shore so the lake shows behind it, and its `mouth`. Hollow
  Road's east edge line breaks at each mouth in `[pretz, office]`, and
  14mb opens its east wall and tree rows at each site. `RING_PRETZ` and
  `EAST.pcan` reach x 1024, z −1920 for it. Each building is 14md's
  `building(K)`: the ground floor's walls and glass by kind, the storeys
  over it a dark solid under a skin of the kind's material and bands of
  `tint`, a pair of store doors, and `fitout(F, W, D, st)` lays the inside
  in the building's own frame (`u` across the front from its middle, `v`
  in from the front wall): lobby, elevator wall with a way through,
  cubicles in fours, a glass conference room. The fountain's water and
  spray are textures `updateOfficePark` (14) scrolls within 150 m.
- The arcade's thirteenth to fifteenth cabinets are 17 (18z1, Abduction
  Acres), 18 (18z2, Cropduster Ace) and 19 (18z3, Deep Well), on the back
  wall past Silo Scramble.

## Round 38 notes

- **Never plain white.** Nothing in the world is painted plain white: no
  wall, slab, trim, building or vehicle body. Large surfaces stay tinted
  and no brighter than about `#d8`-ish in any channel (buff, cream-tan,
  sandstone, warm grey); a light surface takes a warm or cool cast, never
  `#e8e8e4`-and-up neutrals. Sign faces and lettering are the exception
  only where the real thing is white, and even there prefer `#d8d0c0`.
  The plaza's paint and the pavers obey it too.
- Seats face the way they are used: a chair at a table or desk faces it,
  a bench faces what it was put there to look at (the fountain, the
  water), its back on the far side. Check with `tools/seats.js`, which
  lists seats with their back in front of them and seats with their table
  behind them.
- The office park's buildings (14md) are hollow, floor by floor: each
  storey a slab (open over the shaft), its carpet (`carpet()`), ceiling,
  tubes, two lamps and a zone `NAME · nTH FLOOR`; the skins are per storey
  (Two: a bronze spandrel over each slab's edge and bronze glass to the
  next; One and Three: wall, a band of `tint`, wall). Each has an elevator
  (`elevator(K, name, levels, top)`): a shaft at the frame's u 3.25..5.15,
  v 10..11.9, a car that is a moving SURF (its `y` changes, never its rect)
  with its doors, landing doors on every floor whose `COL_DYN` collider
  opens only while the car stands there open, a call use outside and a
  ride use inside on every floor; `OFFICE.elevKey` (17's keydown) takes a
  number while you stand in an idle car. `updateElevators` runs from
  `updateOfficePark`. Furniture comes from the frame's kit (`kit(F)`):
  `chair`, `guest`, `station` (a chair and the desk 0.78 in front of it),
  `sofa`, `table` (its chairs facing in), `plant`, `art`, `files`, `shelf`,
  `wall` and `glassWall` (whose ends never lie in a pane), each placed by
  (u, v) facing one of `front`, `back`, `+u`, `-u`.
- The fountain's water is the lake's ripple normals drifting (`OFFICE.flow`)
  and a pool of drops (`OFFICE.drops`, Points) thrown from the jet and the
  rim's nozzles and off the bowls' lips, run within 130 m.
- Hollow Road's dressing is 14me (`HOLLOW`): the pole line down its west
  side and a drop to each place, a cobra head at each mouth, its signs
  (each post behind its board from the side it is read), reflector posts,
  the guardrail at Hollow Run, the bus shelter, the verges, and the small
  things at the beer distributor and the pretzel works; `updateHollowRoad`
  (14) lights the heads and puffs steam off the oven stacks.

## Round 39 notes

- An elevator's doorway (14md) has a sill: a flat across the wall's depth
  from the landing's slab onto the car's floor. Without it there is a gap
  between them, and stepping out drops you to the floor below.
  `tools/elevators.js` rides every car to every floor and walks out.
- 14md's `kit`: `desk` puts its own clutter on (`DQ`, its own random
  stream so nobody moves seats), unless `clutter:false`; `shelf` is an open
  case (back, sides, top), never a solid box with the books inside it;
  `clock` is a disc on the wall facing its way. `pods` lays LDS's pinwheel
  pods, `poster` paints a travel poster. Each building's `floorNames` hang
  a two-sided board over the way out of the elevator on every upper floor.
- The office lot's cars are seeded (`parked` in 14md), fuller near the way
  in and the buildings. Each car is a `COL_DYN` box and six draws close
  to; keep a lot near fifty, not a hundred.

## Round 40 notes

- The office park's elevators move on the physics step: `OFFICE.step(dt)` runs
  first thing in 17's `fixedUpdate`, and carries whoever stands in the car by
  exactly the car's move, so you never trail it. Across the car's door is a
  `COL_DYN` collider that rides with it (`E.carCol`), solid whenever its doors
  are not open, so nobody walks out between floors; a landing's doors are
  open only while the car stands there open. Calls are a set (`E.calls`,
  `OFFICE.press(E, f, hall)`), served the way it is going; it eases up to
  speed and down to the floor (`EL_A`, `EL_VMAX`); anyone in the doorway
  (`E.gap`) holds the doors. A net puts anyone in the shaft without the car
  under them back out on the nearest landing. `updateElevators` only draws:
  the car, the leaves, the lantern (one canvas per elevator, over every
  landing and inside the car) and the panel's lit buttons, redrawn only when
  they change. `tools/elevators.js` rides every car to every floor, walks
  at its doors the whole way, and checks the doors hold for the doorway.
- Thin bucket boxes are grown by 1 to 3.5 mm at bake, plus up to 1.8 mm by
  entry, so two of them meant to sit a little apart must sit at least 8 mm
  apart, or the bake can close the gap and put their faces back in one
  plane. A run of liner pieces round an opening stands the pieces over and
  under it a centimetre proud of the ones beside it (14mf's `run`).
- The office screens are one atlas (14md's `SCREENS`, sixteen 1980s
  screens, each painted on its own canvas and copied into its cell) drawn
  through `screen(w, h, x, y, z, ry, k)` into one detail mesh; each
  building's kit has `K.scr`, the screens its terminals show.
- Floor coverings laid as planes (14md's carpets, stone, the raised floor)
  take `texPlane`'s `po`, a step up the polygon-offset ladder, as well as a
  centimetre or more over what they lie on.
- The Lakeside Dive is 14mf (`DIVE`), on `EAST.dive.site` (04: graded,
  `siteDist`, and 07's `canopyY`); `RING_PRETZ` reaches z -1936 and
  `EAST.pcan` -1952 for it. The service drive to it is part of the office
  park's paving (14md's `svc`), and the park's north wall stops at the dive's
  site. Its jukebox is `DIVE.radios` in 20's `nearRadio` (station 0), its
  routes `DIVE.routes` in `tools/walk.js`, `updateDive` (from 14's
  `updateLife`) its lamps. The food truck is built piece by piece in its own
  frame (`q(lx, lz)`), chrome on its own material (`CH`).
- A cabinet's screen in the arcade is 01's `crtMaterial(tex, w, h)`: a curved
  face, bloom, scanlines and a slot mask that fade by `fwidth`, the corners
  dimmed. It marks its canvas `_crt`, and 18g's `_cbTube` then leaves that
  canvas alone (the slots and the poker machine keep their own).

## Round 41 notes

- Every office building has two running elevators (14md): `elevator(K,
  name, levels, top, uc)` builds one at `uc` across the frame, `UC` (4.2)
  and `-UC`, each with its own shaft, landing doors, lantern, buttons, zone
  and routes; the floors are open over both shafts, and the lobby's back
  wall has a door either side of the way through. Keep the frame's u from
  -6 to 6, v 7 to 12 clear on every floor: it is the way out of both.
- 14md's kit has `aquarium`, `lateral`, `flag`, `pedestal` (a computer on a
  plinth, its screen from the atlas), `trophies`, `barCart`, `globe`,
  `grandfather` and `deposit` as well. The plaza (14md) has café tables
  under umbrellas, the sculpture, flower boxes along the fronts, bollards,
  bins, a bike rack and the plaque.
- Hollow Run Marina is 14mg (`MARINA`), on `EAST.marina` (04: `site`, the
  drive in off Hollow Road `drive`, its `mouth`; graded, `siteDist`, 07's
  `canopyY`). Its drive and lot are paved with Hollow Road's stretch south
  of the pretzel works (14mc); 14mb opens the road's east wall and tree rows
  at the drive and breaks the edge line at its mouth; 14me lights the
  mouth. Its pier and T are `LAKESIDE.docks`, so any boat ties up at them
  and a boat taken from them ties up at Lake Street's. Its pontoons are
  14n's `LAKESIDE.pontoon` (public now, with `LAKESIDE.WY` / `DY`), each
  moored by 14p's `BOAT.moor(S)`, which ties it to the dock it lies along
  and gives it TAKE THIS BOAT. A boat added after 14p calls `BOAT.moor`.
- The pretzel works' south strip (14mc) holds the break room, the QA lab,
  the film racks and the maintenance cage. Before putting a person on a
  floor, check they stand clear of every collider at head height: a man
  half inside an oven hood looks stuck against it.

## Round 42 notes

- **Boats (14p).** `HULLS` holds each kind you can take (`pont`, `skiff`):
  its length, half beam, how far off a dock's edge it lies at a berth
  (`berth`, clear of the pilings, which stand outside the deck), its lines,
  how it goes, and its collider moored. `_hullPts(H)` is its outline (down
  both sides every 0.7 m, so a piling cannot slip between points).
  `_boatHits(x, z, yaw, H, skip)` counts the points touching; `_boatPush`
  is the way out of what they touch. The boat moves in stretches of 6 cm at
  most (`_boatStep`): a pose that touches more, or goes further into what
  it touches, is refused, the way into the contact is taken off its way and
  the rest kept (it slides along a dock), and `_boatEase` works a hull off
  anything it rests against. `_dockBerth(x, z, yaw, maxD, H, chk)` tries
  points along each edge, either side of it, and `chk` turns down any pose
  that touches. `BOAT.moor` brings every boat to the clear berth nearest
  where it was put. Every boat must be able to get away: check with
  `tools/boats.js` (it fails a boat that cannot get 8 m clear, or whose
  berth touches), and leave each moored boat a way out.
- The fishing skiff is 14n's `LAKESIDE.SKIFF`: a hull lofted from stations
  (`SKIFF.station(t)`), `SKIFF.hull`, `SKIFF.motor(run)` (the 25 with its
  tiller), `SKIFF.put` / `LAKESIDE.skiff`. Taking one swaps hulls with the
  rig, and `BOAT.setKind` makes the rig up for it (motor, fittings, lights,
  where you sit). A still outboard of the other kind waits in `BOAT.spare`.
- **People's heads (14b).** The head is one surface, `_headGeo(o, h)`: a
  sphere shaped to a skull, jaw, chin, brow and sockets, coloured vertex by
  vertex (shade in the sockets and under the jaw, warmth at the cheeks, the
  lips), its hair and any beard part of the same surface, thickened and
  coloured by region with feathered edges. Styles: `hairStyle` (`short`,
  `crop`, `recede`, `bald`, `long`, `pony`, `bun`) and `beardStyle` (`full`,
  `short`, `goatee`), else picked from the look's own hash (`_lookHash`);
  `stubble` shades the jaw. The eyes are a sclera, an iris and an upper lid;
  the brows are bars along the brow ridge. `rigidSkin` multiplies a part's
  colour by its geometry's own colour attribute when it has one. Never put
  `rboxGeo` on a person: it is not indexed and three small pieces doubled a
  person's vertices. A person is under 3,400 vertices; keep it so.
- **Hollow Road Books** is 14mh (`BOOKS`), on `EAST.books` (04: graded,
  `siteDist`, 07's `canopyY`), west of the road. Its drive, lot and a strip
  to the porch steps are in 14md's road paving union; 14mb opens the west
  wall, the tree row and the west edge line at it; 14me keeps the pole line
  out of its mouth, lights the mouth and runs a drop to the shop. A shelf
  of books is one block whose front is a band of `BOOKS.tex` (`books()`),
  so a wall of them is cheap. `BOOKS.radios` joins 20's `nearRadio`.
- The Dive has a dock (`DOCKZ`, 14mf: the bank's wall open across it) in
  `LAKESIDE.docks`, a fire pit (`DIVE.fire`, a `fire` lamp flickered by
  `updateDive`) with Adirondack chairs, and a horseshoe pit. The marina has
  the fishing boats' finger, the pavilion (`addRoof`), the service shed, the
  fish-cleaning table and the no-wake buoys (`marinaExtras`).
- An office floor that wants more is wrapped, not rewritten: keep its plan
  (`PLANS_A[3]` and so on) and add after it (14md's round 42 block).
- Never put a `// (comment)` partway along a line with more code after it:
  everything after `//` is gone. It has cost three fixes now.

## Round 43 notes

- **Grain and rounded edges on every hand-built thing.** 01's `surfaceGrain(mat)`
  (put on every `detailMesh` material that draws no texture) adds a grain in
  world space (a fine speckle, a mottle, a broad unevenness, each a few per
  cent, each fading out once a pixel covers several of its cells) and a
  lighter rim along every box's edges, the way a rounded edge catches the
  light. The rim needs no vertices: `mergeEntries(entries, true)` writes
  each box face's size in cm and its place across it into the uv channel
  (`width + u*0.999`, `height + v*0.999`; -1 for anything not a plain box),
  which the shader reads. It is off with SURFACE DETAIL (`FX_U`). A
  `detailMesh` material that does take a `map` keeps its uvs and gets
  neither. The hash wraps its cell (`mod 289`) first: a kilometre out, a
  float has too little left over and it drew rings.
- The office park's heart (`EAST.office.level`, 04: the lot, the buildings
  and the plaza) is held level with the road; the bank's slope to the lake
  starts only past it. The plaza's east end and the old lawn walk used to
  float up to two metres over the falling lawn. The lawn walk (14md) is now
  a strip laid on the ground, and never a paved rect: `addPaveRect` sets
  the height you stand at to its own `y` over the whole rect.
- The office park's dock (14md, `OFFICE.dockZ`, `dockShore`, `dockLamps`):
  an overlook on the bank where the walk ends, a boardwalk down to the pier,
  the pier and its T in `LAKESIDE.docks`, the bank's wall open across it.
  Its rails' corner posts are shared (`POSTS`), the handrail wider than the
  posts and under their caps.
- The bookstore's cats are 14mh's `CATS` (`updateCats`, from `updateBooks`):
  each a few parts so it can move. Three wander the floor (`_catFree`: the
  shop's floor clear of colliders at a cat's height; `_catPath`: a search
  over a 20 cm grid of it, so they go round the cases), three keep a perch.
  `E` by one pets it (`CATS.pet`, a purr from 20's `AUDIO.ctx` /
  `outLP` / `noise`). The feather wand (`CATS.toggle`, from its jar on the
  counter) puts the feather where you look on the floor; the floor cats
  stalk it from their own side of it, crouch and pounce, the perchers watch.
  The wand goes back if you leave the shop. Anything built at the origin and
  moved about every frame sets `userData.noCull`, or 18c's `cullLoose`
  hides it for good.


## Round 44 notes

- Birch Hollow Apartments is 14mi (`APTS`), on `EAST.apts` (04: graded,
  `siteDist`, 07's `canopyY`), west of Hollow Road past the bookstore, its
  site running from the bookstore's north wall (z −1852) to −1879.5. Its
  drive and lot are in 14md's road paving union; 14mb opens the west wall
  and breaks the west edge line at its mouth; 14me keeps the pole line out
  of the mouth and lights it. The bookstore's north tree row stops behind
  the apartments (x 682).
- The building is one plan, mirrored: `s` −1 the north units, +1 the south,
  `p` out from `ZC`, `d` back from the front wall. Each storey's walls are a
  band of their own openings (`run`), every unit lined in its own paint, its
  floors laid by kind as one mesh a kind (`floorAt` / `buildFloors`, world
  uvs, kitchens and baths a step up the ladder). `UNIT(s, k, look)` builds
  the partitions, doors, zones, kitchen, bath, bedroom and lights; each
  tenant's things follow it. Seats go through `seatAt` / `chairAt`, which
  take a facing (`front`, `back`, `out`, `in`) and set the seat's yaw from it.
- The sliders are `DOORS` entries with `slide` along z: a leaf's `ax` names
  the axis 17's `updateDoors` moves it on (x when left out). They are
  manual (`E`) and solid while shut, so a route onto a balcony or patio
  wants `gate:true`.
- The tenants (14q's crowd, added in 14mi) come and go by the hour through
  `home(x, z, from, to)`, decided only while you are 16 m or more away.
  `APTS.radios` join 20's `nearRadio`.

## Round 45 notes

- Hollow Road Books' cozy pass (14mh, the round 45 block before "what is
  built"): the window seat on the low shelves under the south windows, the
  coffee cart south of the door, footstools and throws at the armchairs, the
  cat's basket by the hearth, lights strung along every beam (`rn_glow`
  bulbs on a swagged cord), plants, prints either side of the stove's pipe,
  the clock over the counter, a staff-picks card and a green lamp in each
  front window, a floor lamp by the window seat, mums by the steps, and an
  OPEN card on the door's group. Keep the aisles the routes walk clear.
- Birch Hollow's round 45 block (14mi): curtains at every bedroom and end
  window (`panelP` / `panelD`, three folds on a rod), rugs (`RUG`, a plane
  at F+0.026 two steps up the ladder), coats on hooks inside each door, a
  clock over each fridge, a lamp by every slider, the wreath on 201's door
  (`DG`, each front door's group), gutters and downspouts, condensers out
  back, the meter bank on the north end, and a picnic table and grill on
  the back lawn. Pictures on an end wall keep off its windows (d 1.6..3.2
  and 8.0..9.6).

## Round 46 notes

- The far canopy shell is on the 16 m ground's own lattice across `RING_FAR`
  (07: `shell(RING_FAR, 16, …)`, then 32 m outside it). On 32 m one shell
  triangle bridged a notch between two 16 m crests and showed against the
  sky as a green sliver. A shell over a ring of ground is never coarser
  than that ground.
- Ridge Lane and Hollow Ridge Trail are 14mj (`RIDGE`), on `EAST.lane` (04:
  `mouth`, `ew` and `ns` (the lane's two graded strips), `lot`, `head`,
  `woods`, `look`). 04 cuts the hillside behind the lane back to about a
  third (a soft cap on `baseHeight` by distance from the lane) and lays
  the trail out on that grading (`EAST.lane.trail`: legs across the
  hillside at about 11 in 100, switchbacks where its woods end, then to
  the overlook, whose shelf is graded to `look.y`). Its hillside is a 4 m
  patch (`RING_TRAIL`, holed out of `RING_FAR`) under its own 8 m shell
  (`EAST.tcan`), which `canopyY` holds down across the woods: 14mj fills
  them with real trees from wall to wall, clear of the trail, the shelf
  and the view east. The lane's paving is in 14md's union; 14mb opens the
  road's west wall and breaks its edge line at the mouth; 14me lights it.
- `fitText` / `fitHwy` on a sign's own canvas (`signTex` marks it `_sign`)
  keep every line 7% clear of the board's nearest edge, whatever the caller
  asks: a line set too near an edge is shrunk, never run up to it.
- `tools/standers.js` fails anyone standing still in a seat or inside a
  collider (a person meant to be inside a booth or a truck whose collider
  is all of it carries `inside:true`). `tools/sitters.js` also fails anyone
  seated with a table behind them and nothing in front. Run all three
  (`sitters`, `standers`, `seats`) after putting down any person or seat.
- A skiff floats with its waterline at its own y 0, so it has a sole (an
  inner floor at 3 cm, shaped to the hull at every station) and everything
  in it stands on that, or the lake shows in its bottom.
- The apartments are open plan inside: no interior door leaves, wide
  openings, the closet a set of bifold doors on the partition, the kitchen
  counter set back from the front door; the sliders open as you come up.

## Round 47 notes

- `tools/zfight.js` lists only overlaps that can be seen. From the middle
  of each shared patch it casts along the face's normal against every mesh
  (both sides, every layer, shown or not: the draw distance hides far
  tiles). A patch is buried if the ray meets something within 2.3 cm or
  the inside of a solid, if it is an underside on the ground, or if it is
  in a sealed cavity that no ray of a fan gets half a metre out of. Two
  faces of one plain-coloured detail mesh in the same colour are skipped,
  since they draw the same. `ALL=1` lists everything. A list of boxes
  (each with a `name`) sweeps several places in one load, and `amin` (m²)
  sets the smallest shared patch it reports. `WHY=1` prints what each ray
  met.
- Trim never shares a plane with the opening it frames. A casing, a
  door's track or a sill stands at least 4 mm clear of the opening's
  sides, head and sill (14n's `win` / `door`), because the wall's thin
  boxes grow at bake. A floor slab between storeys stops inside the
  outer walls, so the walls' own tops are the floor across their
  thickness. A run's pieces over and under an opening in a partition
  with no room side stand 6 mm proud both ways (14mi's `run`).
- Never plain white is enforced at bake. 01's `detailMesh` brings any
  pale, nearly grey colour (brightest channel over 0.85, spread under 0.16)
  on a lit, untextured, non-glowing material down to 0.85 (`capWhite`).
  Pick tinted colours anyway: the cap only stops the worst.
- A double leaf that laps when shut (the elevators' landing and car doors,
  14md) has its second leaf 12 mm forward of the first.
- Curtains hang in front of a window's stool, never through it (14z2's
  `win`).

## Round 48 notes

- 15's `verges` takes paving of any size. It used to skip a piece over
  60,000 indices, which left Hollow Road (14mb, 14mc and 14md's unions) and
  the stone house's drive with hard edges. Its vertex and edge keys are
  numbers, so the pass stays about a second at load. Walks (`walkflat`),
  pads (`padflat`) and trails (`trailbed`) blend too. `VERGES.gaps` lists
  each edge with other paving under 2 m beyond it across the grass: a
  join that missed. Look at those after adding paving.
- A trail through the woods is `trailbed` (08): the same bark as
  `mulchbed`, but its own bucket, so its edges wear into the ground. A
  flower bed stays `mulchbed`, with a hard edge. A trail starts on the
  paving it leads from, never a strip of grass short of it (14mj starts a
  metre over the lot; 14mc's runs from the truck court).
- The drone (17) flies anywhere inside `GROUND_EDGE` (60 m in), not
  ±1500 m.
- Zombie mode's drone is `I` (21's `droneKey`; F is the pipe bomb there).
  You stay standing where you sent it up, and the dead still come for
  you. It is tethered 140 m from you (17's `droneUpdate`), since the dead
  are only kept within 150 m. Its gun (`DG`, a pod on 17's `drone` group)
  fires on the mouse at the point under the crosshair, tested as the roof
  gun's shots are, and runs hot on a long burst. While armed, 19 frames
  the drone low in the view, so the crosshair is clear of it. The hand gun,
  its slots, aiming, the wheel, bombs, melee and reload are off while you
  fly. `ZOMBIE.spawnAt` and `ZOMBIE.dgState` are for tests.
- 21 has no local named `drone` (its ambient sound is `amb`): it would hide
  17's.

## Round 49 notes

- Ridge Rambler is 18z4's `_RRM` on cabinet 20 (12c's sixteenth, `NAMES`
  place 15), on the front wall past Alley Roll at x 83.6. It is a
  side-scrolling run-and-jump game of its own: Ranger Rosie, five worlds
  (`WORLDS`: meadow, deep woods, lakeshore, the old mine, snowy ridge) of
  four stages, each world's fourth ending at Old Grizzly. A stage is put
  together by `build(L)` from the hand-made pieces in `CH`, each twelve
  rows (the screen's rows 4 to 15), starting and ending on ground, with a
  tier for when it may appear, seeded by the stage's own number, so a
  stage is the same every time. A gap is never wider than six tiles and
  nothing to land on more than four above where you jump from. Check a
  new piece by building all twenty stages and walking their tiles (the
  scratch `rrtest` did: standable cells, up to four up and five across,
  down and seven across, rafts and springs counted).
- For speed, a stage's tiles are drawn once onto a canvas of the whole
  stage (`paintStage`; `retile` redraws a crate that changed), the
  backdrops once per world (`BD`), and every figure is a sprite drawn
  once at load (`ROSE` from pixel rows, `SPR` from shapes). A frame is a
  handful of `drawImage` calls. Keep new cabinet games the same way.
- Its sounds go through a map onto 20's blips (`SND`). Its game-over
  carries on from the world reached (`_RRM._world`); reaching the summit
  sets it back to the first world. Its best scores are `_cbTop("rambler")`.

## Round 50 notes

- **A local name never hides a global.** Round 48 named zombie mode's
  ambient sound `amb`, which hid 03's ambient light inside 21's closure.
  The gloom (`ZOMBIE.atmos`) dims that light every frame, so with the sound
  not running its first frame threw, and zombie mode froze under its
  banner. Run `tools/shadows.js` before committing: it lists any local
  declaration in the files you changed that hides a global (`ALL=1` for
  every file; the meant ones are in its `OK` list).
- Test zombie mode with the sound off as well as on (the headless runs had
  audio, which is how the freeze got through). A frame that throws in 19's
  `frame()` keeps the loop alive but never reaches the draw, so the picture
  freezes under whatever DOM is up.
- **The world's walls go round the outside of what is built, never between
  two places that lie side by side.** Hollow Road Books, Birch Hollow and
  Ridge Lane are one place you walk about in now: the walls between them
  are gone, and the outer ones (the apartments' south side, the lane's and
  the mountain woods') stay. The sweep that found them (both sides of every
  edge wall within 6 m of a named place or paving) is the check to run
  after adding a place; only the interstate's end walls and the lake bank
  by Lakeside Park's dock, which carry their own message, should remain.
- **The mountain is walkable to its summit.** `EAST.lane.woods` runs x 320
  to 646, z −2192 to −1792, with the summit (`EAST.lane.summit`, 168 m) at
  (400, −2112). `RING_TRAIL` (4 m ground) and `EAST.tcan` (8 m shell) cover
  it, and 14mj fills it with real trees (5 m apart below the overlook,
  5.8 m above). 04's cut of the hillside behind the lane now eases off
  between 170 and 330 m out instead of stopping, or there would be a step.
  The trail runs on past the overlook. The climb to the overlook keeps its
  old box; the rest is a least-cost path over a 4 m grid (each step costs
  its length plus a penalty for grade over 13%, none over 32%, none within
  8 m of the trail below), so it finds its own switchbacks. The summit has
  its level top, a bald clearing (`siteDist`), boulders, a cairn and the
  survey disc, its sign, two benches facing east, its zone, warp and walk
  routes. A blaze post never stands on another leg of the trail.

## Round 51 notes

- **Hollow Ridge Trail is a few long legs, not a sawtooth.** 04 lays it in
  two halves. The lot to the overlook is the round-46 climber, legs laid a
  step at a time (it starts north along the lane, where the lane's cut lets
  it climb gently). The overlook to the summit is a search over a 4 m grid
  that carries the way it is heading as part of its state: each step costs
  its length plus a charge for grade over 12% and far more over 17% (none
  over 32%), and each turn costs by how far it turns (more for a hairpin),
  so it holds a long line across the slope and turns back only when it
  must. It judges grade on the ground smoothed over about 12 m. Each half
  is cut to its corners (Douglas-Peucker), its corners rounded (corner
  cutting), and the whole laid out again 2 m apart. Never smooth a path
  whose points bunch up: a 0.1 m step next to a 2 m one turns averaging
  into a cliff.
- **A trail is benched into the hill.** Its profile is held to 16% per step
  (pulled to the ground, then clamped forward and back with the lot, the
  overlook and the summit pinned), and `baseHeight` eases the ground to it
  within 2.3 m of the path and over 4.5 m more, wide enough for the 4 m
  ground lattice to carry it.
- **No tree covers a trail.** `FOREST.trail(points, halfWidth)` (07)
  registers one, and `FOREST.plant` then refuses any plant whose crown would
  reach the path (`trailGap`: a hemlock or a maple, crowned near the ground,
  must stand its crown's reach clear; an oak or a pine with a tall trunk
  1.7 m; a fern 0.9 m) and returns false, so its planter adds no trunk
  collider. `FOREST.finish` drops any plant set down before its trail was
  registered and sinks that trunk's collider far underground (its rect
  never moves). Register a new trail before planting its woods. Plants
  record their species (`sp`).
- Zombie mode's codes: `ARSENAL` (21's `giveAll`) gives every gun, each
  magazine full and its reserve topped up, the roof gun's kit with a full
  belt and five pipe bombs, and does so at the start of every run while it
  is on. Like the others it marks the run `cheated`.
