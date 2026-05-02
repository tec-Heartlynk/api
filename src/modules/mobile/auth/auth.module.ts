import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Otp } from './entities/otp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpService } from './otp.service';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../../mail/mail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../../jwt/strategies/jwt.strategy';
import { BlacklistModule } from '../../blacklist/blacklist.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Otp]),
    UsersModule,
    MailModule,
    BlacklistModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(config.get('JWT_EXPIRES_IN_SECONDS') ?? 604800),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, JwtStrategy],
})
export class AuthModule {
  constructor(private configService: ConfigService) {
    console.log('JWT_SECRET 👉', this.configService.get('JWT_SECRET'));
  }
}
