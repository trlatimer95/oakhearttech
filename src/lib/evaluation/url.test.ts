import { describe, expect, it } from 'vitest';
import { isPublicHostname, normalizeUrl, registeredDomain } from './url';

describe('normalizeUrl', () => {
  it('adds https and strips the path', () => {
    expect(normalizeUrl('Example.com/about?x=1')).toEqual({ ok: true, origin: 'https://example.com', host: 'example.com', domain: 'example.com' });
  });
  it('keeps www in the host but not the domain', () => {
    const r = normalizeUrl('http://www.example.com');
    expect(r.ok && r.origin).toBe('https://www.example.com');
    expect(r.ok && r.domain).toBe('example.com');
  });
  it('converts Unicode names', () => {
    const r = normalizeUrl('bücher.de');
    expect(r.ok && r.host).toBe('xn--bcher-kva.de');
  });
  it.each([
    '',
    'localhost',
    'http://localhost:8080',
    'http://127.0.0.1',
    'http://127.1',
    'http://10.0.0.5',
    'http://[::1]/',
    'http://0x7f000001',
    'intranet',
    'printer.local',
    'site.internal',
    'ftp://example.com',
    'file:///etc/passwd',
    'https://user:pass@example.com',
    'https://example.com:8443',
    'exa mple.com',
    'example.123',
  ])('refuses %s', (input) => {
    expect(normalizeUrl(input).ok).toBe(false);
  });
});

describe('isPublicHostname', () => {
  it('accepts normal names', () => {
    expect(isPublicHostname('oakhearttech.com')).toBe(true);
    expect(isPublicHostname('shop.example.co.uk')).toBe(true);
  });
  it('rejects bad labels', () => {
    expect(isPublicHostname('-bad.com')).toBe(false);
    expect(isPublicHostname('a..com')).toBe(false);
  });
});

describe('registeredDomain', () => {
  it('finds the registered name', () => {
    expect(registeredDomain('www.example.com')).toBe('example.com');
    expect(registeredDomain('shop.example.co.uk')).toBe('example.co.uk');
    expect(registeredDomain('example.com')).toBe('example.com');
  });
});
