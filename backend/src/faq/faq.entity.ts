import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

export enum FaqCategory {
  ADMISSION = 'ADMISSION',
  DOCUMENTS = 'DOCUMENTS',
  STUDIES = 'STUDIES',
  SCHEDULE = 'SCHEDULE',
  CLUBS = 'CLUBS',
  TEACHERS = 'TEACHERS',
  OTHER = 'OTHER',
}

@Entity()
export class Faq {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  question!: string;

  @Column({ type: 'text' })
  answer!: string;

  @Column({
    type: 'enum',
    enum: FaqCategory,
    default: FaqCategory.OTHER,
  })
  category!: FaqCategory;

  @Column({ default: true })
  isPublished!: boolean;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  author?: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}