import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true, updatedAt: true } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, createdAt: true, updatedAt: true } });
  }
}
