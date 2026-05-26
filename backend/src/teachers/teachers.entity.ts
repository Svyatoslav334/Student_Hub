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
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  department!: string;

  @Column()
  subject!: string;

  @Column({ nullable: true, type: 'varchar' })
  cabinet: string | null = null;

  @Column({ nullable: true, type: 'varchar' })
  consultationHours: string | null = null;

  @Column({ nullable: true, type: 'text' })
  bio: string | null = null;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  phone: string | null = null;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  email: string | null = null;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  photo: string | null = null;

  @CreateDateColumn()
  createdAt!: Date;
}