"use strict";
/* REST AREA · 02-textures.js
   every canvas-drawn texture in the world, and the sign-face helpers
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   2 · TEXTURE FACTORIES  (base fill -> noise dots -> strokes and features)
   Nothing here is a photograph. Each map is drawn in three passes, flagged
   sRGB, set to repeat; colour mostly comes from the vertex, which can only
   darken what is under it, so the maps are drawn light where they will be
   tinted and in their own colour where they will not.
   ---------------------------------------------------------------------- */
function noiseDots(x,w,h,n,colors){
  for(let i=0;i<n;i++){
    x.fillStyle=colors[(Math.random()*colors.length)|0];
    x.fillRect(Math.random()*w, Math.random()*h, 1+Math.random()*2, 1+Math.random()*2);
  }
}
const TEX={};
const _tex=(c,rx,ry)=>rep(setSRGB(new T.CanvasTexture(c)), rx||1, ry||1);
// a seeded rng per texture, so a map is the same map every load
const _trng=seed=>{ let sd=seed; return ()=>{ sd=(sd*1103515245+12345)%2147483648; return sd/2147483648; }; };

function asphaltTex(seed, cracks, base){
  /* Pennsylvania asphalt is grey, not black: salted every winter, the
     binder bleaches and the limestone aggregate shows. Patches, sealed
     cracks, the odd oil spot — nothing bigger than a third of the tile,
     or the period shows; bigger wear is laid as world decals. */
  const c=cvs(512,512), x=c.getContext("2d"), r=_trng(seed);
  x.fillStyle=base; x.fillRect(0,0,512,512);
  for(let i=0;i<40;i++){
    x.fillStyle="rgba(150,150,146,"+(0.015+r()*0.03).toFixed(3)+")";
    x.beginPath(); x.arc(r()*512, r()*512, 14+r()*34, 0, 7); x.fill();
  }
  noiseDots(x,512,512,26000,["rgba(255,255,255,0.06)","rgba(0,0,0,0.22)",
                             "rgba(176,172,164,0.08)","rgba(110,110,108,0.06)"]);
  for(let i=0;i<340;i++){                       // limestone chips showing through
    const px=r()*512, py=r()*512, rad=0.8+r()*2.0, g=(140+r()*70)|0;
    x.fillStyle="rgba("+g+","+(g-2)+","+(g-8)+",0.34)";
    x.beginPath(); x.arc(px,py,rad,0,7); x.fill();
  }
  for(let i=0;i<cracks;i++){                    // long cracks, most of them sealed
    const sealed=r()<0.6;
    let px=r()*512, py=r()*512;
    x.strokeStyle= sealed ? "rgba(26,26,26,0.32)" : "rgba(18,18,18,0.16)";
    x.lineWidth= sealed ? 2.0+r()*2.2 : 0.6+r()*0.7;
    x.lineCap="round"; x.beginPath(); x.moveTo(px,py);
    for(let k=0;k<7;k++){ px+=(r()-0.5)*90; py+=(r()-0.5)*90; x.lineTo(px,py); }
    x.stroke();
  }
  for(let i=0;i<10;i++){
    const px=r()*512, py=r()*512, rad=7+r()*20;
    const g=x.createRadialGradient(px,py,0,px,py,rad);
    g.addColorStop(0,"rgba(14,14,14,"+(0.22+r()*0.24).toFixed(2)+")");
    g.addColorStop(1,"rgba(14,14,14,0)");
    x.fillStyle=g; x.beginPath(); x.arc(px,py,rad,0,7); x.fill();
  }
  return _tex(c);
}
TEX.asphalt=asphaltTex(20997, 7, "#56575a");     // the lots and the ramps
TEX.road=asphaltTex(30011, 2, "#4f5052");        // the interstate: newer, smoother

