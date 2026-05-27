import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
  Column,
} from 'typeorm';
import { User } from '../../mobile/users/user.entity';

@Entity('blocked_users')
@Unique(['user_id', 'blocked_user_id'])
export class BlockUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @Column()
  blocked_user_id!: number;

  @ManyToOne(() => User, (user) => user.blockedUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => User, (user) => user.blockedByUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'blocked_user_id' })
  blockedUser!: User;

  @CreateDateColumn()
  created_at!: Date;
}
