import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CategoryQuestionOption } from '../option/option.entity';

@Entity('category_options')
export class OptionCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  slug!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ default: 0 })
  sort_order!: number;
}
