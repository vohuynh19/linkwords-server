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
import { UserService } from './user/user.service';

@WebSocketGateway(3001, { cors: true })
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  roomAgreement: {
    [roomid: string]: string[];
  };
  userIdList: string[];
  constructor(private readonly userService: UserService) {
    this.userIdList = [];
    this.roomAgreement = {};
  }

  @SubscribeMessage('enqueue')
  async handleEnqueue(@ConnectedSocket() socket: Socket) {
    const userId = socket.data.userId;

    console.log('enqueue', userId);

    if (!this.userIdList.includes(userId)) {
      this.userIdList.push(userId);
    }

    const match = this.createMatch();

    if (match != null) {
      const userId1 = match[0];
      const userId2 = match[1];
      const roomId = `${userId1}-${userId2}`;
      this.server.to(userId1).emit('matchRoom', {
        roomId,
        competitorId: userId2,
      });
      this.server.to(userId2).emit('matchRoom', {
        roomId,
        competitorId: userId1,
      });
    }
  }

  @SubscribeMessage('dequeue')
  async handleDequeue(@ConnectedSocket() socket: Socket) {
    const userId = socket.data.userId;
    console.log('dequeue', userId);

    this.userIdList = this.userIdList.filter((item) => item != userId);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    console.log('joinRoom', data.roomId);

    socket.join(data.roomId);
    this.server.to(data.roomId).emit('joinRoomSuccess', data.roomId);
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    console.log('leaveRoom', data.roomId);

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
    console.log('message', data.roomId, data.message);
    this.server.to(data.roomId).emit('message', data.message);
  }

  @SubscribeMessage('ready')
  async handleReady(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomId,
    }: {
      roomId: string;
    },
  ) {
    const userId = socket.data.userId;
    console.log('ready', userId);

    if (!this.roomAgreement[roomId]) {
      this.roomAgreement[roomId] = [];
    }

    if (!this.roomAgreement[roomId].includes(userId)) {
      this.roomAgreement[roomId].push(userId);
    }

    if (this.roomAgreement[roomId].length === 2) {
      const first_user = this.roomAgreement[roomId][0];

      this.server.to(roomId).emit('startGame', {
        startUserId: first_user,
      });
    }
  }

  @SubscribeMessage('endgame')
  async handleLosegame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomId: string,
  ) {
    const userId = socket.data.userId as string;
    console.log('endgame', userId);

    this.server.to(roomId).emit('endgame', {
      loserId: userId,
    });
  }

  @SubscribeMessage('pointIncrease')
  async handleIncreasePoint(@ConnectedSocket() socket: Socket) {
    const userId = socket.data.userId as string;
    console.log('pointIncrease', userId);

    const currentUser = await this.userService.getUser(Number(userId));

    // Update User Point
    await this.userService.updateUser(Number(userId), {
      username: currentUser.username,
      point: currentUser.point + 25,
    });

    this.server.to(socket.data.userId).emit('pointUpdate');
  }

  @SubscribeMessage('pointDecrease')
  async handleDecreasePoint(@ConnectedSocket() socket: Socket) {
    const userId = socket.data.userId as string;
    console.log('pointDecrease', userId);

    const currentUser = await this.userService.getUser(Number(userId));

    const newpoint = currentUser.point - 25;

    // Update User Point
    await this.userService.updateUser(Number(userId), {
      username: currentUser.username,
      point: newpoint > 0 ? newpoint : 0,
    });

    this.server.to(socket.data.userId).emit('pointUpdate');
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
