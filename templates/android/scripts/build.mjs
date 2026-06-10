import { existsSync, readFileSync, writeFileSync, cpSync, readdirSync, mkdirSync } from 'node:fs';
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

function addCapacitorPlatform() {
  const androidDir = resolve(TEMPLATE_DIR, 'android');
  if (existsSync(androidDir)) {
    console.log('  ✓ Android platform already exists, skipping cap add');
    return;
  }
  execSync('npx cap add android --no-telemetry', {
    cwd: TEMPLATE_DIR,
    stdio: 'inherit',
  });
}

function syncCapacitor() {
  execSync('npx cap copy', { cwd: TEMPLATE_DIR, stdio: 'inherit' });
}

function buildApk() {
  const androidDir = resolve(TEMPLATE_DIR, 'android');
  if (process.platform === 'win32') {
    execSync('gradlew.bat assembleDebug', { cwd: androidDir, stdio: 'inherit' });
  } else {
    execSync('./gradlew assembleDebug', { cwd: androidDir, stdio: 'inherit' });
  }
}

function collectOutput(outputDir) {
  const apkDir = resolve(TEMPLATE_DIR, 'android', 'app', 'build', 'outputs', 'apk', 'debug');
  if (!existsSync(apkDir)) {
    console.warn('  ⚠ No APK output found');
    return;
  }
  mkdirSync(outputDir, { recursive: true });
  const items = readdirSync(apkDir);
  for (const item of items) {
    if (item.endsWith('.apk')) {
      cpSync(join(apkDir, item), join(outputDir, item));
      console.log(`  ✓ Copied ${item}`);
    }
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

const outputDir = process.env.PET_OUTPUT_DIR || resolve(TEMPLATE_DIR, 'dist', 'apk');

try {
  step('Vite build (renderer)', buildVite);
  step('Capacitor add android platform', addCapacitorPlatform);
  step('Capacitor sync', syncCapacitor);
  step('Gradle assembleDebug', buildApk);
  step('Collecting output', () => collectOutput(outputDir));
  console.log(`\n✓ Android build complete! Output: ${outputDir}`);
} catch (err) {
  console.error(`\n✗ Build failed: ${err.message}`);
  process.exit(1);
} finally {
  cleanup();
}
