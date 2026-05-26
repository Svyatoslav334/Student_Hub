import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

import { User } from '../users/users.entity';
import { ClubMessage } from './club-message.entity';

@Entity()
export class Club {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'text',
  })
  description!: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  image?: string | null;

  @Column({
    type: 'varchar',
    length: 255,
  })
  contact!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  leader?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  schedule?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  meetingTime?: string;

  @Column({
    type: 'int',
    default: 0,
  })
  maxMembers!: number;

  @ManyToMany(() => User)
  @JoinTable()
  members!: User[];

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  creator?: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  get currentMembers(): number {
    return this.members?.length ?? 0;
  }

  @OneToMany(() => ClubMessage, (message) => message.club)
    messages!: ClubMessage[];
}