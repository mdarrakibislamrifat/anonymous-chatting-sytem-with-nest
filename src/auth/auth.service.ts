import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async login(username: string) {
    let user = await this.prisma.user.findUnique({ where: { username } });
    
    if (!user) {
      user = await this.prisma.user.create({
        data: { username },
      });
    }

    const token = uuidv4();
    await this.redis.setex(`session:${token}`, 86400, user.id);

    return {
      success: true,
      data: {
        sessionToken: token,
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt,
        },
      },
    };
  }

  async validateToken(token: string): Promise<string | null> {
    const userId = await this.redis.get(`session:${token}`);
    return userId;
  }
}