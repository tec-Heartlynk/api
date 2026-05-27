import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { SuspensionService } from 'src/modules/mobile/suspension-user/suspension.service';

@Injectable()
export class SuspensionGuard implements CanActivate {
  constructor(private readonly suspensionService: SuspensionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 👇 ADD HERE (START OF FUNCTION)
    const publicRoutes = [
      '/mobile/auth/send-otp',
      '/mobile/auth/verify-otp',
      '/mobile/auth/login',
      '/mobile/auth/register',
    ];

    if (publicRoutes.some((route) => request.url.includes(route))) {
      return true;
    }

    const user = request.user;

    if (!user) {
      return true;
    }

    const userSuspension =
      await this.suspensionService.getByUserIdSuspendedUsers(
        user.userId || user.id,
      );

    if (userSuspension?.suspended) {
      throw new ForbiddenException({
        success: false,
        suspended: true,
        suspension_id: userSuspension.data?.suspension_id,
        message: userSuspension.data?.messages?.[0]?.message,
        suspended_until: userSuspension.data?.suspended_until,
      });
    }

    return true;
  }
}
