import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  Relation,
} from 'typeorm';

import { User } from '../users/users.entity';

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, (user) => user.teacherProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User;

  @Column()
  department!: string;

  @Column()
  subject!: string;

  @Column({ nullable: true })
  cabinet?: string | null;

  @Column({ nullable: true })
  consultationHours?: string | null;

  @Column({ nullable: true, type: 'text' })
  bio?: string | null;

  @Column({ nullable: true })
  photo?: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}