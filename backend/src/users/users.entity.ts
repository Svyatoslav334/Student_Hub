import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToOne, ManyToMany,
  ManyToOne, JoinTable,
} from 'typeorm';
import { Profile } from '../profile/profile.entity';
import { Teacher } from '../teachers/teachers.entity';
import { Club } from '../clubs/clubs.entity';
import { StudentGroup } from '../student-groups/student-group.entity';

export enum Role {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ type: 'enum', enum: Role, default: Role.STUDENT })
  role!: Role;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatar?: string;

  @CreateDateColumn()
  createdAt!: Date;

  
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile?: Profile;

  @OneToOne(() => Teacher, (teacher) => teacher.user)
  teacherProfile?: Teacher;

  @ManyToMany(() => Club, (club) => club.members)
  clubs!: Club[];

  @ManyToOne(() => StudentGroup, (group) => group.students, { nullable: true, onDelete: 'SET NULL' })
  studentGroup?: StudentGroup | null;
}