TEX.concrete=(function(){                     // walks, the plaza, curbs, pads
  const c=cvs(256,256), x=c.getContext("2d"), r=_trng(4411);
  x.fillStyle="#8d8b85"; x.fillRect(0,0,256,256);
  for(let i=0;i<5200;i++){
    const g=(110+r()*70)|0;
    x.fillStyle="rgba("+g+","+(g-2)+","+(g-6)+","+(0.10+r()*0.26).toFixed(2)+")";
    x.beginPath(); x.arc(r()*256, r()*256, 0.5+r()*1.7, 0, 7); x.fill();
  }
  for(let i=0;i<20;i++){                        // broom finish, across the walk
    x.strokeStyle="rgba(255,255,255,"+(0.02+r()*0.04).toFixed(3)+")";
    x.lineWidth=1+r()*3; x.beginPath();
    const y0=r()*256; x.moveTo(0,y0); x.lineTo(256,y0+(r()-0.5)*8); x.stroke();
  }
  // one tooled joint per tile edge, so a 1.5 m tile is a 1.5 m slab
  x.fillStyle="rgba(70,68,64,0.50)"; x.fillRect(0,0,2.4,256); x.fillRect(0,0,256,2.4);
  x.fillStyle="rgba(255,255,255,0.10)"; x.fillRect(2.4,0,1.2,256); x.fillRect(0,2.4,256,1.2);
  for(let i=0;i<12;i++){
    x.fillStyle="rgba("+(70+r()*30|0)+","+(70+r()*30|0)+","+(66+r()*28|0)+","+(0.04+r()*0.10).toFixed(3)+")";
    x.beginPath(); x.ellipse(r()*256, r()*256, 5+r()*26, 4+r()*16, r()*3, 0, 7); x.fill();
  }
  noiseDots(x,256,256,1800,["rgba(255,255,255,0.08)","rgba(50,50,48,0.10)"]);
  return _tex(c);
})();

TEX.brick=(function(){                        // the pavilion: red PA brick, running bond
  const c=cvs(256,256), x=c.getContext("2d"), r=_trng(7717);
  x.fillStyle="#a9a49a"; x.fillRect(0,0,256,256);            // light grey mortar
  const bw=64, bh=21.33;                                     // 8 x 2 2/3 inch, at 0.83 m/tile
  for(let row=0;row<12;row++){
    const off=(row%2)?bw/2:0;
    for(let i=-1;i<5;i++){
      const px=i*bw+off+2, py=row*bh+2, t=r(), u=r();
      const R=(150+t*48)|0, G=(62+t*20+u*10)|0, B=(46+t*14)|0;
      x.fillStyle="rgb("+R+","+G+","+B+")";
      x.fillRect(px,py,bw-4,bh-4);
      // flashed ends and the odd dark header, the way a kiln leaves them
      if(u<0.18){ x.fillStyle="rgba(60,22,16,0.28)"; x.fillRect(px,py,bw-4,bh-4); }
      x.fillStyle="rgba(255,225,200,0.08)"; x.fillRect(px,py,bw-4,2);
      x.fillStyle="rgba(30,10,8,0.18)";    x.fillRect(px,py+bh-6,bw-4,2);
    }
  }
  noiseDots(x,256,256,3400,["rgba(0,0,0,0.12)","rgba(255,230,210,0.07)","rgba(90,30,20,0.14)"]);
  return _tex(c);
})();

TEX.siding=(function(){                       // cream vinyl lap siding in the gables
  const c=cvs(128,128), x=c.getContext("2d");
  x.fillStyle="#e2dcc8"; x.fillRect(0,0,128,128);
  for(let y=0;y<128;y+=16){                    // eight courses a tile
    const g=x.createLinearGradient(0,y,0,y+16);
    g.addColorStop(0,"rgba(0,0,0,0.20)"); g.addColorStop(0.18,"rgba(0,0,0,0.02)");
    g.addColorStop(0.85,"rgba(255,255,255,0.06)"); g.addColorStop(1,"rgba(0,0,0,0.10)");
    x.fillStyle=g; x.fillRect(0,y,128,16);
  }
  for(let i=0;i<60;i++){                       // the faint woodgrain they emboss in it
    x.strokeStyle="rgba(120,110,90,0.05)"; x.lineWidth=0.8;
    const y0=Math.random()*128; x.beginPath(); x.moveTo(0,y0); x.lineTo(128,y0+(Math.random()-0.5)*3); x.stroke();
  }
  noiseDots(x,128,128,500,["rgba(0,0,0,0.04)","rgba(255,255,255,0.05)"]);
  return _tex(c);
})();

