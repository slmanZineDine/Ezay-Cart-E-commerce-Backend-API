import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setDefaultResultOrder } from 'node:dns';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';

setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('v1/api');

  // Enabling global validation with security features
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip away properties that don't have decorators in DTO
      forbidNonWhitelisted: true, // Throw error if extra properties are sent
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  // Enable cookie parsing middleware
  app.use(cookieParser());

  // Apply the unified exception filter globally
  app.useGlobalFilters(new AllExceptionsFilter());

  // --- Swagger Configuration ---

  // 1. Configure the DocumentBuilder with basic API information
  const config = new DocumentBuilder()
    .setTitle('Ezay Cart API')
    .setDescription('Detailed documentation for the API endpoints')
    .setVersion('1.0')
    .addServer(
      process.env.API_URL ?? 'http://localhost:3001/v1/api',
      'Development Server',
    ) // Add server URL for Swagger
    // Enable JWT Bearer Authentication in the Swagger UI
    .addBearerAuth()
    .build();

  // 2. Create the Swagger document instance based on the configuration
  const document = SwaggerModule.createDocument(app, config);

  // 3. Setup the Swagger UI endpoint (Accessible at: /v1/api/docs)
  SwaggerModule.setup('v1/api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
