import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

import { User } from '../users/user.entity';
import { UserPhoto } from '../user-photo/user-photo.entity';
import { IsNegative } from 'class-validator';

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

  @Column('decimal', {
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitude!: number;

  @Column('decimal', {
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitude!: number;

  // ✅ photos relation

  @OneToMany(() => UserPhoto, (photo) => photo.profile)
  photos!: UserPhoto[];

  // ✅ user relation
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  // ✅ foreign key column

  @Column({ nullable: true })
  user_id?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
