import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import {
  Injectable,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { ClubsService } from './clubs.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ClubChatGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private clubsService: ClubsService,
    private jwtService: JwtService,
  ) {}

async handleConnection(client: Socket) {
  try {
    const token = client.handshake.auth.token;

    if (!token) {
      client.disconnect();
      return;
    }

    const payload = this.jwtService.verify(token);

    client.data.userId = payload.sub;
  } catch (e: any) {

    client.disconnect();
  }
}

  handleDisconnect() {}

  @SubscribeMessage(
    'joinClubRoom',
  )
  async handleJoinRoom(
    @MessageBody() clubId: number,
    @ConnectedSocket()
    client: Socket,
  ) {
    const userId =
      client.data.userId;

    const isMember = await this.clubsService.isMember(clubId, userId);
    const isLeader = await this.clubsService.isClubLeader(clubId, userId);

    if (!isMember && !isLeader) {
      client.emit('chatError', 'Немає доступу до чату');
      client.disconnect();
      return;
    }

    client.join(`club-${clubId}`);

    const messages =
      await this.clubsService.getMessages(
        clubId,
        userId,
      );

    client.emit(
      'messagesHistory',
      messages,
    );
  }

  @SubscribeMessage(
    'sendMessage',
  )
  async handleSendMessage(
    @MessageBody()
    body: {
      clubId: number;
      content: string;
    },

    @ConnectedSocket()
    client: Socket,
  ) {
    try {
      const userId =
        client.data.userId;

      const message =
        await this.clubsService.sendMessage(
          body.clubId,
          userId,
          body.content,
        );

      this.server
        .to(`club-${body.clubId}`)
        .emit(
          'newMessage',
          message,
        );
    } catch (err: any) {
      client.emit(
        'chatError',
        err.message,
      );
    }
  }
}