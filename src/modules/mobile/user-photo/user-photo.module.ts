import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserPhoto } from './user-photo.entity';
import { UserPhotoService } from './user-photo.service';
import { UserPhotoController } from './user-photo.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserPhoto]), UsersModule],

  controllers: [UserPhotoController],

  providers: [UserPhotoService],

  // ✅ IMPORTANT
  exports: [UserPhotoService],
})
export class UserPhotoModule {}
