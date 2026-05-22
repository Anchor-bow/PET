import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppDomainService {
  constructor(private readonly prisma: PrismaService) {}

  // Phase 5 implementiert hier das volle CRUD für gespeicherte Apps.
  findAll() {
    return this.prisma.app.findMany();
  }

  findById(id: string) {
    return this.prisma.app.findUnique({ where: { id } });
  }
}
