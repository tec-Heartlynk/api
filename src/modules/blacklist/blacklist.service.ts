import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlacklistedToken } from './blacklist.entity';

@Injectable()
export class BlacklistService {
  constructor(
    @InjectRepository(BlacklistedToken)
    private repo: Repository<BlacklistedToken>,
  ) {}

  async add(token: string, expiresAt: Date) {
    const entry = this.repo.create({ token, expiresAt });
    return this.repo.save(entry);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const exists = await this.repo.findOne({ where: { token } });
    return !!exists;
  }
}
