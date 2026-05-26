import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/users.entity';
import { DocumentCategory } from './document-category.entity';

export enum DocumentType {
  TEMPLATE = 'template',
  SAMPLE = 'sample',
  FORM = 'form',
  REFERENCE = 'reference',
  OTHER = 'other',
}

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  type!: DocumentType;

  @ManyToOne(() => DocumentCategory, { eager: true, nullable: false })
  category!: DocumentCategory;

  @Column({ type: 'varchar', nullable: true })
  file!: string | null;

  @Column({ type: 'varchar', nullable: true })
  originalFileName?: string | null;

  @Column({ type: 'varchar', nullable: true })
  mimeType?: string | null;

  @Column({ type: 'bigint', nullable: true })
  size?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  author?: User | null;

  @Column({ default: true })
  isPublished!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}