import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly adminEmail = 'admin';
  private readonly adminPassword: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    config: ConfigService,
  ) {
    this.adminPassword = config.get<string>('ADMIN_PASSWORD', 'admin');
  }

  async onModuleInit() {
    const existing = await this.prisma.user.findUnique({ where: { email: this.adminEmail } });
    if (existing) return;
    const hashed = await bcrypt.hash(this.adminPassword, 10);
    await this.prisma.user.create({
      data: { email: this.adminEmail, name: 'Admin', password: hashed },
    });
    console.log('[auth] Admin user created');
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, email: user.email };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
