use std::path::{Path as FsPath, PathBuf};

use axum::{
    body::Body,
    extract::Path,
    http::{header, HeaderValue, StatusCode},
    response::{Html, IntoResponse, Response},
};
use tokio::fs;

use crate::layout::{self, Nav, SERVER_ADDRESS};

/// A full-width feature band pairing artwork with copy.
struct Band {
    id: &'static str,
    eyebrow: &'static str,
    title: &'static str,
    lead: &'static str,
    points: &'static [&'static str],
    image: &'static str,
    image_alt: &'static str,
}

const BANDS: [Band; 4] = [
    Band {
        id: "world",
        eyebrow: "The realm",
        title: "A world with history",
        lead: "Discover regions shaped by ancient forces and living stories. Every skyline is placed by hand, not spat out by a generator.",
        points: &[
            "Handcrafted kingdoms, ruins, and frontier roads",
            "Regions that reward the players who read them",
            "Landmarks that mean something when you find them",
        ],
        image: "/assets/world-bg.jpg",
        image_alt: "A fortified hill town below a mountain valley",
    },
    Band {
        id: "loot",
        eyebrow: "Spoils",
        title: "Items worth chasing",
        lead: "Build a collection that reflects how you play. Gear carries provenance, and the emerald economy is driven by players, not vendors.",
        points: &[
            "Relics with real scarcity",
            "A player-driven emerald market",
            "Trade histories you can actually look up",
        ],
        image: "/assets/loot-bg.jpg",
        image_alt: "A market stall with an open chest of glowing emeralds",
    },
    Band {
        id: "quests",
        eyebrow: "Chronicles",
        title: "Quests with consequence",
        lead: "Follow stories that reward curiosity and courage. Branching quest lines remember the choices you made three chapters ago.",
        points: &[
            "Branching lines across rival kingdoms",
            "Choices that close doors as well as open them",
            "No two expeditions run the same way",
        ],
        image: "/assets/quests-bg.jpg",
        image_alt: "An enchanted forest ruin lit by colorful lanterns",
    },
    Band {
        id: "endgame",
        eyebrow: "Endgame",
        title: "The journey continues",
        lead: "Master endgame challenges with your community. Raid windows, world bosses, and guild campaigns keep the frontier moving.",
        points: &[
            "Coordinated raid windows",
            "World bosses that need a real roster",
            "Guild campaigns for the long haul",
        ],
        image: "/assets/endgame-bg.jpg",
        image_alt: "A chained fortress over lava beneath a lightning storm",
    },
];

/// The three-step onboarding cards under the introduction.
const STEPS: [(&str, &str, &str); 3] = [
    (
        "01",
        "Choose a path",
        "Start a character, pick a discipline, and take your first contract on the frontier.",
    ),
    (
        "02",
        "Find your people",
        "Squad up for raid windows, join a guild, and trade on the open emerald market.",
    ),
    (
        "03",
        "Leave a mark",
        "Chase relics, finish chronicles, and put your name on the endgame ladder.",
    ),
];

fn ip_chip() -> String {
    format!(
        r#"<span class="ip"><span class="ip__addr">{SERVER_ADDRESS}</span><button class="btn btn--primary btn--sm ip__copy" type="button" data-copy-text="{SERVER_ADDRESS}">Copy IP</button></span>"#
    )
}

fn bands() -> String {
    BANDS
        .iter()
        .enumerate()
        .map(|(index, band)| {
            let reverse = if index % 2 == 1 { " band--reverse" } else { "" };
            let points = band
                .points
                .iter()
                .map(|point| format!("<li>{point}</li>"))
                .collect::<String>();
            format!(
                r#"<section class="band{reverse} reveal" id="{id}" aria-labelledby="{id}-title">
  <div class="band__body">
    <span class="eyebrow">{eyebrow}</span>
    <h2 id="{id}-title">{title}</h2>
    <p class="lead">{lead}</p>
    <ul class="checks">{points}</ul>
  </div>
  <figure class="band__art"><img src="{image}" alt="{alt}" loading="lazy" decoding="async"></figure>
</section>"#,
                id = band.id,
                eyebrow = band.eyebrow,
                title = band.title,
                lead = band.lead,
                image = band.image,
                alt = band.image_alt,
            )
        })
        .collect()
}

