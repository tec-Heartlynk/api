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
import { UserPreferenceQuestionAnswer } from '../user-preference-question-answer/user-preference-question-answer.entity';
import { UserTraitLedger } from '../../mobile/user_trait_ledger/user_trait_ledger.entity';
import { UserPhoto } from '../user-photo/user-photo.entity';
import { Videos } from '../videos/videos.entity';
import { StarAction } from '../star/star.entity';
import { BlockUser } from '../block-user/block.entity';

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

  @OneToMany(() => UserPreferenceQuestionAnswer, (answer) => answer.user)
  preferenceAnswers!: UserPreferenceQuestionAnswer[];

  @OneToOne(() => UserPreference, (preference) => preference.user)
  preferences!: UserPreference;

  @OneToMany(() => UserTraitLedger, (ledger) => ledger.user)
  userTraitLedgers!: UserTraitLedger[];

  @OneToMany(() => UserPhoto, (photo) => photo.user)
  photos!: UserPhoto[];

  @OneToMany(() => Videos, (video) => video.user)
  videos!: Videos[];

  // user.entity.ts

  @OneToMany(() => StarAction, (star) => star.fromUser)
  sentStars!: StarAction[];

  @OneToMany(() => StarAction, (star) => star.toUser)
  receivedStars!: StarAction[];

  @OneToMany(() => BlockUser, (block) => block.user)
  blockedUsers!: BlockUser[];

  @OneToMany(() => BlockUser, (block) => block.blockedUser)
  blockedByUsers!: BlockUser[];
}
