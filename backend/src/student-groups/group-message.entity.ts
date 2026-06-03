import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { StudentGroup } from './student-group.entity';
import { User } from '../users/users.entity';

@Entity()
export class GroupMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => StudentGroup, (group) => group.messages, { onDelete: 'CASCADE' })
  group!: StudentGroup;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  author!: User;

  @CreateDateColumn()
  createdAt!: Date;
}