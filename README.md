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
    `E` cleans it up; the toast keeps count. If you don't, the custodian
    will (see below).
  - An occupied stall's door is shut and latched, with their feet showing
    under it. `E` on it gets you "OCCUPIED".
  - The women's room has six stalls and a bench.
  - Each room has an accessible stall wide enough to stand in, with grab
    bars. The vanity sits in an alcove behind a privacy screen.

  Between the wings and the lobby are a family restroom and a STAFF ONLY
  office. A janitor's closet and a mechanical room open off service doors at
  the back.
  - The office has a desk with a camera monitor, an office chair, a file
    cabinet, a fridge and microwave, and a whiteboard of the custodian's
    rounds (6A, 12P and 6P). The monitor
    runs the four building cameras and CAM 5, the trail camera out in the
    back woods (`E` at the desk steps through its pictures).
  - The janitor's closet has a mop sink and mop rack, a wringer bucket,
    stocked shelves, a cart and a ladder.
- **The maintenance garage** stands east of the building, past the loop walk
  and the two spruces on the lawn. The pet area is south of it across the
  lawn, untouched.
  - It is a tan block building with a low brown steel roof, on a gravel
    yard cut back into the woods. Facing the building are two roll-up doors
    and a steel man door, with a light over each and the PennDOT and
    contractor signs.
  - In the first bay, nose out, is the contractor's pickup: a yellow plow
    on the front, an amber light bar, a spreader on the hitch, and the
    company's name on the doors. In the second bay are the zero-turn mower
    and a walk-behind salt spreader.
  - At the back are a workbench under a pegboard of tools, with a vise and
    a yellow jobsite radio that is always on. There are also a parts washer,
    steel shelving full of cases of roll towel and tissue, two cleaning
    carts, a cot, a coffee maker that is never off, and a folding chair.
    Rakes, shovels and a trimmer hang on the wall, and the blower hangs on
    its hook.
  - `E` at the radio changes the station: country, AM talk, or the
    Pirates. You hear it properly inside, duller through the open doors, and
    barely once they are shut.
  - In the yard are a three-sided salt and sand bin with a crusted pile
    under its roof, a pallet of ice melt, the gas tank, and the dumpster.
    From the back corner a gravel track runs south-east through the woods,
    behind a padlocked pipe gate.
- **The custodian**, Terry, works for the contractor and all but lives in
  the garage. `E` talks to Terry; what you get depends on what Terry is
  doing.
  - Three times a day (6A, 12P, 6P) Terry pushes the cart over and in at the
    back door, and parks it in the lobby by each restroom in turn.
    - Each stall somebody has left in a state gets cleaned. Terry holds the
      door open, goes at it with the brush and flushes twice. `E` on that
      door gets "GIVE ME A MINUTE ON THIS ONE."
    - Then the cans: a bag out of each, a fresh liner, and the bags carried
      back to the cart.
    - A clipboard inside each restroom door gets the time and Terry's
      initials.
    - On the way back the bags go in the dumpster.
    - Two messes waiting between rounds bring Terry over early.
  - In summer, mornings and afternoons, Terry mows the lawn below the yard
    on the zero-turn, lane by lane, pivoting at the ends, with clippings out
    of the chute. The mower stops for anybody in front of it. In autumn
    Terry takes the backpack blower up and down the loop walk behind the
    building, and the leaves go up in front of it. Both are loud, and Terry
    wears ear defenders for them.
  - In between are the bench, the coffee, the folding chair and the radio.
  - `E` at a bay door's switch inside, or at the door outside, runs it up
    or down, and Terry leaves it as you left it for a while.
  - At night Terry brings the roll-up doors down, puts the lights out,
    turns the radio low and sleeps on the cot. At ten to five Terry sits up
    on the edge of it a while, pulls the boots on, stands and stretches, gets
    the coffee maker going (it gurgles), pours a mug, turns the radio back
    up, raises the doors, and sits in the folding chair with the coffee
    before the day starts.
  - Terry never gets stuck or walks in circles. Every walk is watched: with
    no headway for a few seconds the way is found again round whatever is
    in it, then a point is skipped, and as a last resort Terry is set down
    at the end of it.
  - Out of sight (more than 75 m away) Terry works three times as fast, so
    the day's list gets done.
