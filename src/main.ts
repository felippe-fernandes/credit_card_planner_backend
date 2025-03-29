import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
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

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Credit Card Planner API')
    .setDescription('The API for the Credit Card Planner application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  document.paths = Object.keys(document.paths)
    .sort()
    .reduce((acc, key) => {
      acc[key] = document.paths[key];
      return acc;
    }, {});

  SwaggerModule.setup('api', app, document);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch((err) => console.error(err));
