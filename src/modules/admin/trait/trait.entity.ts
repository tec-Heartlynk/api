import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('traits')
export class Trait {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  abr!: string;

  @Column({ type: 'text', nullable: true })
  meaning!: string;

  @Column()
  domain_id!: number;
}
