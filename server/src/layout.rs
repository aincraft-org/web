//! Shared page shell: document head, masthead, primary navigation, and footer.
//!
//! Every rendered route goes through [`page`] so navigation and chrome stay
//! identical across the site.

use axum::response::Html;

pub const SERVER_ADDRESS: &str = "play.azothmc.com";

/// Primary navigation destination, used to mark the current page.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Nav {
    Home,
    News,
    Store,
    Forum,
}

const LINKS: [(Nav, &str, &str); 4] = [
    (Nav::Home, "/", "Home"),
    (Nav::News, "/news", "News"),
    (Nav::Store, "/store", "Store"),
    (Nav::Forum, "/forum", "Forum"),
];

fn nav(current: Nav) -> String {
    LINKS
        .iter()
        .map(|(target, href, label)| {
            let aria = if *target == current {
                r#" aria-current="page""#
            } else {
                ""
            };
            format!(r#"<a class="nav__link" href="{href}"{aria}>{label}</a>"#)
        })
        .collect()
}

/// Wraps `body` in the shared document shell. `title` is used verbatim.
pub fn page(title: &str, current: Nav, body: &str) -> Html<String> {
    let nav_links = nav(current);
    Html(format!(
        r##"<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#06090f">
<title>{title}</title>
<link rel="stylesheet" href="/assets/styles.css">
<link rel="icon" href="/assets/logo.png">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="masthead" data-masthead>
  <div class="container masthead__inner">
    <a class="brand" href="/" aria-label="AzothMC home"><img src="/assets/logo.png" alt="AzothMC" width="965" height="445"></a>
    <nav class="nav" aria-label="Primary navigation">{nav_links}</nav>
    <a class="btn btn--primary btn--sm" href="/store">Play now</a>
  </div>
</header>
<main id="main">{body}</main>
<footer class="footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        <img src="/assets/logo.png" alt="AzothMC" width="965" height="445">
        <p>A handcrafted Minecraft MMORPG. Join us at <strong>{SERVER_ADDRESS}</strong>.</p>
      </div>
      <nav class="footer__nav" aria-label="Footer navigation">
        <a href="/">Home</a><a href="/news">News</a><a href="/store">Store</a>
        <a href="/forum">Forum</a><a href="/api/v1/items">Market API</a>
      </nav>
    </div>
    <div class="footer__base">
      <small>AzothMC — not affiliated with Mojang or Microsoft.</small>
      <small>{SERVER_ADDRESS}</small>
    </div>
  </div>
</footer>
<script src="/assets/site.js" defer></script>
</body>
</html>"##
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn body_of(html: Html<String>) -> String {
        html.0
    }

    #[test]
    fn current_page_is_marked_once() {
        let html = body_of(page("News | AzothMC", Nav::News, "<p>x</p>"));
        assert_eq!(html.matches(r#"aria-current="page""#).count(), 1);
        assert!(html.contains(r#"<a class="nav__link" href="/news" aria-current="page">News</a>"#));
    }

    #[test]
    fn shell_links_stylesheet_and_every_route() {
        let html = body_of(page("AzothMC", Nav::Home, ""));
        for marker in [
            "/assets/styles.css",
            "/assets/site.js",
            "href=\"/news\"",
            "href=\"/store\"",
            "href=\"/forum\"",
        ] {
            assert!(html.contains(marker), "shell missing {marker}");
        }
    }

    #[test]
    fn body_content_is_embedded_in_main() {
        let html = body_of(page("AzothMC", Nav::Home, "<p>marker</p>"));
        assert!(html.contains(r#"<main id="main"><p>marker</p></main>"#));
    }
}
