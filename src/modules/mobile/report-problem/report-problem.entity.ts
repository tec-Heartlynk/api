import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ReportProblemStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'inprogress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

@Entity('report_problems')
export class ReportProblem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: ReportProblemStatus,
    default: ReportProblemStatus.PENDING,
  })
  status!: ReportProblemStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  user_id!: number;

  @CreateDateColumn()
  created_at!: Date;
}
