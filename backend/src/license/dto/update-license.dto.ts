import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLicenseDto {
  @ApiPropertyOptional({ description: 'Kundenname' })
  customer?: string;

  @ApiPropertyOptional({ description: 'Maximale Anzahl Nutzer' })
  maxUsers?: number;

  @ApiPropertyOptional({ description: 'Status: ACTIVE, REVOKED, EXPIRED' })
  status?: 'ACTIVE' | 'REVOKED' | 'EXPIRED';

  @ApiPropertyOptional({ description: 'Ablaufdatum (ISO 8601)' })
  expiresAt?: string;
}
