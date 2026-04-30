import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClientType;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    
    // Debug log to verify if Railway is passing the variable
    console.log('Checking REDIS_URL:', redisUrl ? 'Found ✅' : 'Not Found ❌');

    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is missing!');
    }

    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
  }

  async onModuleInit() {
    try {
      console.log('Connecting to Redis...');
      await this.client.connect();
      console.log('Redis Connected Successfully! ');
    } catch (error) {
      console.error('Failed to connect to Redis:', error.message);
      // Throw error to crash the app if Redis fails (better than running broken)
      throw error; 
    }
  }

  async setex(key: string, seconds: number, value: string) {
    await this.client.setEx(key, seconds, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async publish(channel: string, message: string) {
    await this.client.publish(channel, message);
  }

  getClient() {
    return this.client;
  }
}