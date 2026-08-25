import { Entity, PrimaryColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('pending_uploads')
export class PendingUpload {
  @PrimaryColumn()
  storageKey!: string;

  @Index('IDX_PENDING_UPLOADS_CREATE_AT')
  @CreateDateColumn()
  createdAt!: Date;
}
