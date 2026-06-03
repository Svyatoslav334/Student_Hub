import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true, type: 'text' })
  bio?: string | null;

  @Column('jsonb', { default: {} })
  socialLinks!: {
    telegram?: string;
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    [key: string]: string | undefined;
  };

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}