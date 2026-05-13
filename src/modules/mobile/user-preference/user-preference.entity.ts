import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Profile } from '../profile/profile.entity';
import { CategoryQuestionOption } from '../questions_option/option/category-question-option.entity';
import { User } from '../users/user.entity';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn()
  id!: number;

  // ✅ user_id column
  @Column()
  user_id!: number;

  @Column({ nullable: true })
  looking_for!: number;

  @Column({ nullable: true })
  feel!: string;

  // ✅ interests array
  @Column('simple-array', {
    nullable: true,
  })
  interests!: number[];

  @Column({ nullable: true })
  height!: number;

  @Column({ nullable: true })
  occupation!: number;

  @Column({ nullable: true })
  religion!: number;

  @Column({ nullable: true })
  ethnicity!: number;

  @Column({ nullable: true })
  education!: number;

  @Column('simple-array', {
    nullable: true,
  })
  language!: number[];

  @Column({ nullable: true })
  political_learning!: number;

  // ✅ PROFILE RELATION

  // ✅ USER RELATION
  @ManyToOne(() => User, (user) => user.userPreferences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;

  // ✅ OPTIONAL RELATION
  @ManyToOne(() => CategoryQuestionOption, {
    nullable: true,
  })
  option!: CategoryQuestionOption;
}
