import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleSignInDto } from './dto/google-signin.dto';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

import { Public } from '../../jwt/strategies/public.decorator';

@Controller('mobile/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 🔥 1. SEND OTP
  @Public()
  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  // 🔥 2. VERIFY OTP
  @Public()
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  // 🔥 GOOGLE LOGIN
  @Public()
  @Post('google')
  verifyGoogle(@Body() dto: GoogleSignInDto) {
    return this.authService.verifyGoogle(dto);
  }

  // 🔥 RESEND OTP
  @Public()
  @Post('resend-otp')
  resendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  // 🔐 LOGOUT
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req) {
    const token = req.headers.authorization.split(' ')[1];

    return this.authService.logout(token);
  }
}
