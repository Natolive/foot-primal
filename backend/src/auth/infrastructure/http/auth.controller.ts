import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { loginSchema, signupSchema, type LoginDto, type SignupDto, type UserDto } from '@primal/shared';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../../../common/infrastructure/http/pipes/zod-validation.pipe.js';
import { AuthService } from '../../application/auth.service.js';
import { clearSessionCookie, readSessionCookie, writeSessionCookie } from './session-cookie.js';
import { Authorize, CurrentUser } from './session.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  signup(@Body(new ZodValidationPipe(signupSchema)) dto: SignupDto): Promise<UserDto> {
    return this.auth.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDto> {
    const session = await this.auth.login(dto);
    writeSessionCookie(res, session);
    return session.user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.auth.logout(readSessionCookie(req));
    clearSessionCookie(res);
  }

  @Get('me')
  @Authorize('profile.read')
  me(@CurrentUser() user: UserDto): UserDto {
    return user;
  }
}
