import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity('report_user')
@Unique(['from_user_id', 'to_user_id'])
export class ReportUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  from_user_id!: number;

  @Column()
  to_user_id!: number;

  @Column()
  what_happened_id!: number;

  @Column({ type: 'text', nullable: true })
  anything_else!: string;

  @Column({ type: 'text', nullable: true })
  describe!: string;

  @CreateDateColumn()
  created_at!: Date;
}
