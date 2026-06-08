import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import {
  fieldDefinitionSchema,
  tableDefinitionSchema,
  type AppDefinition,
  type FieldDefinition,
  type FieldType,
  type JsonValue,
  type TableDefinition,
} from '@pet/types';
import { PrismaService } from '../prisma/prisma.service';

interface CreateTableDto {
  name: string;
  slug: string;
  fields?: CreateFieldDto[];
}

interface CreateFieldDto {
  name: string;
  key: string;
  type: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: string[];
}

interface UpdateTableDto {
  name?: string;
  slug?: string;
  fields?: CreateFieldDto[];
}

@Injectable()
export class DbBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async listTables(appId: string): Promise<TableDefinition[]> {
    const schema = await this.getSchema(appId);
    return schema.tables ?? [];
  }

  async getTable(appId: string, tableId: string): Promise<TableDefinition> {
    const schema = await this.getSchema(appId);
    const table = (schema.tables ?? []).find((t) => t.id === tableId);

    if (!table) {
      throw new NotFoundException(`Table with id "${tableId}" was not found.`);
    }

    return table;
  }

  async createTable(appId: string, dto: CreateTableDto): Promise<TableDefinition> {
    const app = await this.getApp(appId);
    const schema = app.schema as unknown as AppDefinition;
    const tables = schema.tables ?? [];

    if (tables.some((t) => t.slug === dto.slug)) {
      throw new ConflictException(`Table with slug "${dto.slug}" already exists.`);
    }

    if (tables.some((t) => t.name === dto.name)) {
      throw new ConflictException(`Table with name "${dto.name}" already exists.`);
    }

    const fields: FieldDefinition[] = (dto.fields ?? []).map((f) => {
      const field: FieldDefinition = {
        id: randomUUID(),
        name: f.name,
        key: f.key,
        type: f.type as FieldType,
        required: f.required ?? false,
        defaultValue: f.defaultValue as JsonValue | undefined,
        options: f.options,
      };
      return fieldDefinitionSchema.parse(field);
    });

    const table: TableDefinition = {
      id: randomUUID(),
      name: dto.name,
      slug: dto.slug,
      fields,
    };

    const validated = tableDefinitionSchema.parse(table);
    schema.tables = [...tables, validated];
    await this.saveSchema(app.id, app.version, schema);

    return validated;
  }

  async updateTable(appId: string, tableId: string, dto: UpdateTableDto): Promise<TableDefinition> {
    const app = await this.getApp(appId);
    const schema = app.schema as unknown as AppDefinition;
    const tables = schema.tables ?? [];
    const index = tables.findIndex((t) => t.id === tableId);

    if (index === -1) {
      throw new NotFoundException(`Table with id "${tableId}" was not found.`);
    }

    if (dto.slug !== undefined && dto.slug !== tables[index].slug) {
      if (tables.some((t) => t.slug === dto.slug)) {
        throw new ConflictException(`Table with slug "${dto.slug}" already exists.`);
      }
    }

    if (dto.name !== undefined) {
      tables[index] = { ...tables[index], name: dto.name };
    }

    if (dto.slug !== undefined) {
      tables[index] = { ...tables[index], slug: dto.slug };
    }

    if (dto.fields !== undefined) {
      const fields: FieldDefinition[] = dto.fields.map((f) => {
        const field: FieldDefinition = {
          id: randomUUID(),
          name: f.name,
          key: f.key,
          type: f.type as FieldType,
          required: f.required ?? false,
          defaultValue: f.defaultValue as JsonValue | undefined,
          options: f.options,
        };
        return fieldDefinitionSchema.parse(field);
      });
      tables[index] = { ...tables[index], fields };
    }

    const validated = tableDefinitionSchema.parse(tables[index]);
    schema.tables = tables;
    await this.saveSchema(app.id, app.version, schema);

    return validated;
  }

  async deleteTable(appId: string, tableId: string): Promise<void> {
    const app = await this.getApp(appId);
    const schema = app.schema as unknown as AppDefinition;
    const tables = schema.tables ?? [];
    const index = tables.findIndex((t) => t.id === tableId);

    if (index === -1) {
      throw new NotFoundException(`Table with id "${tableId}" was not found.`);
    }

    schema.tables = tables.filter((t) => t.id !== tableId);
    await this.saveSchema(app.id, app.version, schema);
  }

  private async getApp(appId: string) {
    const app = await this.prisma.app.findUnique({ where: { id: appId } });

    if (!app) {
      throw new NotFoundException(`App with id "${appId}" was not found.`);
    }

    return app;
  }

  private async getSchema(appId: string): Promise<AppDefinition> {
    const app = await this.getApp(appId);
    return app.schema as unknown as AppDefinition;
  }

  private async saveSchema(id: string, expectedVersion: number, schema: AppDefinition): Promise<void> {
    try {
      await this.prisma.app.update({
        where: { id, version: expectedVersion },
        data: {
          schema: schema as unknown as Prisma.InputJsonValue,
          name: schema.name,
          version: { increment: 1 },
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new ConflictException('App was modified by another request. Please retry.');
      }

      throw err;
    }
  }
}
