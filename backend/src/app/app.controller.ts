import { Controller, Get, Param } from '@nestjs/common';
import { AppDomainService } from './app.service';

@Controller('apps')
export class AppDomainController {
  constructor(private readonly appService: AppDomainService) {}

  @Get()
  list() {
    return this.appService.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.appService.findById(id);
  }
}
