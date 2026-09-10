import 'dotenv/config';
import { prisma } from '../lib/prisma';

const API_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3001';
// Super-admin credentials come from env so secrets never live in git.
const SEED_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com';
const SEED_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'admin123456';

async function createUserViaApi(email: string, name: string, role: string, tenantId: string | null) {
  const res = await fetch(`${API_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: API_URL,
    },
    body: JSON.stringify({
      email,
      password: SEED_PASSWORD,
      name,
      role,
      tenantId,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sign-up failed for ${email}: ${res.status} ${err}`);
  }

  return res.json();
}

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: SEED_EMAIL },
  });
  if (existing) {
    console.log('Admin users already seeded — skipping');
    return;
  }

  console.log('API server must be running on', API_URL);

  // Super admin
  await createUserViaApi(SEED_EMAIL, 'Super Admin', 'SUPER_ADMIN', null);
  console.log(`Created super admin: ${SEED_EMAIL}`);

  // Tenant admins
  const tenants = await prisma.tenant.findMany();
  for (const tenant of tenants) {
    await createUserViaApi(`admin@${tenant.slug}.com`, `${tenant.name} Admin`, 'TENANT_ADMIN', tenant.id);
    console.log(`Created admin for ${tenant.name}: admin@${tenant.slug}.com`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
