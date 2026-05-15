const fs = require('fs');
const path = require('path');

const roots = [
  path.resolve(__dirname, '..'),
  path.resolve(__dirname, '..', '..', 'packages'),
];
const forbidden = [':8081', ':8082', 'http://localhost:8081', 'http://localhost:8082', 'ms-students', 'ms-attendance'];
let found = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(e.name)) continue;
      scanDir(full);
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (!['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css'].includes(ext)) return;
      try {
        const content = fs.readFileSync(full, 'utf8');
        for (const token of forbidden) {
          if (content.includes(token)) {
            found.push({ file: path.relative(process.cwd(), full), token });
          }
        }
      } catch (err) {
        // ignore binary
      }
    }
  }
}

for (const r of roots) {
  if (fs.existsSync(r)) scanDir(r);
}

if (found.length) {
  console.error('Forbidden backend references found:');
  for (const f of found) console.error(`${f.file} -> ${f.token}`);
  process.exit(2);
} else {
  console.log('No forbidden backend references found in frontend/packages. All good.');
}
