import { Inject, Injectable } from '@nestjs/common';

import {
  EMAIL_SENDER,
  type EmailSender,
  PasswordResetEmailData,
  VerificationEmailData,
} from './email-sender.interface';

@Injectable()
export class EmailSenderService {
  constructor(
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
  ) {}

  async sendVerificationEmail(data: VerificationEmailData): Promise<void> {
    await this.emailSender.sendVerificationEmail(data);
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    await this.emailSender.sendPasswordResetEmail(data);
  }
}