fn steps() -> String {
    STEPS
        .iter()
        .map(|(num, title, copy)| {
            format!(
                r#"<article class="card"><span class="card__num">{num}</span><h3>{title}</h3><p>{copy}</p></article>"#
            )
        })
        .collect()
}

pub async fn landing_page() -> Html<String> {
    let hero = format!(
        r#"<section class="hero" id="hero" aria-labelledby="hero-title">
  <img class="hero__art" src="/assets/hero-bg.jpg" alt="" aria-hidden="true" fetchpriority="high">
  <div class="container hero__inner">
    <span class="tag tag--live">Season zero — live</span>
    <h1 id="hero-title">A world worth getting lost in.</h1>
    <p class="lead">Explore a living Minecraft MMORPG built for discovery, mastery, and community.</p>
    <div class="hero__actions">{ip}<a class="btn btn--ghost" href="/store">Browse the store</a></div>
  </div>
</section>"#,
        ip = ip_chip()
    );

    let intro = format!(
        r#"<section class="section" id="intro" aria-labelledby="intro-title">
  <div class="container">
    <div class="band reveal">
      <div class="band__body">
        <span class="eyebrow">Enter the world</span>
        <h2 id="intro-title">Every path begins with a choice.</h2>
        <p class="lead">Azoth is handcrafted, persistent, and shaped by the people who live in it. Pick a discipline, take a contract, and find out what the frontier does with your name.</p>
      </div>
      <figure class="band__art"><img src="/assets/adventurer.jpg" alt="A hooded adventurer with a staff on a dark ridge above a misted valley" loading="lazy" decoding="async"></figure>
    </div>
    <div class="card-grid reveal">{steps}</div>
  </div>
</section>"#,
        steps = steps()
    );

    let join = format!(
        r#"<section class="section section--tight" id="join" aria-labelledby="join-title">
  <div class="container">
    <div class="cta reveal">
      <img class="cta__art" src="/assets/dragon.jpg" alt="" aria-hidden="true" loading="lazy" decoding="async">
      <div class="cta__inner">
        <span class="eyebrow">Ready to join?</span>
        <h2 id="join-title">The frontier is waking.</h2>
        <p class="lead">Connect on Java Edition and start your first chronicle. Bring a friend — the roads are safer in pairs.</p>
        {ip}
        <a class="back-link" href="/news">Read the latest chronicle →</a>
      </div>
    </div>
  </div>
</section>"#,
        ip = ip_chip()
    );

    layout::page(
        "AzothMC — A Minecraft MMORPG",
        Nav::Home,
        &format!(
            r#"{hero}{intro}<div class="container">{bands}</div>{join}"#,
            bands = bands()
        ),
    )
}

/// Directory served under the `/assets/` URL prefix.
fn static_root() -> PathBuf {
    std::env::var_os("STATIC_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("public").join("assets"))
}

/// Maps a request path to a file under `root`, rejecting traversal attempts.
fn resolve_asset(root: &FsPath, path: &str) -> Option<PathBuf> {
    if path
        .split('/')
        .any(|part| part.is_empty() || part == "." || part == "..")
    {
        return None;
    }
    let candidate = root.join(path);
    candidate.starts_with(root).then_some(candidate)
}

pub async fn static_file(Path(path): Path<String>) -> Response {
    let Some(candidate) = resolve_asset(&static_root(), &path) else {
        return StatusCode::NOT_FOUND.into_response();
    };

    let bytes = match fs::read(&candidate).await {
        Ok(bytes) => bytes,
        Err(_) => return StatusCode::NOT_FOUND.into_response(),
    };
    let content_type = content_type(&candidate);
    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, content_type)
        .body(Body::from(bytes))
        .expect("static response builder accepts valid headers")
}

