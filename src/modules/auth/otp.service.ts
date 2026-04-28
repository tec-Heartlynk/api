import { Injectable } from '@nestjs/common';
import { Otp } from './entities/otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private repo: Repository<Otp>,
    private configService: ConfigService,   
  ) {}

 async saveOtp(email: string, otp: string) {

  const expiryMinutes = Number(this.configService.get<string>('OTP_EXPIRY_MINUTES') || 2);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000); // expiryMinutes 2 min

  const record = this.repo.create({
    email,
    otp,
    expiresAt,
    verified: false,
    attempts: 0,
  });

  return this.repo.save(record);
}

  findOtp(email: string, otp: string) {
    return this.repo.findOne({
      where: { email, otp, verified: false },
    });
  }

  async markVerified(email: string) {
    const record = await this.repo.findOne({ where: { email } });

    if (record) {
      record.verified = true;
      return this.repo.save(record);
    }
  }

  //findLatestOtp
   async findLatestOtp(email: string) {
    return this.repo.findOne({
        where: { email },
        order: { createdAt: 'DESC' },
    });
    }

    //Update attempts and block if necessary
    

    async updateOtp(data: any) {
        return this.repo.save(data);
      }

    async findByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
    });
  }


    //REMOVE OTPs after expiry CHECK EVERY MINUTE
    @Cron(CronExpression.EVERY_MINUTE)
    async deleteExpiredOtps() {
    await this.repo
        .createQueryBuilder()
        .delete()
        .where('expiresAt < :now', { now: new Date() })
        .execute();

       //console.log('Expired OTPs deleted');
    }
}