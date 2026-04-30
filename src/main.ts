// src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for all origins (needed for frontend/Postman)
  app.enableCors(); 

  // Get port from environment or default to 3000
  const port = process.env.PORT || 3000;
  
  // CRITICAL: Listen on 0.0.0.0 so Railway can access it
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`🌐 Public URL: http://localhost:${port}`); // Local test only
}
bootstrap();