TEX.shingle=(function(){                      // three-tab asphalt shingles, dark brown
  const c=cvs(256,256), x=c.getContext("2d"), r=_trng(3301);
  x.fillStyle="#3b2f29"; x.fillRect(0,0,256,256);
  for(let row=0;row<8;row++){
    const y=row*32, off=(row%2)*21;
    for(let i=-1;i<8;i++){
      const t=r();
      x.fillStyle="rgb("+(54+t*18|0)+","+(43+t*13|0)+","+(37+t*11|0)+")";
      x.fillRect(i*42.6+off+1, y+1, 40.6, 30);
    }
    x.fillStyle="rgba(0,0,0,0.42)"; x.fillRect(0,y+28,256,4);          // the shadow line
    for(let i=-1;i<8;i++){ x.fillStyle="rgba(0,0,0,0.34)"; x.fillRect(i*42.6+off, y, 1.6, 30); }
  }
  noiseDots(x,256,256,9000,["rgba(255,240,220,0.07)","rgba(0,0,0,0.18)","rgba(120,96,70,0.10)"]);
  for(let i=0;i<14;i++){                       // algae streaks, the north slope's tell
    x.fillStyle="rgba(20,22,16,"+(0.05+r()*0.08).toFixed(3)+")";
    x.fillRect(r()*256, 0, 3+r()*8, 256);
  }
  return _tex(c);
})();

TEX.quarry=(function(){                       // the lobby floor: 8-inch red quarry tile
  const c=cvs(256,256), x=c.getContext("2d"), r=_trng(5150);
  x.fillStyle="#6f5a4c"; x.fillRect(0,0,256,256);            // grout, gone grey-brown
  for(let j=0;j<4;j++) for(let i=0;i<4;i++){
    const t=r();
    x.fillStyle="rgb("+(176+t*24|0)+","+(92+t*16|0)+","+(56+t*12|0)+")";
    x.fillRect(i*64+2.5, j*64+2.5, 59, 59);
    x.fillStyle="rgba(255,236,210,0.08)"; x.fillRect(i*64+2.5, j*64+2.5, 59, 3);
    for(let k=0;k<3;k++){                      // kiln flashing on the face
      x.fillStyle="rgba(120,50,26,"+(0.05+r()*0.10).toFixed(3)+")";
      x.beginPath(); x.ellipse(i*64+8+r()*48, j*64+8+r()*48, 6+r()*18, 4+r()*12, r()*3, 0, 7); x.fill();
    }
  }
  noiseDots(x,256,256,4200,["rgba(0,0,0,0.10)","rgba(255,230,200,0.06)"]);
  for(let i=0;i<6;i++){                        // the traffic path, a little dull
    x.fillStyle="rgba(90,70,60,0.06)";
    x.beginPath(); x.ellipse(r()*256, r()*256, 40+r()*60, 20+r()*30, r()*3, 0, 7); x.fill();
  }
  return _tex(c);
})();

TEX.ytile=(function(){                        // restroom walls: butter-yellow glazed tile
  const c=cvs(256,256), x=c.getContext("2d"), r=_trng(616);
  x.fillStyle="#c9c3b2"; x.fillRect(0,0,256,256);            // pale grout
  const n=8, s=256/n;                                          // 4-1/4 inch at 0.86 m a tile
  for(let j=0;j<n;j++) for(let i=0;i<n;i++){
    const t=r();
    x.fillStyle="rgb("+(236+t*8|0)+","+(222+t*8|0)+","+(160+t*14|0)+")";
    x.fillRect(i*s+1.6, j*s+1.6, s-3.2, s-3.2);
    const g=x.createLinearGradient(i*s, j*s, i*s+s, j*s+s);    // the glaze catches light
    g.addColorStop(0,"rgba(255,255,255,0.18)"); g.addColorStop(0.5,"rgba(255,255,255,0)");
    g.addColorStop(1,"rgba(120,100,40,0.10)");
    x.fillStyle=g; x.fillRect(i*s+1.6, j*s+1.6, s-3.2, s-3.2);
    if(r()<0.06){ x.strokeStyle="rgba(110,96,60,0.35)"; x.lineWidth=0.7;   // a hairline craze
      x.beginPath(); x.moveTo(i*s+3+r()*20, j*s+3); x.lineTo(i*s+r()*s, j*s+s-3); x.stroke(); }
  }
  return _tex(c);
})();

