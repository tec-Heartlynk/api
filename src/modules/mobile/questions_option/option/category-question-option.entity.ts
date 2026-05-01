import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OptionCategory } from '../option_category/option_category.entity';

@Entity('category_question_options')
export class CategoryQuestionOption {
  @PrimaryGeneratedColumn()
  id!: number;

  // ❌ old approach (optional remove later)
  @Column()
  option_category_id!: number;

  @Column()
  option_title!: string;

  @Column({ nullable: true })
  option_sub_title!: string;

  @Column({ default: 0 })
  sort_order!: number;

  // ✅ ADD THIS RELATION HERE
  @ManyToOne(() => OptionCategory, (cat) => cat.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'option_category_id' }) // 👈 link with existing column
  option_category!: OptionCategory;
}
