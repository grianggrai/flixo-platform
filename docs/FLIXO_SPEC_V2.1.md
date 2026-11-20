# FLIXO Product & Technical Specification v2.1

Status: Approved product baseline; implementation specification
Date: 2026-11-21
Branch: spec/flixo-v2.1-approved

## 1. Product definition

FLIXO is a mobile-first vertical micro-drama streaming and creator-economy platform. Thailand is the launch market; the platform must be localization-ready for Southeast Asia.

### Approved decisions

| Area | Decision |
|---|---|
| Product scope | Viewer + Creator Studio + Admin CMS |
| Frontend | Next.js |
| Backend | FastAPI modular monolith |
| Database/Auth | Supabase PostgreSQL + Supabase Auth |
| Monetization | Hybrid Coins + Subscription; advertising is a later optional revenue stream |
| Purchase unit | Per-Series unlock |
| Payment | Multi-gateway adapter architecture |
| Video | Cloudflare Stream |
| Client | Responsive Web + installable PWA |
| Currency | Multi-currency market pricing |
| Content | Licensed + FLIXO Originals + Creator content |
| Launch | Thailand first; SEA-ready architecture |

Do not replace the existing repository scaffold. Implement incrementally and preserve working flows.

## 2. Product surfaces

### 2.1 Viewer
- Home: featured, continue watching, trending, new releases, genres, recommendations.
- Discovery: browse by genre, tags, popularity, release date and creator.
- Series detail: synopsis, poster, cast/creator, episode list, price, entitlement state and rights/availability messaging.
- Vertical player: 9:16-first, HLS playback, adaptive quality, captions, playback progress, next episode, series navigation and share deep link.
- Library: continue watching, follows, favorites and purchased series.
- Wallet: Coin balance, top-up packages and immutable transaction history.
- Membership: plans, benefits, current status and renewal/cancellation state.
- Account: profile, language, market/currency, consent and privacy controls.

### 2.2 Creator Studio
- Creator profile and onboarding.
- Series and episode metadata management.
- Direct-to-provider video upload through server-created Cloudflare upload sessions.
- Processing status, poster/thumbnail, subtitles and preview.
- Draft -> submitted -> review -> approved/revision/rejected -> scheduled/published lifecycle.
- Configure series-level unlock price and free episodes.
- Rights declarations, territories, license windows and evidence.
- Analytics: views, unique viewers, watch time, completion, unlocks and revenue.
- Revenue statements and payout status.

Creator cannot publish directly unless an explicit editorial policy grants that permission. Rights verification and editorial approval are mandatory before publication.

### 2.3 Admin CMS
- Viewer, creator and role management.
- Series, episode and media review.
- Rights and territory verification.
- Homepage merchandising and genre/tag management.
- Market-specific pricing and Coin packages.
- Payment provider configuration/status (secrets remain server-side).
- Refunds, wallet adjustments with dual-control/audit policy, revenue and settlement review.
- Moderation, reports, takedowns and audit logs.
- Read-only operational and business analytics.

Roles: viewer, creator, editor, finance_admin, moderator, admin, super_admin. Enforce permissions server-side; UI visibility is not authorization.

## 3. Core commercial rules

### 3.1 Coins
- Coins are closed-loop platform credits, not fiat currency, deposits or a withdrawable balance.
- A wallet is denominated in Coins; payment currency is stored separately on each order.
- Coin packages are market-specific and have immutable price/bonus snapshots at checkout.
- Wallet balance is a cached projection; wallet_transactions is the authoritative append-only ledger.
- All ledger mutations occur in trusted backend/database transactions. Never accept client-supplied balance changes.
- Use idempotency keys for top-ups, unlocks, refunds and adjustments.
- Define expiry, promotional Coins, refunds and consumer disclosures before launch. Do not silently expire purchased Coins.

