import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('deleted_accounts')
export class DeletedAccount {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  email!: string;

  @Column()
  user_name!: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  reason!: number;

  @Column({ type: 'text', nullable: true })
  device_info!: string;

  @CreateDateColumn()
  deleted_at!: Date;
}
