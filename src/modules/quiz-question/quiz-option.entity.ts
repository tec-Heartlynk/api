import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QuizQuestion } from './quiz-question.entity';

@Entity('quiz_question_options')
export class QuizOption {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  option_name!: string;

  @Column({ default: 0 })
  sort_order!: number;

  @ManyToOne(() => QuizQuestion, (q) => q.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quiz_questions_id' }) // 🔥 correct
  question!: QuizQuestion;
}
