import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  // Phase 15 baut hier JWT-Login, Register und Password-Hashing ein.
  ping(): string {
    return 'auth-module-ready';
  }
}
