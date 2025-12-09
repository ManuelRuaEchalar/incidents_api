import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <--- IMPORTANTE
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilitar lectura de Cookies
  app.use(cookieParser());

  // 2. ACTIVAR VALIDACIÓN Y TRANSFORMACIÓN GLOBAL
  // Esto hace que @Type(() => Number) funcione en tus DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina campos que no estén en el DTO
      transform: true, // Convierte los tipos (String -> Number) automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 3. Configuración CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();