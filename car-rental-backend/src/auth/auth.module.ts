import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt-strategies';
import { PrismaModule } from '../prisma/prisma.module';
import { PasswordResetService } from './services/password-reset.service';
import {AppMailerModule} from "../mailer/mailer.module";

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AppMailerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, PasswordResetService],
  exports: [AuthService, PasswordResetService],
  controllers: [AuthController],
})
export class AuthModule {}
