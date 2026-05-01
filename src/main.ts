import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { SwaggerModule } from '@nestjs/swagger/dist';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);  
  // Global error handler
  app.use((err, req, res, next) => {
    console.error('🔴 GLOBAL ERROR:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: err.message, error: 'Internal Server Error', statusCode: 500 });
    }
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Dating App API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalInterceptors(new ResponseInterceptor(app.get(ConfigService)));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
