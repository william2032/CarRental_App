import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../users/users.service';
import { JwtPayload } from '../../users/interfaces/auth.interface';
import {UserResponse} from "../../users/interfaces/user.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ??
        (() => {
          throw new Error('JWT_SECRET is not defined');
        })(),
    });
  }

  async validate(payload: JwtPayload): Promise<UserResponse> {
    const user = await this.userService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
