// Simple LCOV coverage threshold checker for Deno projects
// Usage: deno run -A scripts/coverage-threshold.ts [--path=cov/lcov.info] [--minLines=80]

const args = new Map<string, string>();
for (const a of Deno.args) {
  const [k, v] = a.split('=');
  if (k && v) args.set(k.replace(/^--/, ''), v);
}

const path = args.get('path') ?? 'cov/lcov.info';
const minLines = Number(args.get('minLines') ?? Deno.env.get('COVERAGE_LINES') ?? 80);

const text = await Deno.readTextFile(path).catch((err) => {
  console.error(`Failed to read LCOV file at ${path}: ${err.message}`);
  Deno.exit(2);
});

type Totals = { lf: number; lh: number };
const totals: Totals = { lf: 0, lh: 0 };

let includeFile = false;
for (const line of text.split(/\r?\n/)) {
  if (line.startsWith('SF:')) {
    const file = line.substring(3);
    includeFile = /[\\\/]src[\\\/]/.test(file);
  } else if (includeFile && line.startsWith('LF:')) {
    totals.lf += Number(line.substring(3));
  } else if (includeFile && line.startsWith('LH:')) {
    totals.lh += Number(line.substring(3));
  }
}

const pct = totals.lf === 0 ? 0 : (totals.lh / totals.lf) * 100;
const pctStr = pct.toFixed(1);
console.log(`Coverage (lines, src/*): ${pctStr}% (min ${minLines}%)`);
if (pct + 1e-6 < minLines) {
  console.error(`Coverage threshold not met (have ${pctStr}%, need >= ${minLines}%).`);
  Deno.exit(1);
}
