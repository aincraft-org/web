export interface NewsMeta {
  title: string;
  date: string;
  summary: string;
}

export interface ParsedPost extends NewsMeta {
  body: string;
}

const REQUIRED = ['title', 'date', 'summary'];

export function parseFrontMatter(raw: string): ParsedPost {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) {
    throw new Error('News post is missing front matter (--- block)');
  }

  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (key && value) meta[key] = value;
  }

  for (const key of REQUIRED) {
    if (!meta[key]) {
      throw new Error(`News post is missing required front matter field: ${key}`);
    }
  }

  return { title: meta.title, date: meta.date, summary: meta.summary, body: match[2].trim() };
}
