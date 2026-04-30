import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  }

  async onModuleInit() {
    await this.client.connect();
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