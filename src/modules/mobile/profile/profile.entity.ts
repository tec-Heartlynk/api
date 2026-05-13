import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { UserPreference } from '../user-preference/user-preference.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'date', nullable: true })
  dob!: Date;

  @Column()
  identity!: string;

  @Column({ type: 'text', nullable: true })
  self_describe!: string;

  @Column({ nullable: true })
  who_open_meeting!: string;

  @Column()
  location!: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude!: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude!: number;

  @Column({ type: 'json', nullable: true })
  photos!: string[];

  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
