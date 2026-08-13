//! Domain types, seeded repository, and trend calculations for the
//! AzothMC item marketplace API.
//!
//! This module is deliberately secretless and read-only: all data lives in
//! memory and is seeded deterministically so responses are stable across
//! restarts (and across test runs).

use std::collections::BTreeMap;

use serde::Serialize;

/// Current snapshot of a single listing, exactly matching the design spec's
/// `ItemSummary` JSON shape.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct ItemSummary {
    pub slug: String,
    pub name: String,
    pub category: String,
    pub description: String,
    pub price: u64,
    pub currency: String,
    pub change_24h: f64,
    pub volume_24h: u64,
    pub market_activity: String,
    pub image: String,
}

/// A single point in a price-trend series.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct TrendPoint {
    /// RFC3339 UTC timestamp for this observation.
    pub timestamp: String,
    /// Emerald price at this point. Non-negative by construction.
    pub price: u64,
}

/// Response body for `GET /api/v1/items`, wrapping the listing set.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct ItemListResponse {
    pub items: Vec<ItemSummary>,
}

/// Response body for `GET /api/v1/items/{slug}/trends`.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct TrendResponse {
    pub slug: String,
    pub range: String,
    pub points: Vec<TrendPoint>,
}

/// Canonical trend range. Only `24h` is supported for now; new ranges extend
/// this enum and its table in `TrendRange::AS_STR`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TrendRange {
    Hours24,
}

impl TrendRange {
    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "24h" => Some(TrendRange::Hours24),
            _ => None,
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            TrendRange::Hours24 => "24h",
        }
    }
}

/// How many trend points are returned for a range.
///
/// The `24h` range returns 24 samples (`series.len()` must equal
/// `point_count_for` for the seeded data) spread evenly across the full
/// 24-hour lookback window: the oldest point is timestamped at exactly `24h`
/// ago and the newest at `0h` ago ("now"), so `points()` spans precisely 24
/// elapsed hours rather than only 23.
fn point_count_for(range: TrendRange) -> usize {
    match range {
        TrendRange::Hours24 => 24,
    }
}

/// Seeded trend series, indexed by slug. Each entry holds one price point per
/// hour-of-series (oldest first). For the `24h` range the series is exactly 24
/// points long, so every returned point maps one-to-one onto the hourly
/// samples that tile the full 24-hour lookback window.
#[derive(Debug, Clone)]
struct TrendRepo(BTreeMap<String, Vec<u64>>);

/// RFC3339 UTC timestamp `secs_ago` seconds before the fixed `now` anchor
/// (2026-08-12T00:00:00Z). `secs_ago == 0` is "now" for the seeded feed, so
/// trend points can be placed at sub-hour offsets (the 24h window is spread
/// across 23 even intervals, which is not an integral number of hours).
fn offset_iso(secs_ago: u64) -> String {
    const EPOCH_UTC_SECS: i64 = 1_786_492_800; // 2026-08-12T00:00:00Z
    let secs = EPOCH_UTC_SECS - secs_ago as i64;
    format_iso_utc(secs)
}

/// Whole-hour variant of [`offset_iso`], retained for the fixed hourly anchors
/// used by the seed comments and unit tests (`hours_ago == 0` is "now").
/// Test-only: no production path calls it, so gate it to test builds to keep
/// the library/binary free of dead-code warnings.
#[cfg(test)]
fn hour_offset_iso(hours_ago: u64) -> String {
    offset_iso(hours_ago * 3600)
}

/// Format a POSIX timestamp as RFC3339 UTC (`YYYY-MM-DDTHH:MM:SSZ`) without
/// pulling in chrono. `secs` is assumed non-negative.
fn format_iso_utc(secs: i64) -> String {
    let days = secs / 86_400;
    let rem = secs % 86_400;
    let (hh, mm, ss) = (rem / 3600, (rem % 3600) / 60, rem % 60);
    let (y, mo, d) = civil_from_days(days);
    format!("{y:04}-{mo:02}-{d:02}T{hh:02}:{mm:02}:{ss:02}Z")
}

/// Howard Hinnant's civil-from-days algorithm, in days since 1970-01-01.
fn civil_from_days(z: i64) -> (i64, u32, u32) {
    let z = z + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = z - era * 146_097; // [0, 146096]
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365; // [0, 399]
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100); // [0, 365]
    let mp = (5 * doy + 2) / 153; // [0, 11]
    let d = doy - (153 * mp + 2) / 5 + 1; // [1, 31]
    let m = if mp < 10 { mp + 3 } else { mp - 9 }; // [1, 12]
    (if m <= 2 { y + 1 } else { y }, m as u32, d as u32)
}

