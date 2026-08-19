use axum::{
    extract::Path,
    http::StatusCode,
    response::{Html, IntoResponse, Response},
};
use pulldown_cmark::{html, Parser};

use crate::layout::{self, Nav};

#[derive(Clone, Copy)]
pub struct NewsPost {
    pub slug: &'static str,
    pub title: &'static str,
    pub date: &'static str,
    pub summary: &'static str,
    pub body: &'static str,
}

pub const POSTS: [NewsPost; 3] = [
    NewsPost { slug: "2026-08-10-season-zero-launches", title: "Season Zero Launches", date: "2026-08-10", summary: "The realm is open — join the first expedition chronicle.", body: "Season Zero is live. `play.azothmc.com` is open, and the frontier is waking.\n\n## Expedition notes\n\n- Join the server and pick a path\n- Link your account to receive purchases instantly\n- The Trade Market opens with the emerald economy\n\n## Field tips\n\n1. Start a character and follow the quest lines.\n2. Squad up for the first raid windows.\n3. Keep an eye on the news for the first world boss.\n\nWe will see you in Azoth." },
    NewsPost { slug: "2026-08-08-webstore-live", title: "The Webstore Is Live", date: "2026-08-08", summary: "Support the realm and unlock perks — ranks, crates, cosmetics, and bundles.", body: "The AzothMC webstore is open at the new **Store** tab. Choose a perk and complete\ncheckout on our secure partner, Tebex.\n\n## What you can grab\n\n- Ranks with kits and homes\n- Crates and cosmetics\n- Emerald pouches for the trade market\n\nDeliveries arrive in-game within about 1-2 minutes, even if you are offline." },
    NewsPost { slug: "2026-07-30-prologue", title: "A Prologue to the Frontier", date: "2026-07-30", summary: "The realm of Azoth is waking — a field guide to what comes next.", body: "Welcome to the first chronicle from Azoth.\n\n## What is Azoth?\n\nAzoth is a handcrafted Minecraft MMORPG. Every skyline is intentional.\n\n- Handcrafted realms, not generators\n- Player-driven emerald economy\n- Branching quest lines across kingdoms\n\n> No two expeditions are the same.\n\n## What comes next\n\nWe open Season Zero soon. Join the expedition." },
];

fn find_post(slug: &str) -> Option<&'static NewsPost> {
    POSTS.iter().find(|post| post.slug == slug)
}

fn markdown(body: &str) -> String {
    let mut rendered = String::new();
    html::push_html(&mut rendered, Parser::new(body));
    rendered
}

fn page(title: &str, content: &str) -> Html<String> {
    layout::page(&format!("{title} | AzothMC"), Nav::News, content)
}

fn page_head(eyebrow: &str, heading: &str, lead: &str) -> String {
    format!(
        r#"<section class="page-head"><div class="container"><div class="page-head__inner"><span class="eyebrow">{eyebrow}</span>{heading}<p class="lead">{lead}</p></div></div></section>"#
    )
}

pub async fn index() -> Html<String> {
    let cards = POSTS
        .iter()
        .map(|post| {
            format!(
                r#"<article class="news-card" data-testid="news-card"><p class="news-card__date">{}</p><h2><a href="/news/{}">{}</a></h2><p>{}</p></article>"#,
                post.date, post.slug, post.title, post.summary
            )
        })
        .collect::<String>();
    let head = page_head(
        "AzothMC / Chronicles",
        "<h1>News</h1>",
        "Expedition notes, updates, and chronicles from the frontier.",
    );
    page(
        "News",
        &format!(
            r#"{head}<section class="section" data-testid="news-index"><div class="container"><div class="news-list">{cards}</div></div></section>"#
        ),
    )
}

pub async fn article(Path(slug): Path<String>) -> Response {
    let Some(post) = find_post(&slug) else {
        return StatusCode::NOT_FOUND.into_response();
    };
    let head = page_head(
        "AzothMC / Chronicles",
        &format!(
            r#"<p class="article__date">{}</p><h1>{}</h1>"#,
            post.date, post.title
        ),
        post.summary,
    );
    let body = markdown(post.body);
    page(
        post.title,
        &format!(
            r#"{head}<section class="section"><div class="container"><article class="article" data-testid="news-article"><div class="prose">{body}</div><a class="back-link" href="/news">← All chronicles</a></article></div></section>"#
        ),
    )
    .into_response()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn posts_are_sorted_newest_first() {
        assert_eq!(POSTS[0].date, "2026-08-10");
        assert_eq!(POSTS[2].date, "2026-07-30");
    }

    #[test]
    fn markdown_is_rendered() {
        assert!(markdown("## Heading\n\n- item").contains("<h2>Heading</h2>"));
        assert!(markdown("## Heading\n\n- item").contains("<li>item</li>"));
    }
}
