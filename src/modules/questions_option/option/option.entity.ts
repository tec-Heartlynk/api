import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OptionCategory } from '../option_category/option_category.entity';

@Entity('category_question_options')
export class CategoryQuestionOption {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  option_category_id!: number;

  @Column()
  option_title!: string;

  @Column({ nullable: true })
  option_sub_title!: string;

  @Column({ default: 0 })
  sort_order!: number;
}
