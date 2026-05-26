import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

import { Material } from '../material.entity';

@Entity()
export class MaterialCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
    type: 'varchar',
    length: 100,
  })
  name!: string;

  @OneToMany(
    () => Material,
    (material) => material.category,
  )
  materials!: Material[];
}