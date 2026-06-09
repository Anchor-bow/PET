import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { CrudGeneratorService } from './crud-generator.service';

@Controller('apps/:appId/records')
export class CrudGeneratorController {
  constructor(private readonly service: CrudGeneratorService) {}

  @Get(':tableId')
  @ApiQuery({ name: 'resolve', required: false, type: Boolean, description: 'Auflösen von Relation-Feldern' })
  list(
    @Param('appId') appId: string,
    @Param('tableId') tableId: string,
    @Query('resolve') resolve?: string,
  ) {
    return this.service.listRecords(appId, tableId, resolve === 'true');
  }

  @Get(':tableId/:recordId')
  @ApiQuery({ name: 'resolve', required: false, type: Boolean, description: 'Auflösen von Relation-Feldern' })
  get(
    @Param('appId') appId: string,
    @Param('tableId') tableId: string,
    @Param('recordId') recordId: string,
    @Query('resolve') resolve?: string,
  ) {
    return this.service.getRecord(appId, tableId, recordId, resolve === 'true');
  }

  @Post(':tableId')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['data'],
      properties: {
        data: {
          type: 'object',
          example: { name: 'Max', email: 'max@example.com' },
          additionalProperties: true,
        },
      },
    },
  })
  create(
    @Param('appId') appId: string,
    @Param('tableId') tableId: string,
    @Body() body: unknown,
  ) {
    const dto = this.parseCreateBody(body);
    return this.service.createRecord(appId, tableId, dto);
  }

  @Patch(':tableId/:recordId')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['data'],
      properties: {
        data: {
          type: 'object',
          example: { name: 'Max Mustermann' },
          additionalProperties: true,
        },
      },
    },
  })
  update(
    @Param('appId') appId: string,
    @Param('tableId') tableId: string,
    @Param('recordId') recordId: string,
    @Body() body: unknown,
  ) {
    const dto = this.parseUpdateBody(body);
    return this.service.updateRecord(appId, tableId, recordId, dto);
  }

  @Delete(':tableId/:recordId')
  @HttpCode(204)
  async delete(
    @Param('appId') appId: string,
    @Param('tableId') tableId: string,
    @Param('recordId') recordId: string,
  ): Promise<void> {
    await this.service.deleteRecord(appId, tableId, recordId);
  }

  private parseCreateBody(body: unknown): { data: Record<string, unknown> } {
    if (typeof body !== 'object' || body === null) {
      throw new BadRequestException('Request body must be an object.');
    }

    const obj = body as Record<string, unknown>;

    if (typeof obj.data !== 'object' || obj.data === null) {
      throw new BadRequestException('"data" must be an object.');
    }

    return { data: obj.data as Record<string, unknown> };
  }

  private parseUpdateBody(body: unknown): { data: Record<string, unknown> } {
    if (typeof body !== 'object' || body === null) {
      throw new BadRequestException('Request body must be an object.');
    }

    const obj = body as Record<string, unknown>;

    if (typeof obj.data !== 'object' || obj.data === null) {
      throw new BadRequestException('"data" must be an object.');
    }

    return { data: obj.data as Record<string, unknown> };
  }
}