### 3.2 Per-Series unlock
- A successful purchase creates one series_entitlements record for the user and series.
- One purchase grants access to all paid episodes in that series, including future episodes added to the same series while the series remains available and rights remain valid.
- Episodes explicitly marked free remain playable without purchase.
- Series access is subject to territory, license window, moderation and legal takedown restrictions.
- A series already owned must not be charged again. Repeated requests return the existing entitlement.
- Entitlement is permanent by default for Coins purchase; it is not a promise of perpetual availability where the platform's content rights expire or a lawful takedown applies. Disclose this clearly.
- Subscription grants time-bound access according to plan rules and does not create permanent ownership.
- Do not implement per-episode paid unlock in v2.1. Keep legacy episode_unlocks for compatibility/audit; do not use it for new purchases.

### 3.3 Subscription
- Plans, benefits, billing interval, market price, currency and entitlement rules are data-driven.
- Subscription provider events update a normalized subscription state machine.
- Access requires active/trialing status and a valid period window.
- Cancellation at period end preserves access through paid-through time.
- Subscription access and Coins-purchased series access are evaluated independently.

### 3.4 Multi-currency
- Store monetary amounts as integer minor units (e.g. satang) plus ISO 4217 currency code.
- Never use floating-point for money.
- Market price is a configured localized price, not a live FX calculation at checkout.
- Store price, currency, tax treatment, provider, FX rate (if used for reporting), and pricing version snapshots on each order.
- Coins remain currency-neutral integer units. Do not maintain a separate fiat wallet per currency.
- Configure settlement/base currency per legal entity; initial reporting may use THB, but do not hard-code THB in domain logic.
- Enforce provider/currency/market compatibility before creating checkout.
- Refund in the original transaction currency where supported; store refund amount and provider reference.

## 4. Payment architecture

Use a provider adapter interface; business services must not contain provider-specific branching.

Normalized operations:
- create_checkout(order, customer, return_urls)
- verify_webhook(raw_body, headers, signature_config)
- normalize_event(provider_event)
- fetch_payment(provider_payment_id)
- refund(provider_payment_id, amount_minor, currency, idempotency_key)

Data model:
- payment_providers: provider code, enabled markets/currencies, capabilities, public configuration, secret reference (never raw secret).
- payment_orders: user, order type, amount_minor, currency, market, provider, provider_order_id, status, idempotency key, price snapshot.
- payment_webhooks: provider, provider_event_id unique, signature_verified, received_at, processed_at, processing_status, payload hash.
- payment_refunds: payment order, amount_minor, currency, provider refund id, status, reason.
- payment_attempts: provider attempt metadata and normalized result.

Required safeguards:
- Verify webhook signatures against raw request bytes.
- Enforce unique(provider, provider_event_id) and idempotent processing.
- Verify amount, currency, order ownership and expected state before crediting Coins.
- Post payment result and wallet ledger credit atomically where possible; use an outbox/reconciliation workflow when provider/database boundaries prevent a single transaction.
- Never credit from browser redirect/query parameters.
- Handle duplicate, delayed, out-of-order and failed webhooks.
- Daily reconciliation and exception queue before production.
- Provider credentials are environment/secret-manager values, never database plaintext or frontend variables.
- Provider names are intentionally not fixed in this decision; select launch providers after market/currency capability, fee, settlement, refund and compliance review.

## 5. Cloudflare Stream video architecture

Cloudflare Stream is the selected managed video provider.

Upload:
1. Authenticated creator requests upload session.
2. FastAPI checks creator role, quota, file metadata and series permission.
3. Backend creates a one-time/direct creator upload URL through Cloudflare API.
4. Browser uploads directly to Cloudflare; API token is never exposed.
5. Persist provider UID and upload state.
6. Verify Cloudflare webhook authenticity and reconcile processing state.
7. Generate/store thumbnail and duration metadata.
8. Submit media for moderation/rights review.
9. Publish only after editorial approval and rights validation.

