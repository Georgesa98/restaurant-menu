export type Translation = { name: string; description: string | null };

export type WithTranslations<T> = T & { translations: Translation[] };

export type TenantData = {
  id: string;
  name: string;
  slug: string;
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
  cardStyle: string;
  menuLayout: string;
  spacing: string;
  customCss: string | null;
  logoUrl: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  instagram: string | null;
  categories: WithTranslations<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    displayOrder: number;
    isActive: boolean;
    items: WithTranslations<{
      id: string;
      name: string;
      description: string | null;
      price: { toString: () => string };
      imageThumbnail: string | null;
      imageCard: string | null;
      imageFull: string | null;
      isAvailable: boolean;
      displayOrder: number;
      dietaryTags: string[];
    }>[];
  }>[];
};

export type TenantCard = {
  slug: string;
  name: string;
  description: string | null;
  primaryColor: string;
  domain: string | null;
  defaultLocale: string;
};
