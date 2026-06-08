import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
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
  @ApiBody({
    schema: {
      type: 'object',
      required: ['schema'],
      properties: {
        name: { type: 'string', example: 'Meine App' },
        schema: {
          type: 'object',
          description: 'AppDefinition JSON',
        },
      },
    },
  })
  create(@Body() body: unknown) {
    return this.appService.create(body);
  }

  @Patch(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Neuer Name' },
        schema: { type: 'object', description: 'AppDefinition JSON' },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.appService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.appService.delete(id);
  }
}
