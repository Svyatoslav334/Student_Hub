import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return {
      sub: user?.sub || user?.userId,
      userId: user?.userId || user?.sub,
      email: user?.email,
      role: user?.role,
    };
  },
);