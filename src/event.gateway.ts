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

  userIdList: string[];
  constructor() {
    this.userIdList = [];
  }

  @SubscribeMessage('enqueue')
  async handleEnqueue(@ConnectedSocket() socket: Socket) {
    const userId = socket.data.userId;
    if (!this.userIdList.includes(userId)) {
      this.userIdList.push(userId);
    }

    const match = this.createMatch();

    if (match != null) {
      const userId1 = match[0];
      const userId2 = match[1];
      const roomId = `${userId1}-${userId2}`;
      this.server.to(userId1).emit('matchRoom', roomId);
      this.server.to(userId2).emit('matchRoom', roomId);
    }
  }

  @SubscribeMessage('dequeue')
  async handleDequeue(@ConnectedSocket() socket: Socket) {
    const userId = socket.data.userId;
    this.userIdList = this.userIdList.filter((item) => item != userId);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    socket.join(data.roomId);
    this.server.to(data.roomId).emit('joinRoomSuccess', data.roomId);
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    this.server.to(data.roomId).emit('leaveRoomSuccess', data.roomId);
    socket.leave(data.roomId);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: {
      roomId: string;
      message: string;
    },
  ) {
    this.server.to(data.roomId).emit('message', data.message);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  afterInit(): any {}

  async handleConnection(socket: Socket) {
    const userId = Number(socket.handshake.headers['user-id']);

    console.log(`connection ${userId}`);

    socket.data.userId = userId;
    try {
      socket.join(socket.data.userId);
      console.log('connect success', socket.data.userId);
    } catch (e) {
      socket.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log(
      'disconnect',
      `socket-id: ${socket.id}`,
      `userid: ${socket.data.userId}`,
    );
  }

  createMatch() {
    if (this.userIdList.length >= 2) {
      const id1 = this.userIdList.pop();
      const id2 = this.userIdList.pop();
      return [id1, id2];
    }
    return null;
  }
}