impl TrendRepo {
    fn seeded() -> Self {
        let mut repo = BTreeMap::new();

        // Any item in `catalog()` with market history gets a series here.
        // Hour 0 is "now"; the newest point is appended last.
        const NB_EMBERS: u64 = 1840;
        const NE_ARK: u64 = 520;
        const NE_WING: u64 = 640;
        const NE_HEART: u64 = 1009;
        const NE_PCOIN: u64 = 830;

        // Emberheart Core: steady climb over 24h (+7.4% vs 24h ago); the
        // oldest sample is chosen so `change_24h` rounds to 7.4.
        push_hours(&mut repo, "emberheart", 24, &[1714, 1715, 1724, 1730, 1732, 1738, 1740,
            1745, 1750, 1752, 1758, 1762, 1770, 1776, 1780, 1784, 1790, 1792, 1798, 1802,
            1810, 1812, 1820, NB_EMBERS]);

        // Netherite Ark: cooling off.
        push_hours(&mut repo, "netherite-ark", 24, &[560, 558, 556, 555, 553, 551, 550, 548,
            547, 545, 544, 542, 540, 538, 536, 534, 532, 530, 528, 526, 525, 523, 522, NE_ARK]);

        // Phantom Wing: mild volatility around a flat trend.
        push_hours(&mut repo, "phantom-wing", 24, &[636, 640, 634, 642, 638, 644, 640, 645,
            639, 646, 641, 648, 643, 649, 644, 641, 647, 643, 648, 646, 642, 645, 641, NE_WING]);

        // Voidhearth: slight rise.
        push_hours(&mut repo, "voidhearth", 24, &[980, 984, 988, 990, 992, 995, 996, 998,
            1000, 1001, 1003, 1004, 1005, 1006, 1005, 1005, 1006, 1007, 1008, 1008, 1009,
            1009, 1009, NE_HEART]);

        // Packed Compass Coin: small oscillation.
        push_hours(&mut repo, "packed-compass-coin", 24, &[824, 826, 821, 828, 825, 830,
            827, 831, 826, 829, 824, 827, 822, 826, 821, 824, 822, 825, 823, 826, 824, 828,
            826, NE_PCOIN]);

        TrendRepo(repo)
    }

    /// Returns the points for a range, oldest to newest, or `None` if the slug
    /// has no seeded history.
    ///
    /// The `n` samples are spread evenly across the full lookback window so
    /// they tile exactly `24h` of elapsed time: the oldest point is
    /// timestamped at exactly `24h` ago and the newest at `0h` ago ("now").
    /// With `n` points there are `n - 1` even intervals, each of
    /// `24h / (n - 1)`, so spacing is sub-hour (timestamps are truncated to
    /// whole seconds while the 24h endpoints stay exact).
    fn points(&self, slug: &str, range: TrendRange) -> Option<Vec<TrendPoint>> {
        let series = self.0.get(slug)?;
        let n = point_count_for(range);
        let start = series.len().saturating_sub(n);
        let series = &series[start..];
        // Window length in seconds, divided evenly across the `n - 1`
        // intervals. `n - 1` would be 0 only for a degenerate single-point
        // range, which `point_count_for` never yields.
        const WINDOW_SECS: u64 = 24 * 3600;
        let step_den = (n - 1) as u64;
        let points = series
            .iter()
            .enumerate()
            .map(|(idx, &price)| {
                // idx=0 is the oldest sample, at the full 24h offset; idx=
                // `len-1` is the newest, at offset 0h ("now") so its price is
                // exactly the current listing price. Integer `u64` arithmetic
                // keeps the endpoints exact: idx 0 -> 0 elapsed of the
                // window, idx n-1 -> (n-1) elapsed units = the full window.
                let elapsed = idx as u64 * WINDOW_SECS / step_den;
                let secs_ago = WINDOW_SECS - elapsed;
                TrendPoint {
                    timestamp: offset_iso(secs_ago),
                    price,
                }
            })
            .collect();
        Some(points)
    }
}

/// Append a fixed-length hourly series (oldest first) to the repo for `slug`.
fn push_hours(repo: &mut BTreeMap<String, Vec<u64>>, slug: &str, hours: usize, prices: &[u64]) {
    assert_eq!(prices.len(), hours, "seeded series length mismatch for {slug}");
    let mut series = Vec::with_capacity(hours);
    for &price in prices {
        series.push(price);
    }
    repo.insert(slug.to_string(), series);
}

/// Seeded repository of item listings and their trend history.
#[derive(Debug, Clone)]
pub struct MarketRepo {
    items: BTreeMap<String, ItemSummary>,
    trends: TrendRepo,
}

/// Default image referenced by seeded listings, matching the design spec.
const DEFAULT_IMAGE: &str = "/assets/loot-bg.jpg";

