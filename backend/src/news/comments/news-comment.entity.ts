import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { News } from '../news.entity';
import { User } from '../../users/users.entity';

@Entity()
export class NewsComment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => News, (news) => news.comments, { onDelete: 'CASCADE' })
  news!: News;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  author!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: true })
  isPublished!: boolean;
}