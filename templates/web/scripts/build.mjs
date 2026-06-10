import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateDir = resolve(__dirname, '..');
const outputDir = process.env.PET_OUTPUT_DIR || resolve(templateDir, 'dist');

execSync(`npx vite build --outDir "${outputDir}"`, {
  cwd: templateDir,
  stdio: 'inherit',
});
