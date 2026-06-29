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

    const publicRoutes = [
      '/mobile/auth/send-otp',
      '/mobile/auth/verify-otp',
      '/mobile/auth/login',
      '/mobile/auth/register',
      '/admin/employee/login',
    ];

    const currentPath = request.path || request.url;

    if (publicRoutes.some((route) => currentPath.includes(route))) {
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

    const allowedSuspendedRoutes = [
      '/api/mobile/suspension/:id/message',
      '/api/mobile/suspension/:id/chat',
    ];

    const currentRoute = request.route?.path;

    const isAllowed = allowedSuspendedRoutes.includes(currentRoute);

    if (userSuspension?.suspended && isAllowed) {
      return true;
    }

    if (userSuspension?.suspended) {
      throw new ForbiddenException({
        success: false,
        suspended: true,
        suspension_id: userSuspension.data?.suspension_id,
        message:
          'Your account is suspended. You can only communicate with support.',
        suspended_until: userSuspension.data?.suspended_until,
      });
    }

    return true;
  }
}
