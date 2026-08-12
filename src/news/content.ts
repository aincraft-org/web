import { parseFrontMatter } from './frontmatter';

export interface NewsPost {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string;
}

const modules = import.meta.glob('./posts/*.md', { eager: true, query: '?raw', import: 'default' });

const posts = Object.entries(modules).map(([key, raw]) => ({
  slug: key.split('/').pop()!.replace(/\.md$/, ''),
  raw: raw as string,
}));

export const newsPosts: NewsPost[] = posts
  .map(({ slug, raw }) => ({ slug, ...parseFrontMatter(raw) }))
  .sort((left, right) => (left.date < right.date ? 1 : -1));

export function getPost(slug: string): NewsPost | null {
  return newsPosts.find((post) => post.slug === slug) ?? null;
}
