import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClientType;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    
    console.log('🔍 REDIS_URL Check:');
    console.log('  Value:', redisUrl);
    console.log('  Is defined:', redisUrl !== undefined);
    console.log('  Is empty string:', redisUrl === '');
    console.log('  Length:', redisUrl?.length || 0);

    if (!redisUrl || redisUrl.trim() === '') {
      console.error('❌ REDIS_URL is missing or empty!');
      throw new Error('REDIS_URL environment variable is missing or empty!');
    }

    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    this.client.on('connect', () => console.log('✅ Redis Connected'));
  }

  async onModuleInit() {
    try {
      console.log('⏳ Connecting to Redis...');
      await this.client.connect();
      console.log('🎉 Redis Connected Successfully!');
    } catch (error) {
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