- **The lots.**
  - Cars park in a two-aisle lot. There are about 34, thinning out with
    distance from the door, and any of them can be driven: `E`, then `WASD`,
    with `Space` as handbrake.
  - By the walk are three accessible stalls inside the stall lines, with
    hatched access aisles between them, signs and blue curb.
  - The lots are worn: oil in the car stalls under where the engines stand,
    black lines of crack sealant wandering across both lots (and across
    the interstate's lanes by the site), storm inlets at the curbs and
    lids down the aisles.
  - Tractor-trailers park on the angled truck lot past the island. At night
    their marker lamps stay on, and the reefer units can be heard running.
  - One Northern Tier dry van near the middle of the lot has had its seal
    cut. `E` at the back swings its doors round flat against the sides, one
    leaf then the other, and folds a step down off the sill. Inside is a
    53-foot van:
    - an oak plank floor scuffed by pallet jacks, white composite walls with
      two rows of E-track and a galvanized scuff band, and a translucent roof
      that lets the day through between the bows (two LED domes come on with
      the doors at night);
    - at the back, emptied at the last stop: the pallet jack, a pallet
      leaning on the wall, a couple of cartons, the bill of lading, the cut
      seal on the floor, straps hung off the track;
    - two stretch-wrapped pallets, then cartons floor-loaded along both walls
      (paper towels, canned beans, FRAGILE, KEEP DRY, freight labels) with an
      aisle up the middle, and behind the load bar cartons wall to wall and
      nearly to the roof.
- **The vending room.** On the island, across a painted crosswalk from the
  truck aisle, is a small brick room with a glass front under a canopy and a
  light that never goes off, for drivers who want coffee at three in the
  morning without walking the length of the car lot. A brown VENDING sign
  hangs on the front and the back. Inside:
  - a hot-drink machine with a lit picture of a steaming cup, eight buttons,
    a cup bay with its drip grate, a BREWING lamp and a red OUT OF CUPS lamp,
    and a note taped on it ("bring ur own"). It still takes your money: no
    cup drops, the BREWING lamp comes on, and your coffee runs down the
    drain. Or it hangs mid-brew with the lamp on until you thump it;
  - a refrigerated sandwich case: lit shelves of wedges on wire coils behind
    glass (they can hang on the coil too);
  - the cold drinks and the snacks, a change machine that breaks a five or
    pushes it back out, a pay phone with the book on its chain, the 511
    board (I-79 traffic and the weather, a crawl) over a bench, a can and a
    recycling bin, and two flat fluorescent fixtures, one with a bad tube;
  - the Business Enterprise Program sticker on every machine, and its notice
    on the wall: the machines are run by a licensed vendor who is blind.
  - At night a trucker in slippers climbs down from his cab a few stalls
    south, shuffles down the side of his rig and across the stripes with his
    own steel mug, sets it in the bay and waits out the brew, looks at the
    board, sometimes stands at the sandwiches, and goes back up into his cab.
    If you are in the room he tells you about the cups.
  - A state trooper's cruiser parks in a stall by the walk: fleet grey, a
    light bar, a push bumper and a laptop on its mount. The trooper sits
    behind the wheel the way a driver sits, with a clipboard, writing, and
    looks up now and then. The cruiser comes and goes: it sits a few
    minutes, backs out, leaves by the on-ramp, and some minutes later comes
    back down the exit ramp and pulls in again, giving way to you and to
    visitors in the aisle as they give way to it.
- **The vehicles** are lofted, not boxed.
  - Sedans, SUVs, pickups and minivans have rounded bodies with real wheel
    arches. Each has a greenhouse, door seams and mirrors. The head and tail
    lamps are patches of the body's own corners, so they follow its curve:
    a bezel, the lens and a chrome strip in front, the lens and a reversing
    lamp behind. On a sedan or pickup the tail lamps carry on in across the
    back.
  - Close to, the glass is tinted and see-through. Inside are the dash, the
    wheel on its column, a seat back and headrest for every place (three
    rows in a minivan), the headliner and the pillars' linings. Past fifty
    metres the glass goes dark.
  - The bumpers have shut lines round the corners to the wheel arches, and
    the hood and trunk have theirs. There is a black seal along the foot of
    the side glass, a diffuser with the exhaust under it, side markers,
    badges, wipers (one on the back glass of a hatch), a third brake lamp
    and a fin aerial.
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
  - Nobody anywhere stands or sits stock still. Everyone breathes, looks
    about and nods now and then; whoever is standing shifts their weight
    from one foot to the other, and now and then a hand comes up as if
    they were saying something; whoever is sitting leans in and sits back.
    Each does it in their own time, so no two move together, and nobody
    sways off the spot they stand on.
  - Out of doors (Lake Street, the park, the fuel stop, the brewery) the
    walkers go as the visitors do: they stop for you, step round tables,
    posts, parked cars and each other, stand on whatever floor is under
    them, and never set foot in the lake. The brewery's servers keep to
    its lot, its taproom, its garden and its deck. Whoever is sitting sits
    on the seat: on a chair, a stool, a bench or a cushion, not in it.
  - Visitors keep a speed-dependent gap to whatever is in front: cars,
    people and you. If you stand in the aisle they honk, then edge round you
    at a crawl, and pull back to the middle once past.
- **The interstate** is two lanes each way with a wooded median. It has
  rumble strips, mile markers, the REST AREA 1/2 MILE and NEXT RIGHT signs,
  the gore sign and a DO NOT ENTER at the wrong end of the ramp. Three
  paved emergency crossovers cut through the median, level with the road
  on a berm across the swale: one just north of the site in the woods you
  can walk, and one each way out along the road. They are signed NO U TURN
  · AUTHORIZED VEHICLES ONLY for each direction, and you can walk or drive
  across any of them. 44 vehicles
  run on it: sedans, SUVs, pickups, minivans, box trucks, reefers, flatbeds
  and tractor-trailers.
  - Where a ramp leaves or joins, a speed-change lane runs right beside
    the through lane, over the shoulder, and tapers in or out the way a
    real deceleration or acceleration lane does. Its outer line runs down
    the taper into the through lane's edge line, and between the two lanes
    the edge line is wide and dotted. Where the ramp parts from the lane
    the edge line goes solid again, and the ramp's own left line leaves it
    white out to the paved nose. The gore triangle between them is
    chevroned, and past the nose the ramp's left line is yellow. The rumble
    strip stops short of the junction, and the grass stays off the paving.
    The rest area's entrance lane runs on as an auxiliary lane into the
    Edinboro exit a hundred metres north, dotted off the through lane the
    whole way, so the two never cross.
  - Each one follows the car in front with the Intelligent Driver Model
    (a time headway that grows with speed). They pass slower traffic only
    when there is room both ways, and move over for merging visitors.
    Trucks keep right.
  - At night their headlights, tail lights and brake lights come on.
  - Once in a long while there is a wreck on the northbound shoulder across
    the verge from the truck lot: one car spun round in the grass, another
    pulled over with its hazards going, and a cruiser behind them with its
    bar flashing red and blue. Flares and cones close the right lane, and
    traffic slows to look and squeezes by on the left. Then it clears itself:
    a wrecker comes up the closed lane and winches the spun car onto its
    lift, tows it off down the shoulder, the other car drives away, the
    flares burn out, the trooper picks up the cones and walks back, and the
    cruiser kills its bar and leaves. `X` calls one up (or clears it).
- **Edinboro, exit 166.** Two thirds of a mile north, US 6N crosses over
  I-79 on a four-span bridge. It has a concrete deck on weathering-steel
  girders, a pier in the median and one off each outside shoulder, and
  block abutments at the top of the cut. The interstate runs under it in a
  cut through farm country graded level either side.
  - It is a full diamond, a ramp in each corner. Each way an advance sign
    (EXIT 166 · US 6N Edinboro · NEXT RIGHT) and a gore sign mark the exit.
    The northbound off-ramp leaves the right lane, climbs the side of the
    cut and merges into US 6N eastbound under a MERGE sign. The southbound
    off-ramp does the same on the north-west side into US 6N westbound.
  - On to southbound from US 6N on the south-west side. On to northbound
    you turn north off US 6N between the bridge's east end and the fuel
    stop, and come down the cut to an acceleration lane, so you can get
    back on the way you came either way.
  - US 6N is two lanes with a double yellow line and W-beam rail off the
    bridge ends. It has route markers, an Edinboro 3 · Union City 14
    distance sign, and I-79 NORTH and SOUTH signs pointing to the on-ramps.
  - The road's west end is closed for now with a type III barricade
    reading ROAD CLOSED. East, it goes on past the fields (below) to the
    lake, and is closed there instead, past the last house.
  - Farmland runs out both ways: a dozen fields of corn, soybeans and hay
    (round bales left in it) and two pastures, with farm fence along the
    road. There are hedgerows between the fields, a big lone oak, and the
    pole line crossing.
  - **French Creek Fuel & Mart**, on the north side by the bridge. A lot,
    a canopy with its lights over two islands of pumps (somebody filling
    up; a squeegee in its bucket and a towel box at each island), a pickup
    nosed in by the store. The store is block and brick with a glass front,
    decals in it (PA LOTTERY, ATM INSIDE, ICE · BAIT · PROPANE) and a pair
    of storefront doors you walk in at. Out front: a bench, the Erie and
    Meadville papers in their boxes, pumpkins and mums on straw bales for
    October, firewood (BUY IT WHERE YOU BURN IT), the live bait cooler, ice
    and propane. Inside: the counter by the door with the clerk behind it,
    a candy rack along its front, a case of donuts by the register, the
    cigarettes and the lottery behind him, a roller grill; three aisles of
    shelving with endcaps and a wet floor sign; the lit cooler wall across
    the back; a coffee bar, and a fountain and slushie counter (blue
    raspberry, cherry); a magazine rack under the glass; a camera in the
    ceiling and a convex mirror in the corner. The grey door by the
    slushies opens on the restroom: one room with tile to the shoulder, a
    tube that flickers, the sink, the dryer, a fold-up changing table, the
    mop bucket, and a wall written on by everybody who ever got off here.
    Out back, the dumpster in its block enclosure. Open all night, lit all
    night. `E` talks to the clerk, grabs a drink, pours a coffee or a
    slushie, looks in the bait cooler, reads the wall, or tries the pumps.
  - **The Weir place**, south of the road up a gravel lane, past the
    mailbox and a farm stand selling sweet corn on the honour system. The
    farmhouse is an I-house, sixteen metres by ten and a half. It is white
    clapboard, each course lapped and the paint worn thin in places, with
    corner boards, green shutters and curtains in every window, on a
    fieldstone foundation with shrubs along it. Gutters run on the fascias,
    with downspouts down the corners to splash blocks. A porch runs the
    length of its front (a
    swing, two rockers, a fern, pumpkins on the steps, a beadboard ceiling
    painted haint blue), a brick chimney up its west end, lightning rods
    and a dish on the roof, and a cellar bulkhead. You go in at the front
    door, under its transom, to a centre hall with the stair up its east
    side:
    - the parlour, west: a wood stove on its hearth piped into the chimney,
      the couch with the afghan facing the set, a recliner, a braided rug,
      the upright piano (`E` plays it, badly), a rocking chair, the
      grandfather clock, a bookcase, pictures (the farm from the air);
    - the kitchen, east: counters down the wall with the sink under the
      window, gingham valances, the range under its hood, the fridge with
      its magnets, a hutch of the good plates, the pantry, the table with
      oilcloth and a pie under a towel (`E`), the wall phone, the feed
      store's calendar, coats and boots by the back door, the dog's bed;
    - up the stair (oak treads, a red runner, a turned newel, a rail round
      the well upstairs; every room has a painted baseboard and a crown):
      the front bedroom with its rose paper, the bed,
      nightstands, a cedar chest and a dresser with its mirror; the kids'
      room with stars on the walls, two beds, a desk, a toy chest, a John
      Deere poster and the fair's ribbons; the sewing room, striped, with a
      daybed, a treadle machine at the window, a dress form, shelves of
      cloth and the ironing board; the bath, checkered, with a clawfoot
      tub under the window, the pedestal sink and the toilet; and through
      the sewing room a storeroom of boxes, a crib and a trunk. The
      bedroom doors stand half open. Two lamps upstairs are left on at
      night, and you can see them from the road.
  - Across the yard the red bank barn (WEIR · 1911) and its two silos. An
    earth ramp between dry-stone cheeks runs up to its big doors, slid
    open on their track, and you walk in onto the threshing floor under the
    gambrel's timbers: bents with tie beams and knee braces, purlin posts,
    rafters, the hay track along the ridge. The mow to the north is stacked
    with square bales, stepped down where they've been taken from, with an
    elevator up to them; along the south wall three cows stand in their
    stanchions with their heads through to the manger (`E` pats one), with
    a calf in a pen in the corner. The cows are Holsteins, each marked her
    own way. They have hip bones and a spine, jointed legs white below the
    knee on dark cloven hooves, an udder, ears, and a tail hanging to the
    hocks that swishes at the flies. Out in the pasture they graze, and now
    and then one lifts her head to look round. There are milk cans, the barn radio on its shelf (`E`, the farm
    report), pitchforks, a wheelbarrow, a workbench across the east end,
    and bulbs on cords. There is also a hay wagon, the clothesline, the
    woodpile, and cows grazing in the pasture behind.
  - **The machine shed** stands across the south of the yard: a pole
    building of eight bays, open along the front under a doubled header,
    green steel siding on the back and ends, trusses on the posts with the
    purlins over them, and shop lights on chains. A barn light hangs over
    the front. From the west end:
    - the shop, on a concrete pad: the bench under a pegboard of tools,
      with a vise, the grinder, a coffee can of bolts and a radio (`E`), and
      the co-op's calendar on the wall; a red rolling tool chest, the
      compressor, three drums with a pump in one, steel shelving of oil,
      filters and baler twine, and the lawn tractor;
    - a tractor tyre stood against the back wall and a wheelbarrow;
    - the farm truck, backed in (`E` drives it);
    - the green tractor with a loader on it, the bucket down on the gravel;
    - the manure spreader with its tongue on a block, and the disc harrow
      out front.
    Outside the east end is the gas tank on its stand, its hose hung on a
    bent nail (`E`).
  - **People about Edinboro.** At the fuel stop a man fills up at the
    pumps with the hose run back to the pump, a woman walks back out to
    her pickup with a coffee, and another man is on his phone out front.
    At the Weir place Mrs Weir hangs out the wash. Out in the hay field north of the road a red tractor and a round baler go
    up and down the windrows, turning on the headlands. Every so often it
    stops, the gate on the back of the baler goes up, a fresh bale rolls
    out and lies where it fell, and the tractor goes on with smoke puffing
    from its stack. The farmer looks back at the baler now and then, and
    stops for you if you walk up to it.
  - **French Creek Union Chapel**, north of the road past the fuel stop,
    set back in its own mown yard with the corn behind it. A gravel lot
    with a car in it, and a sign at the road with this week's letters
    (HARVEST SUPPER SAT 5 PM · ALL WELCOME · WORSHIP SUNDAY 10:30). The
    chapel is white clapboard on a fieldstone foundation, gable to the
    road, with a steeple on the front of the ridge: a square tower, a
    louvred belfry with the bell hanging in it, a spire and a gilt cross.
    Down each side four tall windows of coloured glass with pointed caps
    over them outside (ruby and cobalt round pale quarries, a gold roundel
    with a cross); they glow at night. You go up four steps between pipe
    rails to red double doors under a transom. Inside is one room: an oak
    floor, oak wainscot to the chair rail and plaster above, eight rows of
    pews either side of a red runner (you can sit in them), three
    schoolhouse globes, and at the front, up two steps, the pulpit (`E`),
    the table with its cloth, candles and the open Bible, the cross on the
    wall, the hymn board and the piano (`E`). At the back hang the bell
    rope (`E` rings the bell, and it is heard across the fields) and the
    coat pegs, and the guest book lies open on its table (`E`).
  - **The fellowship hall** is under the chapel, and the only way in is
    from behind it: a concrete areaway dug down along the back wall, a
    pipe rail round it and a sign at its head (FELLOWSHIP HALL ·
    DOWNSTAIRS · ALL WELCOME), twelve risers down to a white door in the
    fieldstone with a jelly-jar light over it. Inside is one long room set
    out for Saturday's harvest supper: a speckled tile floor, tan
    panelling to a white chair rail, a drop ceiling with fluorescent
    panels, and white columns down the middle with yellow balloons tied
    to them (two got away and are up against the tiles, one has gone soft
    on the floor). Six folding tables in checked cloths, blue, yellow and
    grey, with a canning jar of asters and a gourd on each and the steel
    chairs round them (sit at any middle one). By the door: coat hooks with
    two coats, the bulletin board (`E`; the chest freezer is still for
    sale), a HARVEST SUPPER banner, the free will offering basket (`E`),
    a cart of spare chairs, and the clock. Across the south end the
    kitchen behind its counter and pass-through: the almond fridge (`E`),
    the range with a stock-pot on it, the sink, the cupboards, crock-pots
    (`E`), and the coffee urn on the counter (`E`), with the sign-up sheet
    on the wall by it (`E`). Past the kitchen, the old upright piano (`E`)
    under a picture of the chapel, a drinking fountain, and the children's
    hand turkeys taped up between the small high windows, which have
    checked valances and look out at the grass. It is underground, so its
    light is the same at noon and at midnight.
  - East of it, behind a dry-stone wall along the road with a gap at the
    gate, is the old graveyard: two hundred-odd stones in rows facing the
    road. They are round-topped tablets, uprights on bases, slant markers,
    an obelisk or two, flush markers and a child's lamb, with the oldest at
    the back weathered dark and leaning. A few have a flag by them. There
    are three old maples and a bench under one of them. `E` at the gate
    reads the stones.
  - **French Creek Substation**, off in the field behind the fuel stop
    and the chapel, up a gravel lane from the back of the store's lot. A
    tap off the line up the power cut comes west across the corn on two
    wood poles to a steel dead-end frame at the yard's east end. Under
    that are the air-break switch with its padlocked handle, then the fuses
    on their stand. Next comes the transformer in its oil curb, with
    radiators and fans down both sides, the conservator on top, brown
    porcelain bushings, arresters and its nameplate. West of it is the
    low-side frame, with the bus along the top and three regulators under
    it on their platform. Last are three feeder breakers, one each for the
    village, Route 6N and the lake, their cables going down into the
    ground at the riser frame. It is all on crushed stone inside
    chain-link with barbed wire on top, with DANGER signs and the
    utility's sign by a double gate that opens on `E`. The transformer
    hums. Two floodlights light the yard at night, a white pickup is
    parked inside, and by day a lineman in a vest stands by the
    transformer with his clipboard. In the corner is the control house,
    block with a flat roof and a light over its steel door. Inside are the
    relay panels across the north wall with their meters, lamps and
    switches, the battery rack and its charger, the RTU with its lamps
    blinking, a desk with the laptop open and the log beside it (`E`),
    the one-line diagram on the wall, a hard hat on its hook, a hot stick
    and the window unit.
  - A pole line runs along US 6N on the north side, and a tap crosses the
    road and goes up the Weirs' lane, with a transformer on its last pole
    and drops to the house and the barn. The poles and wires go on east
    with the road, and along the lake street each carries a light out
    over it.
  - **East through the woods.** Past the last hay field US 6N goes on
    into the trees for a quarter mile and more. Second growth stands
    close on both sides, hemlock and maple at the edge with shrubs at their
    feet. There is a 45 sign each way, a deer crossing each way, and a
    board for the fireworks place (AHEAD ON LEFT) before you see it. The
    woods are as far as you can push through.
  - **French Creek Fireworks**, in its own clearing on the north side. It
    is a long white block building with a red band round the top on an
    asphalt lot. Three roll-up doors stand at its west end with yellow
    bollards in front of them and an OPEN 7 DAYS · ALL YEAR banner over
    them; `E` at one winds its curtain up into the drum over it (and down). At its east end are the glass doors (you walk in) and a display
    window with posters in it (BUY 1 GET 2 FREE), under the lit name. At
    the road stands the red pole sign (FIREWORKS · WHOLESALE PRICES · OPEN
    7 DAYS), lit at night, and a big yew on its bed of mulch. There are lot
    lights, a shipping container out back, and a dumpster. Inside is one
    big sales floor under bare joists and strip lights: five gondolas of
    cakes, artillery shells, rockets, fountains and sparklers, each aisle
    signed overhead (`E` to browse); shelving up the back wall under
    ASSORTMENTS · 500 GRAM CAKES; pallets of cases inside the roll-up
    doors; the counter by the door with the register, a case of lighters
    and the 21 · PHOTO ID notice (`E`); a cart corral, the NO SMOKING and
    LIGHT ONE AT A TIME posters, and bunting over the windows.
  - **Lake Street.** Where the woods give out, the road runs on between two
    rows of houses on mown lots, the lake behind the ones on the north
    side. The street is built from four kinds of house. One is a cape cod
    with two dormers, a little deck at its door and a gravel drive. One is
    a red brick ranch with its garage at one end, a stoop under a little
    hood, and a picnic table and a kettle grill out back. One is a bungalow
    with its gable to the road, a porch across the front with two rockers,
    shutters and a barn star. The last is a two-storey house in grey with
    green trim and a carport over a concrete drive. Thirteen of them stand
    in their own colours: tan, white, blue, cream, sage, slate, yellow, red
    and tan brick. Each has its mailbox at the road, its drive and its car
    (`E` gets you in, as at the rest area), shade trees, flowers at the
    front, a porch light and its house number, and windows lit at night
    behind the curtains. In the yards are what people keep in yards: swing
    sets, sheds, kayaks on a rack, a bass boat on its trailer, a fire ring
    with chairs round it looking at the water, a vegetable garden, a flag
    flying off its pole,
    a basketball hoop over a garage, the AC and the propane tank, and two
    pink flamingos. Two cars are parked on the shoulder for a cookout. The
    woods close round the back of the lots and both ends of the street.
  - **People out on Lake Street**, on a fine day: a man mowing his front
    lawn in stripes, a woman watering her beds and another on her knees
    weeding, two neighbours talking over the property line, a man washing
    his car in the drive with a bucket by him, somebody walking down to
    the mailbox and back, a jogger going up and down the street, a woman
    walking her dog the other way, and a man in a lawn chair with a can and
    a radio. In the park an old couple walk the shore path, a man reads the
    paper on a bench, a fisherman stands at the end of the dock, and a kid
    runs round and round the slide while his mother watches. After dark
    the yards empty; the walkers and the fisherman stay out a while.
  - **Inside every house on Lake Street.** The front doors open as you come
    up to them, and the rooms behind agree with what the outside shows.
    Every window is a real opening with glass in it: from inside you see
    the street or the lake through it, and from outside the curtains and
    the lamp behind them look as they always did. Every room has its own
    paint, its floor (boards, carpet, lino, tile, or the garage's slab),
    a light in the ceiling, furniture, and its name on the screen.
    - **Lived in.** Pictures hang in the living rooms, the dining rooms and
      the bedrooms (the lake at sundown, a red barn, a sail on the lake,
      flowers in a jug, the ridges going blue, two fields of colour, a
      family long ago, the light at Presque Isle), each in its frame and
      mat, over the sofa, over the bed or the sideboard, above the set or
      the fireplace, never behind a bookcase or across a window. Every
      kitchen has a clock on the wall keeping the game's time, and a radio
      on the counter: `E` changes the station (country, talk, the Pirates
      game, off), and whichever radio is nearest is the one you hear, quiet
      from the next room and hardly at all from the yard. The fridge hums
      and cuts out and the clock ticks when you are near it. Low tables
      have books, a mug and the remote on them; dining tables a runner and a
      bowl of fruit or flowers in a vase; every other sofa a throw over its
      arm. In some houses the set comes on of an evening and lights the room
      blue, flickering with the cuts. In every third house a cat is asleep
      at the foot of a bed, breathing, an ear going now and then.
    - The **cape cod** has a hall from the door with the stair up its side.
      The living room runs the length of one side, with the fireplace on
      its end wall where the chimney stands outside, a set, a loveseat and
      a bookcase. The kitchen runs the length of the other side, its table
      by the front windows and its counters, range and fridge along the
      back under the window there. A half bath sits at the end of the hall
      under its window. Upstairs, under the slopes, there is a bedroom at
      each end lit by the gable windows. Each dormer on the front slope is
      an alcove let into a bedroom, with its window at the end and a desk
      in it.
    - The **ranch**: in at the front door to the living room behind the
      picture window, and the galley kitchen beside it under the small front
      window, open to the dining room behind. A hall crosses to the
      bedrooms at the far end and the bathroom under the back window. From
      the dining room a door, a landing and two steps go down into the
      garage. Inside it are the back of the big door with its tracks, the
      opener on the ceiling, the bench and pegboard under the back window,
      steel shelves, a freezer, the water heater, the mower, a bicycle, and
      an oil stain where the car stands when it isn't out in the drive.
      `E` at the big door, inside or out, runs it up its tracks, round the
      bend and back under the ceiling in four sections, and down again. The
      back windows now sit the same way round the house whichever end its
      garage is at.
    - The **bungalow**: off the porch into a living room across the front.
      A hall runs back the middle, with the stair to the attic up its side,
      two bedrooms on one side, the dining room and kitchen on the other,
      and the bathroom at its end. Upstairs, under the roof, the window in
      the front gable lights a bedroom, and behind it is the attic room with
      its futon, shelves and boxes.
    - The **two-storey**: a centre hall and stair. The living room, with a
      piano by the front window, is on the side away from the carport. The
      dining room and kitchen are on the carport side, and the kitchen has
      a new side door out under the carport onto a landing and steps beside
      the car. Upstairs are two bedrooms on one side, the kids' room and
      the bathroom on the other, and the hall with the little window over
      the front door.
  - **Lakeside Park**, on the north side of the street. A lot sits off the
    road with its stalls angled toward the water and wheel stops at the
    curb. The lawn goes down to the shore under big trees. A paved path
    runs from the lot to the water and along it the length of the park,
    with benches facing the lake (sit on them) and lamps for the evening.
    There is a pavilion with picnic tables under a hip roof, swings and a
    slide on wood chips, a NO LIFEGUARD sign, and big stones along the
    waterline. Two docks go out into the lake, one with a T at its end and
    one with a finger off it and a bench (sit). Pontoon boats are tied up
    at them, with a ladder and a life ring. You can walk out on the docks.
  - **The pontoon.** The one nearest the shore end of the first dock's T
    isn't tied up, and it has an outboard on its transom. `E` alongside it
    takes the helm: you pull the cord and the motor catches, and the view
    goes out behind the boat (the mouse swings it round). `W` opens the
    throttle, `S` puts it in reverse, `A` and `D` swing the motor, and `E`
    alongside a dock or the shore steps you off. It goes the way a boat
    does: it comes up to speed and coasts down, turns by the prop's push
    when slow and the water past the motor when fast, skids a little in a
    hard turn, comes up onto the plane with the stern squatting, leans in
    the turn and rocks on the chop at rest. Spray comes off the stern and a
    wake opens behind it in a V from the transom's corners, the churn
    straight back from the motor. It bumps off the shore, the docks, the pilings and
    the other boats.
    Geese graze on the lawn and paddle about between the docks.
  - **Disc golf.** Six holes are laid out over the park's lawn between the
    lot and the shore, par 19, from 34 to 52 m. Each has a concrete tee
    pad with its sign (the hole, the par, the distance) and a steel
    basket with chains and its number on the band. The course sign by the
    first tee, off the west end of the lot, has the map on it, with the
    loaner box of discs beside it. `E` at the sign starts a round and puts
    a disc in your hand; `E` there again ends it. On a tee, or standing by
    your disc where it lies, look where you want it to go (up throws it
    higher) and hold `Space` or the mouse button: the meter on the card
    climbs and falls back, and you let go at the power you want. A drive
    goes fifty-odd metres, a putt a few. The disc flies as a disc does:
    lift from its speed and the angle it meets the air at, a little turn
    to the right while it is fast and a fade to the left as it slows. It
    skips and slides when it comes down, and comes off trees and poles.
    Into the chains slowly enough and it drops; too hard and it clangs off
    the rim. In the lake it costs a stroke and you throw again from where
    it went in, and out of the park the same from where it went out. Walk
    up to it to pick it up. The card across the top keeps the hole, the
    throws and the round, and your best round is kept for next time.
    When you let go, the view goes after the disc, from behind and above
    it, to see it come down; it waits a moment on where it lies (`Space`
    brings it back sooner) and comes back to you, turned to face it. Hold
    `Z` or the right mouse button to close the view in on the basket from
    the tee; the mouse turns you slower while you do.
  - **Edinboro Lake** opens out north and east of the park, most of a mile
    across to the far woods, with cottages along the far shore whose
    windows light up at night. A sailboat sits out in the middle, a
    fisherman sits very still in a jon boat nearer in, and a NO WAKE buoy
    floats past the docks. The water ripples and has the sky in it, and
    the boats ride a little on it. Beyond the far woods the hills stand up
    into mountains all round the horizon, ridged and gullied, bluer and
    paler the further off they are.
  - **Lakeshore Brewing Co.**, past the last house at the end of the road,
    on the shore. Its lot has cars in it and its sign at the mouth. The
    building is a long timber taproom with a red standing-seam roof, its
    door, windows and name toward the road. The lake side is five glass
    garage doors, three of them rolled up under the ceiling so the room
    opens onto the grass. Inside there is pine on the walls and ceiling,
    with black beams, fans turning and pendant bulbs. The brewhouse is
    behind a glass wall at the west end (three fermenters, the kettle,
    kegs). The bar runs along the east wall with a marble top, stools,
    the taps on grey barnwood, bottles on the shelves and two TVs over
    them. There are tables, high-tops by the open doors, and a chalkboard.
    Out of the garage doors is the beer garden: turf going down to the
    water, a big maple in a ring of stones, sofas round a fire pit, a
    cornhole game, and the deck bar, a little timber hut with a window to
    order at. Below it the deck runs out over the water on posts. It has
    black slatted tables, aluminium chairs and red market umbrellas,
    mostly furled, with a black cable rail along the water and strings of
    bulbs on poles over it all, lit at dusk. Two bartenders work the
    taproom and one the hut, and two servers go round the tables with
    trays held level. Customers sit at the bar, at the tables and on the
    sofas, stand at the rail looking at the lake, and play cornhole. A fifth
    table stands at the east end of the middle row, high-tops with stools
    stand along the rail, and two picnic tables sit out on the grass west of
    the fire. Somebody's dog lies on the boards by their table with her
    water bowl, head up and panting, watching whoever goes by, now and then
    down on her paws, her tail going slow. Sit in any empty chair or stool.
    The TVs over the bar have the ballgame on: a director cutting between
    the centre-field camera for each pitch, the batter close up with his
    name and average, the wide shot when the ball is in play, a slow replay
    of a hit, the crowd, the line score between innings and the ads, with
    the count, the outs, the bases and the score in the corner going on
    from pitch to pitch.
- **The picnic grove** spreads across the lawn south of the building. Paths
  run to it off curb ramps at the plaza's corners: north to the shelter's
  slab and its ramp, south to a round pad by the pet area's bag dispenser,
  round the back of the building from one side of the plaza to the other,
  and off each end of the raised walk by the car lot. Every one meets
  another walk, a slab or a pad, and none of them ends in the grass. Each
  leaves its ramp straight and just as wide, and only then bends away, so
  no edge steps or notches where the two meet. The grove has tables on concrete pads, charcoal grills (some
  lit, with smoke and embers), a picnic shelter and shade trees. Nearby are
  the flagpole with the US and Pennsylvania flags, a Blue Star Memorial
  Highway marker and a pet area, and on the lawn north of the plaza a blue
  and gold state historical marker for French Creek, which Washington came
  up in 1753 (`E` reads it). Behind the men's wing two condensers hum on
  their pad, with the meter on the wall.
- **The substation** is about 180 m from the building, up a paved drive that
  runs all the way to its gate. At the bottom, a yellow pipe gate stands
  swung open along the shoulder and chained back, with an AUTHORIZED
  VEHICLES ONLY sign facing whoever drives up. The compound is a gravel
  pad behind chain-link and barbed wire, with DANGER signs and a double gate
  that opens on `E` and stays where you leave it. Inside are:
  - a pad-mount transformer and two standby generator sets, with a diesel
    tank and conduit;
  - a block generator house with switchgear, ATS lights and a logbook. To
    the right inside its door is a plain grey door in a block partition
    (NO SUPERVISORS PAST THIS POINT). It is shut until you open it (`E`),
    and stays the way you leave it. Behind it a concrete stair with yellow
    nosings and pipe rails goes down along the south wall to a cellar the
    crew has made theirs: walnut panelling from the seventies, an octagonal
    poker table under a green shade with a hand still on it (kings showing)
    and the chips stacked, six chairs no two alike, a plaid couch with an
    afghan facing a wood-cased television on a cart (`E` turns it on), a
    cable spool for a coffee table, a harvest-gold fridge full of lager, an
    Allegheny Lager neon, a PITTSBURGH pennant, Christmas lights along the
    ceiling, a space heater glowing, and the whiteboard of who owes who
    (Terry owes fourteen). Along the back wall the crew has built a bar
    with a panelled front: a kegerator under its end with three taps up
    through the top, a shelf of bottles and a pyramid of cans, a COLD BEER
    neon and three chrome stools. A half barrel sits in a tub of ice with
    a party pump, for when the kegerator runs dry. There is a foosball
    table in the poker room and a buck mounted on the old wall. Two walls
    are left bare for posters: the long panelled wall over the poker
    table, and the dug-out's west wall north of the dartboard. The old
    foundation wall to the west has been
    knocked through and the yard dug out under. The couch, the TV, the
    spool and the fridge are in that second room now, with room to move,
    and a recliner in the couch's plaid sits beside the couch angled at
    the set.
    - **Darts.** The second room has a darts lane with a regulation board,
      an oche and a chalkboard. `E` at the oche picks up three darts. You
      aim where you look, and your hand drifts a little as a hand does.
      Click or `Space` throws. The dart flies its arc, sticks where it
      lands, and scores off the board's own rings (single, double, treble,
      outer bull, bull). It is 301 against Dale, who throws after you:
      three darts a turn, finish exactly on zero, and go under and the turn
      is bust. A panel and the chalkboard keep the score. `N` starts a new
      game and `Esc` puts the darts down.
    - **The corridor and the arcade.** A door in the far wall opens on six
      steps down to a fallout-shelter corridor from 1962. It has block
      walls painted green and cream, a yellow stripe, conduit and a cable
      tray, vapour-tight tubes (one going), two steel doors in its east wall
      (MECH 2, and STORAGE · NO ENTRY) and the yellow shelter sign. Those
      two, and the doors down in the sub-basement, stay shut until you open
      them (`E`), and stay as you leave them.
      Twenty-five metres on, under the hill, a pair of sliding glass doors
      parts as you come up to them, each leaf running into a pocket in the
      wall, onto a small arcade with a cosmic carpet, black walls with pink
      and blue neon, and a GAME ROOM sign. Four upright cabinets stand
      spread round the walls, each running its own attract screen (ASTRO
      RAIDERS, MAZE MUNCHER, BRICKYARD BREAKOUT and BLOCK DROP), with a
      token changer by the way in, clear of the trash can.
    - **MECH 2.** The first steel door opens on what its name says: the air
      handler that breathes for the corridor and the arcade (`E`), its duct
      away along the ceiling, a water heater, the sump under its grate, the
      electrical panel with the log on a clipboard beside it, a shelf of
      boxed filters and the mop bucket, under one tube fixture with one of
      its two tubes gone grey.
    - **The stair down and the sub-basement.** The door marked NO ENTRY
      opens on the shelter's old stores (cracker tins on a steel shelf, the
      Civil Defense water drums, a broom) and a straight concrete stair,
      eighteen risers with yellow nosings under a ceiling that falls with
      it, down to the sub-basement. That is a loop of block hallways not
      much wider than your shoulders, running out under the hill, with
      dead ends off it, laid out on a grid so every wall turns its corners
      cleanly. A bare bulb hangs every so often, some of them out and one
      going. Pipes run along the ceilings, water stands on the floor, and
      there is chalk on the walls (DON'T GO PAST THE RED LIGHT, TURN BACK,
      OUT →). Water drips somewhere near while you are down there. Off the
      hallways are the old boiler room, cold since the sixties (`E`); a
      bunk room the shelter never needed, with four cots, a table with a
      radio that plays only static (`E`), and an October 1962 calendar
      crossed off to the 27th; a passage with a chair at its end, facing
      the wall under rows of tally marks (`E`); and at the far end what looks
      like a janitor's closet. It isn't one. Past the mop sink and the shelves
      it goes on round a corner, through an old wooden door, along a passage
      of crates, through a steel door marked DANGER, to a red bulb (the chalk
      calls it THE RED LIGHT) and under it a steel door with a wheel on it
      marked LEVEL 3. It is the darkest place in the world: bring the
      flashlight (`L`).
    - **The boiler hall.** `E` at the wheel door puts your hands on the
      wheel. It gives, and you watch it spin round three times as the dogs
      draw back out of the frame, then something clunks and the door swings
      slowly in, red light coming round it. Behind it is a hall the size of
      a church dug out of the hill, three storeys of it, lit red. You come
      out on a grating catwalk high up the wall, and a steel stair goes down
      to a landing and turns to the floor. Down there three Scotch marine
      boilers stand side by side on their saddles, burners roaring, the fire
      showing round their doors and in their sight glasses, gauges quivering,
      each with its steam stop and a red handwheel. The header they feed runs
      the width of the hall under the ceiling, and their stacks go up into
      the breeching. Against the east wall are the deaerator on its platform
      and the two feed pumps under it. On the west wall is the control
      panel with its dials lit and a red beacon going round on top, and at
      the desk in front of it a logbook somebody is still keeping (`E`). One
      stop valve weeps steam, and now and then a safety valve lifts with a
      shriek. `E` at the door again swings it shut and the wheel spins home.
      It is underground and red at any hour.
    - **Astro Raiders.** Every cabinet plays. `E` at the first stands you at it,
      looking at its screen in the cabinet, with the room still round you.
      It is a space invaders game after yojoecool's MIT-licensed
      SpaceInvaders. Five rows of raiders march across and step down, faster
      as there are fewer of them, to a four-note bass that speeds up with
      them; squids take one hit, crabs two and octopuses three. You get two
      shots in the air at once and five lives, over three waves, each faster
      than the last. `A`/`D` or the arrows move, `Space` or a click fires,
      the stick on the cabinet leans as you move, `N` starts again and `Esc`
      or `E` steps away.
    - **The other three** play exactly the same way: `E` stands you at the
      cabinet, you play on its screen with the stick leaning under your
      hand, `N` (or `Space` once it is over) starts again, and `Esc` or `E`
      steps away. Each keeps its high score.
      - **Maze Muncher** follows Ania Kubów's MIT-licensed pac-man: her
        28 × 28 maze, a dot a point, a power pellet ten and the ghosts
        frightened for ten seconds, a frightened ghost a hundred and sent
        home. Blinky, Pinky, Inky and Clyde wander at their own paces. The
        muncher keeps going the way you last pushed him, you have three of
        him, and the tunnel runs across the middle.
      - **Brickyard Breakout** (the old Turnpike Racer, its marquee
        repainted) follows Sara Sánchez's MIT-licensed 2D breakout: a wall
        of fifteen bricks, a point a brick, three balls, the bat on the
        stick or the mouse.
      - **Block Drop** follows Jake Gordon's MIT-licensed
        javascript-tetris: a well ten by twenty, the seven pieces from a
        bag, ten for a piece set down and a hundred for a row (doubling
        for each more at once), the drop quickening as the rows go, and the
        next piece in its box.
    - **Air hockey.** `E` at the near end of the table puts the red mallet
      in your hand, and you play the table's computer, first to seven. The
      mouse (or `WASD`) moves your mallet round your half. The puck rides
      the air, comes off the rails with most of its speed and off a mallet
      with the mallet's speed carried into it, so a swing is a shot and a
      still mallet is a block. The one scored on serves, and the score is
      kept on the table's LED. The computer is good but not perfect: it
      sees the puck a moment late, aims a little off, and now and then
      hangs back or reaches late, so a quick shot gets past it. This is the physics of the little canvas
      game the crew left on the office computer, moved onto the table in
      metres.
    - **Hoops.** `E` at the front of the basketball machine stands you at
      the line. You aim where you look, and a click or `Space` shoots the
      next ball from the tray. The rim and the backboard are hard: off the
      front of the rim it bounces out, off the board it can still drop.
      Your aim sways like a held breath, so you time the shot. A make goes
      through a cloth net that stretches round the ball, slows it, swings
      and settles, with a swish (or the clank of the rim first). A
      basket is two, three in the last ten seconds, forty seconds from the
      first shot. The balls roll back down the ramp to you.
    - **Coin dozer.** On the east wall, a pusher machine in purple with
      pink and cyan neon, its marquee lit and its chase bulbs running.
      `E` stands you at it looking down through the glass at a deck of
      brass tokens with the pusher going back and forth behind them. `A`
      and `D` (or the arrows, or the mouse) move the chute along the back,
      `Space` or a click drops a token, and `X` shakes the machine (once
      every few seconds). A dropped token falls from the chute and bounces
      once. If the pusher is under it, it lands on the pusher's shelf and
      rides it back until the wall scrapes it off the front edge onto the
      deck. Otherwise it lands in front of the pusher's face. What you have
      won, the tokens left and the last message are lit across the top of
      the backglass, in front of you as you play. Anything pushed over the lip is won; into the
      bonus bucket running along under the lip, three more tokens besides.
      The hopper holds fifty and fills back by one every three seconds.
      Now and then the chute drops a prize instead (a big coin, a die, a gem
      or a toy car) worth more if you can get it over. Nobody at it, it
      drops a token now and then by itself, so the deck is always moving.
      It follows the pusher game the crew had on a laptop, cut down to
      what the room's style holds: the tokens slide, shove each other and
      ride up on top of each other, which is all it takes for the pile to
      creep forward and spill.

  Everything underground (the cellar, the dug-out, the corridor and the
  arcade, MECH 2, the stair and the sub-basement, and the chapel's
  fellowship hall at Edinboro) is lit only by its own lamps. It looks the same at noon and at midnight, and it is not on the
  day/night cycle. The sub-basement keeps only a fifth of the fill light
  the rest of it has, so between its bulbs it is all but dark.

  A pole line runs off south down its cleared right-of-way.
