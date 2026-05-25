import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('star')
export class StarAction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  from_user_id!: number;

  @Column()
  to_user_id!: number;

  // Star Entity
  @ManyToOne(() => User, (user) => user.sentStars)
  @JoinColumn({ name: 'from_user_id' })
  fromUser!: User;

  @ManyToOne(() => User, (user) => user.receivedStars)
  @JoinColumn({ name: 'to_user_id' })
  toUser!: User;
}