TEX.mosaic=(function(){                       // restroom floor: one-inch mosaic, speckled
  const c=cvs(256,256), x=c.getContext("2d"), r=_trng(2718);
  x.fillStyle="#6e6658"; x.fillRect(0,0,256,256);
  const n=24, s=256/n;
  const pal=["#b8ad97","#aea38c","#c4bba6","#9f9480","#8c826f","#cfc6b2","#a89a7c"];
  for(let j=0;j<n;j++) for(let i=0;i<n;i++){
    x.fillStyle=pal[(r()*pal.length)|0];
    x.fillRect(i*s+0.9, j*s+0.9, s-1.8, s-1.8);
  }
  noiseDots(x,256,256,2600,["rgba(0,0,0,0.10)","rgba(255,255,255,0.06)"]);
  return _tex(c);
})();

TEX.block=(function(){                        // painted concrete block, above the tile
  const c=cvs(256,256), x=c.getContext("2d"), r=_trng(9090);
  x.fillStyle="#c7c8c4"; x.fillRect(0,0,256,256);
  const bw=128, bh=64;
  for(let row=0;row<4;row++){
    const off=(row%2)?bw/2:0;
    x.fillStyle="rgba(80,82,80,0.30)"; x.fillRect(0,row*bh,256,2.5);
    for(let i=-1;i<3;i++) x.fillRect(i*bw+off,row*bh,2.5,bh);
  }
  for(let i=0;i<1600;i++){                     // the pores the paint never filled
    x.fillStyle="rgba(60,60,58,"+(0.05+r()*0.14).toFixed(2)+")";
    x.beginPath(); x.arc(r()*256, r()*256, 0.5+r()*1.3, 0, 7); x.fill();
  }
  noiseDots(x,256,256,1200,["rgba(255,255,255,0.08)","rgba(0,0,0,0.05)"]);
  return _tex(c);
})();

TEX.drywall=(function(){                      // painted plaster: the lobby's upper walls
  const c=cvs(128,128), x=c.getContext("2d");
  x.fillStyle="#e6e1d2"; x.fillRect(0,0,128,128);
  noiseDots(x,128,128,2400,["rgba(0,0,0,0.035)","rgba(255,255,255,0.06)"]);
  return _tex(c);
})();

TEX.ground=(function(){                       // the terrain's own grain: grass and litter
  /* One map has to serve a mown lawn, a road verge and a forest floor, so it
     carries luminance and nothing else: short blades for the lawn, leaf
     shapes for the litter, light and dark. The vertex colour says which. */
  const c=cvs(512,512), x=c.getContext("2d"), r=_trng(31337);
  x.fillStyle="#bdbdb4"; x.fillRect(0,0,512,512);
  for(let i=0;i<70;i++){                       // a soft mottle at a few scales (soft: a hard one shows the tile)
    const px=r()*512, py=r()*512, rad=16+r()*60;
    x.fillStyle="rgba("+(r()<0.5?"255,255,255":"40,40,30")+","+(0.015+r()*0.03).toFixed(3)+")";
    x.beginPath(); x.arc(px,py,rad,0,7); x.fill();
  }
  for(let i=0;i<22000;i++){                    // blades
    const px=r()*512, py=r()*512, L=3+r()*7, a=-1.57+(r()-0.5)*0.9;
    const v=r();
    x.strokeStyle= v<0.5 ? "rgba(255,255,240,"+(0.10+r()*0.18).toFixed(2)+")"
                         : "rgba(30,34,20,"+(0.10+r()*0.18).toFixed(2)+")";
    x.lineWidth=0.8+r()*0.8;
    x.beginPath(); x.moveTo(px,py); x.lineTo(px+Math.cos(a)*L, py+Math.sin(a)*L); x.stroke();
  }
  for(let i=0;i<420;i++){                      // leaves and twigs, mostly dark
    x.save(); x.translate(r()*512, r()*512); x.rotate(r()*6.28);
    x.fillStyle="rgba("+(r()<0.3?"255,240,210":"50,40,28")+","+(0.08+r()*0.14).toFixed(2)+")";
    x.beginPath(); x.ellipse(0,0, 2+r()*4, 1+r()*2, 0, 0, 7); x.fill(); x.restore();
  }
  for(let i=0;i<120;i++){                      // clover and the odd dandelion
    x.fillStyle= r()<0.7 ? "rgba(255,255,255,0.22)" : "rgba(255,240,120,0.35)";
    x.beginPath(); x.arc(r()*512, r()*512, 0.9+r()*1.2, 0, 7); x.fill();
  }
  return _tex(c);
})();

