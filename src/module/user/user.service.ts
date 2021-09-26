import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { CreateUserDto } from './../../dto/user/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    // @InjectModel('User') private readonly userModel: Model<User>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(usernameOrEmail: string): Promise<User> {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    );
    if (user) {
      return user;
    }
    throw new HttpException(
      'Username or email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getById(id: number): Promise<User> {
    const user = await User.findOne({ id });
    if (user) {
      return user;
    }
    throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
  }

  async create(user: CreateUserDto): Promise<User> {
    const newUser = await this.userRepository.save(user);
    await this.userRepository.save(newUser);
    return newUser;
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }
  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
    const user = await this.getById(userId);

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }
  async removeRefreshToken(userId: number) {
    return this.userRepository.update(userId, {
      currentHashedRefreshToken: null,
    });
  }

  async update(updateUserDto: User): Promise<UpdateResult> {
    return await this.userRepository.update(updateUserDto.id, updateUserDto);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.userRepository.delete(id);
  }
}
