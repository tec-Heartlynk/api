import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { QuizCategory } from './quiz-category.enum';
import { QuizOption } from './quiz-option.entity';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  question!: string;

  @Column({
    type: 'enum',
    enum: QuizCategory,
  })
  category!: QuizCategory;

  @Column({ default: 0 })
  sort_order!: number;

  @OneToMany(() => QuizOption, (opt) => opt.question, {
    cascade: true,
  })
  options!: QuizOption[];
}
