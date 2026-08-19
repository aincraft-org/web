//! Webstore catalog.
//!
//! Prices are held as integer cents so value claims are computed rather than
//! asserted in copy: coin packs derive an emeralds-per-dollar rate, and bundles
//! derive their saving from the list price of their own components.

use axum::response::Html;

use crate::layout::{self, Nav};

#[derive(Clone, Copy, PartialEq, Eq)]
enum Category {
    Rank,
    Bundle,
    Crate,
    Coin,
    Cosmetic,
}

impl Category {
    fn slug(self) -> &'static str {
        match self {
            Self::Rank => "rank",
            Self::Bundle => "bundle",
            Self::Crate => "crate",
            Self::Coin => "coin",
            Self::Cosmetic => "cosmetic",
        }
    }

    fn label(self) -> &'static str {
        match self {
            Self::Rank => "Ranks",
            Self::Bundle => "Bundles",
            Self::Crate => "Crates",
            Self::Coin => "Coins",
            Self::Cosmetic => "Cosmetics",
        }
    }

    fn blurb(self) -> &'static str {
        match self {
            Self::Rank => "Permanent account upgrades. Each tier includes everything below it.",
            Self::Bundle => "Fixed collections priced below the sum of their parts.",
            Self::Crate => "Single-use keys. Loot is rolled when you open them in-game.",
            Self::Coin => "Emeralds for the player-driven trade market.",
            Self::Cosmetic => "Appearance only. No effect on stats or progression.",
        }
    }
}

/// Group order on the page, and the order of the filter pills after "All".
const GROUPS: [Category; 5] = [
    Category::Rank,
    Category::Bundle,
    Category::Crate,
    Category::Coin,
    Category::Cosmetic,
];

/// The one package allowed to carry the popular badge.
const MOST_POPULAR: &str = "ember-knight-rank";

struct Package {
    slug: &'static str,
    name: &'static str,
    category: Category,
    price_cents: u32,
    description: &'static str,
    /// The single comparable figure surfaced on rank tier cards.
    highlight: &'static str,
    perks: &'static [&'static str],
    /// Emeralds granted; drives the coin-pack rate. Zero when not a coin pack.
    emeralds: u32,
    /// Rank ladder position from 1. Zero when not a rank.
    tier: u8,
    /// Component packages as `(slug, quantity)`; drives bundle savings.
    contents: &'static [(&'static str, u32)],
}

