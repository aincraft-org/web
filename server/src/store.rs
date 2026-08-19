use axum::response::Html;

use crate::layout::{self, Nav};

struct Package {
    slug: &'static str,
    name: &'static str,
    category: &'static str,
    price: &'static str,
    description: &'static str,
    perks: &'static [&'static str],
    featured: bool,
    image: &'static str,
    image_alt: &'static str,
}

const PACKAGES: [Package; 12] = [
    Package {
        slug: "adventurer-rank",
        name: "Adventurer Rank",
        category: "rank",
        price: "9.99",
        description: "Step into Azoth with a head start.",
        perks: &["/kit adventurer", "+2 homes", "Access: /sethome"],
        featured: true,
        image: "/assets/character-mage.png",
        image_alt: "Adventurer mage holding a glowing staff",
    },
    Package {
        slug: "ember-knight-rank",
        name: "Ember Knight Rank",
        category: "rank",
        price: "19.99",
        description: "March with the Ember Guard of the frontier.",
        perks: &["/kit ember-knight", "+5 homes", "Access: /hat, /workbench"],
        featured: true,
        image: "/assets/hero-bg.jpg",
        image_alt: "A bright mountain pass through pine forests",
    },
    Package {
        slug: "arcane-scholar-rank",
        name: "Arcane Scholar Rank",
        category: "rank",
        price: "29.99",
        description: "Unlock forgotten tomes and crafting stations.",
        perks: &[
            "/kit arcane-scholar",
            "+8 homes",
            "Access: /anvil, /grindstone",
            "Scholar chat tag",
        ],
        featured: false,
        image: "/assets/world-bg.jpg",
        image_alt: "A fortified hill town and mountain valley",
    },
    Package {
        slug: "sovereign-rank",
        name: "Sovereign Rank",
        category: "rank",
        price: "49.99",
        description: "Rule the provinces. The pinnacle of Azoth.",
        perks: &[
            "/kit sovereign",
            "Unlimited homes",
            "Access: /enderchest, /nick",
            "Sovereign chat tag",
        ],
        featured: true,
        image: "/assets/endgame-bg.jpg",
        image_alt: "A chained fortress over lava beneath a lightning storm",
    },
    Package {
        slug: "relic-crate",
        name: "Relic Crate",
        category: "crate",
        price: "4.99",
        description: "A weathered chest of lost artifacts.",
        perks: &["1x Relic Crate key", "Common-to-rare loot"],
        featured: false,
        image: "/assets/loot-bg.jpg",
        image_alt: "A market stall with an open chest of glowing emeralds",
    },
    Package {
        slug: "vault-crate",
        name: "Vault Crate",
        category: "crate",
        price: "9.99",
        description: "Sealed vaults holding legendary gear.",
        perks: &["1x Vault Crate key", "Rare-to-legendary loot"],
        featured: false,
        image: "/assets/loot-bg.jpg",
        image_alt: "A market stall guarded by a chest of rare loot",
    },
    Package {
        slug: "familiar-whisper",
        name: "Familiar Whisper",
        category: "cosmetic",
        price: "6.99",
        description: "A spectral fox that trails your steps.",
        perks: &["Cosmetic pet: Spectral Fox"],
        featured: false,
        image: "/assets/world-bg.jpg",
        image_alt: "A fortified hill town and mountain valley",
    },
    Package {
        slug: "rune-trail",
        name: "Rune Trail",
        category: "cosmetic",
        price: "3.99",
        description: "Leave a trail of glowing runes.",
        perks: &["Particle effect: Rune Trail"],
        featured: false,
        image: "/assets/quests-bg.jpg",
        image_alt: "An enchanted forest ruin lit by colorful lanterns",
    },
    Package {
        slug: "emerald-pouch-500",
        name: "Emerald Pouch (500)",
        category: "coin",
        price: "5.00",
        description: "500 emeralds for the player-driven trade market.",
        perks: &["+500 emeralds in-game"],
        featured: false,
        image: "/assets/loot-bg.jpg",
        image_alt: "Glowing emeralds spread across a treasure market",
    },
    Package {
        slug: "emerald-pouch-1200",
        name: "Emerald Pouch (1200)",
        category: "coin",
        price: "10.00",
        description: "1200 emeralds. Best value per emerald.",
        perks: &["+1200 emeralds in-game"],
        featured: false,
        image: "/assets/loot-bg.jpg",
        image_alt: "A deep chest overflowing with emerald currency",
    },
    Package {
        slug: "starter-bundle",
        name: "Starter Bundle",
        category: "bundle",
        price: "14.99",
        description: "Everything a new adventurer needs.",
        perks: &["Adventurer Rank", "Relic Crate key x2", "Familiar Whisper"],
        featured: true,
        image: "/assets/hero-bg.jpg",
        image_alt: "A bright mountain pass through pine forests",
    },
    Package {
        slug: "raid-bundle",
        name: "Raid Bundle",
        category: "bundle",
        price: "24.99",
        description: "Gear up your guild for endgame raids.",
        perks: &["Vault Crate key x3", "Emerald Pouch (500)", "Rune Trail"],
        featured: false,
        image: "/assets/endgame-bg.jpg",
        image_alt: "A chained fortress over lava beneath a lightning storm",
    },
];

