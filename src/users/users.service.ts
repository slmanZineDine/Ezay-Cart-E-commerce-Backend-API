import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { CryptoService } from '../auth/services/crypto.service';
import { UserRole } from '../utils/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly cryptoService: CryptoService,
  ) {}

  // -------------------------
  // GET ALL USERS
  // -------------------------
  async findAll() {
    return this.usersRepo.find({
      select: ['id', 'email', 'username', 'role', 'createdAt'],
    });
  }

  // -------------------------
  // GET USER BY ID
  // -------------------------
  async findById(id: number) {
    const user = await this.usersRepo.findOne({
      where: { id },
      select: ['id', 'email', 'username', 'role', 'createdAt'],
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // -------------------------
  // GET USER WITH PASSWORD BY EMAIL
  // -------------------------
  findByIdWithPassword(id: number) {
    return this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
  }

  // -------------------------
  // GET USER WITH PASSWORD BY EMAIL
  // -------------------------
  findByEmailWithPassword(email: string) {
    return this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  // -------------------------
  // GET CURRENT USER
  // -------------------------
  async findCurrentById(id: number) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // -------------------------
  // FIND USER BY EMAIL
  // -------------------------
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  // -------------------------
  // CREATE USER
  // -------------------------
  async create(dto: CreateUserDto) {
    const user = this.usersRepo.create(dto);

    const hashedPassword = await this.cryptoService.hash(dto.password);

    user.password = hashedPassword;
    user.emailVerified = false;

    return this.usersRepo.save(user);
  }

  // -------------------------
  // UPDATE USER
  // -------------------------
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findById(id);

    Object.assign(user, dto);

    return await this.usersRepo.save(user);
  }

  // -------------------------
  // DELETE USER
  // -------------------------
  async delete(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Not found. User not found.');
    }

    if (user.id === id || user.role === UserRole.ADMIN) {
      await this.usersRepo.remove(user);
      return { message: 'User deleted successfully' };
    }

    throw new ForbiddenException('Access denied. You are not allowed.');
  }

  async markEmailAsVerified(user: User): Promise<User> {
    user.emailVerified = true;
    return this.usersRepo.save(user);
  }
}
