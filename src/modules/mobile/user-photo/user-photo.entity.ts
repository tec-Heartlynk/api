import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { User } from '../users/user.entity';

@Entity('user_photo')
export class UserPhoto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  user_id!: number;

  @Index()
  @Column()
  photo!: string;

  // 1 = primary photo, 0 = normal photo
  @Column({ type: 'boolean', default: false })
  is_primary!: boolean;

  @ManyToOne(() => User, (user) => user.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
