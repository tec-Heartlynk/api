import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { DeletedAccount } from './delete-account.entity';
import { UserPhoto } from '../user-photo/user-photo.entity';
import { Videos } from '../videos/videos.entity';

import { BlacklistModule } from '../../blacklist/blacklist.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, DeletedAccount, UserPhoto, Videos]),

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),

    BlacklistModule,
  ],

  controllers: [UsersController],

  providers: [UsersService],

  exports: [UsersService],
})
export class UsersModule {}
