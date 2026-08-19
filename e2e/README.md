# FloorOps Pro browser verification

The browser checks have two independent paths:

- `npm run test:e2e` runs the exploratory crawler and records broad interaction evidence.
- `npm run test:verify` runs deterministic smoke checks and release guardrails.

The deterministic suite is intentionally split so current runtime health can be checked separately from production readiness:

```powershell
npm run test:verify:smoke
npm run test:verify:release
```

The default target is the live Vercel deployment. To verify a local or preview build instead:

```powershell
$env:PLAYWRIGHT_BASE_URL = 'http://localhost:3000'
npm run test:verify
```

The AI check is skipped by default because it makes a billable model request. Enable it explicitly when needed:

```powershell
$env:VERIFY_AI = '1'
npm run test:verify:smoke
```

Release checks express the desired behavior of the owner-facing product demo. The account selector intentionally lets the owner preview every listed role; this is a demo capability, not a production authentication boundary.

The role-preview gate uses the dedicated passwordless `/login/select` demo flow, selects every account row, and verifies that each account reaches its own dashboard. The remaining release guardrails cover public CTA destinations and live integration errors.

Demo data is intentionally browser-only. The release suite verifies that it remains local to the browser session and that Demo mode sends no write requests to external backends.
