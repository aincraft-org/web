import { packageUrl } from './config';

export type CategoryId = 'all' | 'rank' | 'crate' | 'cosmetic' | 'coin' | 'bundle';

export interface StoreCategory {
  id: CategoryId;
  label: string;
}

export interface StorePackage {
  slug: string;
  name: string;
  category: Exclude<CategoryId, 'all'>;
  price: number;
  description: string;
  perks: string[];
  featured: boolean;
  image: string;
  imageAlt: string;
  buyUrl: string;
}

export const storeCategories: StoreCategory[] = [
  { id: 'all', label: 'All' },
  { id: 'rank', label: 'Ranks' },
  { id: 'crate', label: 'Crates' },
  { id: 'cosmetic', label: 'Cosmetics' },
  { id: 'coin', label: 'Coins' },
  { id: 'bundle', label: 'Bundles' },
];

type CatalogSeed = Omit<StorePackage, 'buyUrl'>;

const seeds: CatalogSeed[] = [
  {
    slug: 'adventurer-rank',
    name: 'Adventurer Rank',
    category: 'rank',
    price: 9.99,
    description: 'Step into Azoth with a head start.',
    perks: ['/kit adventurer', '+2 homes', 'Access: /sethome'],
    featured: true,
    image: '/assets/character-mage.png',
    imageAlt: 'Adventurer mage holding a glowing staff',
  },
  {
    slug: 'ember-knight-rank',
    name: 'Ember Knight Rank',
    category: 'rank',
    price: 19.99,
    description: 'March with the Ember Guard of the frontier.',
    perks: ['/kit ember-knight', '+5 homes', 'Access: /hat, /workbench'],
    featured: true,
    image: '/assets/hero-bg.jpg',
    imageAlt: 'A bright mountain pass through pine forests',
  },
  {
    slug: 'arcane-scholar-rank',
    name: 'Arcane Scholar Rank',
    category: 'rank',
    price: 29.99,
    description: 'Unlock forgotten tomes and crafting stations.',
    perks: ['/kit arcane-scholar', '+8 homes', 'Access: /anvil, /grindstone', 'Scholar chat tag'],
    featured: false,
    image: '/assets/world-bg.jpg',
    imageAlt: 'A fortified hill town and mountain valley',
  },
  {
    slug: 'sovereign-rank',
    name: 'Sovereign Rank',
    category: 'rank',
    price: 49.99,
    description: 'Rule the provinces. The pinnacle of Azoth.',
    perks: ['/kit sovereign', 'Unlimited homes', 'Access: /enderchest, /nick', 'Sovereign chat tag'],
    featured: true,
    image: '/assets/endgame-bg.jpg',
    imageAlt: 'A chained fortress over lava beneath a lightning storm',
  },
  {
    slug: 'relic-crate',
    name: 'Relic Crate',
    category: 'crate',
    price: 4.99,
    description: 'A weathered chest of lost artifacts.',
    perks: ['1x Relic Crate key', 'Common-to-rare loot'],
    featured: false,
    image: '/assets/loot-bg.jpg',
    imageAlt: 'A market stall with an open chest of glowing emeralds',
  },
  {
    slug: 'vault-crate',
    name: 'Vault Crate',
    category: 'crate',
    price: 9.99,
    description: 'Sealed vaults holding legendary gear.',
    perks: ['1x Vault Crate key', 'Rare-to-legendary loot'],
    featured: false,
    image: '/assets/loot-bg.jpg',
    imageAlt: 'A market stall guarded by a chest of rare loot',
  },
  {
    slug: 'familiar-whisper',
    name: 'Familiar Whisper',
    category: 'cosmetic',
    price: 6.99,
    description: 'A spectral fox that trails your steps.',
    perks: ['Cosmetic pet: Spectral Fox'],
    featured: false,
    image: '/assets/world-bg.jpg',
    imageAlt: 'A fortified hill town and mountain valley',
  },
  {
    slug: 'rune-trail',
    name: 'Rune Trail',
    category: 'cosmetic',
    price: 3.99,
    description: 'Leave a trail of glowing runes.',
    perks: ['Particle effect: Rune Trail'],
    featured: false,
    image: '/assets/quests-bg.jpg',
    imageAlt: 'An enchanted forest ruin lit by colorful lanterns',
  },
  {
    slug: 'emerald-pouch-500',
    name: 'Emerald Pouch (500)',
    category: 'coin',
    price: 5,
    description: '500 emeralds for the player-driven trade market.',
    perks: ['+500 emeralds in-game'],
    featured: false,
    image: '/assets/loot-bg.jpg',
    imageAlt: 'Glowing emeralds spread across a treasure market',
  },
  {
    slug: 'emerald-pouch-1200',
    name: 'Emerald Pouch (1200)',
    category: 'coin',
    price: 10,
    description: '1200 emeralds. Best value per emerald.',
    perks: ['+1200 emeralds in-game'],
    featured: false,
    image: '/assets/loot-bg.jpg',
    imageAlt: 'A deep chest overflowing with emerald currency',
  },
  {
    slug: 'starter-bundle',
    name: 'Starter Bundle',
    category: 'bundle',
    price: 14.99,
    description: 'Everything a new adventurer needs.',
    perks: ['Adventurer Rank', 'Relic Crate key x2', 'Familiar Whisper'],
    featured: true,
    image: '/assets/hero-bg.jpg',
    imageAlt: 'A bright mountain pass through pine forests',
  },
  {
    slug: 'raid-bundle',
    name: 'Raid Bundle',
    category: 'bundle',
    price: 24.99,
    description: 'Gear up your guild for endgame raids.',
    perks: ['Vault Crate key x3', 'Emerald Pouch (500)', 'Rune Trail'],
    featured: false,
    image: '/assets/endgame-bg.jpg',
    imageAlt: 'A chained fortress over lava beneath a lightning storm',
  },
];

export const storePackages: StorePackage[] = seeds.map((storePackage) => ({
  ...storePackage,
  buyUrl: packageUrl(storePackage.slug),
}));

export function validateCatalog() {
  const categoryIds = new Set(storeCategories.map(({ id }) => id));
  const errors: string[] = [];

  for (const storePackage of storePackages) {
    if (!categoryIds.has(storePackage.category)) {
      errors.push(`${storePackage.slug}: unknown category ${storePackage.category}`);
    }
    if (!/^[a-z0-9-]+$/.test(storePackage.slug)) {
      errors.push(`${storePackage.slug}: invalid slug`);
    }
    if (!storePackage.buyUrl.startsWith('https://store.azothmc.com/package/')) {
      errors.push(`${storePackage.slug}: invalid buy URL`);
    }
    if (!storePackage.image.startsWith('/assets/')) {
      errors.push(`${storePackage.slug}: invalid image path`);
    }
    if (!storePackage.imageAlt.trim()) {
      errors.push(`${storePackage.slug}: missing image alt text`);
    }
    if (!(storePackage.price > 0)) {
      errors.push(`${storePackage.slug}: invalid price`);
    }
  }

  if (errors.length) throw new Error(`Invalid store catalog: ${errors.join('; ')}`);
  return true;
}

validateCatalog();
