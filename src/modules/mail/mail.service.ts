import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const host =
      this.configService.get<string>('MAIL_HOST') || 'smtp.gmail.com';

    const port = Number(this.configService.get<string>('MAIL_PORT') || 587);

    const secure =
      (this.configService.get<string>('MAIL_SECURE') || 'false') === 'true';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: this.configService.get<string>('MAIL_USER') || '',
        pass: this.configService.get<string>('MAIL_PASS') || '',
      },
    });
  }

  // ✅ Send OTP Email
  async sendOtp(email: string, otp: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: email,
        subject: 'Your OTP Code',
        html: `
          <div style="font-family: Arial; text-align: center;">
            <h2>Your OTP Code</h2>
            <p style="font-size: 20px; font-weight: bold;">${otp}</p>
            <p>This OTP is valid for a limited time.</p>
          </div>
        `,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Mail sending failed:', error.message);
        throw new InternalServerErrorException(
          `Failed to send OTP email: ${error.message}`,
        );
      }

      console.error('Mail sending failed:', error);
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }

  // ✅ Send Registration Email
  async sendRegistrationEmail(email: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: email,
        subject: 'Registration Successful',
        html: `
          <div style="font-family: Arial; text-align: center;">
            <h2>Welcome 🎉</h2>
            <p>Your account has been successfully created.</p>
          </div>
        `,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Mail sending failed:', error.message);
        throw new InternalServerErrorException(
          `Failed to send registration email: ${error.message}`,
        );
      }

      console.error('Mail sending failed:', error);
      throw new InternalServerErrorException(
        'Failed to send registration email',
      );
    }
  }
}