impl MarketRepo {
    pub fn seeded() -> Self {
        let trends = TrendRepo::seeded();
        let items = catalog(&trends);
        MarketRepo { items, trends }
    }

    /// All listings, in the canonical seeded order (catalog insertion order).
    pub fn items(&self) -> Vec<ItemSummary> {
        catalog_order()
            .into_iter()
            .filter_map(|slug| self.items.get(slug))
            .cloned()
            .collect()
    }

    /// Look up a single listing by slug.
    pub fn item(&self, slug: &str) -> Option<&ItemSummary> {
        self.items.get(slug)
    }

    /// Trend points for a slug and range, oldest to newest. Returns `None`
    /// both for unknown slugs and for slugs without a seeded series.
    pub fn trends(&self, slug: &str, range: TrendRange) -> Option<Vec<TrendPoint>> {
        self.trends.points(slug, range)
    }
}

/// Build the seeded listing map. Order for `MarketRepo::items` is kept
/// separately via `catalog_order` so listing order is stable.
///
/// `change_24h` is not hardcoded: it is computed from each item's 24h trend
/// series (percent change, oldest→newest, rounded to one decimal) so the
/// summary and its trend chart can never drift apart.
fn catalog(trends: &TrendRepo) -> BTreeMap<String, ItemSummary> {
    let mut m = BTreeMap::new();
    let mut add = |slug: &str,
                   name: &str,
                   category: &str,
                   description: &str,
                   price: u64,
                   volume_24h: u64,
                   market_activity: &str| {
        m.insert(
            slug.to_string(),
            ItemSummary {
                slug: slug.to_string(),
                name: name.to_string(),
                category: category.to_string(),
                description: description.to_string(),
                price,
                currency: "emeralds".to_string(),
                change_24h: change_24h_for(trends, slug),
                volume_24h,
                market_activity: market_activity.to_string(),
                image: DEFAULT_IMAGE.to_string(),
            },
        );
    };

    // Every slug below must have a matching series in `TrendRepo::seeded` and
    // an entry in `catalog_order`; add all three together for any new item.
    add("emberheart", "Emberheart Core", "Relic",
        "A volatile core sought by forge guilds.", 1840, 128, "Rising");
    add("netherite-ark", "Netherite Ark", "Block",
        "A reinforced arcane vault for rare ores.", 520, 342, "Cooling");
    add("phantom-wing", "Phantom Wing", "Material",
        "A spectral wing from the End's hidden coves.", 640, 91, "Stable");
    add("voidhearth", "Voidhearth", "Relic",
        "Steadily glowing heart mined from the void.", 1009, 57, "Rising");
    add("packed-compass-coin", "Packed Compass Coin", "Token",
        "A coin that always points toward the nearest player market.", 830, 205, "Stable");

    m
}

/// The `change_24h` for `slug`: percent change from the first to the last
/// point of its 24h trend series, rounded to one decimal — the same value the
/// UI renders (frontend `toFixed(1)`). Panics on programmer error if the slug
/// lacks a seeded series; every catalog item must have one.
fn change_24h_for(trends: &TrendRepo, slug: &str) -> f64 {
    let points = trends
        .points(slug, TrendRange::Hours24)
        .unwrap_or_else(|| panic!("no 24h trend series for catalog item {slug}"));
    let first = points.first().expect("24h trend is non-empty").price as f64;
    let last = points.last().expect("24h trend is non-empty").price as f64;
    round_one_decimal((last - first) / first * 100.0)
}

/// Round a percentage to one decimal place (round-half-away-from-zero), the
/// canonical form of the frontend's `change_24h.toFixed(1)` rendering.
fn round_one_decimal(x: f64) -> f64 {
    (x * 10.0).round() / 10.0
}

