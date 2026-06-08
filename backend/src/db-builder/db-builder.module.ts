import { Module } from '@nestjs/common';
import { DbBuilderController } from './db-builder.controller';
import { DbBuilderService } from './db-builder.service';

@Module({
  controllers: [DbBuilderController],
  providers: [DbBuilderService],
  exports: [DbBuilderService],
})
export class DbBuilderModule {}
