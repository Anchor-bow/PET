import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { AppDefinition, FieldDefinition, TableDefinition } from '@pet/types';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

interface QueryRequest {
  table: string;
  filter?: Record<string, unknown>;
  sort?: { field: string; order: 'asc' | 'desc' };
  include?: string[];
  select?: string[];
}

export interface QueryResult {
  records: Array<{ id: string; data: Record<string, unknown> }>;
  total: number;
}

@Injectable()
export class QueryBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async query(appId: string, req: QueryRequest): Promise<QueryResult> {
    const schema = await this.getSchema(appId);
    const tables = schema.tables ?? [];

    const table = tables.find((t) => t.id === req.table || t.slug === req.table);
    if (!table) {
      throw new NotFoundException(`Table "${req.table}" was not found.`);
    }

    if (!table.fields || table.fields.length === 0) {
      throw new ConflictException(`Table "${table.name}" has no fields defined.`);
    }

    const where: Prisma.RecordWhereInput = { appId, tableId: table.id };

    if (req.filter) {
      where.data = this.buildFilter(req.filter, table.fields);
    }

    const records = await this.prisma.record.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (req.sort) {
      const sortField = table.fields.find((f) => f.key === req.sort!.field);
      if (!sortField) {
        throw new ConflictException(`Sort field "${req.sort.field}" does not exist in table "${table.name}".`);
      }

      records.sort((a, b) => {
        const aData = a.data as Record<string, unknown>;
        const bData = b.data as Record<string, unknown>;
        const aVal = aData[req.sort!.field];
        const bVal = bData[req.sort!.field];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return req.sort!.order === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const cmp = String(aVal).localeCompare(String(bVal));
        return req.sort!.order === 'asc' ? cmp : -cmp;
      });
    }

    let results: QueryResult['records'] = records.map((r) => ({
      id: r.id,
      data: r.data as Record<string, unknown>,
    }));

    if (req.select && req.select.length > 0) {
      results = results.map((r) => {
        const filtered: Record<string, unknown> = {};
        for (const key of req.select!) {
          if (key in r.data) {
            filtered[key] = r.data[key];
          }
        }
        return { ...r, data: filtered };
      });
    }

    if (req.include && req.include.length > 0) {
      results = await Promise.all(
        results.map(async (rec) => this.resolveIncludes(appId, table, rec, req.include!)),
      );
    }

    return {
      records: results,
      total: results.length,
    };
  }

  private buildFilter(
    filter: Record<string, unknown>,
    fields: FieldDefinition[],
  ): Prisma.JsonFilter {
    const conditions: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(filter)) {
      const field = fields.find((f) => f.key === key);
      if (!field) continue;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const op = value as Record<string, unknown>;
        if ('$eq' in op) conditions[`path = $."${key}"`] = op.$eq;
        if ('$ne' in op) conditions[`path != $."${key}"`] = op.$ne;
        if ('$gt' in op) conditions[`path > $."${key}"`] = op.$gt;
        if ('$gte' in op) conditions[`path >= $."${key}"`] = op.$gte;
        if ('$lt' in op) conditions[`path < $."${key}"`] = op.$lt;
        if ('$lte' in op) conditions[`path <= $."${key}"`] = op.$lte;
        if ('$in' in op) conditions[`path IN $."${key}"`] = op.$in;
        if ('$contains' in op) conditions[`path contains $."${key}"`] = op.$contains;
      } else {
        conditions[`path = $."${key}"`] = value;
      }
    }

    return conditions as Prisma.JsonFilter;
  }

  private async resolveIncludes(
    appId: string,
    table: TableDefinition,
    record: { id: string; data: Record<string, unknown> },
    includes: string[],
  ) {
    const data = { ...record.data };

    for (const includeKey of includes) {
      const field = table.fields.find((f) => f.key === includeKey && f.type === 'relation');
      if (!field || !field.relation) continue;

      const rel = field.relation;
      const fkValue = data[field.key];
      if (!fkValue) continue;

      if (rel.type === 'belongsTo') {
        const target = await this.prisma.record.findFirst({
          where: { id: fkValue as string, appId },
        });
        data[field.key] = target
          ? { id: target.id, data: target.data }
          : null;
      } else if (rel.type === 'hasMany') {
        const ids = Array.isArray(fkValue) ? fkValue : [fkValue];
        const targets = await this.prisma.record.findMany({
          where: { id: { in: ids as string[] }, appId },
        });
        const targetMap = new Map(targets.map((t) => [t.id, { id: t.id, data: t.data }]));
        data[field.key] = ids.map((id: string) => targetMap.get(id) ?? null);
      } else if (rel.type === 'manyToMany') {
        const joins = await this.prisma.relationRecord.findMany({
          where: {
            appId,
            sourceTableId: table.id,
            sourceRecordId: record.id,
            targetTableId: rel.targetTableId,
          },
        });
        const targetIds = joins.map((j) => j.targetRecordId);
        const targets = targetIds.length > 0
          ? await this.prisma.record.findMany({
              where: { id: { in: targetIds }, appId },
            })
          : [];
        const targetMap = new Map(targets.map((t) => [t.id, { id: t.id, data: t.data }]));
        data[field.key] = targetIds.map((id) => targetMap.get(id) ?? null);
      }
    }

    return { ...record, data };
  }

  private async getSchema(appId: string): Promise<AppDefinition> {
    const app = await this.prisma.app.findUnique({ where: { id: appId }, select: { schema: true } });

    if (!app) {
      throw new NotFoundException(`App with id "${appId}" was not found.`);
    }

    return app.schema as unknown as AppDefinition;
  }
}
