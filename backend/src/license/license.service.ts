import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { ValidateLicenseDto } from './dto/validate-license.dto';
import { ConsumeLicenseDto } from './dto/consume-license.dto';

@Injectable()
export class LicenseService {
  constructor(private readonly prisma: PrismaService) {}

  private generateKey(): string {
    const raw = randomBytes(9).toString('base64url').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const parts: string[] = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.slice(i, i + 4));
    }
    return `PET-${parts.slice(0, 3).join('-')}`;
  }

  async create(dto: CreateLicenseDto) {
    const app = await this.prisma.app.findUnique({ where: { id: dto.appId } });
    if (!app) throw new NotFoundException(`App "${dto.appId}" not found`);

    const key = this.generateKey();

    return this.prisma.license.create({
      data: {
        key,
        appId: dto.appId,
        customer: dto.customer,
        maxUsers: dto.maxUsers ?? 1,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async findAll(appId?: string) {
    return this.prisma.license.findMany({
      where: appId ? { appId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { consumptions: true } } },
    });
  }

  async findOne(id: string) {
    const license = await this.prisma.license.findUnique({
      where: { id },
      include: { _count: { select: { consumptions: true } } },
    });
    if (!license) throw new NotFoundException(`License "${id}" not found`);
    return license;
  }

  async update(id: string, dto: UpdateLicenseDto) {
    await this.findOne(id);
    return this.prisma.license.update({
      where: { id },
      data: {
        ...(dto.customer !== undefined && { customer: dto.customer }),
        ...(dto.maxUsers !== undefined && { maxUsers: dto.maxUsers }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.expiresAt !== undefined && { expiresAt: new Date(dto.expiresAt) }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.license.delete({ where: { id } });
  }

  async validate(dto: ValidateLicenseDto) {
    const license = await this.prisma.license.findUnique({ where: { key: dto.key } });
    if (!license) return { valid: false, reason: 'License key not found' };
    if (license.appId !== dto.appId) return { valid: false, reason: 'License key does not match this app' };
    if (license.status === 'REVOKED') return { valid: false, reason: 'License has been revoked' };
    if (license.status === 'EXPIRED') return { valid: false, reason: 'License has expired' };
    if (license.expiresAt && license.expiresAt < new Date()) return { valid: false, reason: 'License has expired' };
    return { valid: true };
  }

  async consume(dto: ConsumeLicenseDto) {
    const license = await this.prisma.license.findUnique({ where: { key: dto.key } });
    if (!license) throw new NotFoundException('License key not found');

    const validation = await this.validate({ key: dto.key, appId: dto.appId });
    if (!validation.valid) throw new BadRequestException(validation.reason);

    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.prisma.licenseConsumption.findUnique({
      where: { licenseId_userId: { licenseId: license.id, userId: dto.userId } },
    });
    if (existing) return { consumed: true, alreadyConsumed: true };

    if (license.usedCount >= license.maxUsers) {
      throw new BadRequestException('License has reached maximum number of users');
    }

    await this.prisma.licenseConsumption.create({
      data: { licenseId: license.id, userId: dto.userId },
    });

    await this.prisma.license.update({
      where: { id: license.id },
      data: { usedCount: { increment: 1 }, lastUsedAt: new Date() },
    });

    return { consumed: true };
  }

  async isUserLicensed(userId: string): Promise<boolean> {
    const count = await this.prisma.licenseConsumption.count({
      where: {
        userId,
        license: { status: 'ACTIVE' },
      },
    });
    return count > 0;
  }
}
