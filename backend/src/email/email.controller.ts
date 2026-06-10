import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailService } from './email.service';

class SendTestEmailDto {
  to!: string;
  subject!: string;
  text!: string;
}

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test')
  @HttpCode(200)
  async sendTest(@Body() dto: SendTestEmailDto) {
    await this.emailService.sendMail({ to: dto.to, subject: dto.subject, text: dto.text });
    return { message: 'Test email sent' };
  }
}
