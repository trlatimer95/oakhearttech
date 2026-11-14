// The check rules and every visitor-facing sentence the evaluation shows. Edit wording here; scoring (score.ts)
// never writes sentences. Fix-menu names (`menu`) are placeholders until the fix menu and its prices are decided.

import type { PsiRaw, QuickRaw } from './facts';
import type { CategoryId, CheckResult, Effort, Status, Weight } from './types';

export const MENU = {
  google: 'Get found on Google',
  speed: 'Speed & repair',
  email: 'Email spam fix',
  domain: 'Domain & email check-up',
  security: 'Website security tune-up',
  mobile: 'Mobile & usability fixes',
} as const;

/** Short phrases for the one-sentence summary at the top of the results, by check id. */
export const SHORT: Record<string, string> = {
  https: 'it isn’t loading securely',
  indexable: 'Google is told not to list it',
  title: 'its Google title needs work',
  description: 'it has no description for Google',
  h1: 'it’s missing a main heading',
  mx: 'its domain can’t receive email',
  spf: 'your emails are likely landing in spam',
  dmarc: 'your emails are likely landing in spam',
  dkim: 'email signing couldn’t be confirmed',
  'http-redirect': 'the insecure version doesn’t redirect',
  www: 'one version of the address doesn’t work',
  'domain-expiry': 'the domain is close to expiring',
  'mixed-content': 'some items load insecurely',
  viewport: 'it isn’t set up for phones',
  performance: 'it’s slow on phones',
  lcp: 'it’s slow on phones',
  cls: 'the page jumps while loading',
  'page-weight': 'the page is a heavy download',
  images: 'its images are oversized',
  'font-size': 'text is too small on phones',
  accessibility: 'some visitors will struggle to use it',
};

type Spec = Omit<CheckResult, 'status' | 'title' | 'why' | 'fix' | 'detail'>;
type Copy = { title: string; why: string; fix?: string; detail?: string };

function make(spec: Spec, status: Status, copy: Copy): CheckResult {
  return { ...spec, status, title: copy.title, why: copy.why, fix: copy.fix ?? '', detail: copy.detail };
}

const spec = (id: string, category: CategoryId, weight: Weight, effort: Effort, menu: string): Spec => ({ id, category, weight, effort, menu });

