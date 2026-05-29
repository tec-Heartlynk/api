export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'manage_users',
    'suspend_users',
    'delete_users',
    'manage_scoring',
    'view_analytics',
    'manage_subscriptions',
    'review_reports',
    'view_flagged_chats',
    'issue_warnings',
    'reset_passwords',
    'assist_users',
    'manage_campaigns',
    'send_notifications',
    'manage_featured_profiles',
  ],

  SAFETY_ADMIN: [
    'review_reports',
    'view_flagged_chats',
    'issue_warnings',
    'suspend_users',
  ],

  SUPPORT_ADMIN: ['reset_passwords', 'assist_users', 'view_limited_profiles'],

  MARKETING_ADMIN: [
    'manage_campaigns',
    'send_notifications',
    'view_engagement_metrics',
    'manage_featured_profiles',
  ],
};
