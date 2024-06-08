import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001, { cors: true })
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  constructor() {}

  @SubscribeMessage('message')
  async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() data) {
    const roomId = socket.data.userId;
    this.server.to(roomId).emit('message', data);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  afterInit(socket: Socket): any {}

  async handleConnection(socket: Socket) {
    const userId = Number(socket.handshake.headers['user-id']);

    socket.data.userId = userId;
    try {
      socket.join(socket.data.userId);
      console.log('connect success', socket.data.userId);
    } catch (e) {
      socket.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log('disconnect', socket.id, socket.data.userId);
  }
}
