import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
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
  create(@Param('appId') appId: string, @Body() body: unknown) {
    const dto = this.parseCreateBody(body);
    return this.service.createTable(appId, dto);
  }

  @Patch(':tableId')
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
      throw new Error('Request body must be an object.');
    }

    const obj = body as Record<string, unknown>;

    if (typeof obj.name !== 'string' || obj.name.trim().length === 0) {
      throw new Error('"name" must be a non-empty string.');
    }

    if (typeof obj.slug !== 'string' || !/^[a-z][a-z0-9_]*$/.test(obj.slug)) {
      throw new Error('"slug" must match /^[a-z][a-z0-9_]*$/.');
    }

    return {
      name: obj.name.trim(),
      slug: obj.slug,
      fields: Array.isArray(obj.fields) ? (obj.fields as any[]) : undefined,
    };
  }

  private parseUpdateBody(body: unknown): Record<string, unknown> {
    if (typeof body !== 'object' || body === null) {
      throw new Error('Request body must be an object.');
    }

    return body as Record<string, unknown>;
  }
}
