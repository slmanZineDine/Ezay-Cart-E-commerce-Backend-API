import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ISendEmailPayload } from './types/send-email.interface';
import { EmailTemplate } from './types/email-template.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Sends an email to verify the user's email address.
   */
  async sendVerificationEmail(
    email: string,
    username: string,
    token: string,
  ): Promise<void> {
    // Construct the URL dynamically based on the current environment
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/verify?token=${token}`;

    await this.sendMail({
      to: email,
      subject: 'Verify Your Email Address',
      template: EmailTemplate.VERIFICATION,
      context: {
        username,
        verificationUrl,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Sends an email with an OTP for resetting the password.
   */
  async sendPasswordResetEmail(
    email: string,
    username: string,
    otp: string,
  ): Promise<void> {
    await this.sendMail({
      to: email,
      subject: 'Your Password Reset Code',
      template: EmailTemplate.RESET_PASSWORD_OTP,
      context: {
        username,
        otp,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * A generic method to send any type of email
   */
  async sendMail(payload: ISendEmailPayload): Promise<void> {
    const { to, subject, template, context } = payload;

    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template: `./${template}`, // Dynamically resolve the template path
        context, // Inject dynamic data into the template
      });
    } catch (error) {
      // It is a good practice to log the exact error for debugging
      console.error(`Failed to send ${template} email to ${to}:`, error);
      throw new Error('Could not send email');
    }
  }
}