const PACKAGES: [Package; 12] = [
    Package {
        slug: "adventurer-rank",
        name: "Adventurer Rank",
        category: Category::Rank,
        price_cents: 999,
        description: "Step into Azoth with a head start.",
        highlight: "2 homes",
        perks: &["/kit adventurer", "Access: /sethome"],
        emeralds: 0,
        tier: 1,
        contents: &[],
    },
    Package {
        slug: "ember-knight-rank",
        name: "Ember Knight Rank",
        category: Category::Rank,
        price_cents: 1999,
        description: "March with the Ember Guard of the frontier.",
        highlight: "5 homes",
        perks: &["/kit ember-knight", "Access: /hat, /workbench"],
        emeralds: 0,
        tier: 2,
        contents: &[],
    },
    Package {
        slug: "arcane-scholar-rank",
        name: "Arcane Scholar Rank",
        category: Category::Rank,
        price_cents: 2999,
        description: "Unlock forgotten tomes and crafting stations.",
        highlight: "8 homes",
        perks: &[
            "/kit arcane-scholar",
            "Access: /anvil, /grindstone",
            "Scholar chat tag",
        ],
        emeralds: 0,
        tier: 3,
        contents: &[],
    },
    Package {
        slug: "sovereign-rank",
        name: "Sovereign Rank",
        category: Category::Rank,
        price_cents: 4999,
        description: "Rule the provinces. The pinnacle of Azoth.",
        highlight: "Unlimited homes",
        perks: &[
            "/kit sovereign",
            "Access: /enderchest, /nick",
            "Sovereign chat tag",
        ],
        emeralds: 0,
        tier: 4,
        contents: &[],
    },
    Package {
        slug: "starter-bundle",
        name: "Starter Bundle",
        category: Category::Bundle,
        price_cents: 1499,
        description: "Everything a new adventurer needs.",
        highlight: "",
        perks: &["Adventurer Rank", "Relic Crate key x2", "Familiar Whisper"],
        emeralds: 0,
        tier: 0,
        contents: &[
            ("adventurer-rank", 1),
            ("relic-crate", 2),
            ("familiar-whisper", 1),
        ],
    },
    Package {
        slug: "raid-bundle",
        name: "Raid Bundle",
        category: Category::Bundle,
        price_cents: 2499,
        description: "Gear up your guild for endgame raids.",
        highlight: "",
        perks: &["Vault Crate key x3", "Emerald Pouch (500)", "Rune Trail"],
        emeralds: 0,
        tier: 0,
        contents: &[
            ("vault-crate", 3),
            ("emerald-pouch-500", 1),
            ("rune-trail", 1),
        ],
    },
    Package {
        slug: "relic-crate",
        name: "Relic Crate",
        category: Category::Crate,
        price_cents: 499,
        description: "A weathered chest of lost artifacts.",
        highlight: "",
        perks: &["1x Relic Crate key", "Common-to-rare loot"],
        emeralds: 0,
        tier: 0,
        contents: &[],
    },
    Package {
        slug: "vault-crate",
        name: "Vault Crate",
        category: Category::Crate,
        price_cents: 999,
        description: "Sealed vaults holding legendary gear.",
        highlight: "",
        perks: &["1x Vault Crate key", "Rare-to-legendary loot"],
        emeralds: 0,
        tier: 0,
        contents: &[],
    },
    Package {
        slug: "emerald-pouch-500",
        name: "Emerald Pouch (500)",
        category: Category::Coin,
        price_cents: 500,
        description: "A working purse for day-to-day trading.",
        highlight: "",
        perks: &["+500 emeralds in-game"],
        emeralds: 500,
        tier: 0,
        contents: &[],
    },
    Package {
        slug: "emerald-pouch-1200",
        name: "Emerald Pouch (1200)",
        category: Category::Coin,
        price_cents: 1000,
        description: "A war chest for guild-scale trading.",
        highlight: "",
        perks: &["+1200 emeralds in-game"],
        emeralds: 1200,
        tier: 0,
        contents: &[],
    },
    Package {
        slug: "familiar-whisper",
        name: "Familiar Whisper",
        category: Category::Cosmetic,
        price_cents: 699,
        description: "A spectral fox that trails your steps.",
        highlight: "",
        perks: &["Cosmetic pet: Spectral Fox"],
        emeralds: 0,
        tier: 0,
        contents: &[],
    },
    Package {
        slug: "rune-trail",
        name: "Rune Trail",
        category: Category::Cosmetic,
        price_cents: 399,
        description: "Leave a trail of glowing runes.",
        highlight: "",
        perks: &["Particle effect: Rune Trail"],
        emeralds: 0,
        tier: 0,
        contents: &[],
    },
];

fn package_url(slug: &str) -> String {
    format!("https://store.azothmc.com/package/{slug}")
}

fn find(slug: &str) -> Option<&'static Package> {
    PACKAGES.iter().find(|package| package.slug == slug)
}

fn money(cents: u32) -> String {
    format!("${}.{:02}", cents / 100, cents % 100)
}

/// List price of a bundle's components bought separately.
fn components_total_cents(package: &Package) -> Option<u32> {
    if package.contents.is_empty() {
        return None;
    }
    let mut total = 0;
    for (slug, quantity) in package.contents {
        total += find(slug)?.price_cents * quantity;
    }
    Some(total)
}

/// Bundle saving as `(cents, whole percent)`, or `None` when there is none.
fn savings(package: &Package) -> Option<(u32, u32)> {
    let total = components_total_cents(package)?;
    let saved = total.checked_sub(package.price_cents)?;
    (saved > 0).then(|| (saved, saved * 100 / total))
}

/// Emeralds granted per dollar spent; the comparable rate across coin packs.
fn emeralds_per_dollar(package: &Package) -> Option<u32> {
    (package.emeralds > 0 && package.price_cents > 0)
        .then(|| package.emeralds * 100 / package.price_cents)
}

fn best_emerald_rate() -> u32 {
    PACKAGES
        .iter()
        .filter_map(emeralds_per_dollar)
        .max()
        .unwrap_or_default()
}

