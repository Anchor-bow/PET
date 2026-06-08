import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { DbBuilderService } from './db-builder.service';

@Controller('apps/:appId/tables')
export class DbBuilderController {
  constructor(private readonly service: DbBuilderService) {}

  @Get()
  list(@Param('appId') appId: string) {
    return this.service.listTables(appId);
  }

  @Get(':tableId')
  get(@Param('appId') appId: string, @Param('tableId') tableId: string) {
    return this.service.getTable(appId, tableId);
  }

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'slug'],
      properties: {
        name: { type: 'string', example: 'Kunden' },
        slug: { type: 'string', example: 'customers' },
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Name' },
              key: { type: 'string', example: 'name' },
              type: { type: 'string', example: 'string', enum: ['string', 'number', 'boolean', 'email', 'url', 'date', 'text', 'select'] },
              required: { type: 'boolean', default: false },
              defaultValue: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  })
  create(@Param('appId') appId: string, @Body() body: unknown) {
    const dto = this.parseCreateBody(body);
    return this.service.createTable(appId, dto);
  }

  @Patch(':tableId')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Kunden' },
        slug: { type: 'string', example: 'customers' },
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              key: { type: 'string' },
              type: { type: 'string', enum: ['string', 'number', 'boolean', 'email', 'url', 'date', 'text', 'select'] },
              required: { type: 'boolean' },
              defaultValue: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  })
  update(
    @Param('appId') appId: string,
    @Param('tableId') tableId: string,
    @Body() body: unknown,
  ) {
    const dto = this.parseUpdateBody(body);
    return this.service.updateTable(appId, tableId, dto);
  }

  @Delete(':tableId')
  @HttpCode(204)
  async delete(@Param('appId') appId: string, @Param('tableId') tableId: string): Promise<void> {
    await this.service.deleteTable(appId, tableId);
  }

  private parseCreateBody(body: unknown): {
    name: string;
    slug: string;
    fields?: { name: string; key: string; type: string; required?: boolean; defaultValue?: unknown; options?: string[] }[];
  } {
    if (typeof body !== 'object' || body === null) {
      throw new BadRequestException('Request body must be an object.');
    }

    const obj = body as Record<string, unknown>;

    if (typeof obj.name !== 'string' || obj.name.trim().length === 0) {
      throw new BadRequestException('"name" must be a non-empty string.');
    }

    if (typeof obj.slug !== 'string' || !/^[a-z][a-z0-9_]*$/.test(obj.slug)) {
      throw new BadRequestException('"slug" must match /^[a-z][a-z0-9_]*$/.');
    }

    return {
      name: obj.name.trim(),
      slug: obj.slug,
      fields: Array.isArray(obj.fields) ? (obj.fields as any[]) : undefined,
    };
  }

  private parseUpdateBody(body: unknown): Record<string, unknown> {
    if (typeof body !== 'object' || body === null) {
      throw new BadRequestException('Request body must be an object.');
    }

    return body as Record<string, unknown>;
  }
}
