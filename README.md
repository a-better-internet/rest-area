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

- **The building.** A brick lobby under a steep shingled gable with a glass
  end wall, and two flat-roofed restroom wings, all laid out from the
  overhead photo. The lobby has:
  - a quarry-tile floor, open timber trusses and pendant lights;
  - three vending machines, a payphone and a drinking fountain;
  - a PA highway map and a bulletin board under a WELCOME TO CRAWFORD COUNTY sign;
  - an attendant's desk, brochure racks, and a clock that keeps game time.

  Doors open on `E`. The storefront doors swing out, as code requires.
- **The restrooms** follow the colour reference: yellow wall tile to 2.1 m
  with grey block above, a speckled mosaic floor, beige toilet partitions,
  stainless hand dryers on white panels, and a fold-down baby changer.
  - The men's room has three stalls, three urinals and a light that
    flickers.
  - The women's room has six stalls and a bench.
  - Each room has an accessible stall wide enough to stand in, with grab
    bars. The vanity sits in an alcove behind a privacy screen.

  Between the wings and the lobby are a family restroom and a STAFF ONLY
  office. A janitor's closet and a mechanical room open off service doors at
  the back.
- **The lots.**
  - Cars park in a two-aisle lot with ADA stalls and blue curb at the walk.
    There are about 34 cars, thinning out with distance from the door, and
    any of them can be driven: `E`, then `WASD`, with `Space` as handbrake.
  - Tractor-trailers park on the angled truck lot past the island.
- **Visitors.** Now and then a car or truck in the right lane signals off at
  the exit ramp. It parks in a free stall, sits a while, backs out, drives
  the aisle and merges back onto the interstate. Visitors stop for you, and
  honk if you stand there long enough. Backing out has the right of way, and
  no one backs out into a car coming down the aisle.
- **The interstate** is two lanes each way with a wooded median. It has
  rumble strips, mile markers, the REST AREA 1/2 MILE and NEXT RIGHT signs,
  the gore sign and a DO NOT ENTER at the wrong end of the ramp. 44 vehicles
  run on it: sedans, SUVs, pickups, minivans, box trucks, reefers, flatbeds
  and tractor-trailers.
  - Each one follows the car in front and passes slower traffic. Trucks keep
    right.
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
  - Three deer graze at the edge of the woods and bolt when you get close.
- **Sound** is synthesized, with no audio files: road noise that pans with
  the highway, wind, cardinals, chickadees, a wood thrush and crows by day,
  insects at night, the hum of the building and the generators, the hand
  dryers, and horns. It starts on your first click; `U` toggles it.

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
| Walkable zone | x −240 … 176, z −328 … 248 |

The forest beyond the walkable zone is scenery.

## Files

```
index.html          HUD (a PA guide-sign masthead, compass, clock, plan) and script tags
js/00-config.js     spawn, highway and site dimensions, lot geometry
js/01-helpers.js    registries, geometry helpers, merge buckets, doors
js/02-textures.js   canvas textures and sign painting
js/03-scene.js      renderer, tone curve, camera, lights, shadows
js/04-terrain.js    heightfield, ramps and drive, clearing distance, ground rings
js/05-sky.js        sky, sun, clouds, birds, day/night, vehicles and highway traffic
js/06-collision.js  colliders, paving raster, seats, uses, zones
js/07-forest.js     tree species, instanced LOD chunks, canopy shell, wind, seasons
js/08-site.js       interstate, ramps, lots, striping, signs, walks, lamps, beds
js/09-building.js   the rest area building, inside and out
js/10-cars.js       parked cars and trucks
js/11-driving.js    driving a parked car
js/12-substation.js the drive, the fenced compound, generators, pole line
js/13-grounds.js    picnic grove, shelter, grills, flags, memorial, pet area
js/14-life.js       visitors, deer, fireflies, falling leaves, grill smoke
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

Three systems were added for this world:
- **Instanced forest.** About 11,700 trees in chunks, each with near and far
  levels of detail. Wind and leaf colour are patched into the shaders.
- **Paving.** Polygon-offset skins over the terrain, with a 1 m raster so the
  player and cars ride on the pavement rather than the ground under it.
- **Car-following traffic.** Highway vehicles follow and pass on the
  interstate, and visitors are routed through the lots.

## Tools

Both tools use Playwright with SwiftShader. Before running them, copy
`three.min.js` (r128) into `tools/`; it is git-ignored.

```
NODE_PATH=$(npm root -g) node tools/shot.js shots.json outDir 960 540
NODE_PATH=$(npm root -g) node tools/walk.js
```

**`shot.js`** renders a list of views. Each entry in `shots.json` looks like
`{"name","go":[x,z,yaw,y,pitch],"hour","autumn","drone":[x,y,z,yaw,pitch],"frames","eval"}`.
It reports draw calls, triangles and any console errors.

**`walk.js`** walks fixed routes and checks that nothing blocks them, then
checks that every seat can be sat in and stood up from. The routes are:
- through the lobby into both restrooms and their accessible stalls;
- into the family restroom and the office;
- out the back and through both service doors;
- across the lot and the grove;
- up the drive and through the substation gate.

The `window.REST` handle exposes the world for scripting. For example:
- `REST.go(x,z,yaw)` and `REST.hour(h)`;
- `REST.season(true)` for autumn;
- `REST.stepTraffic(dt,n)`, along with the traffic, cars, doors, colliders
  and forest.
