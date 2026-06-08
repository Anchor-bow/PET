import { Module } from '@nestjs/common';
import { CrudGeneratorController } from './crud-generator.controller';
import { CrudGeneratorService } from './crud-generator.service';

@Module({
  controllers: [CrudGeneratorController],
  providers: [CrudGeneratorService],
  exports: [CrudGeneratorService],
})
export class CrudGeneratorModule {}
