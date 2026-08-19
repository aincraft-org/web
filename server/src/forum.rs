use axum::response::Html;

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
        Some(url) => format!(r#"<a data-testid="forum-cta" href="{}" target="_blank" rel="noopener noreferrer">Open the forum ↗</a><p>Opens in a new tab. Treat every traveller with respect.</p>"#, html_escape(&url)),
        None => "<div data-testid=\"forum-setup\"><strong>The forum is not configured yet.</strong><p>We self-host our community. Point <code>DISCOURSE_URL</code> at an http/https Discourse origin in your deploy environment and rebuild.</p></div>".to_owned(),
    };
    Html(format!(
        r#"<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Forum | AzothMC</title></head><body><header><a href="/">AzothMC</a><nav><a href="/">Home</a><a href="/news">News</a><a href="/store">Store</a><a href="/forum">Forum</a></nav></header><main><section data-testid="forum-hero" aria-labelledby="forum-title"><p>AZOTHMC / THE COMMONS</p><h1 id="forum-title">The Commons</h1><p>Trade stories, plan expeditions, and shape the realm with fellow travellers. The forum opens in its own tab — a self-hosted community we run ourselves.</p>{action}</section></main><footer><small>AzothMC</small></footer></body></html>"#
    ))
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
