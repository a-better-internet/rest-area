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
  to it 0.5).
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
  `twoStorey`) are built on it.
- `zoneAt` names the last zone added that holds you, so add the general
  zone first and the particular ones (a dock, a pavilion) after it.
- A door that slides (the arcade's pair, 12c) is a `DOORS` entry with
  `slide` (each leaf's group, its shut `x0` and how far it runs, `dx`) and
  a `rate`. `updateDoors` moves the leaves along x instead of swinging
  them. Its `blockCol` makes it solid while shut, and `tools/walk.js`
  opens any door that opens itself before walking a route.

## Tools

Run them with `NODE_PATH` pointing at a global Playwright, for example
`NODE_PATH=/opt/node22/lib/node_modules node tools/walk.js`.

- `tools/shot.js shots.json outDir [w] [h]` renders screenshots from the
  game itself (see its header for the shot format).
- `tools/walk.js` walks every route and seat with keys held at walk, run and
  sprint, and fails if you get stuck anywhere. Add a route for any new place
  you can walk to.
- `tools/zfight.js '{"x0":..,"x1":..,"z0":..,"z1":..,"y0":..,"y1":..}'`
  finds coplanar faces in a box.
- `tools/signaudit.js [pad]` finds sign text too close to an edge.
