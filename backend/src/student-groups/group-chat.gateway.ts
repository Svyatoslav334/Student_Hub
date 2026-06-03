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
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StudentGroupsService } from './student-groups.service';

@Injectable()
@WebSocketGateway({
  cors: { origin: 'http://localhost:5173', credentials: true },
})
export class GroupChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private groupsService: StudentGroupsService,
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
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect() {}

    @SubscribeMessage('joinGroupRoom')
    async handleJoinRoom(
    @MessageBody() groupId: number,
    @ConnectedSocket() client: Socket,
    ) {
    const userId = client.data.userId;

    const hasAccess = await this.groupsService.hasAccessToGroup(groupId, userId);

    if (!hasAccess) {
        client.emit('chatError', 'У вас немає доступу до цього чату');
        client.disconnect();
        return;
    }

    client.join(`group-${groupId}`);

    const messages = await this.groupsService.getGroupMessages(groupId, userId);
    client.emit('messagesHistory', messages);
    }

  @SubscribeMessage('sendGroupMessage')
  async handleSendMessage(
    @MessageBody() body: { groupId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.data.userId;
      const message = await this.groupsService.sendGroupMessage(
        body.groupId,
        userId,
        body.content,
      );

      this.server.to(`group-${body.groupId}`).emit('newMessage', message);
    } catch (err: any) {
      client.emit('chatError', err.message);
    }
  }
}