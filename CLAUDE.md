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
  gun's flash is `FLASH`, a lamp in 16's pool lit by its `mod`.
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
- The arcade's cabinets are 12c's `NAMES` (six, the marquee a cell each)
  and 18g's `_CBG` by cabinet index: a game is an object with `newGame`,
  `step`, `draw`, `attract`, `lean` and optionally `key`, `mouse` and
  `done` (called once it is over, to keep its best scores, 18m's
  `_cbAddTop`). 18m registers Brickyard Breakout (2), Groundhog Gulch (4)
  and Turnpike Turtle (5); 18g's loop runs whatever is registered.

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
