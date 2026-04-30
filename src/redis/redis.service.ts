import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClientType;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    
    // ✅ কোনো ডিফল্ট মান দেবেন না। যদি না থাকে তবে এরর ফেল করুন।
    if (!redisUrl) {
      throw new Error('FATAL: REDIS_URL is not defined in environment!');
    }

    console.log('🔌 Connecting to Redis at:', redisUrl.substring(0, 15) + '...');

    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      console.log('🎉 Redis Connected Successfully!');
    } catch (error) {
      console.error('❌ Redis Connection Failed:', error.message);
      throw error;
    }
  }

  // ... বাকি কোড একই থাকবে ...
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