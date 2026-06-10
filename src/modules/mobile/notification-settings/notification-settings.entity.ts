import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user_notification_settings')
export class NotificationSetting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  user_id!: number;

  // Master Switch
  @Column({ default: true })
  push_enabled!: boolean;

  // Push Notifications
  @Column({ default: true })
  new_match!: boolean;

  @Column({ default: true })
  new_message!: boolean;

  @Column({ default: false })
  profile_like!: boolean;

  @Column({ default: false })
  super_like!: boolean;

  @Column({ default: true })
  daily_recommendation!: boolean;

  @Column({ default: true })
  verification_status!: boolean;

  // Email Notifications
  @Column({ default: true })
  match_digest_email!: boolean;

  @Column({ default: true })
  product_updates_email!: boolean;
}
