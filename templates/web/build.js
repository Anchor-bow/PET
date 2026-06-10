import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { appDefinitionSchema } from '@pet/types';

const __dirname = dirname(fileURLToPath(import.meta.url));

function usage() {
  console.error('Usage: node build.js --input <app.json> [--output <dir>]');
  process.exit(1);
}

const args = process.argv.slice(2);
const inputIdx = args.indexOf('--input');
const outputIdx = args.indexOf('--output');

if (inputIdx === -1 || inputIdx + 1 >= args.length) usage();

const inputPath = resolve(process.cwd(), args[inputIdx + 1]);
const outputPath = outputIdx !== -1 ? resolve(process.cwd(), args[outputIdx + 1]) : resolve(__dirname, 'dist');

if (!existsSync(inputPath)) {
  console.error(`Error: Input file not found: ${inputPath}`);
  process.exit(1);
}

let raw;
try {
  raw = JSON.parse(readFileSync(inputPath, 'utf-8'));
} catch {
  console.error('Error: Invalid JSON in input file');
  process.exit(1);
}

const parsed = appDefinitionSchema.safeParse(raw);
if (!parsed.success) {
  console.error('Error: Invalid app definition:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const appDataPath = resolve(__dirname, 'src', 'app.data.json');
writeFileSync(appDataPath, JSON.stringify(parsed.data, null, 2), 'utf-8');
console.log(`✓ Wrote app definition to ${appDataPath}`);

try {
  mkdirSync(outputPath, { recursive: true });
  execSync(`npx vite build --outDir "${outputPath}"`, {
    cwd: __dirname,
    stdio: 'inherit',
  });
  console.log(`\n✓ Build complete! Output: ${outputPath}`);
} finally {
  if (existsSync(appDataPath)) {
    unlinkSync(appDataPath);
    console.log(`✓ Cleaned up ${appDataPath}`);
  }
}
