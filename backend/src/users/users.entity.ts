import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, ManyToMany } from 'typeorm';
import { Profile } from '../profile/profile.entity';
import { Teacher } from '../teachers/teachers.entity';
import { Club } from '../clubs/clubs.entity';

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

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.STUDENT,
  })
  role!: Role;
  
  @OneToOne(() => Profile, (profile) => profile.user)
  profile!: Profile;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => Teacher, (teacher) => teacher.user)
  teacherProfile?: Teacher;

  @ManyToMany(() => Club, (club) => club.members)
  clubs!: Club[];
}