- **Water in, water out.** No city water or sewer reaches a rest area out
  here, so it has its own.
  - **The well house.** A block hut off the service track, in a clearing
    in the woods. Inside are the well casing with its sanitary cap, a blue
    pressure tank, the gauge and pressure switch on the tee, a chlorine
    solution tank with its pump, a heater and a bulb.
  - **The water tank.** On the rise above the well house is a steel tank
    on a short tower: four battered legs, cross-bracing, a balcony and
    rail, a caged ladder locked off at the bottom, and REST AREA 154 on
    the side.
  - **The treatment plant.** Downhill from everything, at the end of a
    gravel spur off the track, is a fenced compound with a double gate
    (`E`). Inside:
    - a block control building with two blowers, two pumps and the motor
      control panel with its run lights. Its lab bench has sample bottles,
      a pH meter and the logbook open on it (`E` reads the last entry);
    - the headworks box where the sewer comes in;
    - a concrete aeration tank of brown, working water with foam drifting
      on it, a stair up to a grating catwalk across it, and the air drops
      with their red handwheels;
    - a round clarifier, its skimmer arm turning slowly under the bridge
      to its centre;
    - a curbed sand filter bed;
    - a baffled chlorine contact tank with its tablet tubes.
    Manholes mark the sewer down the track. A red beacon on the control
    building turns in a power cut, in a hard rain, and now and then for
    no reason anybody can find.
  - **The end of the track.** Past the plant the service track runs on
    down through the woods to a gravel turnaround. A yellow gate is
    chained across the old track there (STATE GAME LANDS · ROAD CLOSED
    BEYOND THIS GATE), and the ruts go on under a thicket of young spruce
    and hemlock you cannot get through. The same belt of thicket runs
    along the north, south and west edges of the woods, just past where
    you have to stop, and walking into it tells you that you can't go any
    further that way. Only the edge says so: walking into a wall, a fence
    or a building anywhere else says nothing, and the lake's bank says it
    drops straight in, and to go out a dock or take the boat.
  - **The creek.** The treated water goes out a pipe to a concrete headwall
    on the bank of a creek (OUTFALL 001, with its permit sign). The creek
    comes down off the hills to the south, runs past the plant through the
    bottom of the woods and away east. It is cut into its own bed, with
    stones along it.
