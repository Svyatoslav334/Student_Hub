import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id!: number;

@Column({ nullable: true, type: 'varchar' })
  firstName?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  lastName?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  phone?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  avatar?: string | null;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User;
}