/// Canonical display order for the seeded listing set.
fn catalog_order() -> Vec<&'static str> {
    vec![
        "emberheart",
        "netherite-ark",
        "phantom-wing",
        "voidhearth",
        "packed-compass-coin",
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn seeded_catalog_is_nonempty_and_ordered() {
        let repo = MarketRepo::seeded();
        let items = repo.items();
        assert!(!items.is_empty(), "catalog must have at least one item");
        // Canonical order preserved.
        let slugs: Vec<&str> = items.iter().map(|i| i.slug.as_str()).collect();
        assert_eq!(slugs, catalog_order());
    }

    #[test]
    fn all_listings_serialize_with_non_negative_prices() {
        // Prices are `u64`, but assert the serialized wire shape too so an
        // accidental schema change to a signed type is caught here.
        let repo = MarketRepo::seeded();
        for item in repo.items() {
            let json = serde_json::to_value(&item).expect("item serializes");
            // Must be an unsigned integer, never a negative/signed price.
            let _ = json["price"].as_u64().expect("price is an unsigned int");
        }
    }

    #[test]
    fn seeded_catalog_fields_match_design_spec() {
        let repo = MarketRepo::seeded();
        let e = repo.item("emberheart").expect("emberheart present");
        assert_eq!(e.slug, "emberheart");
        assert_eq!(e.name, "Emberheart Core");
        assert_eq!(e.category, "Relic");
        assert_eq!(e.price, 1840);
        assert_eq!(e.currency, "emeralds");
        assert_eq!(e.change_24h, 7.4);
        assert_eq!(e.volume_24h, 128);
        assert_eq!(e.market_activity, "Rising");
        assert_eq!(e.image, "/assets/loot-bg.jpg");
    }

    #[test]
    fn every_catalog_item_has_a_24h_trend_series() {
        let repo = MarketRepo::seeded();
        for item in repo.items() {
            let trends = repo
                .trends(&item.slug, TrendRange::Hours24)
                .unwrap_or_else(|| panic!("missing trend series for {}", item.slug));
            assert_eq!(trends.len(), 24, "{} should have 24 points", item.slug);
            // Oldest first and strictly ordered timestamps.
            for pair in trends.windows(2) {
                assert!(
                    pair[0].timestamp < pair[1].timestamp,
                    "trend timestamps not increasing for {}",
                    item.slug
                );
            }
            // The window truly covers a full 24 hours: the oldest point is at
            // exactly 24h ago and the newest at the current moment (0h ago).
            assert_eq!(
                trends.first().expect("non-empty").timestamp,
                hour_offset_iso(24),
                "{} oldest trend must be exactly 24h ago",
                item.slug
            );
            assert_eq!(
                trends.last().expect("non-empty").timestamp,
                hour_offset_iso(0),
                "{} newest trend must be exactly 0h ago (now)",
                item.slug
            );
        }
    }

    #[test]
    fn trend_points_serialize_as_non_negative_and_newest_matches_current() {
        let repo = MarketRepo::seeded();
        for item in repo.items() {
            let trends = repo.trends(&item.slug, TrendRange::Hours24).unwrap();
            // Newest point price equals the current listing price.
            assert_eq!(
                trends.last().expect("non-empty").price,
                item.price,
                "{} newest trend must match current price",
                item.slug
            );
            // Wire shape: prices are unsigned ints.
            for p in &trends {
                let json = serde_json::to_value(p).expect("point serializes");
                let _ = json["price"].as_u64().expect("non-unsigned price");
            }
        }
    }

    #[test]
    fn every_item_change_24h_matches_first_to_last_trend_rounded() {
        // Each listing's `change_24h` must exactly equal the percent change
        // between the first and last point of its 24h trend series, rounded to
        // one decimal — the same value the UI renders (`toFixed(1)`). The seed
        // derives it this way, so this pin holds by construction and guards
        // against any future drift between the summary and its trend chart.
        let repo = MarketRepo::seeded();
        for item in repo.items() {
            let trends = repo
                .trends(&item.slug, TrendRange::Hours24)
                .expect("trend series present");
            let first = trends.first().expect("non-empty").price as f64;
            let last = trends.last().expect("non-empty").price as f64;
            let computed = round_one_decimal((last - first) / first * 100.0);
            assert_eq!(
                item.change_24h, computed,
                "{} change_24h {} must exactly match its 24h trend first-to-last ({:.2}%) rounded to one decimal",
                item.slug,
                item.change_24h,
                (last - first) / first * 100.0,
            );
        }
    }

    #[test]
    fn unknown_slug_has_no_trend_series() {
        let repo = MarketRepo::seeded();
        assert!(repo.trends("does-not-exist", TrendRange::Hours24).is_none());
    }

    #[test]
    fn unsupported_range_is_rejected() {
        assert!(TrendRange::parse("24h").is_some());
        assert!(TrendRange::parse("7d").is_none());
        assert!(TrendRange::parse("").is_none());
        assert!(TrendRange::parse("24H").is_none());
    }

    #[test]
    fn timestamps_are_rfc3339_utc() {
        // Fixed anchor: hour 0 == 2026-08-12T00:00:00Z.
        assert_eq!(hour_offset_iso(0), "2026-08-12T00:00:00Z");
        assert_eq!(hour_offset_iso(1), "2026-08-11T23:00:00Z");
        // 24h back lands on the prior day boundary.
        assert_eq!(hour_offset_iso(24), "2026-08-11T00:00:00Z");
    }

    #[test]
    fn trend_range_str_roundtrip() {
        let r = TrendRange::parse("24h").expect("valid range string");
        assert_eq!(r.as_str(), "24h");
    }
}
