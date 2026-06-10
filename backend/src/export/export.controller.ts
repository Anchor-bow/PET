import { Controller, Param, Post, Res, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';

@ApiTags('Export')
@Controller('apps/:appId/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  async exportWeb(@Param('appId') appId: string, @Res({ passthrough: true }) res: Response) {
    const { stream, filename } = await this.exportService.exportWebApp(appId);

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(stream);
  }

  @Post('desktop')
  async exportDesktop(@Param('appId') appId: string, @Res({ passthrough: true }) res: Response) {
    const { stream, filename } = await this.exportService.exportDesktopApp(appId);

    const ext = filename.endsWith('.exe') ? 'application/vnd.microsoft.portable-executable'
      : filename.endsWith('.dmg') ? 'application/x-apple-diskimage'
      : filename.endsWith('.AppImage') ? 'application/x-iso9660-image'
      : 'application/octet-stream';

    res.set({
      'Content-Type': ext,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(stream);
  }

  @Post('android')
  async exportAndroid(@Param('appId') appId: string, @Res({ passthrough: true }) res: Response) {
    const { stream, filename } = await this.exportService.exportAndroidApp(appId);

    res.set({
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(stream);
  }
}
