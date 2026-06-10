import { ApiProperty } from '@nestjs/swagger';

export class ValidateLicenseDto {
  @ApiProperty({ description: 'Lizenz-Key (z.B. PET-XXXX-XXXX-XXXX)' })
  key!: string;

  @ApiProperty({ description: 'App-ID' })
  appId!: string;
}