TEX.lawn=(function(){                         // a mown lawn close to: blades, crowded, each its own shade
  /* Like the ground's map it is light and shade, with only a little hue: the
     vertex colour (04) is the green, and this is its grain. 04's shader lays
     it at 1.6 m and again at 7.3 m over itself, so neither repeat shows.
     Every blade near an edge is drawn again across it, so the tile has no seam. */
  const N=1024, c=cvs(N,N), x=c.getContext("2d"), r=_trng(4242);
  x.fillStyle="rgb(176,180,166)"; x.fillRect(0,0,N,N);
  const wrap=(px,py,m,f)=>{ for(const ox of [0,-N,N]) for(const oy of [0,-N,N]){
    if((ox && Math.abs(px+ox-N/2)>N/2+m) || (oy && Math.abs(py+oy-N/2)>N/2+m)) continue; f(px+ox, py+oy); } };
  for(let i=0;i<90;i++){                       // soft clumping, a little lighter and darker
    const px=r()*N, py=r()*N, rad=30+r()*110, a=(0.025+r()*0.04).toFixed(3), lt=r()<0.5;
    wrap(px,py,rad,(qx,qy)=>{ const g=x.createRadialGradient(qx,qy,0,qx,qy,rad);
      g.addColorStop(0, lt?"rgba(236,240,200,"+a+")":"rgba(40,48,26,"+a+")"); g.addColorStop(1,"rgba(0,0,0,0)");
      x.fillStyle=g; x.fillRect(qx-rad,qy-rad,rad*2,rad*2); }); }
  for(let i=0;i<5200;i++){                     // the shade down among the stems
    const px=r()*N, py=r()*N, s=1+r()*2.2;
    wrap(px,py,4,(qx,qy)=>{ x.fillStyle="rgba(34,40,22,"+(0.25+r()*0.3).toFixed(2)+")"; x.fillRect(qx,qy,s,s*1.6); }); }
  // the blades: darker ones first, lit tips last, each a thin tapered curve leaning its own way
  for(let pass=0;pass<3;pass++) for(let i=0;i<17000;i++){
    const px=r()*N, py=r()*N, L=7+r()*(pass===2?12:18), a=-Math.PI/2+(r()-0.5)*1.5, bend=(r()-0.5)*0.9, w=0.7+r()*1.2;
    const l=pass===0 ? 0.48+r()*0.22 : pass===1 ? 0.70+r()*0.22 : 0.88+r()*0.20, h=r();
    const R=Math.min(255,l*(h<0.3?250:236)|0), G=Math.min(255,l*246|0), Bc=Math.min(255,l*(h>0.7?232:206)|0);
    const tx=Math.cos(a)*L, ty=Math.sin(a)*L, cx=Math.cos(a+bend)*L*0.55, cy=Math.sin(a+bend)*L*0.55, nx=-Math.sin(a)*w, ny=Math.cos(a)*w;
    wrap(px,py,L+2,(qx,qy)=>{ x.fillStyle="rgba("+R+","+G+","+Bc+","+(0.55+r()*0.4).toFixed(2)+")";
      x.beginPath(); x.moveTo(qx-nx, qy-ny); x.quadraticCurveTo(qx+cx, qy+cy, qx+tx, qy+ty); x.quadraticCurveTo(qx+cx+nx*0.4, qy+cy+ny*0.4, qx+nx, qy+ny); x.closePath(); x.fill(); }); }
  for(let i=0;i<260;i++){                      // clover, three leaves to a stem, and the odd dandelion leaf
    const px=r()*N, py=r()*N, s=2.4+r()*2.4, rot=r()*6.28;
    wrap(px,py,s*3,(qx,qy)=>{ x.save(); x.translate(qx,qy); x.rotate(rot); x.fillStyle="rgba(214,230,200,0.55)";
      for(let k=0;k<3;k++){ x.rotate(2.094); x.beginPath(); x.ellipse(0,-s,s*0.75,s,0,0,7); x.fill(); } x.restore(); }); }
  return _tex(c);
})();

