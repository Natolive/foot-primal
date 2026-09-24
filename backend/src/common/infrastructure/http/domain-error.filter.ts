import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../../domain/errors.js';

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const status =
      error instanceof NotFoundError
        ? HttpStatus.NOT_FOUND
        : error instanceof ConflictError
          ? HttpStatus.CONFLICT
          : error instanceof UnauthorizedError
            ? HttpStatus.UNAUTHORIZED
            : error instanceof ForbiddenError
              ? HttpStatus.FORBIDDEN
              : error instanceof TooManyRequestsError
                ? HttpStatus.TOO_MANY_REQUESTS
                : HttpStatus.BAD_REQUEST;
    host.switchToHttp().getResponse<Response>().status(status).json({ statusCode: status, message: error.message });
  }
}
