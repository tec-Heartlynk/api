import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SAFETY_ADMIN = 'SAFETY_ADMIN',
  SUPPORT_ADMIN = 'SUPPORT_ADMIN',
  MARKETING_ADMIN = 'MARKETING_ADMIN',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.SUPPORT_ADMIN,
  })
  role!: Role;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isBlocked!: boolean;

  // ✅ LAST LOGIN
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  last_login!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
