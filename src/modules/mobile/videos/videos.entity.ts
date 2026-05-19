import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { User } from '../users/user.entity';

@Entity('videos')
export class Videos {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'int',
  })
  user_id!: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  video_url!: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  video_verified!: string;

  // ✅ Relation using user_
  @ManyToOne(() => User, (user) => user.videos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' }) // 👈 DB column match
  user!: User;
}
