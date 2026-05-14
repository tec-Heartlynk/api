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
import { Profile } from '../profile/profile.entity';

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

  @ManyToOne(() => Profile, (profile) => profile.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  profile!: Profile;
}
