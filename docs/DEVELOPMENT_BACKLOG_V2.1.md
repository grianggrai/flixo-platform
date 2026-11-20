# FLIXO Development Backlog v2.1

Status: Proposed implementation backlog aligned to approved v2.1 baseline.
Repository: grianggrai/flixo-platform
Branch: spec/flixo-v2.1-approved

## Delivery principles
- Extend the current scaffold; do not rewrite it.
- Modular monolith; clear domain boundaries.
- Financial, entitlement and playback operations remain fail-closed until tested.
- Every issue must ship tests, migration notes and documentation.
- No secrets in source code or client environment variables.

## Epic and issue sequence

### EPIC 0 — Specification and platform foundation
1. Publish v2.1 product/technical specification and backlog.
2. Establish environment/config validation, request IDs, structured logging and error conventions.
3. Establish CI test gates: frontend lint/build, backend unit/integration, migration checks.

### EPIC 1 — Identity and authorization (P0)
4. Complete Supabase Auth session integration for Viewer.
5. Implement server-side RBAC for creator/editor/finance_admin/moderator/admin.
6. Add RLS test matrix and protected route/API tests.

Acceptance: role cannot be escalated via user metadata; unauthorized users cannot read/write protected creator, admin or finance data.

### EPIC 2 — Series catalog and entitlement (P0)
7. Add additive migration for series_entitlements and localized pricing.
8. Implement series-level unlock transaction and entitlement query.
9. Update Viewer series detail, paywall and library ownership state.
10. Migrate/retain legacy episode_unlocks safely; no destructive drop in MVP.

Acceptance: one successful purchase grants the series; duplicate/concurrent requests charge once; free episodes remain free; future episodes inherit series entitlement; territory/license restrictions override access.

### EPIC 3 — Coins wallet and payment (P0)
11. Implement immutable Coins ledger with atomic balance projection.
12. Implement multi-gateway adapter contract and provider configuration.
13. Implement localized Coin packages and checkout order snapshots.
14. Implement signed webhook verification, idempotency, retries and reconciliation.
15. Implement refund/reversal and finance audit workflow.

Acceptance: browser redirects never credit wallet; duplicate/out-of-order webhooks do not double-credit; amount/currency/order ownership are verified; refund produces compensating ledger entries.

### EPIC 4 — Subscription (P1)
16. Implement plan catalog and localized market prices.
17. Implement subscription provider adapter events and lifecycle.
18. Implement subscription entitlement and Viewer membership UI.

Acceptance: active/trialing grants configured benefits; cancellation retains access until paid-through date; expiry/revocation is deterministic.

### EPIC 5 — Cloudflare Stream (P0)
19. Implement server-created direct upload sessions for authorized creators.
20. Implement Cloudflare webhook verification and processing-state reconciliation.
21. Implement media asset persistence and Creator upload status UI.
22. Implement entitlement/rights-gated signed playback.
23. Add video error/retry/cleanup and usage monitoring.

Acceptance: API token never reaches browser; only approved/published media can be played; unauthorized users cannot obtain signed playback; failed processing can be retried safely.

### EPIC 6 — PWA and Viewer experience (P1)
24. Implement manifest, icons, installability and service worker.
25. Implement mobile-first vertical feed and player interactions.
26. Implement deep links, responsive layout and safe cache policy.
27. Add Thai/English localization and market selection.

Acceptance: installable on supported browsers; no paid video, wallet or private data cached by service worker; deep links resolve after authentication.

### EPIC 7 — Creator revenue and admin operations (P1)
28. Implement revenue attribution and contract-specific share rules.
29. Implement creator statements and payout workflow (manual approval initially).
30. Complete Admin moderation, rights and financial audit views.

Acceptance: revenue uses immutable transaction sources and versioned contract rules; payouts require finance approval and leave audit evidence.

### EPIC 8 — Analytics, QA and production readiness (P0/P1)
31. Implement consent-aware watch/commerce event pipeline.
32. Implement baseline editorial/trending recommendation.
33. Add end-to-end tests for purchase, unlock, playback and refund.
34. Add monitoring, backups, restore drill and incident runbooks.
35. Complete security, privacy, legal and operational go-live review.

## Suggested sprint order
- Sprint 0: Issues 1-3 (foundation and specification).
- Sprint 1: Issues 4-6 (auth/RBAC/RLS).
- Sprint 2: Issues 7-10 (series catalog and entitlement).
- Sprint 3: Issues 11-15 (Coins and payment).
- Sprint 4: Issues 19-23 (Cloudflare Stream) — can run in parallel with Sprint 3 after auth foundation.
- Sprint 5: Issues 16-18 and 24-27 (subscription/PWA).
- Sprint 6: Issues 28-35 (creator finance, analytics, QA and go-live).

Dates and assignees are intentionally unset until team capacity and launch date are confirmed.
