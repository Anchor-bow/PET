import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { appDefinitionSchema, type AppDefinition } from '@pet/types';
import { PrismaService } from '../prisma/prisma.service';

interface CreateAppBody {
  name?: unknown;
  schema?: unknown;
}

interface UpdateAppBody {
  name?: unknown;
  schema?: unknown;
}

@Injectable()
export class AppDomainService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.app.findMany({
      select: {
        id: true,
        name: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const app = await this.prisma.app.findUnique({ where: { id } });

    if (!app) {
      throw new NotFoundException(`App with id "${id}" was not found.`);
    }

    return app;
  }

  create(body: unknown) {
    const payload = this.parseCreateBody(body);
    const schema = this.parseAppSchema(payload.schema);
    const name = this.resolveName(payload.name, schema.name);

    return this.prisma.app.create({
      data: {
        name,
        schema: this.toJsonInput(schema),
      },
    });
  }

  async update(id: string, body: unknown) {
    const payload = this.parseUpdateBody(body);
    const data: Prisma.AppUpdateInput = {};

    if ('schema' in payload) {
      const schema = this.parseAppSchema(payload.schema);
      data.schema = this.toJsonInput(schema);
      data.name = this.resolveName(payload.name, schema.name);
    } else if ('name' in payload) {
      data.name = this.resolveName(payload.name);
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one of "name" or "schema" must be provided.');
    }

    data.version = { increment: 1 };

    try {
      return await this.prisma.app.update({
        where: { id },
        data,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException(`App with id "${id}" was not found.`);
      }

      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.app.delete({ where: { id } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException(`App with id "${id}" was not found.`);
      }

      throw err;
    }
  }

  private parseCreateBody(body: unknown): CreateAppBody {
    if (!this.isObject(body) || !('schema' in body)) {
      throw new BadRequestException('Request body must include a valid "schema" object.');
    }

    return body;
  }

  private parseUpdateBody(body: unknown): UpdateAppBody {
    if (!this.isObject(body)) {
      throw new BadRequestException('Request body must be an object.');
    }

    return body;
  }

  private parseAppSchema(value: unknown): AppDefinition {
    const result = appDefinitionSchema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Invalid app schema.',
        issues: result.error.issues,
      });
    }

    return result.data;
  }

  private resolveName(value: unknown, fallback?: string): string {
    if (value === undefined) {
      if (fallback) {
        return fallback;
      }

      throw new BadRequestException('"name" must be provided.');
    }

    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException('"name" must be a non-empty string.');
    }

    return value.trim();
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private toJsonInput(schema: AppDefinition): Prisma.InputJsonValue {
    return schema as unknown as Prisma.InputJsonValue;
  }
}
