import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('frictions')
export class Friction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  friction_area!: string;

  @Column({ type: 'int' })
  trait_a_id!: number;

  @Column({ type: 'int' })
  trait_b_id!: number;

  @Column({ type: 'varchar', length: 255 })
  trigger_name!: string;

  @Column({ type: 'double precision' })
  multiplier!: number;

  @Column({ type: 'double precision' })
  area_weight!: number;
}
