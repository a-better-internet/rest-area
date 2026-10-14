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

`G` opens the graphics settings, before you pull in or at any time after.
If the scene runs hot on your machine, start there (see below).

## What is in it

- **The building.** A brick lobby under a steep shingled gable with a big
  tinted window in its end wall, and two flat-roofed restroom wings, all laid
  out from the overhead photo. The window shows the trusses inside by day,
  glows warm at night, and from the lobby you look out through it. The lobby
  has:
  - a quarry-tile floor, open timber trusses and pendant lights;
  - three vending machines, a payphone and a bi-level stainless fountain;
  - grey swing-top trash cans with their flaps facing the room;
  - a PA highway map, and a bulletin board under a WELCOME TO CRAWFORD
    COUNTY sign whose notices change: a couple come down and new ones go up
    every day, and now and then one changes while you are there (lost dogs,
    a chicken BBQ, the lanternfly, a ride to Erie, tear-off phone tabs);
  - over the attendant's desk, a television on the state's travel channel,
    cycling through I-79 traffic, local conditions, Doppler radar, the
    forecast and alerts, with a crawl along the bottom. It shows what the
    world is actually doing: the weather, a wreck on I-79, a power cut;
  - brochure racks, and a clock that keeps game time.
  - The vending machines work the way they do. `E` brings up the keypad:
    the arrows pick a slot, `Q` drops in a quarter, `F` feeds a dollar bill
    (it may spit it back), `E` vends. Sometimes the item hangs on the end of
    the spiral, and `Space` shakes the machine until it falls. `R` is the
    coin return; credit left in a machine stays for the next person.

  Doors open on `E`. The storefront doors swing out, as code requires.
- **The restrooms** follow the colour reference: yellow wall tile to 2.1 m
  with grey block above, a speckled mosaic floor, beige toilet partitions,
  stainless hand dryers on white panels, and a fold-down baby changer.
  - The fixtures are modelled, not boxed:
    - floor-mount toilets lofted like the cars: a foot that flares onto the
      floor, a rolled rim, a shroud back to the wall, bolt caps, a flat
      open-front seat on chrome hinges, and a chrome flushometer;
    - wall-hung urinals that are round in plan with the basin pressed into
      the face, a strainer and a blue screen, and flush valves; one is set low;
    - stall doors with hinges, latches, occupancy indicators and coat hooks.
  - The men's room has three stalls, three urinals and a light that
    flickers.
  - People use them (see Visitors). Now and then whoever was in a stall
    leaves it in a state: murky water, paper over the rim and across the
    floor. The next person picks another stall if they can. Stand in it and
    `E` cleans it up; the toast keeps count.
  - An occupied stall's door is shut and latched, with their feet showing
    under it. `E` on it gets you "OCCUPIED".
  - The women's room has six stalls and a bench.
  - Each room has an accessible stall wide enough to stand in, with grab
    bars. The vanity sits in an alcove behind a privacy screen.

  Between the wings and the lobby are a family restroom and a STAFF ONLY
  office. A janitor's closet and a mechanical room open off service doors at
  the back.
  - The office has a desk with a camera monitor, an office chair, a file
    cabinet, a fridge and microwave, and a whiteboard of rounds. The monitor
    runs the four building cameras and CAM 5, the trail camera out in the
    back woods (`E` at the desk steps through its pictures).
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
  - A state trooper's cruiser parks in a stall by the walk: fleet grey, a
    light bar, a push bumper and a laptop on its mount. The trooper sits
    behind the wheel the way a driver sits, with a clipboard, writing, and
    looks up now and then. The cruiser comes and goes: it sits a few
    minutes, backs out, leaves by the on-ramp, and some minutes later comes
    back down the exit ramp and pulls in again, giving way to you and to
    visitors in the aisle as they give way to it.
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
    crosswalk. Inside, they go about what they came for, and the car waits:
    - most use the restroom: a urinal or a stall (the door shuts behind them,
      a flush when they come out), then a sink, and sometimes the hand dryer;
    - some buy something: a coin, the keypad, the clunk, and a stoop to the
      flap for it;
    - some turn the brochure rack a while;
    - and some do a bit of each, then walk back out to the car.
    Their way between things is found on a grid over the building's floor,
    round everything solid in it, and they wait their turn if the urinals or
    stalls are taken.
  - The car then backs out, finishing pointed down the one-way aisle, drives
    to the entrance ramp and times its merge against lane-0 traffic.
  - Visitors keep a speed-dependent gap to whatever is in front: cars,
    people and you. If you stand in the aisle they honk, then edge round you
    at a crawl, and pull back to the middle once past.
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
  - Once in a long while there is a wreck on the northbound shoulder across
    the verge from the truck lot: one car spun round in the grass, another
    pulled over with its hazards going, and a cruiser behind them with its
    bar flashing red and blue. Flares and cones close the right lane, and
    traffic slows to look and squeezes by on the left. It is cleared after a
    few minutes. `X` calls one up (or clears it).
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
  - Mist lies on the ground for an hour after sunrise and comes back at
    dusk. It is a height fog worked into every surface's own shader: thick
    at the ground and gone a couple of metres up, integrated along each line
    of sight and patchy in a slow drift, so it has no edges. The grass at
    your feet is clear, the far side of the lawn goes milky, posts and
    trunks fade into it at the bottom, and from up in the woods the site
    lies in it.
