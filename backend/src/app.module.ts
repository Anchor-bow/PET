import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AppDomainModule } from './app/app.module';
import { CrudGeneratorModule } from './crud-generator/crud-generator.module';
import { DbBuilderModule } from './db-builder/db-builder.module';
import { MediaModule } from './media/media.module';
import { QueryBuilderModule } from './query-builder/query-builder.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    UserModule,
    AuthModule,
    AppDomainModule,
    DbBuilderModule,
    MediaModule,
    QueryBuilderModule,
    CrudGeneratorModule,
  ],
})
export class AppModule {}
