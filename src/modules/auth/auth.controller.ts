import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './strategies/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 🔥 1. SEND OTP
  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  // 🔥 2. VERIFY OTP
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  // 🔥 3. RESEND OTP
  @Post('resend-otp')
  resendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req) {
    const token = req.headers.authorization.split(' ')[1];
    return this.authService.logout(token);
  }
}
