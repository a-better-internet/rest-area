# Rest Area — a walkable Pennsylvania highway rest stop

A first-person web scene of a small rest area on I-79 northbound in Crawford
County, Pennsylvania: a brick-and-gable welcome building with its restrooms,
car and truck lots, a picnic grove with grills, a fenced substation with
standby generators out at the end of a gravel drive, and the interstate going
by. All of it sits in a clearing cut out of the woods, which run unbroken to
the horizon.

Open `index.html` in a browser. There is no build step and there are no asset
files. Every texture is painted on a canvas at load time and every model is
built from code. The only download is three.js r128, from cdnjs.

## What is in it

- **The building.** A brick lobby under a steep shingled gable with a big
  tinted window in its end wall, and two flat-roofed restroom wings, all laid
  out from the overhead photo. The window shows the trusses inside by day,
  glows warm at night, and from the lobby you look out through it. The lobby
  has:
  - a quarry-tile floor, open timber trusses and pendant lights;
  - three vending machines, a payphone and a bi-level stainless fountain;
  - grey swing-top trash cans with their flaps facing the room;
  - a PA highway map and a bulletin board under a WELCOME TO CRAWFORD COUNTY sign;
  - an attendant's desk, brochure racks, and a clock that keeps game time.

  Doors open on `E`. The storefront doors swing out, as code requires.
- **The restrooms** follow the colour reference: yellow wall tile to 2.1 m
  with grey block above, a speckled mosaic floor, beige toilet partitions,
  stainless hand dryers on white panels, and a fold-down baby changer.
  - The fixtures are modelled, not boxed:
    - floor-mount toilets with open-front seats and chrome flushometers;
    - wall-hung urinals with flush valves, one of them set low;
    - stall doors with hinges, latches, occupancy indicators and coat hooks.
  - The men's room has three stalls, three urinals and a light that
    flickers.
  - The women's room has six stalls and a bench.
  - Each room has an accessible stall wide enough to stand in, with grab
    bars. The vanity sits in an alcove behind a privacy screen.

  Between the wings and the lobby are a family restroom and a STAFF ONLY
  office. A janitor's closet and a mechanical room open off service doors at
  the back.
  - The office has a desk with a camera monitor, an office chair, a file
    cabinet, a fridge and microwave, and a whiteboard of rounds.
  - The janitor's closet has a mop sink and mop rack, a wringer bucket,
    stocked shelves, a cart and a ladder.
- **The lots.**
  - Cars park in a two-aisle lot. There are about 34, thinning out with
    distance from the door, and any of them can be driven: `E`, then `WASD`,
    with `Space` as handbrake.
  - By the walk are three accessible stalls inside the stall lines, with
    hatched access aisles between them, signs and blue curb.
  - Tractor-trailers park on the angled truck lot past the island. At night
    their marker lamps stay on, and the reefer units can be heard running.
- **The vehicles** are lofted, not boxed.
  - Sedans, SUVs, pickups and minivans have rounded bodies with real wheel
    arches. Each has a greenhouse, door seams, mirrors and lamps.
  - Tyres have sidewalls and tread, mounted on spoked alloy rims.
  - Rigs run duals on painted steel wheels.
  - Trailers carry painted sides: posts and rivets, DOT tape, road grime,
    and one of a few fictional liveries.
  - Every wheel on the road turns.
- **Visitors.** Now and then a car or truck in the right lane signals off at
  the exit ramp and parks in a free stall.
  - The driver gets out and walks to the door, between the cars and over the
    crosswalk. They go in, come back out a while later, and the car waits for
    them.
  - The car then backs out, finishing pointed down the one-way aisle, drives
    to the entrance ramp and times its merge against lane-0 traffic.
  - Visitors keep a speed-dependent gap to whatever is in front: cars,
    people and you. They honk if you stand in the way long enough.
- **The interstate** is two lanes each way with a wooded median. It has
  rumble strips, mile markers, the REST AREA 1/2 MILE and NEXT RIGHT signs,
  the gore sign and a DO NOT ENTER at the wrong end of the ramp. 44 vehicles
  run on it: sedans, SUVs, pickups, minivans, box trucks, reefers, flatbeds
  and tractor-trailers.
  - Each one follows the car in front with the Intelligent Driver Model
    (a time headway that grows with speed). They pass slower traffic only
    when there is room both ways, and move over for merging visitors.
    Trucks keep right.
  - At night their headlights, tail lights and brake lights come on.
- **The picnic grove** spreads across the lawn south of the building. It has
  tables on concrete pads, charcoal grills (some lit, with smoke and embers),
  a picnic shelter and shade trees. Nearby are the flagpole with the US and
  Pennsylvania flags, a Blue Star Memorial Highway marker and a pet area.
- **The substation** is about 180 m from the building, up a gated gravel
  drive. It is a gravel
  pad behind chain-link and barbed wire, with DANGER signs and a double gate
  that opens on `E` and stays where you leave it. Inside are:
  - a pad-mount transformer and two standby generator sets, with a diesel
    tank and conduit;
  - a block generator house with switchgear, ATS lights and a logbook.

  A pole line runs off south down its cleared right-of-way.
