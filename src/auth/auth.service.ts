import { ConfigService } from '@nestjs/config';
import { Register } from './../dto/register.dto';
import { UserService } from './../module/user/user.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import PostgresErrorCode from 'src/database/postgresErrorCode.enum';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  public async register(user: Register) {
    const { password } = user;
    const hashedPassword = await argon2.hash(password);
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
      const payload = {
        username: user.username,
        sub: user.id,
        email: user.email,
      };
      return {
        access_token: this.jwtService.sign(payload),
      };
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
    const passwordValid = await argon2.verify(
      hashedPassword,
      plainTextPassword,
    );
    if (!passwordValid) {
      throw new HttpException('Incorrect password', HttpStatus.BAD_REQUEST);
    }
  }
  public getCookieWithJwtToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age='60',
    )}`;
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }
}