- **The night sky.** On a clear night there are stars in several magnitudes
  and colours, and the Milky Way crosses the sky, clumped into star clouds
  and split by the dark of the Great Rift. The moon has its phases. It
  starts on tonight's real phase and moves on a day for every day of the
  clock. It rides behind the sun by its phase (a first quarter is high in
  the south at sunset, a full moon rises as the sun goes down), and its lit
  side faces the sun. A bright moon washes out the Milky Way and lights the
  ground; cloud puts all of it out.
- **Weather.** Most of the time it is fair. Every few minutes it may change:
  a grey overcast, a shower, fog lying in the woods, and now and then a
  thunderstorm. The HUD shows the weather and the temperature.
  - Cloud is a deck across the sky that thickens from broken to a lid. The
    sun's light goes soft and flat under it.
  - Rain is streaks round you that never fall under a roof, with splashes
    at your feet. The paving darkens and shines as it gets wet and dries
    out after.
  - Fog pulls the haze in to a hundred metres or so, with banks of it
    lying low among the trees and over the lawn.
  - In a thunderstorm the wind gets up, the sky flashes, sometimes a bolt
    comes down, and the thunder follows at the speed of sound.
  - `R` toggles rain and fog and `T` a thunderstorm, for testing.
- **Power cuts.** Very occasionally a close strike in a storm takes the power
  out. `P` makes it happen.
  - The screen goes black and flashes POWER OUTAGE. Every light on the rest
    area's supply drops, and only the exit signs and the battery emergency
    lights by the doors stay on.
  - Out at the substation the standby set cranks, catches with a black
    cough from its stack, and comes up to speed, followed by the second set.
    Its hum carries across the site.
  - The transfer switch's lamps go from NORMAL to EMERGENCY, and ten seconds
    after the cut it throws: the building comes back on the generator.
  - The lot and walk lights stay dark until the utility returns. Then the
    switch transfers back with a blink, the pole lamps restrike and warm up
    over half a minute, and the set runs on to cool down before it stops.
  - The TV comes back to NO SIGNAL first, and the vending machines and the
    office monitor are dark until the generator picks the building up.
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
  - They are out there from about noon until three in the morning, and come
    and go when you are not right there to see. In the morning the fire is
    left to burn down, and what they left behind changes from day to day:
    a hoodie over the log, a phone on the cooler still getting messages, a
    guitar, a skateboard, a sketchbook, one shoe, a lantern left on, a jar of
    fireflies (or in October a jack-o'-lantern), and a note under a stone on
    the chopping block for whoever comes by.
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
  - The kids' orange tape leads north-east from the fire to an old
    farmhouse in what is left of its yard, a slight clearing the woods are
    taking back.
    - Outside: grey clapboard where the paint has let go, a fieldstone
      foundation, a hole in the back of the roof, a brick chimney with its
      top fallen in, broken and boarded windows, ivy, and a porch whose
      corner post lies in the grass, so the porch roof sags to meet it.
    - The front door stands open, and both floors can be walked.
      The parlour has a stove, a calendar stopped in October 1987, a picture
      on the wall, and a corner where the ceiling has come down. The kitchen
      has the table on its side, the sink, and an old fridge with its door
      open, and a closet under the stairs.
    - The stair is boxed in up the east wall: thirteen risers with nosed
      treads, stringers, a newel and balusters at the foot, and a rail on
      brackets the rest of the way. The eighth tread is split and sags.
    - Upstairs, off a hall with a runner down it, a little table and the
      attic hatch (its cord does not bring it down, and the kids have
      written DONT GO IN THE ATTIC beside it):
      - the big bedroom, with an iron bed, a quilt half on the floor, a
        dresser with a cracked mirror, a rocker by the window, a suitcase
        open, and a hole through the floor to the parlour below;
      - a sewing room, with a treadle machine under the window, a dress form
        facing the door, and a trunk of letters;
      - a child's room, with a small bed and a bear, a rocking horse, a toy
        box, and pencil marks up the wall by the door;
      - a box room;
      - the bathroom, with a clawfoot tub under the window, a high-tank
        toilet with its chain, a pedestal sink and medicine cabinet, and a
        hole in the ceiling under the hole in the roof, with the sky through
        both and leaves and shingle on the floor beneath.
      Faded floral paper is peeling off the walls. It creaks.
    - In the yard: a fieldstone well, a hand pump, a shed down on its face,
      a rusted swing set, lilacs, an apple tree gone wild, and a mailbox
      at the end of the old drive.
  - You can hear the fire crackle, a little music, and the kids talking and
    laughing, louder as you get closer.
- **Sound** is synthesized, with no audio files: road noise that pans with
  the highway, wind, cardinals, chickadees, a wood thrush and crows by day,
  insects at night, the hum of the building and the generators, the hand
  dryers, and horns. There are also car doors, flushes in the restrooms, the
  flag halyard ringing on its pole in the wind, a distant jake brake, and a
  dog. Rain hisses outside and drums on the roof inside; thunder cracks and
  rolls; the standby diesel cranks, catches and runs; the transfer switch
  bangs; the vending machine takes coins, whirs and thumps; the old house
  creaks. It starts on your first click; `U` toggles it.

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
| Rain & fog · thunderstorm (testing) | `R` · `T` |
| Storm power cut · wreck on I-79 (testing) | `P` · `X` |
| Sound | `U` |
| Plan view · hide HUD | `O` · `H` |
| Graphics settings | `G` |

At a vending machine the keys are its keypad's: arrows (or `WASD`) to pick,
`Q` a quarter, `F` a dollar bill, `E` or `Enter` to vend, `Space` to shake
it, `R` coin return, `Esc` to walk away.

## Graphics settings

`G` opens the menu. Use the arrows (or `WASD`) or the mouse to change a
setting; it takes effect at once, and is kept in the browser for next
time. While the menu is up, its header shows the frame rate, the resolution
being drawn and the draw calls.

| Setting | Choices | What it does |
| --- | --- | --- |
| Preset | Low · Medium · High · Ultra | Sets everything below except the frame cap. High is how the scene has always looked. |
| Resolution | 0.5× · 0.75× · 1× · 1.5× · 2× · native | Pixels drawn per screen point. Native is the screen's own density, up to 2×. On a Retina Mac, 1× draws a quarter of the pixels that native does, and is the biggest single saving. |
| Frame-rate cap | 30 · 60 · off | 60 by default. A 120 Hz ProMotion screen draws twice as many frames with the cap off. |
| Shadows | Off · Low · Medium · High · Ultra | The sun's shadow map: 1024 to 4096 texels, over 76 to 116 m. Low uses hard-edged filtering. Off skips the shadow pass entirely: everything near you is no longer drawn a second time, into the map. |
| Draw distance | Near · Medium · Far · Max | How far full trees reach (54 to 120 m) and, on Near and Medium, a limit past which nothing is drawn (620 m and 1150 m). The haze closes in to meet the limit, so nothing is seen to vanish. Far is the original. |
| Lights | 4 · 6 · 8 · 12 · 16 · 24 | How many real point lights follow you round the lamps. Every lit pixel pays for each one, lit or not. The rest of the lamps only glow. |
| Frame meter | off · on | Frames per second, frame time and draw calls in the top corner. |

Changing shadows on or off, or between hard and soft, rebuilds every shader
once, so there is a short hitch.

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
| The old house | x 312, z 160 (front door on the south side) |
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
js/14b-people.js    people and a dog: skinned figures, poses, the drivers' walks, what they do inside
js/14a-smoke.js     smoke and sparks: two point clouds shared by every fire and cigarette
js/14c-critters.js  butterflies, squirrels, how much ground mist there is
js/14d-backwoods.js the path, the camp and its fire, the teenagers and what they leave, the wall, the stand, the car, the line
js/14e-incidents.js the trooper's cruiser coming and going, and the occasional wreck on I-79
js/14f-homestead.js the old house in the woods, inside and out, and its yard
js/15-bake.js       emissive materials, bucket baking, collision grid
js/16-lighting.js   the pooled point lights
js/16b-weather.js   weather (cloud deck, rain, fog banks, lightning) and the power: circuits, outage, generator, transfer switch
js/16c-screens.js   the lobby TV, the office monitor and CAM 5's trail-camera pictures, the bulletin board's notices
js/17-player.js     movement, interaction, gates, drone
js/18-hud.js        compass, clock, location, weather, plan view
js/18b-vending.js   the vending machines' keypad, coins, coil and shaking
js/18c-settings.js  the graphics menu: resolution, frame cap, shadows, draw distance, light count; the frame meter
js/19-loop.js       main loop and the window.REST debug handle
js/20-audio.js      procedural WebAudio ambience
tools/shot.js       headless screenshots
tools/walk.js       headless walk-through checks
```

The engine comes from the Low Desert Motel and keeps its conventions:
- classic scripts loaded in order into one global scope;
- static geometry merged into material buckets and baked into 96 m tiles;
- axis-aligned box colliders on a grid;
- a pool of point lights handed to the nearest lamps (twelve by default; the
  graphics menu sets anywhere from four to twenty-four);
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
- along the tape to the old house, through its door and into the kitchen;
- up the old house's stair and into every room upstairs, and back down;
- across the lot and the grove;
- up the drive and through the substation gate.

**`zfight.js`** lists faces in a box of the world that lie in one plane and
overlap, which the depth buffer cannot sort and draws as flicker. It loads
the page with `?zdebug`, which keeps every baked piece's final matrix. Pairs
closer than `near` metres are reported by bucket, with the normal and where
they are. Faces turned into a wall still show up, so read the normals.
A merged mesh (a vehicle, say) counts as one piece, so faces fighting inside
one are not seen by it; check those part by part, from `vehicleParts()`.

The `window.REST` handle exposes the world for scripting. For example:
- `REST.go(x,z,yaw)` and `REST.hour(h)`;
- `REST.season(true)` for autumn;
- `REST.stepTraffic(dt,n)`, along with the traffic, cars, doors, colliders
  and forest.

The new systems are globals too: `WEATHER.set("storm")`, `GRID.trip()`,
`CRASH.start()`, `MOON.phaseAt`, `TRAILCAM.photos`, `VEND.openAt(...)`,
`GFX` and `applyGraphics()`, `TROOPER`, `RESTROOMS` (each stall's `mess`).
