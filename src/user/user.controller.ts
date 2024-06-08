import {
  Body,
  Controller,
  // Delete,
  Get,
  Param,
  Post,
  // Put,
  // Req,
  // Res,
} from '@nestjs/common';
import { UserService } from './user.service';
// import { Request, Response } from 'express';
import { User } from './user.model';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUser(@Param('id') id: number): Promise<User | null> {
    return this.userService.getUser(id);
  }

  @Post()
  async postBook(@Body() postData: User): Promise<User> {
    return this.userService.createUser(postData);
  }
}
