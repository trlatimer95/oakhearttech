// Reads a robots.txt: does it block every search engine from the whole site, and does it list a sitemap?

export function parseRobots(text: string): { blocksAll: boolean; sitemapListed: boolean } {
  let agents: string[] = [];
  let inRules = false;
  let blocksAll = false;
  let sitemapListed = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    if (!line) continue;
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === 'sitemap' && value) sitemapListed = true;
    if (key === 'user-agent') {
      if (inRules) {
        agents = [];
        inRules = false;
      }
      agents.push(value.toLowerCase());
    } else if (key === 'disallow' || key === 'allow') {
      inRules = true;
      if (key === 'disallow' && value === '/' && agents.some((a) => a === '*' || a === 'googlebot')) blocksAll = true;
    }
  }
  return { blocksAll, sitemapListed };
}
