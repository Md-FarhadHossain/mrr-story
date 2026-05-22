import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
	image: text("image"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id),
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }),
	updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const storiesTable = sqliteTable('stories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  businessName: text('business_name').notNull(),
  founderName: text('founder_name').notNull(),
  founderType: text('founder_type').default('Founder'),
  revenue: text('revenue').notNull(),
  customers: text('customers'),
  niche: text('niche'),
  productUrl: text('product_url'),
  heroImageUrl: text('hero_image_url'),
  profileImageUrl: text('profile_image_url'),
  twitterUrl: text('twitter_url'),
  location: text('location'),
  tags: text('tags'),
  content: text('content').notNull(),
  faq: text('faq'), // JSON array: [{q: string, a: string}]
  startedYear: text('started_year'), // e.g. "2022" or "2019"
  founderAge: text('founder_age'),   // e.g. "24"
  numberOfFounders: integer('number_of_founders').default(1),
  numberOfEmployees: integer('number_of_employees').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const blogsTable = sqliteTable('blogs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  coverImageUrl: text('cover_image_url'),
  coverImageAlt: text('cover_image_alt'),
  focusKeyword: text('focus_keyword'),
  metaKeywords: text('meta_keywords'), // comma-separated meta keywords for <meta name="keywords">
  tags: text('tags'), // comma-separated e.g. "Marketing,Growth,Bootstrapping"
  content: text('content').notNull(),
  faq: text('faq'), // JSON array: [{q: string, a: string}]
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
