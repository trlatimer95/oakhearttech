// Turns whatever a visitor typed into a safe origin to evaluate, or explains why it can't be used.
// The Worker fetches this address, so anything that could point at a private or internal machine is refused.

export type Normalized = { ok: true; origin: string; host: string; domain: string } | { ok: false; error: string };

const BLOCKED_SUFFIXES = ['.local', '.localhost', '.internal', '.lan', '.home', '.corp', '.intranet', '.test', '.invalid', '.example'];

export function normalizeUrl(input: string): Normalized {
  const raw = (input ?? '').trim();
  if (!raw) return { ok: false, error: 'Enter your website address, like yourbusiness.com.' };
  if (raw.length > 300) return { ok: false, error: 'That address is too long.' };

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  let u: URL;
  try {
    u = new URL(withScheme);
  } catch {
    return { ok: false, error: 'That doesn’t look like a website address. Try something like yourbusiness.com.' };
  }

  if (u.protocol !== 'https:' && u.protocol !== 'http:') return { ok: false, error: 'Only website addresses (http or https) can be checked.' };
  if (u.username || u.password) return { ok: false, error: 'Leave out any username or password.' };
  if (u.port && u.port !== '80' && u.port !== '443') return { ok: false, error: 'Only standard website addresses can be checked.' };

  // URL() lowercases and converts Unicode names to their xn-- form.
  const host = u.hostname.replace(/\.$/, '');
  if (!isPublicHostname(host)) return { ok: false, error: 'Enter a public website address, like yourbusiness.com.' };

  return { ok: true, origin: `https://${host}`, host, domain: host.replace(/^www\./, '') };
}

export function isPublicHostname(host: string): boolean {
  if (!host || host.length > 253) return false;
  if (host.includes('[') || host.includes(':')) return false; // IPv6 literal
  if (/^\d+(\.\d+){0,3}$/.test(host)) return false; // IPv4 literal, including short forms like 127.1
  if (/^0x/i.test(host)) return false;
  if (!host.includes('.')) return false; // single-label names like "localhost" or "intranet"
  if (host === 'localhost' || BLOCKED_SUFFIXES.some((s) => host.endsWith(s))) return false;
  const labels = host.split('.');
  if (labels.some((l) => !l || l.length > 63 || !/^[a-z0-9-]+$/.test(l) || l.startsWith('-') || l.endsWith('-'))) return false;
  const tld = labels[labels.length - 1];
  if (!/^(xn--[a-z0-9-]+|[a-z]{2,63})$/.test(tld)) return false;
  return true;
}

// Second-level labels under which registries sell names (e.g. example.co.uk), for finding the registered domain.
const SECOND_LEVEL = new Set(['co', 'com', 'org', 'net', 'gov', 'ac', 'edu', 'ltd', 'plc', 'me', 'nom']);

/** Best guess at the registered domain (for RDAP): example.com for shop.example.com, example.co.uk for www.example.co.uk. */
export function registeredDomain(host: string): string {
  const labels = host.split('.');
  if (labels.length <= 2) return host;
  const tld = labels[labels.length - 1];
  const sld = labels[labels.length - 2];
  const take = tld.length === 2 && SECOND_LEVEL.has(sld) ? 3 : 2;
  return labels.slice(-take).join('.');
}
