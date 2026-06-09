import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'node:fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';

@UseGuards(JwtAuthGuard)
@Controller('apps/:appId/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@Param('appId') appId: string, @UploadedFile() file: Express.Multer.File) {
    return this.mediaService.save(appId, file.originalname, file.mimetype, file.size, file.buffer);
  }

  @Get()
  async list(@Param('appId') appId: string) {
    return this.mediaService.findAll(appId);
  }

  @Get(':fileId')
  async get(@Param('appId') appId: string, @Param('fileId') fileId: string) {
    return this.mediaService.findOne(appId, fileId);
  }

  @Get(':fileId/file')
  async serve(@Param('appId') appId: string, @Param('fileId') fileId: string, @Res() res: Response) {
    const file = await this.mediaService.findOne(appId, fileId);
    const fp = this.mediaService.filePath(appId, file.id, file.filename);
    const stream = fs.createReadStream(fp);
    res.set({ 'Content-Type': file.mimetype, 'Content-Disposition': `inline; filename="${file.filename}"` });
    stream.pipe(res);
  }

  @Delete(':fileId')
  async remove(@Param('appId') appId: string, @Param('fileId') fileId: string) {
    await this.mediaService.remove(appId, fileId);
  }
}
