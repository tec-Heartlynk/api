import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('daily_profile_views')
export class DailyProfileView {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @Column()
  profile_user_id!: number;

  @CreateDateColumn()
  created_at!: Date;
}
