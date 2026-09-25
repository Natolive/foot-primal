import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Put, Req, Res } from '@nestjs/common';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  updateAvailabilitySchema,
  updateProfileSchema,
  verifyEmailSchema,
  type ChangePasswordDto,
  type ForgotPasswordDto,
  type LoginDto,
  type ResetPasswordDto,
  type SignupDto,
  type UpdateAvailabilityDto,
  type UpdateProfileDto,
  type UserDto,
  type VerifyEmailDto,
} from '@footix/shared';
import type { Request, Response } from 'express';
import { RateLimit } from '../../../common/infrastructure/http/rate-limit.guard.js';
import { ZodValidationPipe } from '../../../common/infrastructure/http/pipes/zod-validation.pipe.js';
import { AuthService } from '../../application/auth.service.js';
import { clearSessionCookie, readSessionCookie, writeSessionCookie } from './session-cookie.js';
import { Authorize, CurrentUser } from './session.guard.js';

const MINUTE = 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Chaque inscription envoie un mail : protège la boîte visée et le quota Brevo.
  @Post('signup')
  @RateLimit({ by: 'email', limit: 3, windowMs: 60 * MINUTE }, { by: 'ip', limit: 30, windowMs: 60 * MINUTE })
  signup(@Body(new ZodValidationPipe(signupSchema)) dto: SignupDto): Promise<UserDto> {
    return this.auth.signup(dto);
  }

  // Essais de mot de passe par qui a le lien : limite par IP (pas d'email dans le body).
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ by: 'ip', limit: 20, windowMs: 15 * MINUTE })
  async verifyEmail(
    @Body(new ZodValidationPipe(verifyEmailSchema)) dto: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDto> {
    const session = await this.auth.verifyEmail(dto);
    writeSessionCookie(res, session);
    return session.user;
  }

  // Essais de mot de passe sur un compte, et depuis une même machine.
  @Post('login')
  @RateLimit({ by: 'email', limit: 10, windowMs: 15 * MINUTE }, { by: 'ip', limit: 50, windowMs: 15 * MINUTE })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDto> {
    const session = await this.auth.login(dto);
    writeSessionCookie(res, session);
    return session.user;
  }

  // Chaque demande envoie un mail, comme l'inscription.
  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RateLimit({ by: 'email', limit: 3, windowMs: 60 * MINUTE }, { by: 'ip', limit: 30, windowMs: 60 * MINUTE })
  forgotPassword(@Body(new ZodValidationPipe(forgotPasswordSchema)) { email }: ForgotPasswordDto): Promise<void> {
    return this.auth.forgotPassword(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ by: 'ip', limit: 20, windowMs: 15 * MINUTE })
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) dto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDto> {
    const session = await this.auth.resetPassword(dto);
    writeSessionCookie(res, session);
    return session.user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.auth.logout(readSessionCookie(req));
    clearSessionCookie(res);
  }

  @Post('me/onboarding')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Authorize('profile.complete_onboarding')
  completeOnboarding(@CurrentUser() user: UserDto): Promise<void> {
    return this.auth.completeOnboarding(user);
  }

  @Get('me')
  @Authorize('profile.read')
  me(@CurrentUser() user: UserDto): UserDto {
    return user;
  }

  @Patch('me')
  @Authorize('profile.update')
  updateProfile(@CurrentUser() user: UserDto, @Body(new ZodValidationPipe(updateProfileSchema)) dto: UpdateProfileDto): Promise<UserDto> {
    return this.auth.updateProfile(user, dto);
  }

  @Put('me/availability')
  @Authorize('profile.update_availability')
  updateAvailability(
    @CurrentUser() user: UserDto,
    @Body(new ZodValidationPipe(updateAvailabilitySchema)) dto: UpdateAvailabilityDto,
  ): Promise<UserDto> {
    return this.auth.updateAvailability(user, dto);
  }

  // Essais du mot de passe actuel : limite par IP, comme les autres routes qui testent un mot de passe.
  @Post('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Authorize('profile.change_password')
  @RateLimit({ by: 'ip', limit: 10, windowMs: 15 * MINUTE })
  changePassword(
    @CurrentUser() user: UserDto,
    @Req() req: Request,
    @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordDto,
  ): Promise<void> {
    return this.auth.changePassword(user, readSessionCookie(req), dto);
  }
}
