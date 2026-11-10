# FLIXO MVP Acceptance Criteria

## Viewer
- Guest can browse catalog and open series details.
- Episode pages clearly indicate free or premium status.
- Player page must display demo state until a video provider is configured.
- Watch history and progress must only persist for authenticated users.

## Creator
- Creator can submit series metadata and rights declarations.
- Upload UI must not claim upload success without storage confirmation.
- Creator cannot publish content directly; submissions require editorial approval.

## Admin
- Admin review supports approve, reject and request-revision with a reason.
- Admin routes require server-side role authorization.
- Publication requires verified rights and human approval.

## Monetization
- Demo wallet balance and checkout are clearly labeled as demo.
- Payment webhook signature verification and idempotency are mandatory before launch.
- Wallet posting must be transactional and append-only.

## Security / Operations
- No service-role key in browser code.
- RLS policies must be tested for every role.
- Signed playback URLs and upload validation are required.
- Financial and admin actions must be audited.
- Backup, monitoring, error reporting and refund reconciliation must be configured.
