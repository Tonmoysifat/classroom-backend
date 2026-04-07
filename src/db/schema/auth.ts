import {boolean, index, pgEnum, pgTable, text, timestamp, uniqueIndex, varchar} from 'drizzle-orm/pg-core';
import {relations} from 'drizzle-orm';

// Reuse the same timestamps pattern used in src/db/schema/app.ts
const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

// Role enum required by the user: student | teacher | admin
export const roleEnum = pgEnum('role', ['student', 'teacher', 'admin'] as const);

export const user = pgTable('user', {
  // Better Auth expects string (text) primary key for user.id
  id: text('id').primaryKey(),
  name: varchar('name', {length: 255}),
  email: varchar('email', {length: 255}).notNull().unique(),
  emailVerified: boolean('email_verified'),
  image: text('image'),
  // Extra required field
  role: roleEnum('role').default('student').notNull(),
  // Optional Cloudinary public id field
  imageCldPubId: text('image_cld_pub_id'),
  ...timestamps,
});

export const session = pgTable('session', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, {onDelete: 'cascade'}),
    token: text('token').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    ...timestamps,
  },
  (table) => ({
    userIdIdx: index("session_user_id_idx").on(table.userId),
    tokenUnique: uniqueIndex("session_token_unique").on(table.token),
  })
);

export const account = pgTable('account', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, {onDelete: 'cascade'}),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    idToken: text('id_token'),
    password: text('password'),
    ...timestamps,
  },
  (table) => ({
    userIdIdx: index("account_user_id_idx").on(table.userId),
    accountUnique: uniqueIndex("account_provider_account_unique").on(
      table.providerId,
      table.accountId
    ),
  })
);

export const verification = pgTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    ...timestamps,
  }, (table) => ({
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
  })
);

// Relations to help with type inference and joins
export const userRelations = relations(user, ({many}) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({one}) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({one}) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Indexes and constraints notes:
// - session.userId and account.userId are foreign keys referencing user.id.
// - session.token is unique.
// - account.accountId + providerId combination should be unique to match provider account uniqueness
//   (create index name in migrations rather than here). For now we declare uniqueness on the pair
//   by using a unique index name via raw SQL in migrations; drizzle's pgTable does not expose multi-column
//   unique constraints directly in this file without extra helpers, so ensure to add it in migration.

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

