import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { Users } from '../entities/Users';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async postUsers(email: string, nickname: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (user) {
      throw new Error('이미 존재하는 사용자입니다.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await this.usersRepository.save({
      email,
      nickname,
      password: hashedPassword,
    });
  }
}
