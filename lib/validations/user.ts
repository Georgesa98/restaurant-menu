import z from 'zod';

const emptyToNull = (v: unknown) => (v === '' || v === undefined ? null : v);

const baseUserSchema = z.object({
  name: z.string('required').trim().min(1).max(100),
  username: z.preprocess(emptyToNull, z.string().trim().min(1).max(100).nullable().optional()),
  role: z.enum(['TENANT_ADMIN', 'SUPER_ADMIN']),
  tenantId: z.preprocess(emptyToNull, z.string().trim().min(1).nullable().optional()),
});

function requireTenantForTenantRole(data: { role: string; tenantId?: string | null }, ctx: z.RefinementCtx) {
  if (data.role !== 'SUPER_ADMIN' && !data.tenantId) {
    ctx.addIssue({
      code: 'custom',
      message: 'required',
      path: ['tenantId'],
    });
  }
}

export const createUserSchema = baseUserSchema
  .extend({
    email: z.email('required').trim().max(255),
    password: z.string('required').min(8).max(128),
  })
  .superRefine(requireTenantForTenantRole);

export const editUserSchema = baseUserSchema.superRefine(requireTenantForTenantRole);

export const resetPasswordSchema = z.object({
  password: z.string('required').min(8).max(128),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type EditUserInput = z.infer<typeof editUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
