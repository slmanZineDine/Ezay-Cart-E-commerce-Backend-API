import { User } from '../../users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AuthTokenType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

@Entity('auth_tokens')
@Index('IDX_AUTH_TOKEN_USER_TYPE_CREATED_AT', ['userId', 'type', 'createdAt'])
@Index('IDX_AUTH_TOKEN_HASH', ['tokenHash'])
@Index('IDX_AUTH_TOKEN_EXPIRES_AT', ['expiresAt'])
export class AuthToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  tokenHash!: string;

  @Column({
    type: 'enum',
    enum: AuthTokenType,
    nullable: false,
  })
  type!: AuthTokenType;

  @Column({
    type: 'int',
    default: 0,
    nullable: false,
  })
  resendCount!: number;

  // ==================== Relations ====================
  @Column({
    type: 'int',
    nullable: false,
  })
  userId!: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // ==================== Timestamps ====================
  @Column({
    type: 'timestamp',
    nullable: false,
  })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
