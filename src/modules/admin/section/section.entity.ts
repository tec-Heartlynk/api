import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('sections')
@Unique(['name'])
export class Section {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;
}