- **The forest.** Northern hardwoods (maple, oak, cherry, beech) mixed with
  eastern hemlock, white pine and spruce, with an understory of saplings,
  shrubs and ferns. Logs, stumps and rocks lie on the forest floor. Trees
  sway in the wind. Past the edge of the walkable zone a canopy shell
  carries the woods over the ridges to the horizon.
- **Time and season.**
  - A day lasts 20 minutes, with sunrise and sunset at Crawford County's
    real times: about 6:05 and 20:45 in July, 7:25 and 18:45 in October.
  - `Y` switches between summer and autumn, which recolours the leaves, drops
    a few, and keeps the clock where it was, so the sun moves instead. In
    autumn the leaves are down on the lawns and walks under the hardwoods
    and round the farm; in summer there are only a few dry ones.
  - The lawns are grass close to: fine blades laid over the ground's own
    colour at two scales, so no repeat shows near or far, and the rest
    area's lawn is mown in stripes that go light and dark as you look
    along them one way and the other, the way a mown lawn does.
  - At night the lot lights and building lights come on and, in summer,
    fireflies rise over the lawn.
  - Mist lies on the ground for an hour after sunrise and comes back at
    dusk. It is a height fog worked into every surface's own shader: thick
    at the ground and gone a couple of metres up, integrated along each line
    of sight and patchy in a slow drift, so it has no edges. The grass at
    your feet is clear, the far side of the lawn goes milky, posts and
    trunks fade into it at the bottom, and from up in the woods the site
    lies in it. On a long sight line, across a field or the lake, it never
    closes in completely, and by the lake it lies on the water. So a morning
    across the lake is a soft band of mist on the water, not a white sheet.
  - Distance has its own colour. The haze a hill sits in, a kilometre
    off, is bluer and darker than the pale sky at the horizon, so ridges go
    blue-grey and layered as they recede. The far woods go in patches of
    darker and lighter stands, and where they come down to the lake their
    face darkens toward the foot like the inside of a wood.
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
  - Rain is streaks round you that never fall under a roof (in any of the
    buildings, under the picnic shelter, in the open trailer, in the car you
    are driving), with splashes at your feet. The paving darkens and shines as it gets wet and dries
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
  - Two people share a picnic table, and a dog is walked round the pet
    area.
  - The truckers are big men in boots, beards and trucker caps. They live
    in the row of parked rigs (14i). One paces the side of his rig on the
    phone. By day another climbs down in a hi-vis vest for his walk-round,
    thumping each tire on the driver's side and looking over the doors and
    lights at the back. In the night the one in slippers goes over for
    coffee. Where the row allows, each has an empty stall held on his
    driver's side, so no visitor rig boxes him in. They stop for you, and rigs moving in the
    aisle stop for them. The parked rigs are solid at their own width, at
    their angle, so the gap between two of them is a gap you can walk. By day somebody sits in the
    grass with their back to the big boulder by the grove (against it, not
    in it), one knee up, a
    paperback open, now and then turning a page or looking round. Visitors stop at the state
    map in the lobby on their way through, tracing the interstates and now
    and then putting a finger on YOU ARE HERE.
  - A smoker stands by the post outside the doors, clear of the planter and
    the doors' swing. The cigarette is lit: the coal brightens on each drag,
    a thread of smoke comes off the end, and they breathe it out after.
  - Nobody stands or walks in anything. People and the dog steer round
    posts, bins, parked cars, each other and the flower beds. The doors open
    for anyone coming or going.
  - Butterflies work the flower beds on summer days. Grey squirrels, with
    pale bellies, eye rings and full plumed tails, forage in the grass round
    the grove's trees: nose down, then up on their haunches to eat, tail
    flicking. They run in a bounding gait from tree to tree, freeze when
    you come near, and go up the nearest trunk and cling there head-down
    until you have gone.
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
    taking back. It is a big house, 12.4 by 9.2 m, with room to move about
    in every room.
    - Outside: grey clapboard where the paint has let go, a fieldstone
      foundation, a hole in the back of the roof, a brick chimney with its
      top fallen in, broken and boarded windows, ivy, and a porch whose
      corner post lies in the grass, so the porch roof sags to meet it.
    - The front door stands open, and both floors can be walked.
      The parlour has a stove, a calendar stopped in October 1987, a picture
      on the wall, and a corner where the ceiling has come down. The kitchen
      has the table on its side, the sink, and an old fridge with its door
      open, and a closet under the stairs. The parlour also has a china
      hutch and a dining table with one chair tipped over.
    - The stair is boxed in up the east wall: thirteen risers with nosed
      treads, stringers, a newel and balusters at the foot, and a rail on
      brackets the rest of the way. The eighth tread is split and sags.
      You reach it from a landing inside the front door. It can be walked,
      run or sprinted up.
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
  at night a chorus of tree crickets (soft, pulsing, in the 2.6 to 2.9 kHz
of the real thing), a ground cricket's trill and now and then katydids,
quieter and slower in October, the hum of the building and the generators, the hand
  dryers, and horns. There are also car doors, flushes in the restrooms, the
  flag halyard ringing on its pole in the wind, a distant jake brake, and a
  dog. Rain hisses outside and drums on the roof inside; thunder cracks and
  rolls; the standby diesel cranks, catches and runs; the transfer switch
  bangs; the vending machine takes coins, whirs and thumps; the old house
  creaks. The garage radio plays its station, the roll-up doors whirr, the
  zero-turn and the blower run where they are, and bags thump into the
  dumpster. It starts on your first click; `U` toggles it.

