import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { BookModule } from './book/book.module';
import { UserModule } from './user/user.module';
import { EventsModule } from './event.module';

@Module({
  imports: [BookModule, UserModule],
  controllers: [AppController],
  providers: [AppService, EventsModule],
})
export class AppModule {}
