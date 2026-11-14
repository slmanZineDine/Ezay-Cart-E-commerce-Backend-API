import { ReviewsModule } from './reviews/reviews.module';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UploadsModule } from './uploads/uploads.module';
import { SecurityModule } from './common/modules/security/security.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmConfigService } from './config/typeorm.config';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),

    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    // Global Modules
    SecurityModule,
    UploadsModule,

    // Modules
    AuthModule,
    UsersModule,
    ProductsModule,
    ReviewsModule,

    // ORM
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),

    // Allow maximum 10 requests per 60 seconds (60000 ms)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    // Apply rate limiting globally across all routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
