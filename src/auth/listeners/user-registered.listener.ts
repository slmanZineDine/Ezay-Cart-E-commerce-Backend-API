import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailVerificationService } from '../services/email-verification.service';
import { EmailService } from 'src/common/modules/email/email.service';
import { UserRegisteredEvent } from '../events/user-registered.event';

@Injectable()
export class UserRegisteredListener {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
    private readonly emailService: EmailService,
  ) {}

  @OnEvent('user.registered')
  async handleUserRegistered(event: UserRegisteredEvent) {
    const rawToken = await this.emailVerificationService.generateAndSaveToken(
      event.userId,
    );

    await this.emailService.sendVerificationEmail(
      event.email,
      event.username,
      rawToken,
    );
  }
}
