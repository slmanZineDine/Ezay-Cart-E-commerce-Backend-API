import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailVerificationService } from '../services/email-verification.service';
import { EmailSenderService } from 'src/common/modules/email/email-sender.service';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { EMAIL_SENDER } from 'src/common/modules/email/email-sender.interface';

@Injectable()
export class UserRegisteredListener {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
    @Inject(EMAIL_SENDER)
    private readonly emailService: EmailSenderService,
  ) {}

  @OnEvent('user.registered')
  async handleUserRegistered(event: UserRegisteredEvent) {
    const rawToken = await this.emailVerificationService.generateAndSaveToken(
      event.userId,
    );

    await this.emailService.sendVerificationEmail({
      email: event.email,
      username: event.username,
      token: rawToken,
    });
  }
}