Playback:
- API checks series publication, territory, license window, age/content policy and entitlement (free episode, series purchase or active subscription).
- Backend requests a short-lived signed playback token/URL where supported by the configured Stream security mode.
- Return only playback data required by the client.
- Never expose Cloudflare account API token.
- Record playback start/progress/completion events with deduplication and privacy controls.
- Support HLS playback and responsive 9:16 presentation.
- Define watermark/DRM requirements separately; signed playback is not equivalent to DRM and does not prevent all screen recording.

Operational requirements:
- Store provider UID, upload state, duration, dimensions, size, readiness, thumbnail, error state and timestamps.
- Retry transient processing failures with bounded retries and dead-letter/manual review.
- Track storage, encoding and delivery usage/cost.
- Provide delete/unpublish workflow that respects retention, legal holds and license obligations.

## 6. PWA requirements
- Web App Manifest with app name, icons, theme/background colors and start URL.
- Service worker with safe static asset caching and versioned cache invalidation.
- Installability and standalone display on supported browsers.
- Responsive mobile-first viewer and Creator/Admin desktop layouts.
- Deep links to series and episodes; preserve login and market context.
- Offline mode is limited to shell/static assets in v2.1. Do not cache paid video segments, private account data, wallet balances or payment pages.
- Push notifications are optional and require permission/consent handling.
- Playback must gracefully handle browser codec, autoplay and network limitations.

## 7. Data model additions/changes

Keep existing schema and introduce additive migrations.

New/updated entities:
- series_entitlements(id, user_id, series_id, source, order_id, granted_at, revoked_at, access_policy_snapshot, unique active user+series)
- coin_packages(id, market, currency, price_minor, coins, bonus_coins, active, version)
- wallets(user_id, coin_balance_cached, updated_at); retain existing table if compatible.
- wallet_transactions(id, user_id, amount_coins, transaction_type, reference_type, reference_id, idempotency_key unique, created_at)
- payment_providers(id, code unique, enabled, supported_markets, supported_currencies, capabilities, secret_ref)
- payment_orders(id, user_id, order_type, amount_minor, currency, market, provider, provider_order_id, status, idempotency_key unique, price_snapshot jsonb, created_at)
- payment_webhooks: add signature_verified, payload_hash, processing_status, received_at; retain unique(provider, provider_event_id).
- payment_refunds(id, payment_order_id, amount_minor, currency, provider_refund_id, status, reason)
- subscription_plans(id, code, market, currency, price_minor, billing_interval, benefits jsonb, active)
- subscriptions: add plan_id, provider, provider_subscription_id, status, current_period_start/end, cancel_at_period_end, market, currency.
- video_assets(id, series_id, episode_id, provider, provider_uid unique, status, duration_seconds, width, height, thumbnail_url, created_at)
- video_uploads(id, creator_id, series_id, episode_id, provider, upload_state, provider_uid, expires_at, error_code)
- localized_prices(id, entity_type, entity_id, market, currency, amount_minor, pricing_version, effective_from, effective_to)
- currency_rates(id, base_currency, quote_currency, rate, source, observed_at) for reporting only, not checkout price calculation.

Constraints:
- All currency columns are CHAR(3) ISO codes.
- All fiat amounts use BIGINT minor units.
- Coins use BIGINT integer units.
- Add foreign keys, unique constraints and indexes for entitlement lookup, provider event dedupe, order idempotency and user transaction history.
- Use additive migrations; retain episode_unlocks until data migration and backward-compatibility checks are complete.
- Apply RLS deny-by-default. All financial writes and provider calls are server-only.

## 8. API v1 additions

Catalog/entitlement:
- GET /api/v1/series/{series_id}/entitlement
- POST /api/v1/series/{series_id}/unlock
- POST /api/v1/episodes/{episode_id}/playback
- GET /api/v1/series/{series_id}/episodes

