import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp.service';
import { UsersService } from '../users/users.service';
import { Role } from '../users/user.entity';
import { MailService } from '../mail/mail.service';
import { BadRequestException, InternalServerErrorException,} from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private otpService: OtpService,
    private jwtService: JwtService,
    private mailService: MailService,

  ) {}

  // 1. SEND OTP
  async sendOtp(email: string) {
  try {
    email = email.toLowerCase().trim();

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // ✅ Check user exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // ✅ Check existing OTP
    const existingOtp = await this.otpService.findLatestOtp(email);

    if (
      existingOtp &&
      !existingOtp.verified &&
      new Date() < existingOtp.expiresAt
    ) {
      throw new BadRequestException(
        'OTP already sent. Please wait before requesting again',
      );
    }

    // ✅ Cooldown (30 sec)
    if (existingOtp) {
      const diff =
        Date.now() - new Date(existingOtp.createdAt).getTime();

      if (diff < 30000) {
        throw new BadRequestException(
          'Please wait 30 seconds before requesting again',
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

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new InternalServerErrorException('Failed to send OTP');
  }
}

  // 2. VERIFY OTP + REGISTER + LOGIN
  async verifyOtp(dto: any) {
    const otpRecord = await this.otpService.findOtp(dto.email, dto.otp);

    if (!otpRecord) {
      throw new BadRequestException('Invalid OTP');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP expired');
    }

    await this.otpService.markVerified(dto.email);

    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      role:  Role.USER,
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Registered successfully',
      user,
      token,
    };
  }
}