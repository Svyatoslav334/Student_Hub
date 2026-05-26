import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Club } from './clubs.entity';
import { User } from '../users/users.entity';

@Entity()
export class ClubMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => Club, (club) => club.messages, { onDelete: 'CASCADE' })
  club!: Club;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  author!: User;

  @CreateDateColumn()
  createdAt!: Date;
}