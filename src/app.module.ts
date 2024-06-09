import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { BookModule } from './book/book.module';
import { UserModule } from './user/user.module';
import { EventGateway } from './event.gateway';
import { UserService } from './user/user.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [BookModule, UserModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, UserService, EventGateway],
})
export class AppModule {}
