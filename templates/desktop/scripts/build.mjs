import { existsSync, readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, '..');

const appDataPath = resolve(TEMPLATE_DIR, 'src', 'app.data.json');

function step(label, fn) {
  console.log(`\n▶ ${label}`);
  fn();
}

function buildVite() {
  execSync('npx vite build', { cwd: TEMPLATE_DIR, stdio: 'inherit' });
}

function buildElectron() {
  const config = resolve(TEMPLATE_DIR, 'tsconfig.electron.json');
  execSync(`npx tsc -p "${config}"`, { cwd: TEMPLATE_DIR, stdio: 'inherit' });
}

function packInstaller(outputDir) {
  mkdirSync(outputDir, { recursive: true });
  execSync('npx electron-builder --config electron-builder.yml --x64', {
    cwd: TEMPLATE_DIR,
    stdio: 'inherit',
  });
}

function collectOutput(outputDir) {
  const installerDir = resolve(TEMPLATE_DIR, 'dist', 'installer');
  if (!existsSync(installerDir)) {
    console.warn('  ⚠ No installer output found at dist/installer');
    return;
  }
  const items = readdirSync(installerDir);
  for (const item of items) {
    const src = join(installerDir, item);
    const dest = join(outputDir, item);
    cpSync(src, dest, { recursive: true });
    console.log(`  ✓ Copied ${item}`);
  }
}

function cleanup() {
  if (existsSync(appDataPath)) {
    const raw = readFileSync(appDataPath, 'utf-8').trim();
    if (raw && raw !== '{}') {
      writeFileSync(appDataPath, '{}', 'utf-8');
    }
  }
}

const outputDir = process.env.PET_OUTPUT_DIR || resolve(TEMPLATE_DIR, 'dist', 'installer');

try {
  step('Vite build (renderer)', buildVite);
  step('TypeScript build (electron main)', buildElectron);
  step('electron-builder packaging', () => packInstaller(outputDir));
  step('Collecting output', () => collectOutput(outputDir));
  console.log(`\n✓ Desktop build complete! Output: ${outputDir}`);
} catch (err) {
  console.error(`\n✗ Build failed: ${err.message}`);
  process.exit(1);
} finally {
  cleanup();
}