- **The forest.** Northern hardwoods (maple, oak, cherry, beech) mixed with
  eastern hemlock, white pine and spruce, with an understory of saplings,
  shrubs and ferns. Logs, stumps and rocks lie on the forest floor. Trees
  sway in the wind. Past the edge of the walkable zone a canopy shell
  carries the woods over the ridges to the horizon.
- **Time and season.**
  - A day lasts 20 minutes, with sunrise and sunset at Crawford County's
    real times: about 6:05 and 20:45 in July, 7:25 and 18:45 in October.
  - `Y` switches between summer and autumn, which recolours the leaves, drops
    a few, and keeps the clock where it was, so the sun moves instead.
  - At night the lot lights and building lights come on and, in summer,
    fireflies rise over the lawn.
  - Mist lies on the lawns for an hour after sunrise and comes back at dusk.
- **Life.**
  - Three whitetail deer graze at the edge of the woods. They walk with a
    four-beat gait and bound away with their tails up when you get close.
  - Someone reads the map in the lobby, two people share a picnic table, a
    trucker talks on the phone by his rig, and a dog is walked round the pet
    area.
  - A smoker stands by the post outside the doors, clear of the planter and
    the doors' swing. The cigarette is lit: the coal brightens on each drag,
    a thread of smoke comes off the end, and they breathe it out after.
  - Nobody stands or walks in anything. People and the dog steer round
    posts, bins, parked cars, each other and the flower beds. The doors open
    for anyone coming or going.
  - Butterflies work the flower beds on summer days, and grey squirrels hop
    between the grove's trees.
- **The back woods.** Behind the building a path the kids have worn runs
  east off the loop walk, a quarter of a kilometre through the trees, to a
  clearing with a fire ring in it.
  - The fire has flames, coals, sparks and smoke, and a light that flickers
    on the trees around it.
  - Four teenagers in hoodies sit round it on logs and a cooler. One is
    toasting a marshmallow, which goes gold, then black, then gets eaten. One
    is on her phone, one has a can, and one stands with her hands to the
    fire. They look round when you walk in, and they have a few things to
    say (`E`).
  - At the camp are a dome tent, a cooler, a camp chair, firewood, a
    chopping block with a hatchet in it, cans, and a phone speaker playing
    something. A log by the fire is free to sit on.
  - Out in the woods there is more:
    - an old fieldstone wall from when this was a field, broken where the
      path goes through;
    - a hunter's ladder stand strapped to an oak;
    - a rusted-out car sunk to its sills, with a sapling growing past it;
    - a trail camera;
    - flagging tape along the path.
  - Past the camp the property line is POSTED, and the trees between the
    signs are banded in purple paint, as Pennsylvania law allows.
  - You can hear the fire crackle, a little music, and the kids talking and
    laughing, louder as you get closer.
- **Sound** is synthesized, with no audio files: road noise that pans with
  the highway, wind, cardinals, chickadees, a wood thrush and crows by day,
  insects at night, the hum of the building and the generators, the hand
  dryers, and horns. There are also car doors, flushes in the restrooms, the
  flag halyard ringing on its pole in the wind, a distant jake brake, and a
  dog. It starts on your first click; `U` toggles it.

## Controls

| Action | Key |
| --- | --- |
| Walk / look | `WASD` / drag or mouse |
| Run · sprint | `Shift` · `Q` |
| Door · drive · use | `E` |
| Handbrake (driving) | `Space` |
| Sit / stand | `C` |
| Drone · fly up / down | `F` · `Space` / `Shift` |
| Flashlight | `L` |
| Nightfall · midday | `N` · `M` |
| Scrub time | `[` `]` |
| Summer / autumn | `Y` |
| Sound | `U` |
| Plan view · hide HUD | `O` · `H` |

## Layout

World units are metres. +x points east, away from the highway, and the
northbound carriageway's traffic runs toward −z. The building's lobby is
centred on the origin.

| Feature | Where |
| --- | --- |
| Northbound / southbound centrelines | x −112 / −158 |
| Exit ramp | z +500 → +104 |
| Entrance ramp | z −146 → −540 |
| Truck lot | x −90 … −60 |
| Car lot | x −46 … −26 |
| Plaza and building | x −21.5 … +7 |
| Picnic grove | x −20 … +30, z −35 … −95 |
| Substation | x 60 … 90, z −184 … −154 (2.6 m up the drive) |
| The path out back | from the loop walk at x 17, z 1 east to x 278, z 50 |
| The camp | x 286, z 52 |
| Forest zone | x −240 … 416, z −328 … 248 |

You can walk to 22 m inside the forest zone's edge, or on the east side to
the posted line, 58 m inside it. The painted backdrop at the edge is only
ever seen through trees, and everything beyond it is scenery. From the
site at eye height the back woods past x 176 are not drawn at all, because
there are more than a hundred metres of trees in front of them.

## Files

