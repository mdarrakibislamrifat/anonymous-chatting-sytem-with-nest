import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private auth: AuthService,
  ) {}

  async findAll() {
    const rooms = await this.prisma.room.findMany({
      include: {
        creator: true,
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rooms.map(room => ({
      id: room.id,
      name: room.name,
      creatorId: room.creatorId,
      createdAt: room.createdAt,
      messageCount: room._count.messages,
    }));
  }

  async create(name: string, token: string) {
    if (!name || name.length < 3 || name.length > 32) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Room name must be 3-32 characters' },
      };
    }

    const userId = await this.auth.validateToken(token);
    if (!userId) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid session' },
        status: HttpStatus.UNAUTHORIZED,
      };
    }

    try {
      const room = await this.prisma.room.create({
        data: { name, creatorId: userId },
        include: { creator: true },
      });

      return {
        success: true,
        data: {
          id: room.id,
          name: room.name,
          creatorId: room.creatorId,
          createdAt: room.createdAt,
        },
      };
    } catch (e) {
      return {
        success: false,
        error: { code: 'ROOM_NAME_TAKEN', message: 'Room name already exists' },
      };
    }
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { creator: true, _count: { select: { messages: true } } },
    });

    if (!room) {
      return {
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' },
      };
    }

    return {
      id: room.id,
      name: room.name,
      creatorId: room.creatorId,
      createdAt: room.createdAt,
      messageCount: room._count.messages,
    };
  }

  async remove(id: string, token: string) {
    const userId = await this.auth.validateToken(token);
    const room = await this.prisma.room.findUnique({ where: { id } });

    if (!room) {
      return {
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' },
      };
    }

    if (room.creatorId !== userId) {
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only creator can delete' },
      };
    }

    await this.prisma.room.delete({ where: { id } });
    await this.redis.publish('room:deleted', JSON.stringify({ roomId: id }));
  }

  async getMessages(roomId: string, limit: number, before?: string) {
    const messages = await this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(before && { cursor: { id: before }, skip: 1 }),
    });

    return {
      messages: messages.reverse(),
      nextCursor: messages.length > 0 ? messages[0].id : null,
    };
  }

  async sendMessage(roomId: string, content: string, token: string) {
    const userId = await this.auth.validateToken(token);
    if (!userId) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid session' },
      };
    }

    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return {
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' },
      };
    }

    if (!content || content.trim().length === 0 || content.length > 1000) {
      return {
        success: false,
        error: { code: 'MESSAGE_TOO_LONG', message: 'Content must be 1-1000 chars' },
      };
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
  return {
    success: false,
    error: { code: 'USER_NOT_FOUND', message: 'User profile not found' },
  };
}

    const message = await this.prisma.message.create({
      data: {
        content: content.trim(),
        username: user.username,
        roomId: roomId,
        authorId: userId, 
      },
    });

    await this.redis.publish(
      `room:${roomId}:messages`,
      JSON.stringify({
        id: message.id,
        content: message.content,
        username: message.username,
        roomId: message.roomId,
        createdAt: message.createdAt,
      }),
    );

    return {
      success: true,
      data: message,
    };
  }
}