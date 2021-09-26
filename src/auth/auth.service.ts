import { Register } from './../dto/register.dto';
import { UserService } from './../module/user/user.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import TokenPayload from './tokenPayload.interface';
import PostgresErrorCode from 'src/database/postgresErrorCode.enum';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  public async register(user: Register) {
    const { password } = user;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const createdUser = await this.userService.create({
        ...user,
        password: hashedPassword,
      });
      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'User or email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  public async getAuthenticatedUser(
    usernameOrEmail: string,
    plainTextPassword: string,
  ): Promise<any> {
    try {
      const user = await this.userService.findOne(usernameOrEmail);

      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const passwordValid = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!passwordValid) {
      throw new HttpException('Incorrect password', HttpStatus.BAD_REQUEST);
    }
  }
  public getCookieWithJwtToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=60s`;
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }
  public getCookieWithJwtRefreshToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=60s`;
    return {
      cookie,
      token,
    };
  }
  public getCookiesForLogOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }
  public async getUserFromAuthenticationToken(token: string) {
    const payload: TokenPayload = this.jwtService.verify(token, {
      secret: process.env.SECRET,
    });
    if (payload.userId) {
      return this.userService.getById(payload.userId);
    }
  }
}
