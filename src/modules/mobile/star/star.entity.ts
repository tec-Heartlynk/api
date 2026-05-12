import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('star')
export class StarAction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  from_user_id!: number;

  @Column()
  to_user_id!: number;
}
