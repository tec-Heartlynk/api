// src/modules/settings/settings.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  // 🔥 relation with user
  @OneToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  user_id!: number;

  // ===== toggles =====
  @Column({ default: true })
  age!: boolean;

  @Column({ default: true })
  distance!: boolean;

  @Column({ default: true })
  last_active!: boolean;

  @Column({ default: false })
  height!: boolean;

  @Column({ default: false })
  occupation!: boolean;

  @Column({ default: false })
  religion!: boolean;

  @Column({ default: false })
  ethnicity!: boolean;

  @Column({ default: false })
  education!: boolean;

  @Column({ default: false })
  languages!: boolean;

  @Column({ default: false })
  political_learning!: boolean;

  @Column({ default: 0 })
  verified_status!: number;

  @Column({ default: 0 })
  match_status!: number;
}
