import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { BlacklistService } from '../blacklist/blacklist.service'; // 👈 ADD

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private otpService: OtpService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
    @InjectRepository(Otp)
    private otpRepo: Repository<Otp>,
    private blacklistService: BlacklistService, // 👈 ADD
  ) {}

  // 🔥 1. SEND OTP (DTO)
  async sendOtp(dto: SendOtpDto) {
    try {
      let email = dto.email.toLowerCase().trim();

      const cooldownSec = Number(
        this.configService.get('OTP_RESEND_COOLDOWN_SECONDS') || 30,
      );

      const existingOtp = await this.otpService.findLatestOtp(email);

      if (existingOtp) {
        const now = Date.now();
        const createdAt = new Date(existingOtp.createdAt).getTime();

        // ✅ Cooldown
        if (now - createdAt < cooldownSec * 1000) {
          const remaining = Math.ceil(
            (cooldownSec * 1000 - (now - createdAt)) / 1000,
          );

          throw new BadRequestException(
            `Please wait ${remaining} seconds before requesting OTP again`,
          );
        }

        // ✅ Active OTP
        if (!existingOtp.verified && new Date() < existingOtp.expiresAt) {
          throw new BadRequestException(
            'OTP already sent. Please use existing OTP or wait for expiry',
          );
        }
      }

      // ✅ Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // ✅ Send email FIRST
      await this.mailService.sendOtp(email, otp);

      // ✅ Save OTP AFTER success
      await this.otpService.saveOtp(email, otp);

      return {
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (error) {
      console.error('SEND OTP ERROR:', error);

      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Failed to send OTP');
    }
  }

  async verifyOtp(dto: VerifyOtpDto) {
    try {
      const email = dto.email.toLowerCase().trim();

      const otpRecord = await this.otpService.findLatestOtp(email);

      if (!otpRecord) {
        throw new BadRequestException('OTP not found');
      }

      const maxAttempts = Number(
        this.configService.get('OTP_MAX_ATTEMPTS') || 3,
      );
      const blockMinutes = Number(
        this.configService.get('OTP_BLOCK_MINUTES') || 10,
      );

      // ❌ Block check
      if (otpRecord.blockedUntil && new Date() < otpRecord.blockedUntil) {
        throw new BadRequestException('Too many attempts. Try later');
      }

      // ❌ Expired check
      if (new Date() > otpRecord.expiresAt) {
        throw new BadRequestException('OTP expired');
      }

      // ❌ Wrong OTP
      if (otpRecord.otp !== dto.otp) {
        otpRecord.attempts += 1;

        if (otpRecord.attempts >= maxAttempts) {
          otpRecord.blockedUntil = new Date(
            Date.now() + blockMinutes * 60 * 1000,
          );
        }

        await this.otpService.updateOtp(otpRecord);

        throw new BadRequestException('Invalid OTP');
      }

      // ✅ OTP VERIFIED
      otpRecord.verified = true;
      otpRecord.attempts = 0;
      otpRecord.blockedUntil = null;

      await this.otpService.updateOtp(otpRecord);

      // 🔥 CHECK USER EXIST OR CREATE
      let user = await this.usersService.findByEmail(email);

      let isNewUser = false;

      if (!user) {
        user = await this.usersService.createUser(email);
        isNewUser = true;
      }

      // 🔐 GENERATE JWT TOKEN
      const token = this.jwtService.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        success: true,
        message: isNewUser
          ? 'OTP verified & new user created'
          : 'OTP verified & user logged in',
        user,
        token,
        isNewUser, // 👈 useful for frontend
      };
    } catch (error) {
      console.error('VERIFY OTP ERROR:', error);

      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('OTP verification failed');
    }
  }

  async checkEmail(email: string) {
    const otp = await this.otpService.findByEmail(email);

    if (otp) {
      throw new Error('OTP already exists');
    }
  }

  //Logout

  async logout(token: string) {
    try {
      const decoded: any = this.jwtService.decode(token);

      if (!decoded) {
        throw new BadRequestException('Invalid token');
      }

      const expiresAt = new Date(decoded.exp * 1000);

      // ✅ Blacklist token
      await this.blacklistService.add(token, expiresAt);

      // ✅ Delete OTP data
      if (decoded.email) {
        await this.otpService.deleteByEmail(decoded.email);
      }

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Logout failed');
    }
  }
}
