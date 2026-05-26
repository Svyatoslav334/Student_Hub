import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { User } from '../users/users.entity';
import { NewsComment } from './comments/news-comment.entity';

export enum NewsCategory {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  EVENT = 'EVENT',
  EDUCATION = 'EDUCATION',
  ADMINISTRATION = 'ADMINISTRATION',
}

@Entity()
export class News {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'enum',
    enum: NewsCategory,
    default: NewsCategory.ANNOUNCEMENT,
  })
  category!: NewsCategory;

  @Column({
    type: 'text',
  })
  content!: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  image?: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  author?: User | null;
  
  @Column({
    default: false,
  })
  pinned!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => NewsComment, (comment) => comment.news)
    comments!: NewsComment[];
}