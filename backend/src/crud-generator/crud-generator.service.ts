import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  buildRecordSchema,
  type AppDefinition,
  type FieldDefinition,
  type TableDefinition,
} from '@pet/types';
import { PrismaService } from '../prisma/prisma.service';

interface CreateRecordDto {
  data: Record<string, unknown>;
}

interface UpdateRecordDto {
  data: Record<string, unknown>;
}

@Injectable()
export class CrudGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  async listRecords(appId: string, tableId: string, resolve = false) {
    const table = await this.getTable(appId, tableId);
    this.validateTableHasFields(table);

    const records = await this.prisma.record.findMany({
      where: { appId, tableId },
      orderBy: { createdAt: 'desc' },
    });

    if (!resolve) return records;

    const resolved = await Promise.all(
      records.map((rec) => this.resolveRelations(appId, table, rec)),
    );
    return resolved;
  }

  async getRecord(appId: string, tableId: string, recordId: string, resolve = false) {
    const table = await this.getTable(appId, tableId);
    this.validateTableHasFields(table);

    const record = await this.prisma.record.findFirst({
      where: { id: recordId, appId, tableId },
    });

    if (!record) {
      throw new NotFoundException(`Record with id "${recordId}" was not found.`);
    }

    if (!resolve) return record;

    return this.resolveRelations(appId, table, record);
  }

  async createRecord(appId: string, tableId: string, dto: CreateRecordDto) {
    const table = await this.getTable(appId, tableId);
    this.validateTableHasFields(table);

    await this.validateForeignKeys(appId, table.fields, dto.data);

    const data = this.validateData(table.fields, dto.data);

    const record = await this.prisma.record.create({
      data: {
        appId,
        tableId,
        data: data as Prisma.InputJsonValue,
      },
    });

    return record;
  }

  async updateRecord(appId: string, tableId: string, recordId: string, dto: UpdateRecordDto) {
    const table = await this.getTable(appId, tableId);
    this.validateTableHasFields(table);

    const existing = await this.prisma.record.findFirst({
      where: { id: recordId, appId, tableId },
    });

    if (!existing) {
      throw new NotFoundException(`Record with id "${recordId}" was not found.`);
    }

    await this.validateForeignKeys(appId, table.fields, dto.data);

    const merged = { ...(existing.data as Record<string, unknown>), ...dto.data };
    const data = this.validateData(table.fields, merged);

    const record = await this.prisma.record.update({
      where: { id: recordId },
      data: { data: data as Prisma.InputJsonValue },
    });

    return record;
  }

  async deleteRecord(appId: string, tableId: string, recordId: string): Promise<void> {
    const table = await this.getTable(appId, tableId);
    this.validateTableHasFields(table);

    const existing = await this.prisma.record.findFirst({
      where: { id: recordId, appId, tableId },
    });

    if (!existing) {
      throw new NotFoundException(`Record with id "${recordId}" was not found.`);
    }

    await this.cascadeDelete(appId, tableId, recordId);
    await this.cleanupManyToMany(appId, tableId, recordId);

    await this.prisma.record.delete({ where: { id: recordId } });
  }

  private async resolveRelations(
    appId: string,
    table: TableDefinition,
    record: { id: string; data: unknown },
  ) {
    const relationFields = table.fields.filter((f) => f.type === 'relation' && f.relation);
    if (relationFields.length === 0) return record;

    const data = record.data as Record<string, unknown>;
    const resolved: Record<string, unknown> = { ...data };

    for (const field of relationFields) {
      const rel = field.relation!;
      const fkValue = data[field.key];

      if (!fkValue) continue;

      if (rel.type === 'belongsTo') {
        const target = await this.prisma.record.findFirst({
          where: { id: fkValue as string, appId },
        });
        resolved[field.key] = target
          ? { id: target.id, data: target.data }
          : null;
      } else if (rel.type === 'hasMany') {
        const ids = Array.isArray(fkValue) ? fkValue : [fkValue];
        const targets = await this.prisma.record.findMany({
          where: { id: { in: ids as string[] }, appId },
        });
        const targetMap = new Map(targets.map((t) => [t.id, { id: t.id, data: t.data }]));
        resolved[field.key] = ids.map((id: string) => targetMap.get(id) ?? null);
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
        resolved[field.key] = targetIds.map((id) => targetMap.get(id) ?? null);
      }
    }

    return { ...record, data: resolved };
  }

  private async validateForeignKeys(
    appId: string,
    fields: FieldDefinition[],
    data: Record<string, unknown>,
  ): Promise<void> {
    for (const field of fields) {
      if (field.type !== 'relation' || !field.relation) continue;

      const value = data[field.key];
      if (!value) continue;

      if (field.relation.type === 'belongsTo') {
        const target = await this.prisma.record.findFirst({
          where: { id: value as string, appId },
        });
        if (!target) {
          throw new ConflictException(
            `Foreign key validation failed: "${field.key}" references record "${value as string}" which does not exist.`,
          );
        }
      }
    }
  }

  private async cascadeDelete(
    appId: string,
    tableId: string,
    recordId: string,
  ): Promise<void> {
    const schema = await this.getSchema(appId);
    const tables = schema.tables ?? [];

    for (const table of tables) {
      for (const field of table.fields) {
        if (
          field.type === 'relation' &&
          field.relation?.type === 'hasMany' &&
          field.relation?.targetTableId === tableId
        ) {
          const children = await this.prisma.record.findMany({
            where: { appId, tableId: table.id },
          });
          const toDelete = children.filter((child) => {
            const childData = child.data as Record<string, unknown>;
            const raw = childData[field.key];
            const ids: string[] = Array.isArray(raw) ? raw as string[] : [raw as string];
            return ids.includes(recordId);
          });

          for (const child of toDelete) {
            await this.deleteRecord(appId, table.id, child.id);
          }
        }
      }
    }
  }

  private async cleanupManyToMany(
    appId: string,
    tableId: string,
    recordId: string,
  ): Promise<void> {
    await this.prisma.relationRecord.deleteMany({
      where: {
        appId,
        OR: [
          { sourceTableId: tableId, sourceRecordId: recordId },
          { targetTableId: tableId, targetRecordId: recordId },
        ],
      },
    });
  }

  private validateData(fields: FieldDefinition[], data: Record<string, unknown>): Record<string, unknown> {
    const schema = buildRecordSchema(fields);
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new ConflictException(
        `Validation failed: ${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
      );
    }

    return result.data as Record<string, unknown>;
  }

  private async getTable(appId: string, tableId: string): Promise<TableDefinition> {
    await this.ensureAppExists(appId);

    const schema = await this.getSchema(appId);
    const table = (schema.tables ?? []).find((t) => t.id === tableId);

    if (!table) {
      throw new NotFoundException(`Table with id "${tableId}" was not found.`);
    }

    return table;
  }

  private validateTableHasFields(table: TableDefinition): void {
    if (!table.fields || table.fields.length === 0) {
      throw new ConflictException(`Table "${table.name}" has no fields defined.`);
    }
  }

  private async ensureAppExists(appId: string): Promise<void> {
    const app = await this.prisma.app.findUnique({ where: { id: appId }, select: { id: true } });

    if (!app) {
      throw new NotFoundException(`App with id "${appId}" was not found.`);
    }
  }

  private async getSchema(appId: string): Promise<AppDefinition> {
    const app = await this.prisma.app.findUnique({ where: { id: appId }, select: { schema: true } });
    return app!.schema as unknown as AppDefinition;
  }
}
