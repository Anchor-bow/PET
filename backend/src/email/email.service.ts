import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import Handlebars from 'handlebars';

export interface SendMailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface SendTemplateOptions extends SendMailOptions {
  template: string;
  context: Record<string, unknown>;
}

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly templatesDir: string;
  private readonly enabled: boolean;

  constructor(config: ConfigService) {
    this.from = config.get<string>('SMTP_FROM', 'noreply@pet.local');
    this.templatesDir = path.resolve(__dirname, 'templates');
    this.enabled = config.get<string>('SMTP_HOST') !== undefined && config.get<string>('SMTP_HOST') !== '';

    this.transporter = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST', 'sandbox.smtp.mailtrap.io'),
      port: config.get<number>('SMTP_PORT', 2525),
      auth: {
        user: config.get<string>('SMTP_USER', ''),
        pass: config.get<string>('SMTP_PASS', ''),
      },
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    if (!this.enabled) return;

    await this.transporter.sendMail({
      from: this.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }

  async sendTemplate(options: SendTemplateOptions): Promise<void> {
    const templatePath = path.join(this.templatesDir, `${options.template}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(source);
    const html = template(options.context);

    await this.sendMail({ to: options.to, subject: options.subject, html, text: options.text });
  }
}
