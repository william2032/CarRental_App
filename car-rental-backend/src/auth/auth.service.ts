import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import {
  IAuthService,
  JwtPayload,
  LoginResponse,
  RegisterResponse,
} from '../users/interfaces/auth.interface';
import { UserService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dtos/auth.dto';
import { RegisterUserDto } from '../users/dtos';
import { UserResponse } from '../users/interfaces/user.interface';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterUserDto): Promise<RegisterResponse> {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create the user using UserService
    const user = await this.userService.create({
      phone: registerDto.phone,
      email: registerDto.email,
      password: registerDto.password,
      name: registerDto.name,
      role: registerDto.role,
    });

    //send email
    await this.mailerService.sendWelcomeEmail(user.email, user.name);

    // Generate JWT token
    const access_token = await this.generateJwtToken(user);
    const expires_in = 24 * 60 * 60; // 24 hours in seconds

    return {
      message: 'Registration successful',
      user,
      access_token,
      token_type: 'Bearer',
      expires_in,
    };
  }

  async login(loginDto: LoginUserDto): Promise<LoginResponse> {
    // Validate user credentials
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const access_token = await this.generateJwtToken(user);
    const expires_in = 24 * 60 * 60; // 24 hours in seconds

    return {
      message: 'Login successful',
      user,
      access_token,
      token_type: 'Bearer',
      expires_in,
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponse | null> {
    // Find user by email (this returns user with password)
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }

    // Verify password
    const isPasswordValid = await this.userService.verifyPassword(
      user,
      password,
    );
    if (!isPasswordValid) {
      return null;
    }

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as UserResponse;
  }

  async generateJwtToken(user: UserResponse): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async verifyPayloadAndGetUser(
    payload: JwtPayload,
  ): Promise<UserResponse | null> {
    const user = await this.userService.findOne(payload.sub);

    if (!user || user.email !== payload.email || user.role !== payload.role) {
      return null;
    }

    return user;
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Refresh JWT token
   * @param user - User data
   * @returns Promise<string> - New JWT token
   */
  async refreshToken(user: UserResponse): Promise<string> {
    return this.generateJwtToken(user);
  }
}
