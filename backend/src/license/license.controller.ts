import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { LicenseService } from './license.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { ValidateLicenseDto } from './dto/validate-license.dto';
import { ConsumeLicenseDto } from './dto/consume-license.dto';

@ApiTags('Licenses')
@Controller('licenses')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Post()
  create(@Body() dto: CreateLicenseDto) {
    return this.licenseService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'appId', required: false })
  findAll(@Query('appId') appId?: string) {
    return this.licenseService.findAll(appId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.licenseService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLicenseDto) {
    return this.licenseService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.licenseService.remove(id);
  }

  @Post('validate')
  validate(@Body() dto: ValidateLicenseDto) {
    return this.licenseService.validate(dto);
  }

  @Post('consume')
  consume(@Body() dto: ConsumeLicenseDto) {
    return this.licenseService.consume(dto);
  }
}
