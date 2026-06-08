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

  async listRecords(appId: string, tableId: string) {
    const table = await this.getTable(appId, tableId);
    this.validateTableHasFields(table);

    return this.prisma.record.findMany({
      where: { appId, tableId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRecord(appId: string, tableId: string, recordId: string) {
    const table = await this.getTable(appId, tableId);
    this.validateTableHasFields(table);

    const record = await this.prisma.record.findFirst({
      where: { id: recordId, appId, tableId },
    });

    if (!record) {
      throw new NotFoundException(`Record with id "${recordId}" was not found.`);
    }

    return record;
  }

  async createRecord(appId: string, tableId: string, dto: CreateRecordDto) {
    const table = await this.getTable(appId, tableId);
    this.validateTableHasFields(table);

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

    await this.prisma.record.delete({ where: { id: recordId } });
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
