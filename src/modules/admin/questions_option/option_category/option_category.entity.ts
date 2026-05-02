import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

import { CategoryQuestionOption } from '../option/category-question-option.entity';

@Entity('category_options')
export class OptionCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ default: 0 })
  sort_order!: number;

  // ✅ ADD THIS
  @OneToMany(() => CategoryQuestionOption, (option) => option.option_category)
  options!: CategoryQuestionOption[];
}
