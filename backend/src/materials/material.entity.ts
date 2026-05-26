import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { User } from '../users/users.entity';

import { MaterialCategory } from './categories/material-category.entity';

export enum MaterialType {
  LECTURE = 'lecture',
  PRESENTATION = 'presentation',
  METHODICAL = 'methodical',
  OTHER = 'other',
}

@Entity()
export class Material {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'enum',
    enum: MaterialType,
    default: MaterialType.OTHER,
  })
  type!: MaterialType;

  @Column({
    type: 'text',
  })
  description!: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  file?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  originalFileName?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  mimeType?: string | null;

  @Column({
    type: 'bigint',
    nullable: true,
  })
  size?: number | null;

  @ManyToOne(
    () => MaterialCategory,
    (category) => category.materials,
    {
      eager: true,
      nullable: false,
    },
  )
  category!: MaterialCategory;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  author?: User | null;

  @CreateDateColumn()
  createdAt!: Date;
}