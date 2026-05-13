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

  @ManyToOne(() => QuizQuestion, (q) => q.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quiz_questions_id' })
  question!: QuizQuestion;

  @Column()
  option_name!: string;

  @Column({ type: 'int', default: 0 })
  primary_trait_id!: number;

  @Column({ type: 'int', default: 0 })
  primary_trait_value!: number;

  @Column({ type: 'int', default: 0 })
  secondary_trait_id!: number;

  @Column({ type: 'int', default: 0 })
  secondary_trait_value!: number;

  @Column({ type: 'int', default: 0 })
  supporting_trait_id!: number;

  @Column({ type: 'int', default: 0 })
  supporting_trait_value!: number;

  @Column({ default: 0 })
  sort_order!: number;
}