## Controls

| Action | Key |
| --- | --- |
| Walk / look | `WASD` / drag or mouse |
| Run · sprint | `Shift` · `Q` |
| Door · drive · use | `E` |
| Handbrake (driving) | `Space` |
| Throttle · reverse · steer (the boat) | `W` · `S` · `A` `D` |
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

At the oche you aim with the mouse. A click or `Space` throws, `N` starts a
new game, and `Esc` or `E` puts the darts down.

At the Astro Raiders cabinet `A`/`D` or the arrows move, `Space` or a click
fires, `N` (or `Enter`) starts a new game and `Esc` or `E` steps away. At
the other three the arrows or `WASD` work the stick: in Maze Muncher they
steer, in Brickyard Breakout they (or the mouse) move the bat, and in Block
Drop left and right move the piece, up turns it and down drops it faster.
`N` (or `Space`, when the game is over) starts again, and `Esc` or `E` steps
away.

At the air hockey table the mouse (or `WASD`) moves your mallet. At the
hoops machine you aim with the mouse, and a click or `Space` shoots. At
either, `N` starts a new game and `Esc` or `E` steps away. At the coin
dozer `A` and `D` (or the arrows, or the mouse) move the chute, `Space` or
a click drops a token, `X` shakes the machine, `N` empties it and starts
again, and `Esc` or `E` steps away.