```
index.html          HUD (a PA guide-sign masthead, compass, clock, plan) and script tags
js/00-config.js     spawn, highway and site dimensions, lot geometry
js/01-helpers.js    registries, geometry helpers, merge buckets, doors
js/02-textures.js   canvas textures and sign painting
js/03-scene.js      renderer, tone curve, camera, lights, shadows
js/04-terrain.js    heightfield, ramps and drive, clearing distance, ground rings
js/04b-vehicles.js  reflections, lofted car and truck bodies, trailer liveries, wheels, the wheel pool
js/05-sky.js        sky, sun, clouds, birds, day/night, highway traffic
js/06-collision.js  colliders, paving raster, seats, uses, zones
js/07-forest.js     tree species, instanced LOD chunks, canopy shell, wind, seasons
js/08-site.js       interstate, ramps, lots, striping, signs, walks, lamps, beds
js/09-building.js   the rest area building, inside and out
js/10-cars.js       parked cars and trucks
js/11-driving.js    driving a parked car
js/12-substation.js the drive, the fenced compound, generators, pole line
js/13-grounds.js    picnic grove, shelter, grills, flags, memorial, pet area
js/14-life.js       visitors, deer, fireflies, falling leaves, grill smoke
js/14b-people.js    people and a dog: skinned figures, poses, the drivers' walks
js/14a-smoke.js     smoke and sparks: two point clouds shared by every fire and cigarette
js/14c-critters.js  butterflies, squirrels, ground mist
js/14d-backwoods.js the path, the camp and its fire, the teenagers, the wall, the stand, the car, the line
js/15-bake.js       emissive materials, bucket baking, collision grid
js/16-lighting.js   the pooled point lights
js/17-player.js     movement, interaction, gates, drone
js/18-hud.js        compass, clock, location, plan view
js/19-loop.js       main loop and the window.REST debug handle
js/20-audio.js      procedural WebAudio ambience
tools/shot.js       headless screenshots
tools/walk.js       headless walk-through checks
```

The engine comes from the Low Desert Motel and keeps its conventions:
- classic scripts loaded in order into one global scope;
- static geometry merged into material buckets and baked into 96 m tiles;
- axis-aligned box colliders on a grid;
- a pool of twelve point lights handed to the nearest lamps;
- a fixed 1/60 s simulation step.

Several systems were added for this world:
- **Instanced forest.** About 15,700 trees, saplings, shrubs and ferns in
  chunks, each with near and far levels of detail. Wind and leaf colour are
  patched into the shaders.
- **Paving.** Polygon-offset skins over the terrain, with a 1 m raster so the
  player and cars ride on the pavement rather than the ground under it.
- **Traffic.** Highway vehicles follow (IDM) and pass on the interstate,
  and visitors are routed through the lots on chord-length splines, which
  never double back.
- **Vehicles.** Bodies are lofted from superellipse sections. One material
  per vehicle holds a finish per part (paint, trim, rubber, chrome), looked
  up by uv. Prefiltered sky reflections fade with the light.
- **People.** Each person is one rigidly skinned mesh with eleven bones, so
  each costs one draw call. Walkers look a stride ahead and bend their line
  round anything solid, a flower bed or another person.
- **Smoke and sparks.** Two point clouds, one blended and one added, each a
  single draw. Every cigarette and fire in the world emits into them.
- **No two faces in one plane.** Walls and slabs butt where they meet
  instead of overlapping. Every thinner box (trim, frames, glass, fittings)
  is grown by 1 to 3.5 mm when it is baked, so it sits proud of any wall it
  lies against. Wall boxes take their UVs from world position, so brick
  courses run on past a door head.

## Tools

All three tools use Playwright with SwiftShader. Before running them, copy
`three.min.js` (r128) into `tools/`; it is git-ignored.

```
NODE_PATH=$(npm root -g) node tools/shot.js shots.json outDir 960 540
NODE_PATH=$(npm root -g) node tools/walk.js
NODE_PATH=$(npm root -g) node tools/zfight.js '{"x0":-10,"x1":17,"z0":-21,"z1":21,"y0":-0.6,"y1":10,"near":0.0011}'
```

**`shot.js`** renders a list of views. Each entry in `shots.json` looks like
`{"name","go":[x,z,yaw,y,pitch],"hour","autumn","drone":[x,y,z,yaw,pitch],"frames","eval"}`.
It reports draw calls, triangles and any console errors.

**`walk.js`** walks fixed routes and checks that nothing blocks them, then
checks that every seat can be sat in and stood up from. The routes are:
- through the lobby into both restrooms and their accessible stalls;
- into the family restroom and the office;
- out the back and through both service doors;
- out the path to the camp, and into the camp past the fire;
- across the lot and the grove;
- up the drive and through the substation gate.

**`zfight.js`** lists faces in a box of the world that lie in one plane and
overlap, which the depth buffer cannot sort and draws as flicker. It loads
the page with `?zdebug`, which keeps every baked piece's final matrix. Pairs
closer than `near` metres are reported by bucket, with the normal and where
they are. Faces turned into a wall still show up, so read the normals.

The `window.REST` handle exposes the world for scripting. For example:
- `REST.go(x,z,yaw)` and `REST.hour(h)`;
- `REST.season(true)` for autumn;
- `REST.stepTraffic(dt,n)`, along with the traffic, cars, doors, colliders
  and forest.