fn content_type(path: &FsPath) -> HeaderValue {
    let value = match path.extension().and_then(|ext| ext.to_str()) {
        Some("html") => "text/html; charset=utf-8",
        Some("css") => "text/css; charset=utf-8",
        Some("js") => "text/javascript; charset=utf-8",
        Some("woff2") => "font/woff2",
        Some("svg") => "image/svg+xml",
        Some("png") => "image/png",
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("webp") => "image/webp",
        Some("txt") => "text/plain; charset=utf-8",
        _ => "application/octet-stream",
    };
    HeaderValue::from_static(value)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_band_uses_a_distinct_image() {
        let mut images: Vec<&str> = BANDS.iter().map(|band| band.image).collect();
        images.sort_unstable();
        let total = images.len();
        images.dedup();
        assert_eq!(images.len(), total, "bands must not reuse artwork");
    }

    #[test]
    fn bands_alternate_sides() {
        let markup = bands();
        assert_eq!(markup.matches("band--reverse").count(), 2);
    }

    #[test]
    fn css_content_type_is_served_for_the_stylesheet() {
        assert_eq!(
            content_type(FsPath::new("styles.css")),
            "text/css; charset=utf-8"
        );
    }

    #[test]
    fn style_guide_and_fonts_are_served_with_their_own_types() {
        assert_eq!(
            content_type(FsPath::new("styleguide.html")),
            "text/html; charset=utf-8"
        );
        assert_eq!(
            content_type(FsPath::new("fonts/inter-latin-var.woff2")),
            "font/woff2"
        );
    }

    /// The style guide is reachable only because it lives under the asset root.
    /// Every file it pulls in must sit beside it, or the page renders unstyled.
    #[test]
    fn style_guide_and_its_dependencies_exist_on_disk() {
        let root = FsPath::new("../public/assets");
        for name in [
            "styleguide.html",
            "themes.html",
            "azoth.css",
            "themes.css",
            "hero-bg.jpg",
            "fonts/fonts.css",
            "fonts/fraunces-latin-var.woff2",
            "fonts/inter-latin-var.woff2",
            "fonts/jetbrains-mono-latin-var.woff2",
            "fonts/cinzel-latin-var.woff2",
            "fonts/oswald-latin-var.woff2",
            "fonts/space-grotesk-latin-var.woff2",
        ] {
            let resolved = resolve_asset(root, name).expect("must resolve under the asset root");
            assert!(resolved.is_file(), "missing style guide dependency: {name}");
        }
    }

    #[test]
    fn assets_resolve_under_the_assets_directory() {
        let root = FsPath::new("public/assets");
        assert_eq!(
            resolve_asset(root, "hero-bg.jpg"),
            Some(PathBuf::from("public/assets/hero-bg.jpg"))
        );
        assert_eq!(
            resolve_asset(root, "styles.css"),
            Some(PathBuf::from("public/assets/styles.css"))
        );
    }

    #[test]
    fn traversal_and_empty_segments_are_rejected() {
        let root = FsPath::new("public/assets");
        for path in ["../Cargo.toml", "a/../../b", ".", "..", "a//b", ""] {
            assert_eq!(resolve_asset(root, path), None, "{path} must be rejected");
        }
    }

    /// Guards against markup that points at artwork the server cannot serve.
    #[test]
    fn every_referenced_asset_exists_on_disk() {
        let root = FsPath::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .expect("server dir has a parent")
            .join("public")
            .join("assets");
        let markup = format!("{}{}", bands(), steps());
        let referenced = ["hero-bg.jpg", "adventurer.jpg", "dragon.jpg", "logo.png"]
            .into_iter()
            .chain(BANDS.iter().map(|band| {
                band.image
                    .strip_prefix("/assets/")
                    .expect("band art is served from /assets/")
            }));
        for name in referenced {
            assert!(root.join(name).is_file(), "missing asset file: {name}");
        }
        assert!(markup.contains("/assets/"), "bands reference /assets/ paths");
    }
}
