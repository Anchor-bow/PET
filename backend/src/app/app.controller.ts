import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
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

  @Post()
  create(@Body() body: unknown) {
    return this.appService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.appService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.appService.delete(id);
  }
}
