import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLicenseDto {
  @ApiProperty({ description: 'App-ID, für die die Lizenz gilt' })
  appId!: string;

  @ApiPropertyOptional({ description: 'Kundenname (für Abrechnung)' })
  customer?: string;

  @ApiPropertyOptional({ description: 'Maximale Anzahl Nutzer (Default: 1)' })
  maxUsers?: number;

  @ApiPropertyOptional({ description: 'Ablaufdatum (ISO 8601)' })
  expiresAt?: string;
}
