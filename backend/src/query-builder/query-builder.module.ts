import { Module } from '@nestjs/common';
import { QueryBuilderController } from './query-builder.controller';
import { QueryBuilderService } from './query-builder.service';

@Module({
  controllers: [QueryBuilderController],
  providers: [QueryBuilderService],
  exports: [QueryBuilderService],
})
export class QueryBuilderModule {}