fn package_url(slug: &str) -> String {
    format!("https://store.azothmc.com/package/{slug}")
}
const CATEGORIES: [(&str, &str); 6] = [
    ("all", "All"),
    ("rank", "Ranks"),
    ("crate", "Crates"),
    ("cosmetic", "Cosmetics"),
    ("coin", "Coins"),
    ("bundle", "Bundles"),
];

fn tabs() -> String {
    CATEGORIES
        .iter()
        .map(|(slug, label)| {
            let pressed = *slug == "all";
            format!(
                r#"<button type="button" data-category="{slug}" aria-pressed="{pressed}">{label}</button>"#
            )
        })
        .collect()
}

fn catalog() -> String {
    PACKAGES
        .iter()
        .map(|p| {
            let perks = p
                .perks
                .iter()
                .map(|perk| format!("<li>{perk}</li>"))
                .collect::<String>();
            let featured = if p.featured {
                r#" data-featured="true""#
            } else {
                ""
            };
            let badge = if p.featured {
                r#"<span class="product__badge">Popular</span>"#
            } else {
                ""
            };
            let search =
                format!("{} {} {}", p.name, p.description, p.perks.join(" ")).to_lowercase();
            format!(
                r#"<article class="product" data-testid="product-card" data-category="{category}" data-search="{search}"{featured}><img class="product__thumb" data-testid="product-image" src="{image}" alt="{alt}" loading="lazy" decoding="async"><div class="product__main"><div class="product__title"><h2>{name}</h2>{badge}</div><p class="product__desc">{description}</p><ul class="product__perks">{perks}</ul></div><p class="product__price">${price}</p><a class="btn btn--primary btn--sm" data-testid="product-buy" href="{url}" target="_blank" rel="noopener noreferrer">Purchase</a></article>"#,
                category = p.category,
                search = html_escape(&search),
                image = p.image,
                alt = p.image_alt,
                name = p.name,
                description = p.description,
                price = p.price,
                url = package_url(p.slug),
            )
        })
        .collect()
}

pub async fn index() -> Html<String> {
    layout::page(
        "Store | AzothMC",
        Nav::Store,
        &format!(
            r#"<section class="page-head" data-testid="store-hero"><div class="container"><div class="page-head__inner"><span class="eyebrow">AzothMC / Webstore</span><h1>Store</h1><p class="lead">Support the realm and unlock perks for your journey. Deliveries land in-game in about a minute.</p></div></div></section>
<section class="section section--tight" data-testid="store-page"><div class="container">
  <div class="store-toolbar">
    <nav class="tabs" data-testid="store-tabs" aria-label="Filter by category">{tabs}</nav>
    <label class="search">Search packages<input data-testid="store-search" id="store-search" type="search" aria-label="Search packages" placeholder="Search ranks, crates, coins…"></label>
  </div>
  <div class="catalog" data-testid="store-grid">{catalog}</div>
  <p class="store-empty" data-testid="store-empty" hidden>No packages match your search.</p>
  <div class="panel-grid">
    <section class="panel" data-testid="market-panel"><h2>Player market</h2><p>Explore the seeded market snapshot and 24h price trends.</p><a href="/api/v1/items">Market data →</a></section>
    <section class="panel" data-testid="delivery-note"><h2>Delivery</h2><p>Deliveries arrive in-game within about 1-2 minutes, even if you are offline.</p></section>
  </div>
</div><script src="/assets/store.js" defer></script></section>"#,
            tabs = tabs(),
            catalog = catalog(),
        ),
    )
}

fn html_escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('"', "&quot;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn catalog_has_expected_packages() {
        assert_eq!(PACKAGES.len(), 12);
        assert!(PACKAGES.iter().any(|p| p.featured));
    }
}
