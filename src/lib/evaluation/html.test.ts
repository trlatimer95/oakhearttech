import { describe, expect, it } from 'vitest';
import { parseHtml } from './html';

const page = `<!doctype html><html><head>
<title>Example Bakery &amp; Café | Spokane</title>
<meta name="description" content="Fresh bread daily.">
<meta name=viewport content="width=device-width, initial-scale=1">
<meta property="og:title" content="Example Bakery">
<meta name="generator" content="WordPress 6.4.2">
<link rel="canonical" href="https://examplebakery.com/">
<link rel="stylesheet" href="http://examplebakery.com/old.css">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Bakery"}</script>
<script>var x = "<h1>not a heading</h1>";</script>
</head><body>
<!-- <h1>commented out</h1> -->
<h1>Welcome</h1>
<img src="http://examplebakery.com/a.jpg">
<a href="tel:+15095550100">Call</a> <a href="/contact-us">Get in touch</a>
<form action="/subscribe"></form>
<footer>© 2019–2022 Example Bakery</footer>
</body></html>`;

describe('parseHtml', () => {
  const f = parseHtml(page);
  it('reads the head', () => {
    expect(f.title).toBe('Example Bakery & Café | Spokane');
    expect(f.metaDescription).toBe('Fresh bread daily.');
    expect(f.viewport).toContain('width=device-width');
    expect(f.canonical).toBe('https://examplebakery.com/');
    expect(f.hasOgTitle).toBe(true);
    expect(f.hasOgImage).toBe(false);
  });
  it('ignores headings inside scripts and comments', () => {
    expect(f.h1Count).toBe(1);
  });
  it('finds contact paths and mixed content', () => {
    expect(f.telLinks).toBe(1);
    expect(f.contactLink).toBe(true);
    expect(f.forms).toBe(1);
    expect(f.insecureAssets).toBe(2);
  });
  it('reads the copyright year range end', () => {
    expect(f.copyrightYear).toBe(2022);
  });
  it('detects the platform and business markup', () => {
    expect(f.platform).toBe('WordPress');
    expect(f.hasJsonLdBusiness).toBe(true);
  });
  it('does not count page-structure markup as business info', () => {
    const g = parseHtml('<script type="application/ld+json">{"@graph":[{"@type":"WebSite"},{"@type":["WebPage","FAQPage"]}]}</script>');
    expect(g.hasJsonLdBusiness).toBe(false);
  });
  it('handles an empty page', () => {
    const e = parseHtml('');
    expect(e.title).toBeNull();
    expect(e.h1Count).toBe(0);
    expect(e.platform).toBeNull();
  });
});
