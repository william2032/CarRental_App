import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginResponse,
  RegisterResponse,
} from '../users/interfaces/auth.interface';
import {ForgotPasswordDto, LoginUserDto, ResetPasswordDto} from '../users/dtos/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasswordResetService } from './services/password-reset.service';
import { RegisterUserDto } from '../users/dtos';
import { AuthRequest } from '../common/interface/auth-request.interface';
import { UserResponse } from '../users/interfaces/user.interface';
import {ApiOperation, ApiResponse} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private passwordResetService: PasswordResetService,
  ) {}

  /**
   * Register a new user
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterUserDto,
  ): Promise<RegisterResponse> {
    return await this.authService.register(registerDto);
  }

  /**
   * Login user
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUserDto): Promise<LoginResponse> {
    return await this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: AuthRequest): {
    message: string;
    user: UserResponse;
  } {
    return {
      message: 'Profile retrieved successfully',
      user: req.user,
    };
  }

  /**
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Request() req: AuthRequest): Promise<{
    message: string;
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    const access_token = await this.authService.refreshToken(req.user);

    return {
      message: 'Token refreshed successfully',
      access_token,
      token_type: 'Bearer',
      expires_in: 24 * 60 * 60, // 24 hours
    };
  }

  /**
   * Logout user (client-side token invalidation)
   * POST /auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logout(): {
    message: string;
  } {
    return {
      message:
        'Logout successful. Please remove the token from client storage.',
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.passwordResetService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token or password' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(
      dto.token,
      dto.password,
      dto.confirmPassword,
    );
  }

  @Get('verify-reset-token/:token')
  @ApiOperation({ summary: 'Verify if reset token is valid' })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  async verifyResetToken(@Param('token') token: string) {
    return this.passwordResetService.verifyResetToken(token);
  }
}
