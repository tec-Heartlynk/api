import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

import { Profile } from '../profile/profile.entity';
import { UserSettings } from '../user-settings/settings.entity';
import { UserPreference } from '../user-preference/user-preference.entity';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role!: Role;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isBlocked!: boolean;

  @Column({ nullable: true })
  status!: number;

  // 📅 TIMESTAMPS
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 👇 ADD THIS
  @OneToOne(() => Profile, (profile) => profile.user)
  profile!: Profile;

  //UserSettings relation
  @OneToOne(() => UserSettings, (settings) => settings.user)
  settings!: UserSettings;

  @OneToMany(() => UserPreference, (userPreference) => userPreference.user)
  userPreferences!: UserPreference[];
}
