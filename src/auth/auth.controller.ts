import { UserService } from './../module/user/user.service';
import { Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { Register } from './../dto/register.dto';
import { AuthService } from './auth.service';
import {
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
  Body,
  Res,
  Get,
  Request,
} from '@nestjs/common';
import RequestWithUser from './requestWithUser.interface';
import JwtAuthenticationGuard from './jwt-auth.guard';
import JwtRefreshGuard from './jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() registrationData: Register) {
    return this.authService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser) {
    const { user } = request;
    const accessTokenCookie = this.authService.getCookieWithJwtToken(user.id);
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authService.getCookieWithJwtRefreshToken(user.id);
    await this.userService.setCurrentRefreshToken(refreshToken, user.id);
    request.res.setHeader('Set-Cookie', [
      accessTokenCookie,
      refreshTokenCookie,
    ]);
    return user;
  }
  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  @HttpCode(200)
  async logOut(@Req() request: RequestWithUser) {
    await this.userService.removeRefreshToken(request.user.id);
    request.res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
  }
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser) {
    const accessTokenCookie = this.authService.getCookieWithJwtToken(
      request.user.id,
    );

    request.user.password = undefined;
    request.res.setHeader('Set-Cookie', accessTokenCookie);
    return request.user;
  }
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    const user = request.user;
    user.password = undefined;
    return user;
  }
}
