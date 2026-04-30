import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // ✅ ১. সবার আগে চেক করি Variable আসছে কিনা
  console.log('🔍 DEBUG: Environment Variables Check');
  console.log('REDIS_URL exists:', !!process.env.REDIS_URL);
  console.log('REDIS_URL value:', process.env.REDIS_URL ? 'Found (Hidden)' : 'NOT FOUND');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  // যদি REDIS_URL না থাকে, তবে সব Variables প্রিন্ট করে দাও যাতে আমরা নাম দেখতে পাই
  if (!process.env.REDIS_URL) {
     console.log('️ Available Keys:', Object.keys(process.env).filter(k => k.includes('REDIS')));
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(` Server running on port ${port}`);
}
bootstrap();