Wallet/commerce:
- GET /api/v1/wallet
- GET /api/v1/wallet/transactions
- GET /api/v1/coins/packages?market={market}
- POST /api/v1/checkout/coin-topups
- POST /api/v1/checkout/series-unlock
- POST /api/v1/checkout/subscriptions
- POST /api/v1/payments/webhooks/{provider}
- POST /api/v1/payments/{payment_id}/refund (admin/finance role only)

Creator/media:
- POST /api/v1/creator/video-uploads
- GET /api/v1/creator/video-uploads/{upload_id}
- POST /api/v1/creator/series
- POST /api/v1/creator/series/{series_id}/submit
- GET /api/v1/creator/revenue

Admin:
- GET /api/v1/admin/review-queue
- POST /api/v1/admin/series/{series_id}/approve
- POST /api/v1/admin/series/{series_id}/request-revision
- POST /api/v1/admin/series/{series_id}/reject
- GET /api/v1/admin/payments/reconciliation
- GET /api/v1/admin/settlements

API rules:
- Require authenticated identity and server-side RBAC.
- Require Idempotency-Key for financial POST operations.
- Validate market, currency and provider compatibility.
- Return normalized provider-neutral status; never leak secrets or raw sensitive payloads.
- Use consistent error codes and correlation/request IDs.

## 9. Recommendation and analytics
MVP recommendation: editorial curation + genre/content tags + trending/popularity + watch behavior. Start with deterministic ranking and cold-start fallback; defer collaborative/deep-learning models until event volume is sufficient.

Track consent-aware events: impression, playback_start, progress, complete, skip, replay, like, follow, share, unlock_prompt, checkout_start, payment_success. Avoid collecting unnecessary personal data. Deduplicate event ingestion and define retention windows.

## 10. Security, privacy and operations
- Supabase Auth with secure session handling.
- Server-side RBAC and RLS tests for viewer, creator, editor, finance_admin, moderator and admin.
- No service-role key, Cloudflare token or payment secret in browser bundles.
- Webhook signature verification and replay/idempotency protection.
- Rate limiting, input validation, upload quotas and content type validation.
- PDPA consent, privacy notice, access/export/deletion workflows and retention policy.
- Copyright/territory/license checks before playback and publication.
- Audit all financial, moderation, rights and role changes.
- Backup/restore drills, error monitoring, structured logs and incident runbooks.
- Coins legal classification, consumer disclosures, tax, cross-border payment and payout obligations require legal/accounting review before commercial launch.

## 11. Non-functional requirements
- Standard API P95 target <= 500 ms excluding external provider calls.
- Playback startup target <= 3 seconds under defined test network/device conditions.
- Initial availability target 99.5%.
- No duplicate wallet credit/debit under retry or concurrent requests.
- Financial ledger integrity and reconciliation are release blockers.
- PWA shell installable on supported browsers; paid media/private data not cached offline.
- Thai and English at launch; market/currency/locale configuration must be extensible.
- Modular monolith first; do not split microservices prematurely.

## 12. Release gates
Do not enable real money or production video until:
1. Auth and RBAC/RLS tests pass.
2. Series entitlement race/idempotency tests pass.
3. Payment signatures, webhook replay protection and reconciliation pass.
4. Refund/reversal and wallet ledger tests pass.
5. Cloudflare upload and signed playback authorization pass.
6. Rights/territory/license checks pass.
7. Privacy, legal, tax and operational readiness review is complete.
8. End-to-end QA and backup/restore test pass.

## 13. Explicitly out of scope for v2.1 MVP
- Native iOS/Android apps.
- Offline paid video downloads.
- Per-episode paid unlock.
- Full DRM guarantee.
- AI-generated video production.
- Complex deep-learning recommendation.
- Multi-entity automated cross-border royalty/tax settlement.

## 14. Repository implementation policy
- Preserve existing Next.js/FastAPI/Supabase modular monolith.
- Add migrations; never rewrite production data in place.
- Keep wallet/payment/playback fail-closed until release gates pass.
- Implement by GitHub Issues and PRs with tests and acceptance criteria.
