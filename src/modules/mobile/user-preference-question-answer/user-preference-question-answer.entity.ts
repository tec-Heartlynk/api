import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('user_preferences_question_answer')
@Index(['user_id', 'q_id', 'cat_slug'], { unique: true }) // ✅ यही लगाना है
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
}
