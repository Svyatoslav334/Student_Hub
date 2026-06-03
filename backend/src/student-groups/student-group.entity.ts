import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, OneToMany,
} from 'typeorm';
import { Teacher } from '../teachers/teachers.entity';
import { User } from '../users/users.entity';
import { GroupMessage } from './group-message.entity';

@Entity()
export class StudentGroup {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 50 })
  name!: string;

  @Column({ nullable: true })
  year?: number;

  @Column({ nullable: true, length: 100 })
  specialty?: string;

  @ManyToOne(() => Teacher, { nullable: true, onDelete: 'SET NULL' })
  curator?: Teacher | null;

  @OneToMany(() => User, (user) => user.studentGroup, { cascade: true })
  students!: User[];

  @OneToMany(() => GroupMessage, (message) => message.group)
  messages!: GroupMessage[];

  @CreateDateColumn()
  createdAt!: Date;
}