TEX.riverRock=(function(){                    // the beds round the pavilion
  const c=cvs(256,256), x=c.getContext("2d"), r=_trng(808);
  x.fillStyle="#5b5146"; x.fillRect(0,0,256,256);
  const pal=[[148,132,114],[120,108,96],[168,150,128],[104,92,82],[136,120,96],[160,142,120],[96,86,78]];
  for(let i=0;i<900;i++){
    const p=pal[(r()*pal.length)|0], rx=3+r()*8, ry=rx*(0.55+r()*0.4), px=r()*256, py=r()*256, a=r()*3;
    x.fillStyle="rgba(30,24,20,0.45)";
    x.beginPath(); x.ellipse(px+1.2, py+1.6, rx, ry, a, 0, 7); x.fill();
    x.fillStyle="rgb("+p[0]+","+p[1]+","+p[2]+")";
    x.beginPath(); x.ellipse(px, py, rx, ry, a, 0, 7); x.fill();
    x.fillStyle="rgba(255,250,240,0.16)";
    x.beginPath(); x.ellipse(px-rx*0.25, py-ry*0.3, rx*0.45, ry*0.35, a, 0, 7); x.fill();
  }
  return _tex(c);
})();

TEX.crushed=(function(){                      // the substation yard: angular grey stone
  const c=cvs(256,256), x=c.getContext("2d"), r=_trng(1212);
  x.fillStyle="#6c6a64"; x.fillRect(0,0,256,256);
  for(let i=0;i<2600;i++){
    const g=(90+r()*90)|0, px=r()*256, py=r()*256, s=1.5+r()*4;
    x.fillStyle="rgb("+g+","+(g-2)+","+(g-6)+")";
    x.beginPath(); x.moveTo(px,py); x.lineTo(px+s,py+r()*s); x.lineTo(px+r()*s,py+s); x.closePath(); x.fill();
  }
  noiseDots(x,256,256,3000,["rgba(0,0,0,0.25)","rgba(255,255,255,0.08)"]);
  return _tex(c);
})();

TEX.mulch=(function(){                        // shredded bark under the shrubs
  const c=cvs(256,256), x=c.getContext("2d"), r=_trng(4321);
  x.fillStyle="#4a3426"; x.fillRect(0,0,256,256);
  for(let i=0;i<2200;i++){
    x.save(); x.translate(r()*256, r()*256); x.rotate(r()*6.28);
    const t=r(); x.fillStyle="rgba("+(90+t*60|0)+","+(60+t*40|0)+","+(40+t*24|0)+","+(0.4+r()*0.5).toFixed(2)+")";
    x.fillRect(-4-r()*4, -0.8, 8+r()*8, 1.6+r()*1.4); x.restore();
  }
  return _tex(c);
})();

TEX.wood=(function(){                         // picnic tables: stained pine, weathered
  const c=cvs(256,256), x=c.getContext("2d"), r=_trng(6060);
  x.fillStyle="#b58a62"; x.fillRect(0,0,256,256);
  for(let i=0;i<120;i++){
    x.strokeStyle="rgba("+(r()<0.5?"80,52,30":"220,190,150")+","+(0.08+r()*0.18).toFixed(2)+")";
    x.lineWidth=0.6+r()*1.8;
    const y0=r()*256; x.beginPath(); x.moveTo(0,y0);
    x.bezierCurveTo(80,y0+(r()-0.5)*6, 170,y0+(r()-0.5)*6, 256,y0+(r()-0.5)*4); x.stroke();
  }
  for(let i=0;i<6;i++){                        // knots
    const px=r()*256, py=r()*256;
    x.fillStyle="rgba(70,42,24,0.55)"; x.beginPath(); x.ellipse(px,py,4+r()*4,2+r()*2,0,0,7); x.fill();
  }
  noiseDots(x,256,256,2000,["rgba(0,0,0,0.08)","rgba(255,255,255,0.06)"]);
  return _tex(c);
})();

