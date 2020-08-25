import { Repository, EntityRepository } from 'typeorm';
import User from './user.entity';

@EntityRepository(User)
export default class UserRepository extends Repository<User> {}
