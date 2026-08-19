use std::path::{Path as FsPath, PathBuf};

use axum::{
    body::Body,
    extract::Path,
    http::{header, HeaderValue, StatusCode},
    response::{Html, IntoResponse, Response},
};
use tokio::fs;

pub async fn landing_page() -> Html<String> {
    Html(
        r#"<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AzothMC — Minecraft MMORPG</title>
</head>
<body>
  <header>
    <a href="/" aria-label="AzothMC home">AzothMC</a>
    <nav aria-label="Primary navigation">
      <a href="/#hero">Home</a><a href="/#intro">About</a><a href="/#world">World</a>
      <a href="/#loot">Items</a><a href="/#quests">Quests</a><a href="/#endgame">Endgame</a>
      <a href="/store">Store</a><a href="/news">News</a><a href="/forum">Forum</a>
    </nav>
  </header>
  <main>
    <section id="hero"><p>AZOTHMC</p><h1>A world worth getting lost in.</h1>
      <p>Explore a living Minecraft MMORPG built for discovery, mastery, and community.</p>
      <p><strong>play.azothmc.com</strong></p>
      <button type="button" data-copy-text="play.azothmc.com">Copy server address</button>
    </section>
    <section id="intro"><h2>Enter the world</h2><p>Every path begins with a choice.</p></section>
    <section id="world"><h2>A world with history</h2><p>Discover regions shaped by ancient forces and living stories.</p></section>
    <section id="loot"><h2>Items worth chasing</h2><p>Build a collection that reflects how you play.</p></section>
    <section id="quests"><h2>Quests with consequence</h2><p>Follow stories that reward curiosity and courage.</p></section>
    <section id="endgame"><h2>The journey continues</h2><p>Master endgame challenges with your community.</p></section>
    <section id="join"><h2>Ready to join?</h2><p>Connect at <strong>play.azothmc.com</strong>.</p></section>
  </main>
  <footer><small>AzothMC</small></footer>
</body>
</html>"#
            .to_owned(),
    )
}

pub async fn static_file(Path(path): Path<String>) -> Response {
    if path
        .split('/')
        .any(|part| part.is_empty() || part == "." || part == "..")
    {
        return StatusCode::NOT_FOUND.into_response();
    }

    let root = std::env::var_os("STATIC_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("public"));
    let candidate = root.join(&path);
    if !candidate.starts_with(&root) {
        return StatusCode::NOT_FOUND.into_response();
    }

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
        Some("css") => "text/css; charset=utf-8",
        Some("js") => "text/javascript; charset=utf-8",
        Some("svg") => "image/svg+xml",
        Some("png") => "image/png",
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("webp") => "image/webp",
        Some("txt") => "text/plain; charset=utf-8",
        _ => "application/octet-stream",
    };
    HeaderValue::from_static(value)
}
