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
| Web3Forms access key | `site.web3formsAccessKey` | Blank = form tells visitors to email instead |
| Analytics token | `site.analyticsToken` | Cloudflare Web Analytics |
| Prices | `src/data/services.ts` | Search for `$[X]` |
| Case studies | `src/content/work/*.md` | Set `draft: false` when real |
| Logo | `src/components/Logo.astro`, `public/favicon.svg` | Placeholder SVG |

## Contact form

The form posts straight from the browser to [Web3Forms](https://web3forms.com), which emails the message to
tyler@oakhearttech.com. There is no server code and nothing secret to configure.

1. Go to web3forms.com and enter `tyler@oakhearttech.com` to get an access key (they email it to you).
2. Put the key in `site.web3formsAccessKey` in `src/data/site.ts`. It is public by design.
3. Rebuild and deploy. Until the key is set, the form tells visitors to email instead.

Spam protection is the hidden `botcheck` honeypot. Web3Forms can add hCaptcha from its dashboard if spam appears.

## Deploy (Cloudflare Workers with static assets)

1. Push this folder to a GitHub repository.
2. Cloudflare dashboard > Workers & Pages > the `oakhearttech` Worker > Settings > Build, connected to the repo.
3. Build command `npm run build`, deploy command `npx wrangler deploy`.
4. Add the custom domain `oakhearttech.com`.
5. Add Redirect Rules for `www`, `oakhearttechnologies.com` and `oakheartinteractive.com` (see the brief, section 6).