TEX.enamel=(function(){                       // eggshell paint on anything flat
  const c=cvs(64,64), x=c.getContext("2d");
  x.fillStyle="#f2f0ea"; x.fillRect(0,0,64,64);
  noiseDots(x,64,64,500,["rgba(0,0,0,0.04)","rgba(255,255,255,0.05)"]);
  return _tex(c);
})();
TEX.galv=(function(){                         // galvanised, with its spangle
  const c=cvs(128,128), x=c.getContext("2d");
  x.fillStyle="#d4d8da"; x.fillRect(0,0,128,128);
  for(let i=0;i<60;i++){
    x.fillStyle="rgba("+(Math.random()<0.5?"255,255,255":"90,96,100")+","+(0.05+Math.random()*0.10).toFixed(3)+")";
    const px=Math.random()*128, py=Math.random()*128, s=4+Math.random()*12;
    x.beginPath(); x.moveTo(px,py); x.lineTo(px+s,py+Math.random()*s*0.6);
    x.lineTo(px+Math.random()*s*0.4,py+s); x.closePath(); x.fill();
  }
  noiseDots(x,128,128,900,["rgba(0,0,0,0.06)","rgba(255,255,255,0.08)"]);
  return _tex(c);
})();
TEX.brushed=(function(){                      // stainless: dryers, sinks, kick plates
  const c=cvs(128,128), x=c.getContext("2d");
  x.fillStyle="#d0d2d2"; x.fillRect(0,0,128,128);
  for(let i=0;i<400;i++){
    x.strokeStyle="rgba("+(Math.random()<0.5?"255,255,255":"70,74,76")+","+(0.04+Math.random()*0.08).toFixed(3)+")";
    x.lineWidth=0.6; const y0=Math.random()*128;
    x.beginPath(); x.moveTo(0,y0); x.lineTo(128,y0); x.stroke();
  }
  return _tex(c);
})();
TEX.rubber=(function(){                       // tyres, mats, the bumpers on the dock
  const c=cvs(64,64), x=c.getContext("2d");
  x.fillStyle="#2a2a2a"; x.fillRect(0,0,64,64);
  noiseDots(x,64,64,700,["rgba(255,255,255,0.05)","rgba(0,0,0,0.25)"]);
  return _tex(c);
})();
TEX.chain=(function(){                        // chain-link, alpha-cut
  const c=cvs(64,64), x=c.getContext("2d");
  x.clearRect(0,0,64,64);
  x.strokeStyle="rgba(170,176,178,0.95)"; x.lineWidth=1.8; x.lineCap="round";
  for(let i=-64;i<128;i+=16){
    x.beginPath(); x.moveTo(i,0); x.lineTo(i+64,64); x.stroke();
    x.beginPath(); x.moveTo(i,64); x.lineTo(i+64,0); x.stroke();
  }
  return _tex(c);
})();
TEX.rock=(function(){                         // boulders: grey sandstone and glacial erratics
  const c=cvs(256,256), x=c.getContext("2d"), r=_trng(2468);
  x.fillStyle="#8e8a80"; x.fillRect(0,0,256,256);
  for(let i=0;i<60;i++){
    x.fillStyle="rgba("+(r()<0.5?"255,250,240":"40,38,34")+","+(0.04+r()*0.08).toFixed(3)+")";
    x.beginPath(); x.ellipse(r()*256, r()*256, 10+r()*40, 6+r()*20, r()*3, 0, 7); x.fill();
  }
  noiseDots(x,256,256,7000,["rgba(0,0,0,0.16)","rgba(255,255,255,0.10)","rgba(90,80,60,0.10)"]);
  for(let i=0;i<30;i++){                       // lichen
    x.fillStyle="rgba("+(r()<0.6?"170,180,140":"200,190,120")+","+(0.10+r()*0.16).toFixed(3)+")";
    x.beginPath(); x.arc(r()*256, r()*256, 2+r()*8, 0, 7); x.fill();
  }
  return _tex(c);
})();
TEX.cork=(function(){                         // the bulletin board
  const c=cvs(128,128), x=c.getContext("2d");
  x.fillStyle="#a77d52"; x.fillRect(0,0,128,128);
  noiseDots(x,128,128,5000,["rgba(60,36,18,0.30)","rgba(230,200,150,0.25)","rgba(120,80,40,0.30)"]);
  return _tex(c);
})();
TEX.soot=(function(){                         // a soft blob: wear on the lots, shade under things
  const c=cvs(128,128), x=c.getContext("2d");
  const g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,"rgba(255,255,255,0.85)"); g.addColorStop(0.5,"rgba(255,255,255,0.38)");
  g.addColorStop(1,"rgba(255,255,255,0)");
  x.fillStyle=g; x.fillRect(0,0,128,128);
  return setSRGB(new T.CanvasTexture(c));
})();
TEX.haze=(function(){                         // a soft vertical fade, for light shafts
  const c=cvs(32,128), x=c.getContext("2d");
  const g=x.createLinearGradient(0,0,0,128);
  g.addColorStop(0,"rgba(255,255,255,0)"); g.addColorStop(0.3,"rgba(255,255,255,0.8)");
  g.addColorStop(1,"rgba(255,255,255,0)");
  x.fillStyle=g; x.fillRect(0,0,32,128);
  return setSRGB(new T.CanvasTexture(c));
})();

