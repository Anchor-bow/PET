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
}
