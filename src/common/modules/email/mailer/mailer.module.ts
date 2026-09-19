import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';

import { MailerAdapter } from './mailer.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: configService.get<string>('MAIL_SECURE') === 'true',

          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },

        defaults: {
          from: '"Ezaycart Support" <no-reply@ezaycart.com>',
        },

        template: {
          dir: join(
            process.cwd(),
            'src',
            'common',
            'modules',
            'email',
            'templates',
          ),

          adapter: new HandlebarsAdapter(),

          options: {
            strict: true,
          },
        },
      }),
    }),
  ],

  providers: [MailerAdapter],
  exports: [MailerAdapter],
})
export class MailerInfrastructureModule {}
