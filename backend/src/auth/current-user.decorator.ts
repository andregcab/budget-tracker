import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithUser<T = unknown> {
  user?: T;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser<unknown>>();
    return request.user;
  },
);
