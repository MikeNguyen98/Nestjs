import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { CreateUserDto } from './../../dto/user/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
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
  // async login(login: Login): Promise<User> {
  //   try {
  //     const { usernameOrEmail, password } = login;
  //     const existingUser = await this.userRepository.findOne(
  //       usernameOrEmail.includes('@')
  //         ? { email: usernameOrEmail }
  //         : { username: usernameOrEmail },
  //     );
  //     if (!existingUser) {
  //       throw new HttpException(
  //         'User with this username or email does not exist',
  //         HttpStatus.NOT_FOUND,
  //       );
  //     }

  //     const passwordValid = await argon2.verify(
  //       existingUser.password,
  //       password,
  //     );
  //     if (!passwordValid) {
  //       throw new HttpException('Incorrect password', HttpStatus.NOT_FOUND);
  //     }

  //     return existingUser;
  //   } catch (error) {
  //     return null;
  //   }
  // }
  async update(updateUserDto: User): Promise<UpdateResult> {
    return await this.userRepository.update(updateUserDto.id, updateUserDto);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.userRepository.delete(id);
  }
}
