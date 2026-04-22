import { Injectable } from '@nestjs/common';
import { Otp } from './entities/otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private repo: Repository<Otp>,
  ) {}

 async saveOtp(email: string, otp: string) {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  const record = this.repo.create({
    email,
    otp,
    expiresAt,
    verified: false,
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


    @Cron(CronExpression.EVERY_MINUTE)
    async deleteExpiredOtps() {
    await this.repo
        .createQueryBuilder()
        .delete()
        .where('expiresAt < :now', { now: new Date() })
        .execute();

    console.log('Expired OTPs deleted');
    }
}