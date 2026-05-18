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

  @Column()
  photo!: string;

  @Column({ type: 'boolean', default: false })
  is_primary!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}