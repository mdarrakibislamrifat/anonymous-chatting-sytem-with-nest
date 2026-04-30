import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import { AuthService } from '../auth/auth.service';
import { createAdapter } from '@socket.io/redis-adapter';

@WebSocketGateway({ cors: true, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private redis: RedisService,
    private auth: AuthService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;
    const userId = await this.auth.validateToken(token);

    if (!userId) {
      client.disconnect(true);
      return;
    }

    const pubClient = this.redis.getClient().duplicate();
    const subClient = this.redis.getClient().duplicate();
    await pubClient.connect();
    await subClient.connect();

    this.server.adapter(createAdapter(pubClient, subClient));

    client.data.userId = userId;
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      await this.redis.publish('user:disconnected', JSON.stringify({ userId }));
    }
  }


@SubscribeMessage('room:join')
async handleRoomJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
  client.join(data.roomId);
  
  const userId = client.data.userId;
  const redisClient = this.redis.getClient(); 

  await redisClient.sAdd(`room:${data.roomId}:users`, userId);
  const userCount = await redisClient.sCard(`room:${data.roomId}:users`);
  
  client.emit('room:joined', { roomId: data.roomId, userCount });
  client.to(data.roomId).emit('room:user_joined', { userId, userCount });
}

@SubscribeMessage('room:leave')
async handleRoomLeave(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
  client.leave(data.roomId);
  
  const userId = client.data.userId;
  const redisClient = this.redis.getClient();

  await redisClient.sRem(`room:${data.roomId}:users`, userId);
  const userCount = await redisClient.sCard(`room:${data.roomId}:users`);
  
  client.to(data.roomId).emit('room:user_left', { userId, userCount });
}
}