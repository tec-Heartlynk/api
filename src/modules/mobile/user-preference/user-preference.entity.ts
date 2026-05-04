import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @Column({ nullable: true })
  looking_for!: number;

  @Column('simple-array', { nullable: true })
  interests!: number[];

  @Column({ nullable: true })
  height!: number;

  @Column({ nullable: true })
  occupation!: number;

  @Column({ nullable: true })
  religion!: number;

  @Column({ nullable: true })
  ethnicity!: number;

  @Column({ nullable: true })
  education!: number;

  @Column('simple-array', { nullable: true })
  language!: number[];

  @Column({ nullable: true })
  political_learning!: number;
}
