import fs from 'node:fs';
import crypto from 'node:crypto';
const C = '4cd34b9061900eba4078439ad30c285daf88dffa';
const BASE = 'https://raw.githubusercontent.com/israelayomide188-rgb/portfolio-images/' + C + '/assets/';
const L = {
  'ncc-home': ['55fab8e654331b02bec59ed866f194ee1df1401b', 1280, 13492],
  'ncc-about': ['c60c2429ed3220b97b238529024c67fc29bd87bb', 1280, 7092],
  'ncc-1to1': ['8889e3df1e8b69e24b2b2c856afd4b8d60f429eb', 1280, 3760],
  'ncc-bq': ['009ee3892059110eea963fec6d387e19107e7d3d', 1280, 10377],
  'ncc-workshops': ['0eaeed0db859fb895398325a09463d2a3f0c6fb8', 1280, 11299],
  'ncc-home-hero': ['264427556df4bd80a493dc72d6078cbb6e7f6cd3', 1400, 802],
  'israel-portrait': ['00ababc05403c3cccbeed9c5e53537b4538f3f9d', 1040, 1125]
};
async function get(u) {
  let e;
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(u);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return Buffer.from(await r.arrayBuffer());
    } catch (x) { e = x; await new Promise(r => setTimeout(r, 1500 * (i + 1))); }
  }
  throw e;
}
let html = fs.readFileSync('index.html', 'utf8');
for (const [n, [sha, w, h]] of Object.entries(L)) {
  const b = await get(BASE + n + '.webp');
  const got = crypto.createHash('sha1').update(b).digest('hex');
  if (got !== sha) throw new Error('checksum mismatch for ' + n + ': ' + got);
  fs.writeFileSync('assets/' + n + '.webp', b);
  const re = new RegExp('(assets/' + n + '\\.webp" width=")\\d+(" height=")\\d+');
  if (!re.test(html)) throw new Error('image tag not found: ' + n);
  html = html.replace(re, (m, a, c) => a + w + c + h);
  console.log('img ok', n, b.length);
}
fs.writeFileSync('index.html', html);
