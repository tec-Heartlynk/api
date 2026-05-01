import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';


@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  email!: string;

  @Column()
  otp!: string;

  @Column({ default: 0 })
  attempts!: number;

  @Column({ default: false })
  verified!: boolean;

  @Column()
  expiresAt!: Date;

  @Column({
  type: 'timestamp',
  nullable: true,
})
blockedUntil!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}