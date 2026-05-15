import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from '../users/user.entity';
import { QuizQuestion } from '../../admin/quiz-question/quiz-question.entity';
import { QuizOption } from '../../admin/quiz-question/quiz-option.entity';

@Entity('user_preferences_question_answer')
@Index(['user_id', 'q_id', 'cat_slug'], { unique: true })
export class UserPreferenceQuestionAnswer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @Column()
  q_id!: number;

  @Column()
  ans_id!: number;

  @Column()
  cat_slug!: string;

  // relation
  @ManyToOne(() => User, (user) => user.preferenceAnswers)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // ADD THIS
  @ManyToOne(() => QuizQuestion)
  @JoinColumn({ name: 'q_id' })
  question!: QuizQuestion;

  // ADD THIS
  @ManyToOne(() => QuizOption)
  @JoinColumn({ name: 'ans_id' })
  answer!: QuizOption;
}
