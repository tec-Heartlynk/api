import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { BlacklistService } from '../../../blacklist/blacklist.service'; // 👈 ADD

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private blacklistService: BlacklistService, // 👈 ADD
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is missing in .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      passReqToCallback: true, // 👈 ADD (IMPORTANT)
    });
  }

  // 👇 CHANGE HERE (req add kiya)
  async validate(req: Request, payload: any) {
    const authHeader = req.headers['authorization'];

    const token = authHeader?.split(' ')[1];

    // 🔥 BLACKLIST CHECK
    if (token && await this.blacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    return {
      userId: payload.id,
      email: payload.email,
      role: payload.role,
    };
  }
}