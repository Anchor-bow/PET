import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  constructor() {
    super({
      datasourceUrl:
        process.env.DATABASE_URL ??
        'postgresql://postgres:postgres@localhost:5432/pet?schema=public',
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.connected = true;
    } catch (err) {
      this.connected = false;
      this.logger.warn(
        `Datenbank nicht erreichbar — Backend läuft im degraded mode. (${(err as Error).message})`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connected) {
      await this.$disconnect();
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
