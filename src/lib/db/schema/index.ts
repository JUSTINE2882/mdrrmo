import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const applicationStatusEnum = pgEnum('application_status', [
  'draft',
  'pending',
  'under_review',
  'approved',
  'rejected',
]);

export const announcementTypeEnum = pgEnum('announcement_type', [
  'info',
  'urgent',
  'warning',
  'success',
]);

export const volunteerStatusEnum = pgEnum('volunteer_status', [
  'active',
  'inactive',
  'suspended',
]);

export const announcementStatusEnum = pgEnum('announcement_status', [
  'draft',
  'scheduled',
  'published',
]);

export const employmentStatusEnum = pgEnum('employment_status', [
  'Employed',
  'Unemployed',
]);

export const genderEnum = pgEnum('gender', [
  'Male',
  'Female',
  'Prefer not to say',
]);

export const maritalStatusEnum = pgEnum('marital_status', [
  'Single',
  'Married',
  'Widowed',
  'Annulment',
]);

export const volunteerProfiles = pgTable('volunteer_profiles', {
  id: uuid('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const volunteerApplications = pgTable('volunteer_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  volunteerId: uuid('volunteer_id')
    .references(() => volunteerProfiles.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  firstName: text('first_name').notNull(),
  middleName: text('middle_name').notNull(),
  lastName: text('last_name').notNull(),
  gender: genderEnum('gender').notNull(),
  age: integer('age').notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  nationality: text('nationality').notNull().default('Filipino'),
  nativePlace: text('native_place').notNull(),
  educationLevel: text('education_level').notNull(),
  maritalStatus: maritalStatusEnum('marital_status').notNull(),
  employmentStatus: employmentStatusEnum('employment_status').notNull(),
  natureOfEmployment: text('nature_of_employment'),
  position: text('position'),
  employer: text('employer'),
  primaryRole: text('primary_role').notNull(),
  secondaryRole: text('secondary_role').notNull(),
  idNumber: text('id_number').notNull(),
  idCardType: text('id_card_type').notNull(),
  completeAddress: text('complete_address').notNull(),
  provinceCode: text('province_code').notNull(),
  municipalityCode: text('municipality_code').notNull(),
  barangayCode: text('barangay_code').notNull(),
  contactNumber: text('contact_number').notNull(),
  homePhone: text('home_phone'),
  email: text('email').notNull(),
  emergencyContact: jsonb('emergency_contact').$type<{
    name: string;
    relation: string;
    contactNumber: string;
    address: string;
  }>(),
  volunteeringExperience: text('volunteering_experience'),
  validIdFrontUrl: text('valid_id_front_url'),
  validIdBackUrl: text('valid_id_back_url'),
  trainingCertUrl: jsonb('training_cert_url').$type<string[]>(),
  photoUrl: text('photo_url'),
  applicationStatus: applicationStatusEnum('status').default('draft').notNull(),
  reviewedBy: integer('reviewed_by').references(() => adminUsers.id),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),
  submittedAt: timestamp('submitted_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const hiredVolunteers = pgTable('hired_volunteers', {
  id: uuid('id').primaryKey().defaultRandom(),
  volunteerId: uuid('volunteer_id')
    .references(() => volunteerProfiles.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  applicationId: uuid('application_id')
    .references(() => volunteerApplications.id)
    .notNull(),
  role: text('role').notNull(),
  status: volunteerStatusEnum('status').default('active').notNull(),
  hiredAt: timestamp('hired_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deploymentCount: integer('deployment_count').default(0),
  trainings: jsonb('trainings').$type<string[]>().default([]),
  hiredBy: integer('hired_by').references(() => adminUsers.id),
});

export const adminUsers = pgTable('admin_users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(), // bcrypt
  displayName: text('display_name').notNull(),
  email: text('email'),
  role: text('role').default('admin').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  type: announcementTypeEnum('type').default('info').notNull(),
  tags: jsonb('tags').$type<string[]>().default([]),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at'),
  repeatBroadcast: boolean('repeat_broadcast').default(false),
  status: announcementStatusEnum('status').notNull().default('draft'),
  scheduledAt: timestamp('scheduled_at'),
  publishedAt: timestamp('published_at'),
  broadcastFrequency: text('broadcast_frequency'),
  createdBy: integer('created_by').references(() => adminUsers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const notificationReads = pgTable(
  'notification_reads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    volunteerId: uuid('volunteer_id')
      .notNull()
      .references(() => volunteerProfiles.id, { onDelete: 'cascade' }),
    announcementId: uuid('announcement_id')
      .notNull()
      .references(() => announcements.id, { onDelete: 'cascade' }),
    readAt: timestamp('read_at').defaultNow().notNull(),
  },
  (table) => [
    unique('notification_reads_volunteer_announcement_unique').on(
      table.volunteerId,
      table.announcementId,
    ),
  ],
);

// Activity Logs
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: integer('admin_id').references(() => adminUsers.id, {
    onDelete: 'set null',
  }),
  name: text('name').notNull(),
  action: text('action').notNull(),
  targetType: text('target_type'),
  targetId: text('target_id'),
  targetLabel: text('target_label'),
  details: jsonb('details').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Role capacity ("Records")
export const volunteerRoleSlots = pgTable('volunteer_role_slots', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  capacity: integer('capacity').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: integer('created_by').references(() => adminUsers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Deployments
export const deployments = pgTable('deployments', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  deploymentDate: timestamp('deployment_date').notNull(),
  createdBy: integer('created_by').references(() => adminUsers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const deploymentParticipants = pgTable(
  'deployment_participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deploymentId: uuid('deployment_id')
      .notNull()
      .references(() => deployments.id, { onDelete: 'cascade' }),
    hiredVolunteerId: uuid('hired_volunteer_id')
      .notNull()
      .references(() => hiredVolunteers.id, { onDelete: 'cascade' }),
  },
  (table) => [
    unique('deployment_participants_unique').on(
      table.deploymentId,
      table.hiredVolunteerId,
    ),
  ],
);
