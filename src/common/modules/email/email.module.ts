import { Module } from '@nestjs/common';

import { MailerAdapter } from './mailer/mailer.adapter';
import { MailerInfrastructureModule } from './mailer/mailer.module';
import { EMAIL_SENDER } from './email-sender.interface';

@Module({
  imports: [MailerInfrastructureModule],

  providers: [
    {
      provide: EMAIL_SENDER,
      useExisting: MailerAdapter,
    },
  ],

  exports: [EMAIL_SENDER],
})
export class EmailModule {}
