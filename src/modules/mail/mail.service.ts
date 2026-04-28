import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST') || 'smtp.gmail.com';
    const port = Number(this.configService.get<string>('MAIL_PORT') || 587);
    const secure =
      (this.configService.get<string>('MAIL_SECURE') || 'false') === 'true';

    console.log('MAIL DEBUG:', { host, port, secure });

    this.transporter = nodemailer.createTransport({
      host: host, 
      port: port, 
      secure: secure,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendOtp(email: string, otp: string) {
    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: 'Your OTP Code',
      html: `<h2>Your OTP is: ${otp}</h2>`,
    });
  }

  async sendRegistrationEmail(email: string) {
    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: 'Registration Successful',
      html: `
        <h2>Welcome 🎉</h2>
        <p>Your account has been successfully created.</p>
      `,
    });
  }



}