//! AzothMC Rust web application.
//!
//! Server-rendered routes and read-only marketplace API. Binds to
//! `127.0.0.1:8787` by default and honors `MARKET_ADDR`.

use std::net::SocketAddr;
use std::sync::Arc;

use axum::{
    extract::{Path, Query, State},
    http::{header, HeaderValue, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use serde::Deserialize;
use tower_http::cors::CorsLayer;

mod forum;
mod layout;
mod market;
mod news;
mod site;
mod store;

use market::{ItemListResponse, MarketRepo, TrendRange, TrendResponse};

/// Application error shape; serializes to `{ "error": "..." }`.
#[derive(serde::Serialize)]
struct ApiError<'a> {
    error: &'a str,
}

impl<'a> IntoResponse for ApiError<'a> {
    fn into_response(self) -> Response {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::to_value(&self).expect("error serializes")),
        )
            .into_response()
    }
}

/// Shared application state.
#[derive(Clone)]
struct AppState {
    repo: Arc<MarketRepo>,
}

async fn healthz() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "status": "ok" }))
}

async fn list_items(State(state): State<AppState>) -> Json<ItemListResponse> {
    Json(ItemListResponse {
        items: state.repo.items(),
    })
}

async fn get_item(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<Json<market::ItemSummary>, (StatusCode, Json<ApiError<'static>>)> {
    match state.repo.item(&slug) {
        Some(item) => Ok(Json(item.clone())),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(ApiError {
                error: "item_not_found",
            }),
        )),
    }
}

#[derive(Deserialize)]
struct TrendsQuery {
    range: Option<String>,
}

async fn item_trends(
    State(state): State<AppState>,
    Path(slug): Path<String>,
    Query(query): Query<TrendsQuery>,
) -> Result<Json<TrendResponse>, Response> {
    // Validate the range before looking anything up so a malformed request
    // fails fast with 400 regardless of slug existence.
    let range = match query.range.as_deref().map(TrendRange::parse) {
        Some(Some(r)) => r,
        _ => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ApiError {
                    error: "unsupported_range",
                }),
            )
                .into_response())
        }
    };

    let points = state.repo.trends(&slug, range).ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(ApiError {
                error: "item_not_found",
            }),
        )
            .into_response()
    })?;

    Ok(Json(TrendResponse {
        slug,
        range: range.as_str().to_string(),
        points,
    }))
}

fn build_router(state: AppState) -> Router {
    // Permissive, GET-only, no-credentials CORS for the local frontend origin.
    let cors = CorsLayer::new()
        .allow_origin(HeaderValue::from_static("*"))
        .allow_methods([Method::GET, Method::HEAD, Method::OPTIONS])
        .allow_headers([header::CONTENT_TYPE])
        .allow_credentials(false);

    Router::new()
        .route("/", get(site::landing_page))
        .route("/news", get(news::index))
        .route("/news/{slug}", get(news::article))
        .route("/store", get(store::index))
        .route("/forum", get(forum::index))
        .route("/assets/{*path}", get(site::static_file))
        .route("/healthz", get(healthz))
        .route("/api/v1/items", get(list_items))
        .route("/api/v1/items/{slug}", get(get_item))
        .route("/api/v1/items/{slug}/trends", get(item_trends))
        .with_state(state)
        .layer(cors)
}

fn parse_addr(env_val: Option<&str>) -> SocketAddr {
    match env_val {
        Some(val) => val
            .parse()
            .unwrap_or_else(|_| panic!("MARKET_ADDR must be a valid SocketAddr, got: {val}")),
        None => "127.0.0.1:8787".parse().expect("default addr is valid"),
    }
}

