import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name can only contain letters'),
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── ADMIN AUTH ───────────────────────────────────────────────────────────────

export const adminLoginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username too long'),
  password: z.string().min(1, 'Password is required'),
});

export const adminChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const applicationStep1BaseSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  middleName: z.string().min(2, 'Middle name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  gender: z.enum(['Male', 'Female', 'Prefer not to say']),
  age: z
    .number()
    .int()
    .min(18, 'You must be at least 18 years old')
    .max(70, 'Age must be 70 or below')
    .refine((value) => typeof value === 'number' && !Number.isNaN(value), {
      message: 'Age must be a number',
    }),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  nativePlace: z.string().min(1, 'Native language is required'),
  educationLevel: z.string().min(1, 'Education level is required'),
  maritalStatus: z.enum(['Single', 'Married', 'Widowed', 'Annulment']),
  employmentStatus: z.enum(['Employed', 'Unemployed']),
  natureOfEmployment: z.string().optional(),
  position: z.string().optional(),
  employer: z.string().optional(),
  primaryRole: z.string().min(1, 'Primary role is required'),
  secondaryRole: z.string(),
  idNumber: z
    .string()
    .min(5, 'ID number must be at least 5 characters')
    .max(30, 'ID number too long'),
  idCardType: z.string().min(1, 'ID card type is required'),
  completeAddress: z.string().min(5, 'Complete address is required'),
  provinceCode: z.string().min(1, 'Province is required'),
  municipalityCode: z.string().min(1, 'Municipality or city is required'),
  barangayCode: z.string().min(1, 'Barangay is required'),
  contactNumber: z
    .string()
    .regex(/^09\d{9}$/, 'Phone number must be in format 09XXXXXXXXX'),
  homePhone: z.string().optional(),
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  emergencyName: z.string().min(2, 'Emergency contact name is required'),
  emergencyRelation: z.string().min(1, 'Relation is required'),
  emergencyContact: z
    .string()
    .regex(/^09\d{9}$/, 'Must be a valid phone number (09XXXXXXXXX)'),
  emergencyAddress: z.string().min(5, 'Address is required'),
  volunteeringExperience: z.string().optional(),
});

export const applicationStep1Schema = applicationStep1BaseSchema.superRefine(
  (data, ctx) => {
    if (data.employmentStatus === 'Employed') {
      if (!data.natureOfEmployment?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['natureOfEmployment'],
          message: 'Nature of employment is required',
        });
      }
      if (!data.position?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['position'],
          message: 'Position is required',
        });
      }
      if (!data.employer?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['employer'],
          message: 'Employer is required',
        });
      }
    }
    if (data.primaryRole === data.secondaryRole) {
      ctx.addIssue({
        code: 'custom',
        path: ['secondaryRole'],
        message: 'Secondary role must be different from primary role',
      });
    }
  },
);

export const applicationStep2Schema = z.object({
  validIdFrontUrl: z.string().min(1, 'Valid ID front view is required'),
  validIdBackUrl: z.string().min(1, 'Valid ID back view is required'),
  trainingCertUrls: z
    .array(z.string().min(1))
    .min(1, 'At least one training certificate is required')
    .max(5, 'You can upload up to 5 training certificates'),
  photoUrl: z.string().min(1, 'Profile Picture is required'),
});

export const fullApplicationSchema = applicationStep1Schema.and(
  applicationStep2Schema,
);

export const applicationDraftSchema = applicationStep1BaseSchema
  .partial()
  .extend({
    validIdFrontUrl: z.string().optional(),
    validIdBackUrl: z.string().optional(),
    trainingCertUrls: z.array(z.string()).max(5).optional(),
    photoUrl: z.string().optional(),
    status: z.literal('draft'),
  });

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────

export const announcementSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title too long'),
  body: z
    .string()
    .min(10, 'Body must be at least 10 characters')
    .max(5000, 'Body too long'),
  type: z.enum(['info', 'urgent', 'warning', 'success']),
  tags: z.array(z.string()).optional(),
  scheduledAt: z.string().optional(),
  expiresAt: z.string().optional(),
  repeatBroadcast: z.boolean(),
  broadcastFrequency: z
    .enum(['Daily', 'Weekly', 'Bi-weekly', 'Monthly'])
    .optional(),
  action: z.enum(['draft', 'publish']).default('publish').optional(),
});

// ─── ADMIN SETTINGS ───────────────────────────────────────────────────────────

export const adminProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

export const createDeploymentSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  deploymentDate: z.string().min(1, 'Date is required'),
  volunteerIds: z.array(z.string()).min(1, 'Select at least one volunteer'),
});

export const updateDeploymentSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  deploymentDate: z.string().min(1, 'Date is required'),
  volunteerIds: z.array(z.string()).min(1, 'Select at least one volunteer'),
});

// ─── TYPE EXPORTS ─────────────────────────────────────────────────────────────

export type RegisterInput = z.input<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminChangePasswordInput = z.infer<
  typeof adminChangePasswordSchema
>;
export type ApplicationStep1Input = z.infer<typeof applicationStep1Schema>;
export type ApplicationStep2Input = z.infer<typeof applicationStep2Schema>;
export type FullApplicationInput = z.infer<typeof fullApplicationSchema>;
export type ApplicationDraftInput = z.infer<typeof applicationDraftSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type AdminProfileInput = z.infer<typeof adminProfileSchema>;
export type DeploymentInput = z.infer<typeof createDeploymentSchema>;
export type UpdateDeployment = z.infer<typeof updateDeploymentSchema>;
