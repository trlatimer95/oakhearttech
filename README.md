# Oakheart Technologies website

Astro + Tailwind v4 static site, deployed to Cloudflare Pages. Built from `Oakheart Technologies Website Brief.md`.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview
```

## What still needs your input

Everything highlighted yellow on the site (class `.ph`) is a placeholder. Central settings live in `src/data/site.ts`:

| Setting | Where | Notes |
|---|---|---|
| Bookings URL | `site.bookingUrl` | Until set, "Book a call" buttons go to `/contact#book` |
| Phone, LinkedIn, GitHub | `site.phone`, `site.linkedin`, `site.github` | Blank = not shown |
| Turnstile site key | `site.turnstileSiteKey` | Blank = form renders without the widget |
| Analytics token | `site.analyticsToken` | Cloudflare Web Analytics |
| Prices | `src/data/services.ts` | Search for `$[X]` |
| Case studies | `src/content/work/*.md` | Set `draft: false` when real |
| Logo | `src/components/Logo.astro`, `public/favicon.svg` | Placeholder SVG |

## Contact form

`functions/api/contact.ts` is a Cloudflare Pages Function. Set these under Pages > Settings > Variables and Secrets:
`TURNSTILE_SECRET`, `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`. It uses Resend for email; swap the `fetch` for any
other email API if you prefer, and add that provider to your SPF record.

## Deploy (Cloudflare Pages)

1. Push this folder to a GitHub repository.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git.
3. Build command `npm run build`, output directory `dist`.
4. Add the environment variables above, then add the custom domain `oakhearttech.com`.
5. Add Redirect Rules for `www`, `oakhearttechnologies.com` and `oakheartinteractive.com` (see the brief, section 6).
