import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync, createWriteStream, createReadStream, readdirSync } from 'node:fs';
import { Readable } from 'node:stream';
import { resolve, join } from 'node:path';
import { ZipArchive } from 'archiver';
import { PrismaService } from '../prisma/prisma.service';

const MONOREPO_ROOT = resolve(__dirname, '../../..');
const BUILD_CLI = resolve(MONOREPO_ROOT, 'packages', 'build-cli', 'dist', 'index.js');
const TEMP_BASE = resolve(MONOREPO_ROOT, 'node_modules', '.export-tmp');

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAppOrThrow(appId: string) {
    const app = await this.prisma.app.findUnique({ where: { id: appId } });
    if (!app) {
      throw new NotFoundException(`App with id "${appId}" was not found.`);
    }
    return app;
  }

  private ensureBuildCli() {
    if (!existsSync(BUILD_CLI)) {
      throw new BadRequestException(
        'Build CLI is not built. Run: pnpm --filter @pet/build-cli run build',
      );
    }
  }

  private buildApp(safeId: string, template: string, schema: Record<string, unknown>): string {
    const workDir = resolve(TEMP_BASE, safeId);
    const outputDir = resolve(workDir, 'output');
    const inputPath = resolve(workDir, 'app.json');

    rmSync(workDir, { recursive: true, force: true });
    mkdirSync(workDir, { recursive: true });
    writeFileSync(inputPath, JSON.stringify(schema, null, 2), 'utf-8');

    try {
      execSync(
        `node "${BUILD_CLI}" --input "${inputPath}" --output "${outputDir}" --template ${template}`,
        { cwd: MONOREPO_ROOT, stdio: 'pipe', timeout: 300_000 },
      );
    } catch {
      rmSync(workDir, { recursive: true, force: true });
      throw new BadRequestException(`Export build failed for template "${template}".`);
    }

    return workDir;
  }

  async exportWebApp(appId: string): Promise<{ stream: Readable; filename: string }> {
    const app = await this.getAppOrThrow(appId);
    this.ensureBuildCli();

    const safeId = app.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const schema = app.schema as Record<string, unknown>;
    const workDir = this.buildApp(safeId, 'web', schema);
    const outputDir = resolve(workDir, 'output');

    if (!existsSync(outputDir)) {
      rmSync(workDir, { recursive: true, force: true });
      throw new BadRequestException('Build completed but no output was produced.');
    }

    const zipPath = resolve(workDir, `${safeId}-web.zip`);
    await this.zipDirectory(outputDir, zipPath);

    rmSync(outputDir, { recursive: true, force: true });

    const stream = createReadStream(zipPath);
    stream.on('close', () => rmSync(workDir, { recursive: true, force: true }));
    stream.on('error', () => rmSync(workDir, { recursive: true, force: true }));

    return { stream, filename: `${safeId}-web.zip` };
  }

  async exportDesktopApp(appId: string): Promise<{ stream: Readable; filename: string }> {
    const app = await this.getAppOrThrow(appId);
    this.ensureBuildCli();

    const safeId = app.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const schema = app.schema as Record<string, unknown>;
    const workDir = this.buildApp(safeId, 'desktop', schema);
    const outputDir = resolve(workDir, 'output');

    if (!existsSync(outputDir)) {
      rmSync(workDir, { recursive: true, force: true });
      throw new BadRequestException('Build completed but no output was produced.');
    }

    const files = readdirSync(outputDir);
    const installer = files.find((f) => f.endsWith('.exe') || f.endsWith('.dmg') || f.endsWith('.AppImage'));

    if (!installer) {
      rmSync(workDir, { recursive: true, force: true });
      throw new BadRequestException('No installer file found in build output.');
    }

    const installerPath = join(outputDir, installer);
    const stream = createReadStream(installerPath);
    stream.on('close', () => rmSync(workDir, { recursive: true, force: true }));
    stream.on('error', () => rmSync(workDir, { recursive: true, force: true }));

    return { stream, filename: installer };
  }

  private zipDirectory(sourceDir: string, outPath: string): Promise<void> {
    return new Promise((resolvePromise, reject) => {
      const writeStream = createWriteStream(outPath);
      const archive = new ZipArchive({ zlib: { level: 9 } });

      writeStream.on('close', resolvePromise);
      writeStream.on('error', reject);
      archive.on('error', reject);

      archive.pipe(writeStream);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }
}
