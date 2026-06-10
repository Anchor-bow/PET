import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync, createWriteStream, createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import { resolve } from 'node:path';
import { ZipArchive } from 'archiver';
import { PrismaService } from '../prisma/prisma.service';

const MONOREPO_ROOT = resolve(__dirname, '../../..');
const BUILD_CLI = resolve(MONOREPO_ROOT, 'packages', 'build-cli', 'dist', 'index.js');
const TEMP_BASE = resolve(MONOREPO_ROOT, 'node_modules', '.export-tmp');

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportWebApp(appId: string): Promise<{ stream: Readable; filename: string }> {
    const app = await this.prisma.app.findUnique({ where: { id: appId } });
    if (!app) {
      throw new NotFoundException(`App with id "${appId}" was not found.`);
    }

    if (!existsSync(BUILD_CLI)) {
      throw new BadRequestException(
        'Build CLI is not built. Run: pnpm --filter @pet/build-cli run build',
      );
    }

    const safeId = appId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const workDir = resolve(TEMP_BASE, safeId);
    const distDir = resolve(workDir, 'dist');
    const inputPath = resolve(workDir, 'app.json');

    rmSync(workDir, { recursive: true, force: true });
    mkdirSync(workDir, { recursive: true });
    writeFileSync(inputPath, JSON.stringify(app.schema, null, 2), 'utf-8');

    try {
      execSync(
        `node "${BUILD_CLI}" --input "${inputPath}" --output "${distDir}" --template web`,
        { cwd: MONOREPO_ROOT, stdio: 'pipe', timeout: 120_000 },
      );
    } catch {
      rmSync(workDir, { recursive: true, force: true });
      throw new BadRequestException('Export build failed.');
    }

    if (!existsSync(distDir)) {
      rmSync(workDir, { recursive: true, force: true });
      throw new BadRequestException('Build completed but no output was produced.');
    }

    const zipPath = resolve(workDir, `${safeId}-web.zip`);
    await this.zipDirectory(distDir, zipPath);

    rmSync(distDir, { recursive: true, force: true });

    const stream = createReadStream(zipPath);
    stream.on('close', () => rmSync(workDir, { recursive: true, force: true }));
    stream.on('error', () => rmSync(workDir, { recursive: true, force: true }));

    return { stream, filename: `${safeId}-web.zip` };
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