/// The computed value note shown beside a package name, if it has one.
fn value_note(package: &Package) -> String {
    if let Some((saved, percent)) = savings(package) {
        return format!(
            r#"<span class="product__value">Save {} ({percent}%)</span>"#,
            money(saved)
        );
    }
    match emeralds_per_dollar(package) {
        Some(rate) if rate == best_emerald_rate() => format!(
            r#"<span class="product__value product__value--best">{rate} emeralds per $1 — best rate</span>"#
        ),
        Some(rate) => format!(r#"<span class="product__value">{rate} emeralds per $1</span>"#),
        None => String::new(),
    }
}

fn sigil_svg(inner: &str) -> String {
    format!(
        r#"<svg class="sigil" data-testid="product-image" viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" role="img" aria-hidden="true" focusable="false">{inner}</svg>"#
    )
}

/// Rank sigil: four chevrons with the tier's position lit, so the ladder is
/// readable from the mark alone.
fn rank_sigil(tier: u8) -> String {
    let inner = [18u32, 14, 10, 6]
        .iter()
        .enumerate()
        .map(|(index, y)| {
            let lit = (index as u8) < tier;
            let class = if lit { "sigil__lit" } else { "sigil__dim" };
            format!(r#"<path class="{class}" d="M5 {y} l7 -4.5 l7 4.5" />"#)
        })
        .collect::<String>();
    sigil_svg(&inner)
}

fn sigil(package: &Package) -> String {
    match package.category {
        Category::Rank => rank_sigil(package.tier),
        Category::Bundle => sigil_svg(
            r#"<path class="sigil__lit" d="M4 10 h16 v10 H4 Z" /><path class="sigil__dim" d="M12 10 v10" /><path class="sigil__lit" d="M7 4 q5 2.5 5 6 q0 -3.5 5 -6" />"#,
        ),
        Category::Crate => sigil_svg(
            r#"<path class="sigil__lit" d="M5 9 h14 v10 a1 1 0 0 1 -1 1 H6 a1 1 0 0 1 -1 -1 Z" /><path class="sigil__dim" d="M3 5 h18 v4 H3 Z" /><path class="sigil__lit" d="M12 13 v3" />"#,
        ),
        Category::Coin => sigil_svg(
            r#"<path class="sigil__lit" d="M12 3 l7 6.5 -7 11.5 -7 -11.5 Z" /><path class="sigil__dim" d="M5 9.5 h14 M12 3 v18" />"#,
        ),
        Category::Cosmetic => sigil_svg(
            r#"<path class="sigil__lit" d="M11 4 l1.7 5.3 5.3 1.7 -5.3 1.7 -1.7 5.3 -1.7 -5.3 -5.3 -1.7 5.3 -1.7 Z" /><path class="sigil__dim" d="M18.5 16.5 l.8 2.2 2.2 .8 -2.2 .8 -.8 2.2 -.8 -2.2 -2.2 -.8 2.2 -.8 Z" />"#,
        ),
    }
}

fn html_escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('"', "&quot;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

/// Attributes every package shares, so filtering behaves identically whether a
/// package renders as a tier card or a catalog row.
fn card_attrs(package: &Package) -> String {
    let haystack = format!(
        "{} {} {} {}",
        package.name,
        package.description,
        package.highlight,
        package.perks.join(" ")
    )
    .to_lowercase();
    let featured = if package.slug == MOST_POPULAR {
        r#" data-featured="true""#
    } else {
        ""
    };
    format!(
        r#" data-testid="product-card" data-category="{}" data-search="{}"{featured}"#,
        package.category.slug(),
        html_escape(&haystack)
    )
}

fn badge(package: &Package) -> &'static str {
    if package.slug == MOST_POPULAR {
        r#"<span class="product__badge">Most popular</span>"#
    } else {
        ""
    }
}

fn buy_link(package: &Package) -> String {
    format!(
        r#"<a class="btn btn--primary btn--sm" data-testid="product-buy" href="{}" target="_blank" rel="noopener noreferrer">Purchase<span class="u-sr-only"> {}</span></a>"#,
        package_url(package.slug),
        package.name
    )
}

fn perk_list(package: &Package, class: &str) -> String {
    let items = package
        .perks
        .iter()
        .map(|perk| format!("<li>{perk}</li>"))
        .collect::<String>();
    format!(r#"<ul class="{class}">{items}</ul>"#)
}

/// Ranks render as a comparison ladder rather than as rows.
///
/// The badge takes the head slot on the popular tier so every card keeps the
/// same row count and the purchase buttons stay on one line. The tier number is
/// still announced to assistive tech, since the sigil itself is decorative.
fn tier_card(package: &Package) -> String {
    let step = format!("Tier {} of 4", package.tier);
    let head_end = if package.slug == MOST_POPULAR {
        format!(r#"{}<span class="u-sr-only">{step}</span>"#, badge(package))
    } else {
        format!(r#"<span class="tier__step">{step}</span>"#)
    };
    format!(
        r#"<article class="tier"{attrs}>
  <div class="tier__head">{sigil}{head_end}</div>
  <h3 class="tier__name">{name}</h3>
  <p class="tier__price">{price}</p>
  <p class="tier__highlight">{highlight}</p>
  <p class="tier__desc">{description}</p>
  {perks}
  {buy}
</article>"#,
        attrs = card_attrs(package),
        sigil = sigil(package),
        name = package.name,
        price = money(package.price_cents),
        highlight = package.highlight,
        description = package.description,
        perks = perk_list(package, "tier__perks"),
        buy = buy_link(package),
    )
}

fn product_row(package: &Package) -> String {
    format!(
        r#"<article class="product"{attrs}>
  <span class="product__sigil">{sigil}</span>
  <div class="product__main">
    <div class="product__title"><h3>{name}</h3>{badge}{value}</div>
    <p class="product__desc">{description}</p>
    {perks}
  </div>
  <p class="product__price">{price}</p>
  {buy}
</article>"#,
        attrs = card_attrs(package),
        sigil = sigil(package),
        name = package.name,
        badge = badge(package),
        value = value_note(package),
        description = package.description,
        perks = perk_list(package, "product__perks"),
        price = money(package.price_cents),
        buy = buy_link(package),
    )
}

fn group_section(category: Category) -> String {
    let members: Vec<&Package> = PACKAGES
        .iter()
        .filter(|package| package.category == category)
        .collect();
    let count = members.len();
    let body = if category == Category::Rank {
        format!(
            r#"<div class="tier-grid">{}</div>"#,
            members.iter().map(|p| tier_card(p)).collect::<String>()
        )
    } else {
        format!(
            r#"<div class="catalog">{}</div>"#,
            members.iter().map(|p| product_row(p)).collect::<String>()
        )
    };
    format!(
        r#"<section class="group" data-group="{slug}" aria-labelledby="group-{slug}">
  <header class="group__head">
    <h2 id="group-{slug}">{label}</h2>
    <p class="group__meta">{count} {noun} · {blurb}</p>
  </header>
  {body}
</section>"#,
        slug = category.slug(),
        label = category.label(),
        noun = if count == 1 { "package" } else { "packages" },
        blurb = category.blurb(),
    )
}

fn tabs() -> String {
    let all = format!(
        r#"<button type="button" data-category="all" aria-pressed="true">All <span class="tabs__count">{}</span></button>"#,
        PACKAGES.len()
    );
    let rest = GROUPS
        .iter()
        .map(|category| {
            let count = PACKAGES
                .iter()
                .filter(|package| package.category == *category)
                .count();
            format!(
                r#"<button type="button" data-category="{}" aria-pressed="false">{} <span class="tabs__count">{count}</span></button>"#,
                category.slug(),
                category.label()
            )
        })
        .collect::<String>();
    format!("{all}{rest}")
}

pub async fn index() -> Html<String> {
    let groups = GROUPS.iter().map(|c| group_section(*c)).collect::<String>();
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
  <p class="store-count" data-testid="store-count" role="status">Showing all {total} packages</p>
  <div data-testid="store-grid">{groups}</div>
  <p class="store-empty" data-testid="store-empty" hidden>No packages match your search.</p>
  <div class="panel-grid">
    <section class="panel" data-testid="market-panel"><h2>Player market</h2><p>Explore the seeded market snapshot and 24h price trends.</p><a href="/api/v1/items">Market data →</a></section>
    <section class="panel" data-testid="delivery-note"><h2>Delivery</h2><p>Deliveries arrive in-game within about 1-2 minutes, even if you are offline.</p></section>
  </div>
</div><script src="/assets/store.js" defer></script></section>"#,
            tabs = tabs(),
            total = PACKAGES.len(),
        ),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn catalog_has_expected_packages() {
        assert_eq!(PACKAGES.len(), 12);
        assert_eq!(
            PACKAGES
                .iter()
                .filter(|p| p.category == Category::Rank)
                .count(),
            4
        );
    }

    #[test]
    fn exactly_one_package_is_badged_popular() {
        let badged = PACKAGES
            .iter()
            .filter(|p| p.slug == MOST_POPULAR)
            .count();
        assert_eq!(badged, 1, "the popular badge must not be diluted");
        assert_eq!(index_markup().matches("Most popular").count(), 1);
    }

    fn index_markup() -> String {
        let groups = GROUPS.iter().map(|c| group_section(*c)).collect::<String>();
        format!("{}{}", tabs(), groups)
    }

    #[test]
    fn every_package_renders_exactly_one_card_and_image() {
        let markup = index_markup();
        assert_eq!(markup.matches(r#"data-testid="product-card""#).count(), 12);
        assert_eq!(markup.matches(r#"data-testid="product-image""#).count(), 12);
        assert_eq!(markup.matches(r#"data-testid="product-buy""#).count(), 12);
    }

    #[test]
    fn money_formats_cents_with_two_decimals() {
        assert_eq!(money(999), "$9.99");
        assert_eq!(money(500), "$5.00");
        assert_eq!(money(1000), "$10.00");
        assert_eq!(money(4999), "$49.99");
    }

    #[test]
    fn bundle_savings_are_computed_from_component_prices() {
        // Adventurer 9.99 + 2x Relic 4.99 + Familiar 6.99 = 26.96, sold at 14.99.
        let starter = find("starter-bundle").expect("starter bundle exists");
        assert_eq!(components_total_cents(starter), Some(2696));
        assert_eq!(savings(starter), Some((1197, 44)));

        // 3x Vault 9.99 + Pouch 5.00 + Rune 3.99 = 38.96, sold at 24.99.
        let raid = find("raid-bundle").expect("raid bundle exists");
        assert_eq!(components_total_cents(raid), Some(3896));
        assert_eq!(savings(raid), Some((1397, 35)));
    }

    #[test]
    fn every_bundle_beats_buying_its_parts_separately() {
        for package in PACKAGES.iter().filter(|p| p.category == Category::Bundle) {
            assert!(
                savings(package).is_some(),
                "{} must cost less than its components",
                package.slug
            );
        }
    }

    #[test]
    fn bundle_contents_reference_real_packages() {
        for package in PACKAGES.iter() {
            for (slug, quantity) in package.contents {
                assert!(find(slug).is_some(), "unknown component slug: {slug}");
                assert!(*quantity > 0, "{slug} needs a positive quantity");
            }
        }
    }

    #[test]
    fn non_bundles_have_no_savings() {
        let rank = find("sovereign-rank").expect("sovereign exists");
        assert_eq!(components_total_cents(rank), None);
        assert_eq!(savings(rank), None);
    }

    #[test]
    fn larger_emerald_pouch_has_the_better_rate() {
        let small = find("emerald-pouch-500").expect("small pouch exists");
        let large = find("emerald-pouch-1200").expect("large pouch exists");
        assert_eq!(emeralds_per_dollar(small), Some(100));
        assert_eq!(emeralds_per_dollar(large), Some(120));
        assert_eq!(best_emerald_rate(), 120);
        assert!(value_note(large).contains("best rate"));
        assert!(!value_note(small).contains("best rate"));
    }

    #[test]
    fn rank_sigil_lights_one_chevron_per_tier() {
        for tier in 1..=4u8 {
            let svg = rank_sigil(tier);
            assert_eq!(svg.matches("sigil__lit").count(), usize::from(tier));
            assert_eq!(svg.matches("sigil__dim").count(), usize::from(4 - tier));
        }
    }

    #[test]
    fn ranks_render_as_tiers_and_others_as_rows() {
        let ranks = group_section(Category::Rank);
        assert!(ranks.contains("tier-grid"));
        assert_eq!(ranks.matches(r#"class="tier""#).count(), 4);

        let crates = group_section(Category::Crate);
        assert!(crates.contains(r#"<div class="catalog">"#));
        assert!(!crates.contains("tier-grid"));
    }

    #[test]
    fn every_group_is_rendered_and_accounts_for_all_packages() {
        let rendered: usize = GROUPS
            .iter()
            .map(|c| PACKAGES.iter().filter(|p| p.category == *c).count())
            .sum();
        assert_eq!(rendered, PACKAGES.len(), "every package needs a group");
    }

    #[test]
    fn search_haystack_is_lowercase_and_covers_perks() {
        let knight = find("ember-knight-rank").expect("knight exists");
        let attrs = card_attrs(knight);
        assert!(attrs.contains("ember knight rank"));
        assert!(attrs.contains("/kit ember-knight"));
        assert!(attrs.contains(r#"data-featured="true""#));
    }

    #[test]
    fn purchase_links_stay_canonical() {
        for package in PACKAGES.iter() {
            assert_eq!(
                package_url(package.slug),
                format!("https://store.azothmc.com/package/{}", package.slug)
            );
        }
    }

    #[test]
    fn slugs_are_unique() {
        let mut slugs: Vec<&str> = PACKAGES.iter().map(|p| p.slug).collect();
        slugs.sort_unstable();
        let total = slugs.len();
        slugs.dedup();
        assert_eq!(slugs.len(), total, "duplicate package slug");
    }

    #[test]
    fn html_escape_neutralizes_markup() {
        assert_eq!(html_escape(r#"<a href="x">&"#), "&lt;a href=&quot;x&quot;&gt;&amp;");
    }
}
