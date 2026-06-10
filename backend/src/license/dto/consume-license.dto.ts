import { ApiProperty } from '@nestjs/swagger';

export class ConsumeLicenseDto {
  @ApiProperty({ description: 'Lizenz-Key (z.B. PET-XXXX-XXXX-XXXX)' })
  key!: string;

  @ApiProperty({ description: 'App-ID' })
  appId!: string;

  @ApiProperty({ description: 'User-ID, die die Lizenz nutzen soll' })
  userId!: string;
}
