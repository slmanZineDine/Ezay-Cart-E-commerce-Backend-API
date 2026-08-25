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

export enum RefreshTokenRevokeReason {
  ROTATED = 'ROTATED',
  LOGOUT = 'LOGOUT',
  REUSE = 'REUSE',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

@Entity('refresh_tokens')
@Index('IDX_REFRESH_TOKEN_HASH', ['tokenHash'])
@Index('IDX_REFRESH_TOKEN_FAMILY', ['familyId'])
@Index('IDX_REFRESH_TOKEN_USER', ['userId'])
@Index('IDX_REFRESH_TOKEN_EXPIRES_AT', ['expiresAt'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  tokenHash!: string;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  familyId!: string;

  @Column({
    type: 'boolean',
    default: false,
    nullable: false,
  })
  isRevoked!: boolean;

  @Column({
    type: 'enum',
    enum: RefreshTokenRevokeReason,
    nullable: true,
  })
  revokeReason?: RefreshTokenRevokeReason | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  userAgent?: string;

  @Column({
    type: 'varchar',
    length: 45, // Accommodates both IPv4 and IPv6 addresses
    nullable: true,
  })
  ipAddress?: string;

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