/* ---- printed faces -------------------------------------------------
   Text fitted to a board, a canvas turned into a sign texture, and the
   panel that carries one. They live here because half the world raises a
   sign long before anything that could be called "the signage" loads.
   Every painted word keeps its padding: never within 8% of the board's
   edge, never taller than about three fifths of it.                     */
function _fitBox(x, maxW, size){
  const c=x.canvas;
  return [Math.min(maxW, c.width*0.84), Math.min(size, c.height*0.62)];
}
function fitText(x, str, maxW, size, cx, cy, weight, family){
  x.textAlign="center"; x.textBaseline="middle";
  [maxW, size]=_fitBox(x, maxW, size);
  let s=size;
  do{ x.font=(weight||"500")+" "+s+"px "+(family||"Oswald, 'Arial Narrow', sans-serif"); s-=1; }
  while(x.measureText(str).width>maxW && s>6);
  x.fillText(str, cx, cy);
  return s+1;
}
// highway lettering: a wide, plain face, the way a guide sign is set
function fitHwy(x, str, maxW, size, cx, cy){
  return fitText(x, str, maxW, size, cx, cy, "600", "'Arial', 'Helvetica Neue', Helvetica, sans-serif");
}
function signTex(w,h,draw){
  const c=cvs(w,h), x=c.getContext("2d");
  draw(x,w,h);
  return setSRGB(new T.CanvasTexture(c));
}
// A face is a plane a centimetre proud of its board, with polygonOffset so it
// wins the depth test at every range; lit = an unlit basic material.
function signPanel(w,h,tex,x,y,z,ry,lit,rx){
  const opts={map:tex, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4};
  const m=new T.Mesh(new T.PlaneGeometry(w,h),
    lit ? new T.MeshBasicMaterial(Object.assign({toneMapped:false}, opts))
        : new T.MeshStandardMaterial(Object.assign({roughness:0.62}, opts)));
  m.position.set(x,y,z); m.rotation.order="YXZ"; m.rotation.y=ry; if(rx) m.rotation.x=rx;
  m.receiveShadow=true;
  scene.add(m);
  return m;
}
// the round-cornered rectangle every sign blank is cut as
function rrect(x, X, Y, W, H, R){
  x.beginPath(); x.moveTo(X+R,Y); x.lineTo(X+W-R,Y); x.quadraticCurveTo(X+W,Y,X+W,Y+R);
  x.lineTo(X+W,Y+H-R); x.quadraticCurveTo(X+W,Y+H,X+W-R,Y+H); x.lineTo(X+R,Y+H);
  x.quadraticCurveTo(X,Y+H,X,Y+H-R); x.lineTo(X,Y+R); x.quadraticCurveTo(X,Y,X+R,Y); x.closePath();
}
// the international symbol of access, drawn into a box
function drawISA(x, cx, cy, s, col){
  x.save(); x.translate(cx,cy); x.scale(s/100,s/100);
  x.fillStyle=col; x.strokeStyle=col; x.lineCap="round"; x.lineJoin="round";
  x.beginPath(); x.arc(-4,-40,9,0,7); x.fill();
  x.lineWidth=11;
  x.beginPath(); x.moveTo(-6,-26); x.lineTo(-2,6); x.lineTo(24,6); x.lineTo(34,32); x.stroke();
  x.lineWidth=8; x.beginPath(); x.moveTo(-4,-12); x.lineTo(16,-12); x.stroke();
  x.lineWidth=7; x.beginPath(); x.arc(-4,20,24,-0.9,3.6); x.stroke();
  x.restore();
}
