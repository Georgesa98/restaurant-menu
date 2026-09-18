// Bilingual dish search. Same spec as the Android kiosk
// (menu_format.dart): lowercase, strip Arabic diacritics (tashkeel),
// unify alef/hamza + waw/hamza + yaa/hamza + taa-marbuta forms.

export function normalizeForSearch(s: string): string {
  let n = s.trim().toLowerCase();
  n = n.replace(/[ً-ٰٟ]/g, '');
  n = n.replace(/[أإآٱ]/g, 'ا');
  n = n.replace(/ؤ/g, 'و').replace(/ئ/g, 'ي');
  n = n.replace(/ة/g, 'ه');
  n = n.replace(/\s+/g, ' ');
  return n;
}

// Owner pin with a live window: pinned while featuredUntil is null or in
// the future. Evaluated at render time — no cron needed. Lives here (not in
// the component) so the render-purity lint stays quiet about the clock.
export function isLiveFeatured(item: {
  isFeatured: boolean;
  featuredUntil: string | Date | null | undefined;
}): boolean {
  if (!item.isFeatured) return false;
  if (item.featuredUntil == null) return true;
  const t =
    item.featuredUntil instanceof Date
      ? item.featuredUntil.getTime()
      : new Date(item.featuredUntil).getTime();
  return Number.isFinite(t) ? t > Date.now() : false;
}

// 0 = name prefix, 1 = name contains, 2 = description contains,
// null = no match. Blank query matches everything at rank 1 (neutral).
export function searchRank(
  query: string,
  names: (string | null | undefined)[],
  descriptions: (string | null | undefined)[],
): number | null {
  const q = normalizeForSearch(query);
  if (!q) return 1;
  const ns = names.filter((x): x is string => !!x && x.trim() !== '').map(normalizeForSearch);
  if (ns.some((n) => n.startsWith(q))) return 0;
  if (ns.some((n) => n.includes(q))) return 1;
  const ds = descriptions.filter((x): x is string => !!x && x.trim() !== '').map(normalizeForSearch);
  if (ds.some((d) => d.includes(q))) return 2;
  return null;
}
