import { describe, expect, it } from 'vitest';
import { parseRobots } from './robots';

describe('parseRobots', () => {
  it('spots a site-wide block for all crawlers', () => {
    expect(parseRobots('User-agent: *\nDisallow: /\n').blocksAll).toBe(true);
  });
  it('ignores blocks aimed at other bots and partial paths', () => {
    expect(parseRobots('User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nDisallow: /wp-admin/\nSitemap: https://x.com/sitemap.xml')).toEqual({
      blocksAll: false,
      sitemapListed: true,
    });
  });
  it('handles grouped user-agents', () => {
    expect(parseRobots('User-agent: bingbot\nUser-agent: Googlebot\nDisallow: /').blocksAll).toBe(true);
  });
  it('treats an empty Disallow as allowing everything', () => {
    expect(parseRobots('User-agent: *\nDisallow:').blocksAll).toBe(false);
  });
});