#[tokio::main]
async fn main() {
    let addr = parse_addr(std::env::var("MARKET_ADDR").ok().as_deref());
    let state = AppState {
        repo: Arc::new(MarketRepo::seeded()),
    };
    let app = build_router(state);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .unwrap_or_else(|e| panic!("failed to bind {addr}: {e}"));
    eprintln!("azoth-market listening on http://{addr}");
    axum::serve(listener, app).await.expect("server error");
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use http_body_util::BodyExt;
    use serde_json::Value;
    use tower::ServiceExt;

    fn test_app() -> Router {
        let state = AppState {
            repo: Arc::new(MarketRepo::seeded()),
        };
        build_router(state)
    }

    async fn get_json(app: &Router, uri: &str) -> (StatusCode, Value) {
        let resp = app
            .clone()
            .oneshot(Request::builder().uri(uri).body(Body::empty()).unwrap())
            .await
            .unwrap();
        let status = resp.status();
        let body = resp.into_body().collect().await.unwrap().to_bytes();
        let json = serde_json::from_slice(&body).expect("response is JSON");
        (status, json)
    }

    #[tokio::test]
    async fn landing_page_renders_html() {
        let response = test_app()
            .oneshot(Request::builder().uri("/").body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.headers().get(header::CONTENT_TYPE).unwrap(),
            "text/html; charset=utf-8"
        );
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let html = String::from_utf8(body.to_vec()).unwrap();
        for marker in [
            "AzothMC",
            "play.azothmc.com",
            "/store",
            "/news",
            "/forum",
            "id=\"hero\"",
            "id=\"intro\"",
            "id=\"world\"",
            "id=\"loot\"",
            "id=\"quests\"",
            "id=\"endgame\"",
        ] {
            assert!(html.contains(marker), "landing page missing {marker}");
        }
    }
    #[tokio::test]
    async fn missing_asset_is_not_found() {
        let response = test_app()
            .oneshot(
                Request::builder()
                    .uri("/assets/does-not-exist.txt")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }
    #[tokio::test]
    async fn healthz_returns_ok() {
        let (status, json) = get_json(&test_app(), "/healthz").await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(json, serde_json::json!({ "status": "ok" }));
    }

    #[tokio::test]
    async fn items_returns_listing_set() {
        let (status, json) = get_json(&test_app(), "/api/v1/items").await;
        assert_eq!(status, StatusCode::OK);
        let items = json["items"].as_array().expect("items array");
        assert_eq!(items.len(), 5, "seeded catalog size");
        // Spot-check the first item's full shape (exact design-spec fields).
        let first = &items[0];
        assert_eq!(first["slug"], "emberheart");
        assert_eq!(first["name"], "Emberheart Core");
        assert_eq!(first["category"], "Relic");
        assert_eq!(first["price"], 1840);
        assert_eq!(first["currency"], "emeralds");
        assert_eq!(first["change_24h"], 7.4);
        assert_eq!(first["volume_24h"], 128);
        assert_eq!(first["market_activity"], "Rising");
        assert_eq!(first["image"], "/assets/loot-bg.jpg");
    }

    #[tokio::test]
    async fn item_by_slug_returns_summary() {
        let (status, json) = get_json(&test_app(), "/api/v1/items/emberheart").await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(json["slug"], "emberheart");
        assert_eq!(json["price"], 1840);
    }

    #[tokio::test]
    async fn unknown_item_returns_404_json() {
        let (status, json) = get_json(&test_app(), "/api/v1/items/nope").await;
        assert_eq!(status, StatusCode::NOT_FOUND);
        assert_eq!(json, serde_json::json!({ "error": "item_not_found" }));
    }

    #[tokio::test]
    async fn trends_returns_points_oldest_first_with_24h_range() {
        let (status, json) =
            get_json(&test_app(), "/api/v1/items/emberheart/trends?range=24h").await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(json["slug"], "emberheart");
        assert_eq!(json["range"], "24h");
        let points = json["points"].as_array().expect("points array");
        assert_eq!(points.len(), 24);
        // Oldest-first timestamp ordering.
        let ts: Vec<&str> = points
            .iter()
            .map(|p| p["timestamp"].as_str().unwrap())
            .collect();
        let mut sorted = ts.clone();
        sorted.sort();
        assert_eq!(ts, sorted, "points must be oldest to newest");
        // RFC3339 shape.
        assert!(ts[0].ends_with('Z'));
        // Latest point price matches the item's current price (1840).
        assert_eq!(points[23]["price"], 1840);
    }

    #[tokio::test]
    async fn missing_trend_range_returns_400_unsupported() {
        // Range is required; an absent value is not a recognized range.
        let (status, json) = get_json(&test_app(), "/api/v1/items/emberheart/trends").await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert_eq!(json, serde_json::json!({ "error": "unsupported_range" }));
    }

    #[tokio::test]
    async fn empty_trend_range_returns_400_unsupported() {
        let (status, json) = get_json(&test_app(), "/api/v1/items/emberheart/trends?range=").await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert_eq!(json, serde_json::json!({ "error": "unsupported_range" }));
    }

    #[tokio::test]
    async fn unknown_item_trends_returns_404_before_range_check() {
        let (status, json) = get_json(&test_app(), "/api/v1/items/nope/trends?range=24h").await;
        assert_eq!(status, StatusCode::NOT_FOUND);
        assert_eq!(json, serde_json::json!({ "error": "item_not_found" }));
    }

    #[tokio::test]
    async fn unsupported_range_returns_400_json() {
        let (status, json) =
            get_json(&test_app(), "/api/v1/items/emberheart/trends?range=7d").await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert_eq!(json, serde_json::json!({ "error": "unsupported_range" }));
    }

    #[tokio::test]
    async fn unsupported_range_and_unknown_slug_returns_400_first() {
        // Range validation happens before slug lookup by design.
        let (status, json) = get_json(&test_app(), "/api/v1/items/nope/trends?range=7d").await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert_eq!(json, serde_json::json!({ "error": "unsupported_range" }));
    }

    #[test]
    fn market_addr_defaults_to_local_8787() {
        assert_eq!(
            parse_addr(None),
            "127.0.0.1:8787".parse::<SocketAddr>().unwrap()
        );
        assert_eq!(
            parse_addr(Some("0.0.0.0:9000")),
            "0.0.0.0:9000".parse::<SocketAddr>().unwrap()
        );
    }
}
