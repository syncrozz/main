import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (synced with Firebase Auth)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  role: text('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Platforms table
export const platforms = pgTable('platforms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  subName: text('sub_name'),
  tagline: text('tagline').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // 'Education' | 'Campus' | 'Productivity' | 'Community' | 'Innovation'
  badgeColor: text('badge_color').default('blue').notNull(),
  accentColor: text('accent_color').default('blue').notNull(),
  logoBg: text('logo_bg').default('bg-blue-600').notNull(),
  iconName: text('icon_name').default('Sparkles').notNull(),
  features: text('features'), // JSON string array
  audience: text('audience'), // JSON string array
  url: text('url'),
  isPopular: boolean('is_popular').default(false),
  status: text('status').default('Active').notNull(), // 'Active' | 'Beta' | 'New'
  ogImage: text('og_image'),
  ogTitle: text('og_title'),
  ogDescription: text('og_description'),
  isDefault: boolean('is_default').default(false),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Platform Open Graph images table
export const platformOgImages = pgTable('platform_og_images', {
  platformId: text('platform_id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Audit Logs table
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  eventType: text('event_type').notNull(),
  userEmail: text('user_email').notNull(),
  status: text('status').notNull(), // 'SUCCESS' | 'DENIED' | 'INFO' | 'WARNING'
  details: text('details'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Contact & Support inquiries
export const contactInquiries = pgTable('contact_inquiries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  organization: text('organization'),
  platformOfInterest: text('platform_of_interest'),
  message: text('message').notNull(),
  status: text('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
