export const STORE_ORIGIN: string = 'https://store.azothmc.com';

export function packageUrl(slug: string): string {
  return `${STORE_ORIGIN}/package/${slug}`;
}
