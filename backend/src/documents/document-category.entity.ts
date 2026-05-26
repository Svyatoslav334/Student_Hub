import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Document } from './document.entity';

@Entity()
export class DocumentCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 100 })
  name!: string;

  @OneToMany(() => Document, (document) => document.category)
  documents!: Document[];
}