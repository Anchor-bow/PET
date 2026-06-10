import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { appDefinitionSchema } from '@pet/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(__dirname, '../../..');

interface BuildOptions {
  template: string;
  templateDir?: string;
  input: string;
  output: string;
}

function usage(): never {
  console.error('Usage: pet-build --template <name> --input <app.json> [options]');
  console.error('');
  console.error('Options:');
  console.error('  --template <name>      Template name (e.g. "web"). Resolves to templates/<name>/.');
  console.error('  --template-dir <path>  Explicit path to template directory.');
  console.error('  --input <file>         Path to app definition JSON file.');
  console.error('  --output <dir>         Output directory (default: ./dist).');
  console.error('  --help                 Show this help.');
  process.exit(1);
}

function parseArgs(): BuildOptions {
  const args = process.argv.slice(2);
  const get = (key: string): string | undefined => {
    const idx = args.indexOf(key);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
  };

  if (args.includes('--help') || args.includes('-h')) usage();

  const template = get('--template') || 'web';
  const templateDir = get('--template-dir');
  const input = get('--input');
  const output = get('--output') || resolve(process.cwd(), 'dist');

  if (!input) {
    console.error('Error: --input is required');
    usage();
  }

  return { template, templateDir, input, output };
}

function resolveTemplateDir(options: BuildOptions): string {
  if (options.templateDir) {
    return resolve(process.cwd(), options.templateDir);
  }
  return resolve(MONOREPO_ROOT, 'templates', options.template);
}

export async function buildApp(templateDir: string, appJsonPath: string, outputDir: string): Promise<void> {
  if (!existsSync(templateDir)) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  const templatePkg = resolve(templateDir, 'package.json');
  if (!existsSync(templatePkg)) {
    throw new Error(`Template has no package.json: ${templatePkg}`);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(appJsonPath, 'utf-8'));
  } catch {
    throw new Error(`Invalid JSON in input file: ${appJsonPath}`);
  }

  const parsed = appDefinitionSchema.safeParse(raw);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid app definition:\n${messages}`);
  }

  const appDataPath = resolve(templateDir, 'src', 'app.data.json');
  writeFileSync(appDataPath, JSON.stringify(parsed.data, null, 2), 'utf-8');
  console.log(`✓ Wrote app definition to ${appDataPath}`);

  try {
    mkdirSync(outputDir, { recursive: true });
    execSync('npm run build', {
      cwd: templateDir,
      stdio: 'inherit',
      env: { ...process.env, PET_OUTPUT_DIR: outputDir },
    });
    console.log(`\n✓ Build complete! Output: ${outputDir}`);
  } finally {
    if (existsSync(appDataPath)) {
      unlinkSync(appDataPath);
    }
  }
}

const runningDirectly =
  process.argv[1] &&
  fileURLToPath(import.meta.url).replace(/\\/g, '/') ===
    resolve(process.argv[1]).replace(/\\/g, '/');

if (runningDirectly) {
  const options = parseArgs();
  const templateDir = resolveTemplateDir(options);
  buildApp(templateDir, options.input, options.output).catch((err: Error) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}
