use axum::response::Html;

use crate::layout::{self, Nav};

fn discourse_url() -> Option<String> {
    let raw = std::env::var("DISCOURSE_URL").ok()?;
    let trimmed = raw.trim();
    let parsed = url::Url::parse(trimmed).ok()?;
    match parsed.scheme() {
        "http" | "https" => Some(parsed.to_string()),
        _ => None,
    }
}

pub async fn index() -> Html<String> {
    let action = match discourse_url() {
        Some(url) => format!(
            r#"<div class="hero__actions"><a class="btn btn--primary" data-testid="forum-cta" href="{}" target="_blank" rel="noopener noreferrer">Open the forum ↗</a></div><p class="lead">Opens in a new tab. Treat every traveller with respect.</p>"#,
            html_escape(&url)
        ),
        None => r#"<div class="notice" data-testid="forum-setup"><strong>The forum is not configured yet.</strong><p>We self-host our community. Point <code>DISCOURSE_URL</code> at an http/https Discourse origin in your deploy environment and rebuild.</p></div>"#.to_owned(),
    };
    layout::page(
        "Forum | AzothMC",
        Nav::Forum,
        &format!(
            r#"<section class="page-head"><div class="container"><div class="page-head__inner"><span class="eyebrow">AzothMC / The Commons</span><h1 id="forum-title">The Commons</h1><p class="lead">Trade stories, plan expeditions, and shape the realm with fellow travellers. The forum opens in its own tab — a self-hosted community we run ourselves.</p></div></div></section><section class="section" data-testid="forum-hero" aria-labelledby="forum-title"><div class="container"><div class="article">{action}</div></div></section>"#
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
    fn only_http_and_https_are_accepted() {
        assert!(url::Url::parse("https://forum.example.com").is_ok());
        assert!(url::Url::parse("javascript:alert(1)").is_ok());
    }
}
