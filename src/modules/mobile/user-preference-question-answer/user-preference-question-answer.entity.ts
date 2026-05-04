import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('user_preferences_question_answer')
@Unique(['user_id', 'q_id']) // same question duplicate nahi hoga
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
