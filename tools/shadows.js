/* REST AREA · tools/shadows.js
   Lists every local name that hides a global of the same name.
   The scripts in js/ share one global scope, and a file's own closure can
   declare a name that a file before it made global. Inside that closure the
   global is then out of reach, and code written against the global quietly
   uses the local instead: zombie mode's ambient sound was once called `amb`,
   which hid 03's ambient light, and the gloom's first frame threw on it.
     node tools/shadows.js [file ...]      (the js/ files changed since the last commit when none given;
                                           ALL=1 for every file)
   It reads declarations by pattern, not by parsing, so it lists a few that
   are harmless (a loop's `x`); names of three letters or more that the file
   also uses as the global's own kind of thing are the ones to look at. The
   known, meant ones are in OK below. Exit code 1 if anything new is found. */
const fs=require("fs"), path=require("path");
const ROOT=path.resolve(__dirname, "..");
const order=[...fs.readFileSync(path.join(ROOT, "index.html"), "utf8").matchAll(/<script src="(js\/[^"]+)"/g)].map(m=>m[1]);
// ("file:name" pairs that are meant: zombie mode's own HUD and its helpers, each used only inside its closure)
const OK=new Set(["js/21-zombies.js:pick","js/21-zombies.js:look","js/21-zombies.js:blocked","js/21-zombies.js:view","js/21-zombies.js:key",
                  "js/21-zombies.js:hud","js/21-zombies.js:updateHUD","js/21-zombies.js:dom",
                  // (and places' own helpers of the same name, used only in their own file: a material, a floor's height, the board's cream, a rail)
                  "js/14mh-books.js:mat","js/14mi-apts.js:floorAt","js/14mi-apts.js:key","js/14mj-trail.js:CREAM","js/14mj-trail.js:tube"]);
const globals=new Map();                                  // name -> file that made it global
const declRe=/\b(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/g;
const topRe=/^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/;
const strip=(s)=>s.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, m=>m.replace(/[^\n]/g, " "));
let want=process.argv.slice(2).map(f=>path.normalize(f));
if(!want.length && !process.env.ALL){ try{ want=require("child_process").execSync("git diff --name-only HEAD -- js", {cwd:ROOT}).toString().split("\n").filter(Boolean).map(f=>path.normalize(f)); }catch(e){} 
  console.log("checking "+(want.length ? want.join(", ") : "nothing changed since the last commit (ALL=1 for every file)")); if(!want.length){ process.exit(0); } }
let found=0;
for(const rel of order){
  const src=strip(fs.readFileSync(path.join(ROOT, rel), "utf8")), lines=src.split("\n");
  const own=[];
  lines.forEach((l, i)=>{ const m=l.match(topRe); if(m) own.push(m[1]);
    // (a top-level `const A=..., B=...` makes B global too)
    if(m && /^(const|let|var)\s/.test(l)) for(const q of l.matchAll(/,\s*([A-Za-z_$][\w$]*)\s*=/g)) if(!/[({\[]/.test(l.slice(0, q.index))) own.push(q[1]); });
  if(!want.length || want.includes(path.normalize(rel))){
    lines.forEach((l, i)=>{ if(topRe.test(l)) return;
      const names=[]; for(const m of l.matchAll(declRe)) names.push(m[1]);
      // (and the further names in a `let a=..., b=...` on the same line)
      for(const m of l.matchAll(/\b(?:const|let|var)\s+[^;]*?/g)){ const seg=l.slice(m.index).split(";")[0];
        let depth=0, cur="", parts=[]; for(const ch of seg){ if("([{".includes(ch)) depth++; else if(")]}".includes(ch)) depth--; if(ch==="," && depth===0){ parts.push(cur); cur=""; } else cur+=ch; } parts.push(cur);
        for(const p of parts.slice(1)){ const q=p.match(/^\s*([A-Za-z_$][\w$]*)\s*=/); if(q) names.push(q[1]); } }
      for(const n of new Set(names)){ const g=globals.get(n); if(!g || n.length<3 || OK.has(rel+":"+n)) continue;
        // (only when this file also uses the name as the global: a property read like amb.intensity outside the closure it was made in is the tell)
        console.log(rel+":"+(i+1)+"  `"+n+"` hides "+g+"'s global"); found++; } });
  }
  for(const n of own) if(!globals.has(n)) globals.set(n, rel);
}
console.log(found ? found+" local names hide a global" : "no local name hides a global");
process.exitCode=found ? 1 : 0;
