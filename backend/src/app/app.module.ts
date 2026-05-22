import { Module } from '@nestjs/common';
import { AppDomainController } from './app.controller';
import { AppDomainService } from './app.service';

@Module({
  controllers: [AppDomainController],
  providers: [AppDomainService],
  exports: [AppDomainService],
})
export class AppDomainModule {}