On the disc golf course (Lakeside Park), `E` at the course sign starts or
ends a round. On the tee or by your disc, aim with the view and hold
`Space` or the mouse button to wind up; let go to throw. Hold `Z` or the
right mouse button to zoom in on the basket. While the view follows the
disc, `Space` brings it back.

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
| Generator house and its cellar | x 77 … 87, z −182 … −176; the cellar floor 2.65 m below the house's |
| The dug-out (darts, couch) | x 70.25 … 77, z −183.4 … −176, off the cellar's west side |
| The corridor and the arcade | corridor x 71 … 73 from z −184 to −211; arcade x 67.5 … 76.5, z −219.5 … −211 |
| MECH 2 · the stores and the stair | x 73.25 … 78.25, z −193.75 … −188.25 · x 73.25 … 80.2, z −205.4 … −201.6 |
| The sub-basement | x 58.4 … 100.8, z −258.6 … −183.4, its floor 3.42 m under the corridor's; the closet and passages to the wheel door x 91.2 … 101.2, z −259.4 … −242 |
| The boiler hall | x 86 … 112, z −280.6 … −258.6, its floor 5 m under the sub-basement's |
| Median crossovers | z −250, −520 and +470 |
| Edinboro (US 6N bridge) | z −1200; ramps from z −640 (south) and −1630 (north); the fields x −330 … 610, z −1460 … −860 |
| French Creek Substation | x −16 … 36, z −1416 … −1376 (gate x 10 … 13 on the south side); the control house x −14 … −6, z −1388 … −1381 |
| The Weirs' machine shed | x 136 … 168, z −1120 … −1107 |
| The chapel and its graveyard | x 50 … 128, z −1296 … −1205; the chapel x 84 … 93, z −1238 … −1222; the hall under it, the stair down x 85.2 … 86.8, z −1242.3 … −1238 |
| US 6N east through the woods | x 586 … 1062, z −1213 … −1187 |
| French Creek Fireworks | x 872 … 966, z −1284 … −1205; the building x 893 … 925, z −1274 … −1258 |
| Lake Street and Lakeside Park | x 1062 … 1420, z −1298 … −1134; the park x 1238 … 1372 north of the road; the shore at z −1296 |
| Lakeside Park disc golf | the course sign x 1243, z −1223; tees and baskets over x 1247 … 1364, z −1281 … −1226 |
| Lakeshore Brewing Co. | lot x 1422 … 1468 from the road to z −1226; the taproom x 1430 … 1460, z −1243 … −1229; the deck x 1423 … 1467, z −1299 … −1266 |
| Edinboro Lake | x 980 … 2260, z −2090 … −1296, a rounded oblong, wandering off the street |
| Treatment plant | x 118 … 160, z 90 … 128 (gate on the west side) |
| Well house · water tank | x 65.6 … 68.8, z 97.6 … 101.2 · x 70, z 140 |
| The creek | from x 170, z 262 north past the plant, then east along z ≈ 100 … 134 |
| Vending room | x −55.4 … −50.6, z −3.6 … 4.6, on the island; crosswalk at z 0.5 |
| The open trailer | the truck lot's stall 11, its tail at x −70.6, z −3.6 |
| The path out back | from the loop walk at x 17, z 1 east to x 278, z 50 |
| The camp | x 286, z 52 |
| Maintenance garage | x 32.5 … 41.5, z 24 … 38; yard x 23.5 … 42.5, z 18.5 … 45 |
| Service track | from the yard's south-east corner to x 108, z 252 |
| Pet area | x 8 … 30, z 60 … 100 |
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
js/08-site.js       interstate, ramps, lots, striping, signs, walks, lamps, beds, the median crossovers
js/08b-edinboro.js  exit 166: the ramps, US 6N and its bridge over I-79, the signs, the fields
js/09-building.js   the rest area building, inside and out
js/10-cars.js       parked cars and trucks
js/10b-trailer.js   the trailer whose back doors open: its doors and step, the inside, the load
js/11-driving.js    driving a parked car
js/12-substation.js the drive, the fenced compound, generators, pole line
js/12b-hangout.js   the stair down from the generator house, the crew's rooms under it, the darts lane
js/12c-arcade.js    the shelter corridor on down from the dug-out, its two steel doors, and the arcade at the end of it behind its sliding doors
js/12d-subbasement.js MECH 2, the stores and the stair behind the other door, and the sub-basement's hallways and rooms, the closet and passages to the wheel door
js/12e-boilers.js   the boiler hall behind the wheel door: the wheel, the catwalk and stair, the boilers, their fires, steam and sounds
js/13-grounds.js    picnic grove, shelter, grills, flags, memorial, pet area
js/13b-vendhut.js   the vending room on the island: machines, phone, board, lights, crosswalk
js/13c-wastewater.js the well house, the tank on its tower, the treatment plant, the outfall and the creek
js/14-life.js       visitors, deer, fireflies, falling leaves, grill smoke
js/14b-people.js    people and a dog: skinned figures, poses, the drivers' walks, what they do inside
js/14a-smoke.js     smoke and sparks: two point clouds shared by every fire and cigarette
js/14c-critters.js  butterflies, squirrels, how much ground mist there is
js/14d-backwoods.js the path, the camp and its fire, the teenagers and what they leave, the wall, the stand, the car, the line
js/14e-incidents.js the trooper's cruiser coming and going, and the occasional wreck on I-79
js/14f-homestead.js the old house in the woods, inside and out, and its yard
js/14g-garage.js    the maintenance garage, its yard, the track and gate, the truck, mower, carts and blower, the roll-up doors
js/14h-custodian.js the custodian: rounds, stalls and cans, the restroom logs, mowing, leaf blowing, the cot; the outdoor path grid
js/14i-trucker.js   the truckers: the one on the phone, the walk-round, the one in slippers and his coffee run
js/14k-edinboro.js  at exit 166: the fuel stop, its store and restroom, the Weir farm (the house and both its floors, the walk-in barn, silos, shed, stand, cows)
js/14l-chapel.js    at exit 166: French Creek Union Chapel, inside and out, the fellowship hall under it, its lot and sign, and the old graveyard
js/14m-fireworks.js US 6N on east through the woods, and French Creek Fireworks, which you can walk into
js/14n-lakeside.js  the end of the road east: Lake Street's houses (their outsides), Lakeside Park and its docks, and Edinboro Lake
js/14o-houses.js    the houses on Lake Street from inside: their walls round real openings, glazed and with doors hung, and the rooms of each kind
js/14p-boat.js      the pontoon you can take out on the lake: its outboard, how it handles, getting on and off, the camera behind it
js/14q-townsfolk.js people out of doors (Lake Street, the park, Edinboro, the baler in the hay field) and the crowd runtime the brewery uses too
js/14r-brewery.js   Lakeshore Brewing Co.: its lot, the taproom, the beer garden, the deck over the water, its staff and customers
js/14s-edinsub.js   French Creek Substation behind the fuel stop: the tap line, the yard and its equipment, the control house
js/14y-wear.js      wear and small things: oil, crack sealant, drains and lids, fallen leaves, the historical marker, the condensers, the poles and wires along US 6N
js/15-bake.js       emissive materials, bucket baking, collision grid
js/16-lighting.js   the pooled point lights
js/16b-weather.js   weather (cloud deck, rain, fog banks, lightning) and the power: circuits, outage, generator, transfer switch
js/16c-screens.js   the lobby TV, the office monitor and CAM 5's trail-camera pictures, the bulletin board's notices
js/17-player.js     movement, interaction, gates, drone
js/18-hud.js        compass, clock, location, weather, plan view
js/18b-vending.js   the vending machines' keypad, coins, coil and shaking
js/18d-darts.js     darts: aiming, the throw and its flight, scoring, 301 against Dale
js/18e-games.js     the arcade's games: air hockey against the table, and hoops (its net)
js/18f-raiders.js   Astro Raiders, the space invaders game on the first cabinet
js/18g-cabinets.js  the other three cabinets: Maze Muncher, Brickyard Breakout, Block Drop
js/18h-dozer.js     the coin dozer on the arcade's east wall: its cabinet, and the game
js/18i-discgolf.js  the disc golf course in Lakeside Park: its tees, baskets, sign and loaner box, and the game (the throw, the flight, the card)
js/18c-settings.js  the graphics menu: resolution, frame cap, shadows, draw distance, light count; the frame meter
js/19-loop.js       main loop and the window.REST debug handle
js/20-audio.js      procedural WebAudio ambience
tools/shot.js       headless screenshots
tools/walk.js       headless walk-through checks
tools/zfight.js     coplanar faces in a box of the world
tools/signaudit.js  sign text too close to the edge of its board
CLAUDE.md           the standing rules for anything added: no coplanar faces, nothing underground on the day/night cycle, sign text fitted with padding
```

The engine comes from the Low Desert Motel and keeps its conventions:
- classic scripts loaded in order into one global scope;
- static geometry merged into material buckets and baked into 96 m tiles;
- axis-aligned box colliders on a grid (and, for the one trailer you can
  walk into at the lot's angle, boxes turned about the vertical: colliders,
  floors, zones, the rain mask and its dome lamp all take them);
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

All four tools use Playwright with SwiftShader. Before running them, copy
`three.min.js` (r128) into `tools/`; it is git-ignored.

```
NODE_PATH=$(npm root -g) node tools/shot.js shots.json outDir 960 540
NODE_PATH=$(npm root -g) node tools/walk.js
NODE_PATH=$(npm root -g) node tools/zfight.js '{"x0":-10,"x1":17,"z0":-21,"z1":21,"y0":-0.6,"y1":10,"near":0.0011}'
NODE_PATH=$(npm root -g) node tools/signaudit.js
```

**`shot.js`** renders a list of views. Each entry in `shots.json` looks like
`{"name","go":[x,z,yaw,y,pitch],"hour","autumn","drone":[x,y,z,yaw,pitch],"frames","eval"}`.
It reports draw calls, triangles and any console errors.

**`walk.js`** walks fixed routes and checks that nothing blocks them, then
checks that every seat can be sat in and stood up from. Last, it climbs the
old house's stair with the real player controller and the keys held down,
at walk, run and sprint, and comes back down; the same for the stair to
the generator house's cellar and the trailer's step. The routes are:
- through the lobby into both restrooms and their accessible stalls;
- into the family restroom and the office;
- out the back and through both service doors;
- out the path to the camp, and into the camp past the fire;
- along the tape to the old house, through its door and into the kitchen;
- up the old house's stair and into every room upstairs, and back down;
- across the lawn to the garage yard, in at the man door, round the shop and
  out a bay door, round the salt bin and the dumpster, and up the track and
  around the gate;
- across the lot and the grove;
- up the drive and through the substation gate, into the generator house,
  through the grey door and down the stair into the cellar;
- across the truck aisle on the crosswalk, into the vending room, round the
  machines and out the back door to the cars;
- up the trailer's step (doors opened first) and up its aisle to the load bar;
- on through the dug-out, its door, the corridor and into the arcade (and the
  corridor's stair, keys held, at all three speeds);
- in at MECH 2's door; in at the other, down the stair to the sub-basement
  (and the stair, keys held, at all three speeds), along the hallways to
  the bunk room, to the chair, round to the boiler room, and up to the
  door at the end; through the closet and the passages to the wheel door;
  and through it (opened first) along the catwalk and down the boiler
  hall's stair to the floor (the stair also with the keys held, at all
  three speeds);
- across each of the three median crossovers on foot;
- up Edinboro's off-ramp, along US 6N and over the bridge, and down the
  on-ramp to southbound; and the other two, down onto northbound and up
  off southbound;
- along every sidewalk off the plaza and the long walk;
- into the fuel stop and through the grey door into its restroom;
- up the chapel's walk and steps, in at its doors and up the aisle to the
  chancel; and in at the graveyard's gate and along between the stones;
- round the back of the chapel, down the outside stair (and its keys held,
  at all three speeds), in at the white door and through the fellowship
  hall to the kitchen counter;
- east along US 6N through the woods, in at the fireworks outlet's glass
  doors and down an aisle; and in under its middle roll-up door (raised
  first);
- along Lake Street into the park, through its lot, down the path to the
  shore and out to the end of a dock;
- past the car in a ranch's drive and in under its garage door (raised
  first);
- across the brewery's lot, in at its door and through the taproom to the
  bar; out a garage door to the beer garden; and round the east end of the
  building, down the path to the deck, between its tables and along the
  rail;
- past the disc golf course's sign, over the first tee's pad and down its
  fairway past the basket to the second tee;
- into every house on Lake Street and to every room in it. Each house
  lays out its own routes as it builds (`LAKE_HOUSES.routes` in 14o, so
  they move with the plans): in at the front door, round the ground floor,
  out a two-storey's side door and down into a ranch's garage, and up each
  stair to every room upstairs, with each stair also climbed and come down
  with the keys held at all three speeds;
- up the Weirs' lane, onto the porch, in at the front door, into the
  parlour and the kitchen and out the back; up the stair (and its keys
  held, at all three speeds) into each room upstairs, the storeroom
  through the sewing room;
- up the bank into the barn, round the threshing floor and the stalls;
- from the yard into the machine shed and past the lawn tractor to the
  bench; and along the front of the bays to the fuel tank;
- up the lane from the fuel stop's lot to the substation, in at its gate
  (opened first), across the stone, in at the control house's door and
  up to its desk; and round the inside of the fence;
- down the spur to the treatment plant, through its gate (opened first)
  and into the control building; up the stair and along the aeration
  tank's catwalk, out the clarifier's bridge, and onto the sand filter;
- along the paths to the well house (and in its door) and to the water
  tank.

**`zfight.js`** lists faces in a box of the world that lie in one plane and
overlap, which the depth buffer cannot sort and draws as flicker. It loads
the page with `?zdebug`, which keeps every baked piece's final matrix. Pairs
closer than `near` metres are reported by bucket, with the normal and where
they are. Faces turned into a wall still show up, so read the normals.
A merged mesh (a vehicle, say) counts as one piece, so faces fighting inside
one are not seen by it; check those part by part, from `vehicleParts()`.
It takes a list of boxes as well, each with a `name`, to sweep several
places in one load. For rooms below ground, give a box `buried` and `floor`
(the heights under which faces count as buried, and as resting on the
floor) so that they are checked.

**`signaudit.js`** wraps the canvas's `fillText` before the world builds,
measures every piece of lettering as it is drawn, and lists any that comes
within 3% of its canvas's edge (or runs off it), with the line that drew
it. It then plays a few seconds in the lobby, the arcade and by the
dartboard, to catch what is drawn at run time too.

The `window.REST` handle exposes the world for scripting. For example:
- `REST.go(x,z,yaw)` and `REST.hour(h)`;
- `REST.season(true)` for autumn;
- `REST.stepTraffic(dt,n)`, along with the traffic, cars, doors, colliders
  and forest.

The new systems are globals too: `WEATHER.set("storm")`, `GRID.trip()`,
`CRASH.start()`, `MOON.phaseAt`, `TRAILCAM.photos`, `VEND.openAt(...)`,
`GFX` and `applyGraphics()`, `TROOPER`, `RESTROOMS` (each stall's `mess`),
`CUST` (the custodian: `mode`, `step`, the queue `q`), `GARAGE_RT` (doors,
lights, radio station, cart, mower, blower), `CUST_MOW` and `CUST_LOG`,
`CUST_STATS` (the walk watchdog's re-plans and set-downs), `WALKIN` and
`TRAILER_RT` (the open trailer: `target` 1 to open it), `HANGOUT` (`tvOn`),
`VENDHUT_RT` (`brew`, `pour`, `mugUnder`) and `SLIPPERS.p` (the trucker:
`state`, `nextM`, the hours after six in the evening of his next trip),
`TRUCKERS` (whose rig is whose, and the stalls held beside them), `DARTS`
(`start()`, `game`), `ARCADE`, `HOCKEY`, `HOOPS`, `RAIDERS` (`start()`), `WEAR`
(the leaves), `EDIN_PLACES` (the farm's floors, the cows), `EDIN` (the interchange: its ramps, bridge
and fields), `CROSSOVERS`, `WWTP`, `CREEK` and `PLANT_RT` (the clarifier's
arm, the alarm: set `alarmT` to a number of seconds to sound it).
