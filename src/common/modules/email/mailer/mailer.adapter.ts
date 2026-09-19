import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import {
  EmailSender,
  PasswordResetEmailData,
  VerificationEmailData,
} from '../email-sender.interface';

@Injectable()
export class MailerAdapter implements EmailSender {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(data: VerificationEmailData): Promise<void> {
    await this.mailerService.sendMail({
      to: data.email,
      subject: 'Verify your email',
      template: 'verification',
      context: {
        username: data.username,
        token: data.token,
      },
    });
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    await this.mailerService.sendMail({
      to: data.email,
      subject: 'Reset your password',
      template: 'password-reset',
      context: {
        username: data.username,
        otp: data.otp,
      },
    });
  }
}
