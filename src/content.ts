export const SERVER_IP = 'play.azothmc.com';

export interface NavItem {
  href?: string;
  to?: string;
  section: string;
  index: string;
  label: string;
  ariaLabel: string;
  isJoin?: boolean;
}

export interface JournalSection {
  id: string;
  testId: string;
  entry: string;
  category: string;
  index: string;
  kicker: string;
  title: string;
  background: string;
  side: 'left' | 'right';
  paragraphs: string[];
  bullets: string[];
}

export const navItems: NavItem[] = [
  { href: '#hero', section: 'hero', index: '00', label: 'Home', ariaLabel: 'Home' },
  { href: '#intro', section: 'intro', index: '01', label: 'About', ariaLabel: 'About' },
  { href: '#world', section: 'world', index: '02', label: 'World', ariaLabel: 'World' },
  { href: '#loot', section: 'loot', index: '03', label: 'Items', ariaLabel: 'Items' },
  { href: '#quests', section: 'quests', index: '04', label: 'Quests', ariaLabel: 'Quests' },
  { href: '#endgame', section: 'endgame', index: '05', label: 'Endgame', ariaLabel: 'Endgame' },
  { to: '/store', section: 'store', index: 'SHOP', label: 'Store', ariaLabel: 'Store' },
  { to: '/news', section: 'news', index: 'NEWS', label: 'News', ariaLabel: 'News' },
  { to: '/forum', section: 'forum', index: 'TALK', label: 'Forum', ariaLabel: 'Forum' },
  {
    href: '#join',
    section: 'join',
    index: 'GO',
    label: 'Join',
    ariaLabel: 'Play / Join',
    isJoin: true,
  },
];

export const journalSections: JournalSection[] = [
  {
    id: 'world',
    testId: 'feature-world',
    entry: 'ENTRY 02',
    category: 'EXPLORATION',
    index: '02 / 05',
    kicker: 'Exploration',
    title: 'Handcrafted Realms',
    background: '/assets/world-bg.jpg',
    side: 'left',
    paragraphs: [
      'Wander the provinces of Azoth: citadels, wetlands, and sunken ruins shaped by builders, not generators. Every skyline is intentional.',
    ],
    bullets: ['Distinct biomes and capitals', 'Hidden vaults and secrets', 'Years of exploration content'],
  },
  {
    id: 'loot',
    testId: 'feature-loot',
    entry: 'ENTRY 03',
    category: 'ECONOMY',
    index: '03 / 05',
    kicker: 'Economy',
    title: 'Loot & Trade Market',
    background: '/assets/loot-bg.jpg',
    side: 'right',
    paragraphs: [
      'Chase legendary gear, pair it with class abilities, or sell it on the Trade Market. Build wealth in a player-driven emerald economy.',
    ],
    bullets: ['Tradable rare items', 'Player-run markets', 'Build-defining synergies'],
  },
  {
    id: 'quests',
    testId: 'feature-quests',
    entry: 'ENTRY 04',
    category: 'STORY',
    index: '04 / 05',
    kicker: 'Story',
    title: 'Quests & Roleplay',
    background: '/assets/quests-bg.jpg',
    side: 'left',
    paragraphs: [
      'Follow branching quest lines across kingdoms and cults. Play as a knight, mage, assassin, or archer; your path shapes Azoth for you.',
    ],
    bullets: ['Multi-step quest chains', 'Unique class kits', 'Dialogue-driven lore'],
  },
  {
    id: 'endgame',
    testId: 'feature-endgame',
    entry: 'ENTRY 05',
    category: 'CHALLENGE',
    index: '05 / 05',
    kicker: 'Challenge',
    title: 'Endgame Raids & Bosses',
    background: '/assets/endgame-bg.jpg',
    side: 'right',
    paragraphs: [
      'Rally your guild against raids and world bosses. Whether you are new to MMOs or a veteran, there is always a greater threat ahead.',
    ],
    bullets: ['Coordinated raid content', 'World bosses and territory', 'Seasonal challenges'],
  },
];
