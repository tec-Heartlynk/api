import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @Column({ nullable: true })
  from_user_id!: number;

  @Column()
  type!: string;

  @Column()
  title!: string;

  @Column('text')
  message!: string;

  @Column({
    default: false,
  })
  is_read!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
