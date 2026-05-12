// src/modules/heart/entities/heart.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('heart')
export class HeartAction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  from_user_id!: number;

  @Column()
  to_user_id!: number;
}
