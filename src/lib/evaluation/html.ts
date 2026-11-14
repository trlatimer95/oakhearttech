// Reads the facts the evaluation needs out of a homepage's HTML. Plain string work, no DOM, so it runs the same in
// the Worker and in unit tests. It only needs to be good enough for headings and meta tags, not a full parser.

export interface HtmlFacts {
  title: string | null;
  metaDescription: string | null;
  robotsMeta: string | null;
  viewport: string | null;
  canonical: string | null;
  h1Count: number;
  hasJsonLdBusiness: boolean;
  hasOgTitle: boolean;
  hasOgImage: boolean;
  telLinks: number;
  mailtoLinks: number;
  forms: number;
  contactLink: boolean;
  /** http:// images, scripts, stylesheets or frames on the page (mixed content once the page is https). */
  insecureAssets: number;
  copyrightYear: number | null;
  generator: string | null;
  platform: string | null;
}

const NON_BUSINESS_TYPES = new Set([
  'WebSite', 'WebPage', 'AboutPage', 'ContactPage', 'CollectionPage', 'ItemPage', 'FAQPage', 'QAPage', 'SearchResultsPage',
  'BreadcrumbList', 'ListItem', 'ItemList', 'SiteNavigationElement', 'WPHeader', 'WPFooter', 'WPSideBar',
  'ImageObject', 'VideoObject', 'SearchAction', 'ReadAction', 'EntryPoint', 'PropertyValueSpecification',
  'Article', 'BlogPosting', 'NewsArticle', 'Person', 'Question', 'Answer', 'Thing',
]);

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? decode(m[1] ?? m[2] ?? m[3] ?? '') : null;
}

function metaContent(tags: string[], key: 'name' | 'property', value: string): string | null {
  for (const t of tags) {
    const v = attr(t, key);
    if (v && v.toLowerCase() === value) return attr(t, 'content');
  }
  return null;
}

export function parseHtml(html: string): HtmlFacts {
  // Drop comments, and the bodies of scripts and styles, so their text can't be mistaken for markup.
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const clean = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');

  const metas = clean.match(/<meta\b[^>]*>/gi) ?? [];
  const links = clean.match(/<link\b[^>]*>/gi) ?? [];
  const anchors = clean.match(/<a\b[^>]*>/gi) ?? [];

  const titleM = clean.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleM ? decode(titleM[1].replace(/<[^>]+>/g, '')) || null : null;

  const canonicalTag = links.find((l) => (attr(l, 'rel') ?? '').toLowerCase().split(/\s+/).includes('canonical'));

  const hrefs = anchors.map((a) => attr(a, 'href') ?? '');
  const anchorTexts = [...clean.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => m[1].replace(/<[^>]+>/g, ' ').toLowerCase());

  const jsonLd = scripts
    .filter(([, attrs]) => /application\/ld\+json/i.test(attrs))
    .map(([, , body]) => body)
    .join(' ');
  // Any schema.org type that describes the business itself (Organization, LocalBusiness, Bakery, Plumber, ...),
  // as opposed to page-structure types every site builder adds.
  const types = [...jsonLd.matchAll(/"@type"\s*:\s*(\[[^\]]*\]|"[^"]*")/g)].flatMap((m) => m[1].match(/[A-Za-z]+/g) ?? []);
  const hasJsonLdBusiness = types.some((t) => !NON_BUSINESS_TYPES.has(t));

  const insecureAssets = (clean.match(/<(img|script|iframe|source|video|audio)\b[^>]*\ssrc\s*=\s*["']?http:\/\//gi) ?? []).length +
    links.filter((l) => /stylesheet/i.test(attr(l, 'rel') ?? '') && /^http:\/\//i.test(attr(l, 'href') ?? '')).length;

  // Footer copyright: the latest four-digit year next to © or the word "copyright".
  const text = clean.replace(/<[^>]+>/g, ' ');
  let copyrightYear: number | null = null;
  for (const m of text.matchAll(/(?:©|&copy;|\(c\)|copyright)[^0-9]{0,40}((?:19|20)\d{2})(?:\s*[-–]\s*((?:19|20)\d{2}))?/gi)) {
    const y = Number(m[2] ?? m[1]);
    if (!copyrightYear || y > copyrightYear) copyrightYear = y;
  }

  const generator = metaContent(metas, 'name', 'generator');

  return {
    title,
    metaDescription: metaContent(metas, 'name', 'description'),
    robotsMeta: metaContent(metas, 'name', 'robots') ?? metaContent(metas, 'name', 'googlebot'),
    viewport: metaContent(metas, 'name', 'viewport'),
    canonical: canonicalTag ? attr(canonicalTag, 'href') : null,
    h1Count: (clean.match(/<h1\b/gi) ?? []).length,
    hasJsonLdBusiness,
    hasOgTitle: Boolean(metaContent(metas, 'property', 'og:title')),
    hasOgImage: Boolean(metaContent(metas, 'property', 'og:image')),
    telLinks: hrefs.filter((h) => /^tel:/i.test(h)).length,
    mailtoLinks: hrefs.filter((h) => /^mailto:/i.test(h)).length,
    forms: (clean.match(/<form\b/gi) ?? []).length,
    contactLink: hrefs.some((h) => /contact/i.test(h)) || anchorTexts.some((t) => /\bcontact\b/.test(t)),
    insecureAssets,
    copyrightYear,
    generator,
    platform: detectPlatform(html, generator),
  };
}

export function detectPlatform(html: string, generator: string | null): string | null {
  const g = (generator ?? '').toLowerCase();
  if (g.includes('wordpress') || /\/wp-content\/|\/wp-includes\//i.test(html)) return 'WordPress';
  if (g.includes('wix') || /static\.wixstatic\.com|wix\.com/i.test(html)) return 'Wix';
  if (g.includes('squarespace') || /squarespace\.com|static1\.squarespace/i.test(html)) return 'Squarespace';
  if (/cdn\.shopify\.com|Shopify\.theme/i.test(html)) return 'Shopify';
  if (g.includes('webflow') || /webflow\.(com|io)/i.test(html)) return 'Webflow';
  if (/img1\.wsimg\.com|godaddy/i.test(html) || g.includes('go daddy') || g.includes('godaddy')) return 'GoDaddy Website Builder';
  if (g.includes('weebly') || /weebly\.com/i.test(html)) return 'Weebly';
  if (g.includes('duda') || /dudaone|multiscreensite/i.test(html)) return 'Duda';
  if (g.includes('joomla')) return 'Joomla';
  if (g.includes('drupal') || /drupal-settings-json|\/sites\/default\/files\//i.test(html)) return 'Drupal';
  if (g.includes('astro')) return 'Astro';
  if (/__next|_next\/static/i.test(html)) return 'Next.js';
  if (g) return generator!.split(/\s+/)[0];
  return null;
}
