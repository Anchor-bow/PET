import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  private readonly uploadDir: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.uploadDir = path.resolve(config.get<string>('UPLOAD_DIR', 'uploads'));
  }

  getUploadDir() {
    return this.uploadDir;
  }

  appDir(appId: string) {
    return path.join(this.uploadDir, appId);
  }

  filePath(appId: string, fileId: string, filename: string) {
    return path.join(this.appDir(appId), `${fileId}-${filename}`);
  }

  async save(appId: string, filename: string, mimetype: string, size: number, buffer: Buffer) {
    const meta = await this.prisma.fileMetadata.create({
      data: { appId, filename, mimetype, size },
    });
    const dir = this.appDir(appId);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(this.filePath(appId, meta.id, filename), buffer);
    return meta;
  }

  async findAll(appId: string) {
    return this.prisma.fileMetadata.findMany({ where: { appId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(appId: string, fileId: string) {
    const file = await this.prisma.fileMetadata.findFirst({ where: { id: fileId, appId } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async remove(appId: string, fileId: string) {
    const file = await this.findOne(appId, fileId);
    const fp = this.filePath(appId, file.id, file.filename);
    await fs.promises.unlink(fp).catch(() => {});
    await this.prisma.fileMetadata.delete({ where: { id: fileId } });
  }
}
