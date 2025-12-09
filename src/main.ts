import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'; // <--- Importar esto

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilitar lectura de Cookies
  app.use(cookieParser());

  // 2. Configuración CORS para Web + Móvil con Cookies
  app.enableCors({
    // 'origin: true' es el truco. Permite que cualquier origen (Web puerto 4000, 
    // o cualquier IP móvil) envíe credenciales sin usar '*' explícitamente.
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // <--- Necesario para que las cookies viajen
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();