import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('repair_bonus')
export class RepairBonus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  repair_trait!: number;

  @Column({ type: 'text' })
  meaning!: string;
}
