import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Sprint 5 Hardening: Enterprise HTTP Security Headers
  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Sprint 6: Serve recovered historical images
  const imagesPath1 = path.resolve(__dirname, '../../../03_IMAGES');
  const imagesPath2 = path.resolve(__dirname, '../../03_IMAGES');
  const imagesPath = fs.existsSync(imagesPath1) ? imagesPath1 : imagesPath2;
  if (fs.existsSync(imagesPath)) {
    app.use('/03_IMAGES', express.static(imagesPath));
  }

  // Uploaded media directory (direct uploads from CMS editor & media library)
  const uploadsDir1 = path.resolve(__dirname, '../../../uploads');
  const uploadsDir2 = path.resolve(__dirname, '../../uploads');
  const uploadsDir3 = path.resolve(process.cwd(), 'uploads');
  const uploadsDir = fs.existsSync(uploadsDir1)
    ? uploadsDir1
    : fs.existsSync(uploadsDir2)
    ? uploadsDir2
    : uploadsDir3;
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  app.setGlobalPrefix('api/v1', {
    exclude: ['sitemap.xml', 'robots.txt', '03_IMAGES/*', 'uploads/*'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('News Publishing & Digital Archive API')
    .setDescription('OpenAPI specification for the Samabima & Rights Now news publishing and searchable historical digital archive.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server listening on: http://localhost:${port}/api/v1`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
