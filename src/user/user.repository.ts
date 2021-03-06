import { Repository, EntityRepository } from 'typeorm';
import { v1 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';

import AuthSignUpCredentialsDTO from '../auth/dto/auth-sign-up-credentials.dto';
import AuthSignInCredentialsDTO from 'src/auth/dto/auth-sign-in-credentials.dto';

import User from './user.entity';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
  async signUp(authSignUpCredentials: AuthSignUpCredentialsDTO): Promise<void> {
    const { nickname, password, birthday } = authSignUpCredentials;

    const user = new User();
    user.id = uuid();
    user.birthday = birthday;
    user.nickname = nickname;
    user.passwordSalt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.passwordSalt);

    try {
      await user.save();
    } catch (error) {
      if (error.code == 'SQLITE_CONSTRAINT') {
        throw new ConflictException('Nickname already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async validateUserPassword(
    authSignInCredentials: AuthSignInCredentialsDTO
  ): Promise<string> {
    const { nickname, password } = authSignInCredentials;

    const user = await this.findOne({ nickname });

    if (user && (await user.validatePassword(password))) {
      return user.nickname;
    } else {
      return null;
    }
  }

  private async hashPassword(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }
}
