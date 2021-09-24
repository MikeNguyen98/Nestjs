/* eslint-disable prettier/prettier */
import { AuthService } from './auth.service';
import { User } from './../module/user/entities/user.entity';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'usernameOrEmail',
    });
  }
  async validate(usernameOrEmail: string, password: string): Promise<User> {
    const user = this.authService.getAuthenticatedUser(
      usernameOrEmail,
      password,
    );
     if (!user) {
       throw new UnauthorizedException();
     }
     return user;
  }
}
