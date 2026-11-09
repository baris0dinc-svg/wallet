// src/*.js parçalarını Prettier ile biçimlendirir (.prettierrc.json).
// Parçalar tek başına geçerli JavaScript olmadığından (01-core IIFE'yi açar, 99-init kapatır) birleştirilip biçimlendirilir,
// sonra işaretlerden yeniden bölünür.
// Kullanım: npm i --no-save prettier@3.3.3 && node tools/format.mjs          → src/ biçimlendirilir
//           node tools/format.mjs --check                                     → biçim bozuksa hata (CI)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as prettier from 'prettier';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = path.join(root, 'src');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
const cfg = JSON.parse(fs.readFileSync(path.join(root, '.prettierrc.json'), 'utf8'));
const cur = Object.fromEntries(files.map(f => [f, fs.readFileSync(path.join(dir, f), 'utf8')]));
const src = files.map((f, i) => (i ? '\n/*@@PART:' + f + '@@*/\n' : '') + cur[f]).join('');
const out = await prettier.format(src, { ...cfg, parser: 'babel' });
const re = /^[ \t]*\/\*@@PART:(.+?)@@\*\/\n/gm;
const parts = {};
let last = 0, name = files[0], m;
while ((m = re.exec(out))) { parts[name] = out.slice(last, m.index); name = m[1]; last = m.index + m[0].length; }
parts[name] = out.slice(last);
if (Object.keys(parts).length !== files.length) throw new Error('parça işaretleri kayboldu');
const bad = files.filter(f => parts[f] !== cur[f]);
if (process.argv.includes('--check')) {
  if (bad.length) { console.error('Biçim bozuk: ' + bad.join(', ') + '\nnode tools/format.mjs çalıştırın, sonra python3 tools/build.py'); process.exit(1); }
  console.log('src biçimi güncel (' + files.length + ' parça)');
} else {
  bad.forEach(f => fs.writeFileSync(path.join(dir, f), parts[f]));
  console.log(bad.length ? 'biçimlendirildi: ' + bad.join(', ') : 'src biçimi zaten güncel');
}
