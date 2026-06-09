import { BadRequestException, Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { QueryBuilderService } from './query-builder.service';

@Controller('apps/:appId/query')
export class QueryBuilderController {
  constructor(private readonly service: QueryBuilderService) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['table'],
      properties: {
        table: { type: 'string', example: 'customers', description: 'Table ID or slug' },
        filter: {
          type: 'object',
          example: { name: 'Max', age: { $gte: 18 } },
          description: 'Filter conditions. Supports: $eq, $ne, $gt, $gte, $lt, $lte, $in, $contains',
        },
        sort: {
          type: 'object',
          properties: {
            field: { type: 'string', example: 'createdAt' },
            order: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
          },
        },
        include: {
          type: 'array',
          items: { type: 'string' },
          example: ['orders', 'tags'],
          description: 'Relation field keys to resolve',
        },
        select: {
          type: 'array',
          items: { type: 'string' },
          example: ['name', 'email'],
          description: 'Fields to include in result',
        },
      },
    },
  })
  async query(@Param('appId') appId: string, @Body() body: unknown) {
    const req = this.parseBody(body);
    return this.service.query(appId, req);
  }

  private parseBody(body: unknown): {
    table: string;
    filter?: Record<string, unknown>;
    sort?: { field: string; order: 'asc' | 'desc' };
    include?: string[];
    select?: string[];
  } {
    if (typeof body !== 'object' || body === null) {
      throw new BadRequestException('Request body must be an object.');
    }

    const obj = body as Record<string, unknown>;

    if (typeof obj.table !== 'string' || obj.table.trim().length === 0) {
      throw new BadRequestException('"table" must be a non-empty string.');
    }

    const result: ReturnType<typeof this.parseBody> = { table: obj.table.trim() };

    if (obj.filter !== undefined) {
      if (typeof obj.filter !== 'object' || obj.filter === null || Array.isArray(obj.filter)) {
        throw new BadRequestException('"filter" must be an object.');
      }
      result.filter = obj.filter as Record<string, unknown>;
    }

    if (obj.sort !== undefined) {
      if (typeof obj.sort !== 'object' || obj.sort === null) {
        throw new BadRequestException('"sort" must be an object.');
      }
      const s = obj.sort as Record<string, unknown>;
      if (typeof s.field !== 'string') {
        throw new BadRequestException('"sort.field" must be a string.');
      }
      result.sort = {
        field: s.field,
        order: s.order === 'desc' ? 'desc' : 'asc',
      };
    }

    if (obj.include !== undefined) {
      if (!Array.isArray(obj.include) || !obj.include.every((i) => typeof i === 'string')) {
        throw new BadRequestException('"include" must be an array of strings.');
      }
      result.include = obj.include as string[];
    }

    if (obj.select !== undefined) {
      if (!Array.isArray(obj.select) || !obj.select.every((s) => typeof s === 'string')) {
        throw new BadRequestException('"select" must be an array of strings.');
      }
      result.select = obj.select as string[];
    }

    return result;
  }
}