const kb = (bytes: number) => (bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`);
const secs = (ms: number) => `${(ms / 1000).toFixed(1)} seconds`;

// ---------------------------------------------------------------------------------------------------------------
// Quick checks: homepage, headers, DNS and domain registration. Done in a few seconds.
// ---------------------------------------------------------------------------------------------------------------

export function quickChecks(raw: QuickRaw, now = new Date()): CheckResult[] {
  const out: CheckResult[] = [];
  const h = raw.html;
  const hdr = raw.homepage.headers;
  const loaded = raw.homepage.ok && !!h;
  const blocked = raw.homepage.error === 'blocked';

  // ---- Security & upkeep: does the site load over HTTPS at all? ----
  {
    const s = spec('https', 'security', 'critical', 'Half day', MENU.security);
    if (raw.homepage.ok) {
      out.push(make(s, 'pass', { title: 'Your site loads securely (HTTPS)', why: 'Browsers show your site as secure, and Google expects it.' }));
    } else if (blocked) {
      out.push(make(s, 'skip', { title: 'Your site blocked our automated check', why: 'Some hosts block automated visitors. That’s fine for customers, but it means parts of this check couldn’t run.' }));
    } else {
      const reason = {
        dns: 'The address doesn’t point to a website.',
        timeout: 'It took too long to respond.',
        tls: 'Its security certificate is missing, expired or doesn’t match the address.',
        refused: 'The server refused the connection.',
        other: 'It returned an error.',
        blocked: '',
      }[raw.homepage.error ?? 'other'];
      out.push(
        make(s, 'fail', {
          title: 'Your website didn’t load securely',
          why: `${reason} Visitors may see a warning page or nothing at all.`,
          fix: 'Find out why it isn’t loading and get a valid security certificate in place.',
          detail: raw.homepage.status ? `HTTP status ${raw.homepage.status}` : `Error: ${raw.homepage.error}`,
        }),
      );
    }
  }

  // ---- Found on Google ----
  if (loaded) {
    const robotsHeader = (hdr['x-robots-tag'] ?? '').toLowerCase();
    const robotsMeta = (h.robotsMeta ?? '').toLowerCase();
    const noindex = robotsMeta.includes('noindex') || robotsHeader.includes('noindex') || raw.robots.blocksAll;
    const s = spec('indexable', 'google', 'critical', 'Quick fix', MENU.google);
    out.push(
      noindex
        ? make(s, 'fail', {
            title: 'Your homepage is hidden from Google',
            why: 'A setting on your site tells search engines not to list it, so customers searching for you won’t find it.',
            fix: 'Remove the “noindex” setting or the robots.txt rule that blocks search engines.',
            detail: [robotsMeta && `robots meta: ${robotsMeta}`, robotsHeader && `X-Robots-Tag: ${robotsHeader}`, raw.robots.blocksAll && 'robots.txt: Disallow: /'].filter(Boolean).join(' · '),
          })
        : make(s, 'pass', { title: 'Google is allowed to list your homepage', why: 'Nothing on the page tells search engines to stay away.' }),
    );

    const t = h.title ?? '';
    const ts = spec('title', 'google', 'high', 'Quick fix', MENU.google);
    if (!t) {
      out.push(make(ts, 'fail', { title: 'Your homepage has no title', why: 'The title is the blue headline in Google results. Without one, Google guesses.', fix: 'Add a title with your business name, what you do and where.' }));
    } else if (/^(home|homepage|untitled|welcome|index)$/i.test(t.trim()) || t.length < 10) {
      out.push(make(ts, 'warn', { title: 'Your page title is too generic', why: `“${t}” doesn’t tell searchers who you are or what you do.`, fix: 'Rewrite it to include your business name, service and town.', detail: `Title: ${t}` }));
    } else if (t.length > 65) {
      out.push(make(ts, 'warn', { title: 'Your page title gets cut off in Google', why: `At ${t.length} characters, the end of it won’t show in search results.`, fix: 'Shorten it to about 60 characters, with the most important words first.', detail: `Title: ${t}` }));
    } else {
      out.push(make(ts, 'pass', { title: 'Your page has a clear title', why: 'This is the headline people see in Google results.', detail: `Title: ${t}` }));
    }

    const d = h.metaDescription ?? '';
    const ds = spec('description', 'google', 'medium', 'Quick fix', MENU.google);
    if (!d) {
      out.push(make(ds, 'fail', { title: 'No description for search results', why: 'Google writes its own snippet from random text on the page, which rarely sells you well.', fix: 'Add a one- or two-sentence description of what you offer and who it’s for.' }));
    } else if (d.length > 170) {
      out.push(make(ds, 'warn', { title: 'Your search description gets cut off', why: `At ${d.length} characters, Google will trim it.`, fix: 'Shorten it to about 155 characters.', detail: `Description: ${d}` }));
    } else {
      out.push(make(ds, 'pass', { title: 'Your page has a search description', why: 'This is the short summary under your listing in Google.', detail: `Description: ${d}` }));
    }

    const hs = spec('h1', 'google', 'medium', 'Quick fix', MENU.google);
    if (h.h1Count === 0) {
      out.push(make(hs, 'fail', { title: 'No main heading on your homepage', why: 'Search engines and screen readers use the main heading to understand what the page is about.', fix: 'Make the headline at the top of the page a proper main heading (H1).' }));
    } else if (h.h1Count > 1) {
      out.push(make(hs, 'warn', { title: `Your homepage has ${h.h1Count} main headings`, why: 'One clear main heading helps Google understand the page. Several compete with each other.', fix: 'Keep one main heading and turn the rest into subheadings.' }));
    } else {
      out.push(make(hs, 'pass', { title: 'Your homepage has one clear main heading', why: 'It tells Google what the page is about.' }));
    }

    const sm = spec('sitemap', 'google', 'low', 'Quick fix', MENU.google);
    out.push(
      raw.sitemapFound || raw.robots.sitemapListed
        ? make(sm, 'pass', { title: 'Your site has a sitemap', why: 'A sitemap helps Google find all your pages.' })
        : make(sm, 'warn', { title: 'No sitemap found', why: 'A sitemap is a list of your pages for Google. Without one, newer pages can take longer to show up.', fix: 'Turn on or generate a sitemap and submit it in Google Search Console.' }),
    );

    const bs = spec('business-info', 'google', 'low', 'Quick fix', MENU.google);
    out.push(
      h.hasJsonLdBusiness
        ? make(bs, 'pass', { title: 'Your business details are marked up for Google', why: 'Google can read your name, address and hours directly.' })
        : make(bs, 'warn', { title: 'Your business details aren’t marked up for Google', why: 'A small block of hidden code (structured data) lets Google show your hours, phone and location more reliably.', fix: 'Add LocalBusiness structured data with your name, phone, area and hours.' }),
    );

    const og = spec('social-preview', 'google', 'low', 'Quick fix', MENU.google);
    out.push(
      h.hasOgTitle && h.hasOgImage
        ? make(og, 'pass', { title: 'Links to your site show a proper preview', why: 'When someone shares your site, a title and image appear.' })
        : make(og, 'warn', { title: 'Shared links to your site look bare', why: 'When someone posts your link on Facebook or in a text, no picture or proper title appears.', fix: 'Add a share title and image (Open Graph tags).' }),
    );
  } else {
    out.push(make(spec('indexable', 'google', 'critical', 'Quick fix', MENU.google), 'skip', { title: 'Couldn’t read your homepage', why: 'The Google checks need the page to load.' }));
  }

  // ---- Email ----
  if (raw.dns.ok) {
    const mx = spec('mx', 'email', 'critical', 'Half day', MENU.domain);
    out.push(
      raw.dns.mx.length
        ? make(mx, 'pass', { title: 'Your domain can receive email', why: providerSentence(raw.dns.mx), detail: `MX: ${raw.dns.mx.join(', ')}` })
        : make(mx, 'fail', { title: 'Your domain can’t receive email', why: 'There’s no mail server set up for this domain, so email sent to addresses at it will bounce.', fix: 'Set up mail records (MX) for your email provider, or stop using addresses at this domain.' }),
    );

    const spf = raw.dns.spf;
    const ss = spec('spf', 'email', 'high', 'Quick fix', MENU.email);
    if (spf.length === 0) {
      out.push(make(ss, 'fail', { title: 'No sender list (SPF)', why: 'SPF tells other mail servers which services may send email as you. Without it, your emails are more likely to land in spam, and others can more easily fake them.', fix: 'Add an SPF record listing your email provider and any services that send for you.' }));
    } else if (spf.length > 1) {
      out.push(make(ss, 'fail', { title: 'Your domain has more than one sender list (SPF)', why: 'Two SPF records cancel each other out, so mail servers treat it as if you had none.', fix: 'Merge them into a single SPF record.', detail: spf.join(' | ') }));
    } else if (/\+all\b/i.test(spf[0])) {
      out.push(make(ss, 'fail', { title: 'Your sender list (SPF) allows anyone', why: 'It ends in “+all”, which tells mail servers that anyone may send email as you.', fix: 'Change the ending to “~all” or “-all”.', detail: spf[0] }));
    } else if (/\?all\b/i.test(spf[0]) || !/[~-]all\b/i.test(spf[0])) {
      out.push(make(ss, 'warn', { title: 'Your sender list (SPF) is too loose', why: 'It doesn’t tell mail servers what to do with email from other senders, so it gives you little protection.', fix: 'End the record with “~all” or “-all”.', detail: spf[0] }));
    } else {
      out.push(make(ss, 'pass', { title: 'Sender list (SPF) is set up', why: 'It tells other mail servers which services may send email as you.', detail: spf[0] }));
    }

    const dkim = spec('dkim', 'email', 'medium', 'Quick fix', MENU.email);
    out.push(
      raw.dns.dkimSelectors.length
        ? make(dkim, 'pass', { title: 'Email signing (DKIM) is set up', why: 'Your outgoing email carries a signature that proves it wasn’t altered or faked.', detail: `Selectors found: ${raw.dns.dkimSelectors.join(', ')}` })
        : make(dkim, 'warn', { title: 'Couldn’t confirm email signing (DKIM)', why: 'It may be set up under a name we can’t see from outside. If it isn’t, your email is more likely to be flagged.', fix: 'Confirm DKIM is turned on in your email provider’s admin settings.' }),
    );

    const dmarc = raw.dns.dmarc[0] ?? '';
    const policy = (dmarc.match(/\bp\s*=\s*(\w+)/i)?.[1] ?? '').toLowerCase();
    const dm = spec('dmarc', 'email', 'high', 'Quick fix', MENU.email);
    if (!dmarc) {
      out.push(make(dm, 'fail', { title: 'No DMARC policy', why: 'Without it, Gmail, Outlook and Yahoo treat your mail as less trustworthy. It’s one of the most common reasons small business email lands in spam.', fix: 'Add a DMARC record, starting in monitoring mode and tightening it once reports look clean.' }));
    } else if (policy === 'none' || !policy) {
      out.push(make(dm, 'warn', { title: 'DMARC is in monitoring mode only', why: 'Your DMARC record exists but doesn’t ask mail servers to act on fake email. That’s a good first step, but it doesn’t protect you yet.', fix: 'Review the reports, then move the policy to “quarantine” or “reject”.', detail: dmarc }));
    } else {
      out.push(make(dm, 'pass', { title: 'DMARC policy is protecting your domain', why: `Mail servers are told to ${policy === 'reject' ? 'reject' : 'quarantine'} email that fakes your address.`, detail: dmarc }));
    }
  } else {
    out.push(make(spec('mx', 'email', 'critical', 'Half day', MENU.domain), 'skip', { title: 'Couldn’t look up your email settings', why: 'The lookup service didn’t answer. Try again in a minute.' }));
  }

  // ---- Security & upkeep (continued) ----
  if (raw.httpToHttps !== null) {
    const s = spec('http-redirect', 'security', 'high', 'Quick fix', MENU.security);
    out.push(
      raw.httpToHttps
        ? make(s, 'pass', { title: 'Insecure links are sent to the secure version', why: 'Anyone typing http:// ends up on https:// automatically.' })
        : make(s, 'fail', { title: 'The insecure version of your site doesn’t redirect', why: 'Visitors who type or follow an http:// link stay on the unencrypted version, and browsers mark it “Not secure”.', fix: 'Redirect every http:// address to https://.' }),
    );
  }

  if (raw.altHost) {
    const s = spec('www', 'security', 'medium', 'Quick fix', MENU.domain);
    const a = raw.altHost;
    if (!a.ok) {
      out.push(make(s, 'warn', { title: `${a.host} doesn’t work`, why: 'Some people type your address with or without “www”. One version leads nowhere.', fix: `Point ${a.host} to your website and redirect it to the main address.` }));
    } else if (!a.sameDestination) {
      out.push(make(s, 'warn', { title: `${a.host} goes somewhere different`, why: 'The www and non-www versions of your address don’t end up at the same place, which splits your Google ranking and can confuse visitors.', fix: 'Redirect one version to the other.' }));
    } else {
      out.push(make(s, 'pass', { title: 'Your address works with and without “www”', why: 'Both versions end up at the same place.' }));
    }
  }

  if (raw.rdap.ok && raw.rdap.expires) {
    const days = Math.floor((Date.parse(raw.rdap.expires) - now.getTime()) / 86_400_000);
    const s = spec('domain-expiry', 'security', 'high', 'Quick fix', MENU.domain);
    const date = new Date(raw.rdap.expires).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    const detail = `Expires ${date}${raw.rdap.registrar ? ` · Registrar: ${raw.rdap.registrar}` : ''}`;
    if (days < 30) {
      out.push(make(s, 'fail', { title: days < 0 ? 'Your domain registration has expired' : `Your domain expires in ${days} day${days === 1 ? '' : 's'}`, why: 'If it lapses, your website and email stop working, and someone else can register the name.', fix: 'Renew it now, turn on auto-renew, and make sure the account is in the business’s name.', detail }));
    } else if (days < 90) {
      out.push(make(s, 'warn', { title: `Your domain expires in ${days} days`, why: 'If it lapses, your website and email stop working.', fix: 'Turn on auto-renew and confirm the account is in the business’s name.', detail }));
    } else {
      out.push(make(s, 'pass', { title: 'Your domain registration is current', why: `It’s paid up until ${date}.`, detail }));
    }
  }

  if (raw.rdap.ok && raw.rdap.transferLock !== undefined) {
    const s = spec('transfer-lock', 'security', 'low', 'Quick fix', MENU.domain);
    out.push(
      raw.rdap.transferLock
        ? make(s, 'pass', { title: 'Your domain is locked against transfers', why: 'Nobody can move it to another registrar without unlocking it first.' })
        : make(s, 'warn', { title: 'Your domain isn’t locked against transfers', why: 'A transfer lock stops someone from moving your domain away without your say-so.', fix: 'Turn on the transfer lock at your registrar.' }),
    );
  }

  if (raw.homepage.ok) {
    const missing: string[] = [];
    if (!hdr['strict-transport-security']) missing.push('HSTS');
    if ((hdr['x-content-type-options'] ?? '').toLowerCase() !== 'nosniff') missing.push('X-Content-Type-Options');
    if (!hdr['x-frame-options'] && !/frame-ancestors/i.test(hdr['content-security-policy'] ?? '')) missing.push('frame protection');
    if (!hdr['referrer-policy']) missing.push('Referrer-Policy');
    const s = spec('security-headers', 'security', 'medium', 'Quick fix', MENU.security);
    out.push(
      missing.length >= 2
        ? make(s, 'warn', { title: 'Some browser security settings are missing', why: 'These settings tell browsers to protect your visitors, for example from your site being shown inside someone else’s. They’re a quick, low-risk addition.', fix: 'Add the missing security headers at your host or in your site settings.', detail: `Missing: ${missing.join(', ')}` })
        : make(s, 'pass', { title: 'Browser security settings are in place', why: 'Your site tells browsers how to protect your visitors.', detail: missing.length ? `Missing: ${missing.join(', ')}` : undefined }),
    );

    const versioned = ['server', 'x-powered-by', 'x-aspnet-version', 'x-generator']
      .map((k) => hdr[k] && `${k}: ${hdr[k]}`)
      .filter((v): v is string => !!v && /\d+\.\d+/.test(v));
    const vs = spec('version-exposed', 'security', 'low', 'Quick fix', MENU.security);
    out.push(
      versioned.length
        ? make(vs, 'warn', { title: 'Your server announces its software version', why: 'Showing exact version numbers makes it easier for attackers to look up known weaknesses.', fix: 'Hide version numbers in the server settings, and keep the software updated.', detail: versioned.join(' · ') })
        : make(vs, 'pass', { title: 'Your server doesn’t announce its software version', why: 'Less information for anyone looking for weaknesses.' }),
    );
  }

  if (loaded) {
    const ms = spec('mixed-content', 'security', 'medium', 'Quick fix', MENU.security);
    out.push(
      h.insecureAssets
        ? make(ms, 'warn', { title: `${h.insecureAssets} item${h.insecureAssets === 1 ? '' : 's'} on your page load insecurely`, why: 'Images or scripts loaded over plain http:// can be blocked by browsers or trigger a “Not secure” warning.', fix: 'Change those links to https://.' })
        : make(ms, 'pass', { title: 'Everything on your page loads securely', why: 'No insecure images or scripts.' }),
    );

    if (h.copyrightYear) {
      const yr = now.getUTCFullYear();
      const cs = spec('copyright', 'security', 'low', 'Quick fix', MENU.security);
      out.push(
        h.copyrightYear <= yr - 2
          ? make(cs, 'warn', { title: `Your footer still says ©${h.copyrightYear}`, why: 'Visitors notice an old year and may wonder whether the business is still active or the site is looked after.', fix: 'Update the year, or have it fill in automatically.' })
          : make(cs, 'pass', { title: 'Your footer’s copyright year is current', why: 'A small sign that the site is looked after.' }),
      );
    }
  }

  // ---- Mobile & usability (the parts that don't need the speed test) ----
  if (loaded) {
    const vp = spec('viewport', 'mobile', 'high', 'Half day', MENU.mobile);
    out.push(
      h.viewport && /width\s*=\s*device-width/i.test(h.viewport)
        ? make(vp, 'pass', { title: 'Your site is set up for phone screens', why: 'Phones show it at the right size instead of a shrunken desktop page.' })
        : make(vp, 'fail', { title: 'Your site isn’t set up for phone screens', why: 'Phones show a shrunken desktop page that visitors have to pinch and zoom.', fix: 'Add a mobile viewport setting and check the layout on a phone.' }),
    );

    const tel = spec('tap-to-call', 'mobile', 'low', 'Quick fix', MENU.mobile);
    out.push(
      h.telLinks
        ? make(tel, 'pass', { title: 'Phone visitors can tap to call you', why: 'Your number is a tap-to-call link.' })
        : make(tel, 'warn', { title: 'Phone visitors can’t tap your number to call', why: 'On a phone, a tappable number is the quickest way for a customer to reach you.', fix: 'Make your phone number a tap-to-call link.' }),
    );

    const cp = spec('contact-path', 'mobile', 'medium', 'Quick fix', MENU.mobile);
    out.push(
      h.forms || h.mailtoLinks || h.contactLink || h.telLinks
        ? make(cp, 'pass', { title: 'Visitors can find a way to contact you', why: 'There’s a contact page, form, email or phone link on your homepage.' })
        : make(cp, 'warn', { title: 'No obvious way to contact you from the homepage', why: 'Visitors who can’t quickly see how to reach you often leave.', fix: 'Add a contact link, form or phone number near the top of the page.' }),
    );
  }

  return out;
}

function providerSentence(mx: string[]): string {
  const p = emailProvider(mx);
  return p ? `Mail for this domain goes to ${p}.` : 'Mail servers are set up for this domain.';
}

export function emailProvider(mx: string[]): string | undefined {
  const all = mx.join(' ').toLowerCase();
  if (/google\.com|googlemail\.com/.test(all)) return 'Google Workspace';
  if (/outlook\.com|protection\.outlook/.test(all)) return 'Microsoft 365';
  if (/secureserver\.net/.test(all)) return 'GoDaddy';
  if (/zoho\./.test(all)) return 'Zoho Mail';
  if (/protonmail|proton\.me/.test(all)) return 'Proton Mail';
  if (/icloud\.com/.test(all)) return 'iCloud Mail';
  if (/mx\.cloudflare\.net/.test(all)) return 'Cloudflare Email Routing';
  if (/emailsrvr\.com/.test(all)) return 'Rackspace';
  if (/yahoodns|yahoo\.com/.test(all)) return 'Yahoo';
  if (/titan\.email/.test(all)) return 'Titan';
  if (/mimecast/.test(all)) return 'Mimecast';
  if (/pphosted|proofpoint/.test(all)) return 'Proofpoint';
  return undefined;
}

// ---------------------------------------------------------------------------------------------------------------
// Speed checks: from Google PageSpeed Insights (mobile). Take 15–40 seconds.
// ---------------------------------------------------------------------------------------------------------------

export function speedChecks(psi: PsiRaw): CheckResult[] {
  if (!psi.ok) {
    const why = 'Google’s speed test couldn’t finish for this site. That sometimes happens with slow or protected sites.';
    return [
      make(spec('performance', 'speed', 'high', 'Half day', MENU.speed), 'skip', { title: 'Couldn’t measure speed', why, detail: psi.error }),
      make(spec('accessibility', 'mobile', 'medium', 'Half day', MENU.mobile), 'skip', { title: 'Couldn’t test readability on a phone', why }),
    ];
  }
  const out: CheckResult[] = [];

  if (psi.performance !== undefined) {
    const p = psi.performance;
    const s = spec('performance', 'speed', 'high', 'Half day', MENU.speed);
    const detail = `PageSpeed performance score: ${p}/100 (mobile)`;
    out.push(
      p < 50
        ? make(s, 'fail', { title: 'Your site is slow on phones', why: `Google scores its speed on a phone at ${p} out of 100. Slow sites lose visitors and rank lower.`, fix: 'Shrink images, trim scripts and plugins, and check the hosting.', detail })
        : p < 90
          ? make(s, 'warn', { title: 'Your site could be faster on phones', why: `Google scores its speed on a phone at ${p} out of 100. 90 or above is considered good.`, fix: 'Tackle the biggest slowdowns, usually images and scripts.', detail })
          : make(s, 'pass', { title: 'Your site is fast on phones', why: `Google scores its speed on a phone at ${p} out of 100.`, detail }),
    );
  }

  if (psi.lcpMs !== undefined) {
    const v = psi.lcpMs;
    const s = spec('lcp', 'speed', 'high', 'Half day', MENU.speed);
    const detail = `Largest Contentful Paint: ${secs(v)}`;
    out.push(
      v > 4000
        ? make(s, 'fail', { title: `Main content takes ${secs(v)} to appear on a phone`, why: 'Many visitors give up after about 3 seconds. Until the main content shows, they’re looking at a mostly blank page.', fix: 'Speed up the largest item at the top of the page, usually a big photo or slider.', detail })
        : v > 2500
          ? make(s, 'warn', { title: `Main content takes ${secs(v)} to appear on a phone`, why: 'Under 2.5 seconds is considered good. Visitors start leaving after about 3.', fix: 'Optimize the main image or banner at the top of the page.', detail })
          : make(s, 'pass', { title: `Main content appears in ${secs(v)}`, why: 'That’s within Google’s “good” range on a phone.', detail }),
    );
  }

  if (psi.cls !== undefined) {
    const v = psi.cls;
    const s = spec('cls', 'speed', 'medium', 'Half day', MENU.speed);
    const detail = `Cumulative Layout Shift: ${v.toFixed(2)}`;
    out.push(
      v > 0.25
        ? make(s, 'fail', { title: 'The page jumps around while it loads', why: 'Text and buttons move as things load, so visitors tap the wrong thing or lose their place.', fix: 'Reserve space for images, ads and banners before they load.', detail })
        : v > 0.1
          ? make(s, 'warn', { title: 'The page shifts a little while it loads', why: 'Some content moves after it appears, which is annoying on a phone.', fix: 'Set sizes on images and embedded content.', detail })
          : make(s, 'pass', { title: 'The page stays steady while it loads', why: 'Nothing jumps around as it loads.', detail }),
    );
  }

  if (psi.totalBytes !== undefined) {
    const v = psi.totalBytes;
    const s = spec('page-weight', 'speed', 'medium', 'Half day', MENU.speed);
    const detail = `Total download: ${kb(v)}`;
    out.push(
      v > 5_000_000
        ? make(s, 'fail', { title: `Your homepage is a ${kb(v)} download`, why: 'That’s heavy for a phone on cellular data. It’s slow and uses up visitors’ data.', fix: 'Compress images and remove unused scripts and fonts.', detail })
        : v > 3_000_000
          ? make(s, 'warn', { title: `Your homepage is a ${kb(v)} download`, why: 'A bit heavy for a phone. Under 3 MB loads noticeably faster.', fix: 'Compress the largest images.', detail })
          : make(s, 'pass', { title: `Your homepage is a lean ${kb(v)} download`, why: 'Light enough to load quickly on a phone.', detail }),
    );
  }

  if (psi.imageSavingsBytes !== undefined) {
    const v = psi.imageSavingsBytes;
    const s = spec('images', 'speed', 'medium', 'Quick fix', MENU.speed);
    out.push(
      v > 1_000_000
        ? make(s, 'fail', { title: 'Images are much bigger than they need to be', why: `Resizing and compressing them would save about ${kb(v)} on every visit. That’s often the single biggest speed win.`, fix: 'Resize photos to the size they’re shown and save them in a modern format.' })
        : v > 300_000
          ? make(s, 'warn', { title: 'Some images are bigger than they need to be', why: `Optimizing them would save about ${kb(v)} per visit.`, fix: 'Resize and compress the largest photos.' })
          : make(s, 'pass', { title: 'Images are well optimized', why: 'Photos are already about the right size.' }),
    );
  }

  // Mobile & usability, from Lighthouse's accessibility and best-practice audits.
  const a = psi.audits;
  if (a['font-size'] !== undefined && a['font-size'] !== null) {
    const s = spec('font-size', 'mobile', 'medium', 'Half day', MENU.mobile);
    out.push(
      a['font-size'] < 1
        ? make(s, 'fail', { title: 'Text is too small to read on a phone', why: 'Visitors have to zoom in to read it.', fix: 'Increase the base text size on small screens.' })
        : make(s, 'pass', { title: 'Text is readable on a phone', why: 'No zooming needed.' }),
    );
  }
  if (a['target-size'] !== undefined && a['target-size'] !== null) {
    const s = spec('tap-targets', 'mobile', 'medium', 'Half day', MENU.mobile);
    out.push(
      a['target-size'] < 1
        ? make(s, 'warn', { title: 'Some buttons and links are hard to tap', why: 'They’re small or too close together, so people tap the wrong one.', fix: 'Make buttons and links bigger and space them out on phones.' })
        : make(s, 'pass', { title: 'Buttons and links are easy to tap', why: 'They’re big enough and spaced out on a phone.' }),
    );
  }
  if (a['image-alt'] !== undefined && a['image-alt'] !== null) {
    const s = spec('image-alt', 'mobile', 'low', 'Quick fix', MENU.mobile);
    out.push(
      a['image-alt'] < 1
        ? make(s, 'warn', { title: 'Some images have no description', why: 'Screen readers can’t describe them to visitors with low vision, and Google can’t tell what they show.', fix: 'Add short descriptions (alt text) to meaningful images.' })
        : make(s, 'pass', { title: 'Images have descriptions', why: 'Screen readers and Google can tell what they show.' }),
    );
  }
  if (psi.accessibility !== undefined) {
    const v = psi.accessibility;
    const s = spec('accessibility', 'mobile', 'medium', 'Half day', MENU.mobile);
    const detail = `Lighthouse accessibility score: ${v}/100`;
    out.push(
      v < 70
        ? make(s, 'fail', { title: 'Your site is hard to use for some visitors', why: `Google’s accessibility score is ${v} out of 100. Low contrast, unlabeled buttons and similar issues shut some customers out.`, fix: 'Fix the flagged contrast, labels and structure issues.', detail })
        : v < 90
          ? make(s, 'warn', { title: 'A few things make your site harder to use', why: `Google’s accessibility score is ${v} out of 100. 90 or above is good.`, fix: 'Fix the flagged contrast and labeling issues.', detail })
          : make(s, 'pass', { title: 'Your site is easy to use for most visitors', why: `Google’s accessibility score is ${v} out of 100.`, detail }),
    );
  }

  return out;
}
