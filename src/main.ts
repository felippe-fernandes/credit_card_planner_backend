import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './interceptors/http-exceptions.interceptor';
import { ResponseInterceptor } from './interceptors/response.interceptor';

dotenv.config();

void ConfigModule.forRoot({
  envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalFilters(new HttpExceptionFilter());

  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Credit Card Planner - Swagger')
    .setDescription('The API for the Credit Card Planner application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  document.paths = Object.keys(document.paths)
    .sort()
    .reduce((acc, key) => {
      acc[key] = document.paths[key];
      return acc;
    }, {});

  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Credit Card Planner - Swagger',
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  const serverUrl = process.env.NODE_ENV === 'production' ? `Port ${port}` : `http://localhost:${port}`;

  console.log(`🚀 Server running at ${serverUrl} in ${process.env.NODE_ENV ?? 'development'} mode`);
}
bootstrap().catch((err) => console.error(err));
