import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserPhoto } from './user-photo.entity';
import { UserPhotoService } from './user-photo.service';
import { UserPhotoController } from './user-photo.controller';
import { UsersModule } from '../users/users.module';
import { Profile } from '../profile/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPhoto, Profile]), UsersModule],

  controllers: [UserPhotoController],

  providers: [UserPhotoService],

  // ✅ IMPORTANT
  exports: [UserPhotoService],
})
export class UserPhotoModule {}
