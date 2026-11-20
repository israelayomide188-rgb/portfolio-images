import fs from 'node:fs';
const css5 = fs.readFileSync('fix5.css', 'utf8');
const js5 = fs.readFileSync('fix5.js', 'utf8');
const must = (ok, m) => { if (!ok) throw new Error('fix5 anchor missing: ' + m); };

/* ---- brace-aware filter that drops light-theme / toggle rules ---- */
function splitSel(s) { const o = []; let dep = 0, c = ''; for (const ch of s) { if (ch === '(' || ch === '[') dep++; if (ch === ')' || ch === ']') dep--; if (ch === ',' && dep === 0) { o.push(c); c = ''; } else c += ch; } o.push(c); return o; }
const bad = s => /\[data-theme|theme-toggle|html\.tx/.test(s);
function walk(str) {
  let out = '', pos = 0;
  while (pos < str.length) {
    const i = str.indexOf('{', pos);
    if (i < 0) { out += str.slice(pos); break; }
    let dep = 1, j = i + 1;
    while (j < str.length && dep) { if (str[j] === '{') dep++; else if (str[j] === '}') dep--; j++; }
    const pre = str.slice(pos, i).trim(), body = str.slice(i + 1, j - 1);
    pos = j;
    if (/^@(media|supports)/.test(pre)) { const b = walk(body); if (b.trim()) out += pre + '{' + b + '}'; }
    else if (pre.startsWith('@')) out += pre + '{' + body + '}';
    else { const keep = splitSel(pre).filter(p => !bad(p)); if (keep.length) out += keep.join(',') + '{' + body + '}'; }
  }
  return out;
}

const MARQ = ['WIX DESIGN', 'WIX STUDIO', 'WEBSITE STRATEGY', 'UX DESIGN', 'SEO', 'WEBSITE DEVELOPMENT'];
const marqSet = dup => MARQ.map(t => `<span${dup ? ' data-dup' : ''}>${t}</span><i${dup ? ' data-dup' : ''}></i>`).join('');
const marquee = `<div class="marq" role="group" aria-label="Services"><p class="sr">Wix design, Wix Studio, website strategy, UX design, SEO, website development.</p><div class="marq-t" aria-hidden="true">${marqSet(false)}${marqSet(true)}</div></div>\n\n`;

const IMG = '<img src="assets/israel-portrait.webp" width="1040" height="1125"';
const ALT = 'Portrait of Ojo Israel Ayomide, website strategist and designer, in a black suit with a hand resting at his chin';
const frame = (cls, eager, extra) => `<figure class="pf ${cls}"${extra}>
        <span class="pf-dot" aria-hidden="true"></span>
        <div class="pf-in"><div class="pf-ph">${IMG} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} alt="${ALT}"></div></div>`;

for (const f of ['index.html', 'insights.html']) {
  let h = fs.readFileSync(f, 'utf8');
  const isIdx = f === 'index.html';

  /* 1. dark only */
  const n0 = h.length;
  h = h.replace(/<script>try\{if\(localStorage\.getItem\("oi-theme"\)==="light"\)[^<]*<\/script>\s*/, '');
  h = h.replace(/\s*<button class="theme-toggle"[\s\S]*?<\/button>/, '');
  const a = h.indexOf('function cur(){'), tm = h.indexOf("classList.remove('tx')");
  must(a > 0 && tm > a, f + ' theme js');
  const e = h.indexOf('  });\n', tm) + 6;
  h = h.slice(0, a) + 'function start(){\n' + h.slice(e);
  const s0 = h.lastIndexOf('<style'), s1 = h.lastIndexOf('</style>');
  const open = h.indexOf('>', s0) + 1;
  const css = walk(h.slice(open, s1).replace(/\/\*[\s\S]*?\*\//g, ''));
  h = h.slice(0, open) + css + h.slice(s1);
  must(!/data-theme|themeToggle|oi-theme|theme-toggle/.test(h.replace(/<meta name="theme-color"[^>]*>/, '')), f + ' theme leftovers');
  console.log(f, 'dark-only, bytes', n0, '->', h.length);

  /* 2. facts wording */
  const fr = /<dt>Builds in<\/dt><dd>Wix and Wix Studio<\/dd>/;
  if (fr.test(h)) h = h.replace(fr, '<dt>Builds across platforms</dt><dd>Wix and beyond.</dd>');
  else must(!isIdx, f + ' facts row');

  /* 3. clocks */
  const navClock = '<span class="nav-clock" title="Local time in Lagos, Nigeria"><i class="lv" aria-hidden="true"></i><span class="sr">Local time in Lagos, Nigeria</span><time data-lagos aria-hidden="true">--:--:--</time><span aria-hidden="true">WAT</span></span>';
  must(h.includes('<div class="nav-r">'), f + ' nav-r');
  h = h.replace('<div class="nav-r">', '<div class="nav-r">' + navClock);
  const foot = '<p class="lagos"><i class="lv" aria-hidden="true"></i><span class="lg-l">Lagos, Nigeria</span><time data-lagos aria-label="Current time in Lagos">--:--:--</time><span class="lg-z">WAT</span></p>\n    ';
  must(h.includes('<div class="legal">'), f + ' legal');
  h = h.replace('<div class="legal">', foot + '<div class="legal">');

  if (isIdx) {
    /* 4. hero portrait */
    const o0 = h.indexOf('<div class="orbit"'), o1 = h.indexOf('</div>\n    </div>\n    <ul class="disciplines');
    must(o0 > 0 && o1 > o0, 'orbit');
    const chip = '<div class="pf-chip"><img src="brand/mark-on-dark.svg" alt="" width="44" height="20"><span>Ojo Israel Ayomide<small>Website Strategist &amp; Designer</small></span></div>';
    const hero = `<div class="hero-pf" data-par="-12">\n      ${frame('', true, '')}\n      </figure>\n      ${chip}\n      </div>\n      `;
    h = h.slice(0, o0) + hero.replace('</figure>\n      ' + chip, chip.length ? '</figure>\n      ' + chip : '') + h.slice(o1 + 6);
    /* 5. about portrait */
    const p0 = h.indexOf('<figure class="pic rv"'), p1 = h.indexOf('</figure>', p0) + 9;
    must(p0 > 0, 'about pic');
    h = h.slice(0, p0) + frame('pf-about rv', false, ' data-par="10"') + '\n      <span class="pf-chip"><span>Ojo Israel Ayomide<small>Website Strategist &amp; Designer</small></span></span>\n    </figure>' + h.slice(p1);
    /* 6. marquee */
    must(h.includes('<!-- 02 PROBLEM -->'), 'problem marker');
    h = h.replace('<!-- 02 PROBLEM -->', marquee + '<!-- 02 PROBLEM -->');
  }

  h = h.replace(/<\/style>(?![\s\S]*<\/style>)/, css5 + '</style>');
  must(h.includes('</body>'), 'body');
  h = h.replace(/<\/body>(?![\s\S]*<\/body>)/, '<script>\n' + js5 + '</script>\n</body>');
  fs.writeFileSync(f, h);
}
console.log('fix5 ok');
