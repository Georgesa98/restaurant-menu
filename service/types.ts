import type { CategoryOption, Item } from '@/types/item.types';

/** Authenticated staff user (subset returned by /api/auth/get-session). */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
  username?: string | null;
  displayUsername?: string | null;
};

export type Translation = { locale: string; name: string; description: string | null };

export type TranslationPayload = { name: string; description: string | null };

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  translations: Translation[];
};

export type CategoryWithItems = Category & {
  coverImage?: string | null;
  items?: { imageUrl: string | null }[];
};

export type { CategoryOption, Item };

export type Tenant = {
  id: string;
  name: string;
  slug: string;
};

export type TenantRow = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  plan: string;
  isActive: boolean;
  revision: number;
  syncRequired: boolean;
  _count: { categories: number; items: number };
};

/** Full tenant record returned by GET /api/tenants/:id. */
export type TenantDetail = TenantRow & {
  defaultLocale: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textMuted: string;
  headingFont: string;
  bodyFont: string;
  borderRadiusSm: string;
  borderRadiusMd: string;
  borderRadiusLg: string;
  shadow: string;
};

export type UserRow = {
  id: string;
  email: string;
  name: string;
  username: string | null;
  role: string;
  tenantId: string | null;
  isActive: boolean;
  createdAt: string;
  tenant: { name: string; slug: string } | null;
};

export type Device = {
  id: string;
  deviceId: string;
  lastSeen: string;
  appVersion: string | null;
  locale: string | null;
};

export type ImportResult = {
  imported: { categories: number; items: number; translations: number };
  errors?: string[];
};

export type ReorderInput = { id: string; displayOrder: number };
