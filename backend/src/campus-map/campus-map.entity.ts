import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class CampusMap {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  svgData?: string;

  @Column('jsonb', { default: [] })
  rooms!: Array<{
    id: number;
    name: string;
    label?: string;
    type?: 'room' | 'corridor';   
    x: number;
    y: number;
    width: number;
    height: number;
    doorX: number;
    doorY: number;
  }>;

  @Column({ default: 1 })
  floor!: number;

  @CreateDateColumn()
  createdAt!: Date;
}