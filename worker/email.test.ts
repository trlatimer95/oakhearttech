import { describe, expect, it } from 'vitest';
import { reportLink, validEmail, validLink } from './email';

const ID = '5686f4bb-0dc3-49ca-8b75-270d31046aae';

describe('report links', () => {
  it('accepts a link it made', async () => {
    const link = new URL(await reportLink('https://oakhearttech.com', ID, 'salt'));
    expect(link.pathname).toBe(`/api/report/${ID}`);
    expect(await validLink(ID, link.searchParams.get('k'), 'salt')).toBe(true);
  });

  it('refuses a link for another id, another key, or no key', async () => {
    const k = new URL(await reportLink('https://x.com', ID, 'salt')).searchParams.get('k');
    expect(await validLink(ID.replace('5', '6'), k, 'salt')).toBe(false);
    expect(await validLink(ID, k, 'other')).toBe(false);
    expect(await validLink(ID, null, 'salt')).toBe(false);
    expect(await validLink(ID, k, undefined)).toBe(false);
  });
});

describe('validEmail', () => {
  it('accepts ordinary addresses', () => {
    expect(validEmail('pat@example.com')).toBe(true);
    expect(validEmail('pat.smith+site@mail.example.co.uk')).toBe(true);
  });
  it('refuses junk and header tricks', () => {
    for (const s of ['', 'pat', 'pat@', 'pat@example', 'a b@example.com', 'pat@example.com, eve@example.com', 'Pat <pat@example.com>', 'pat@example.com\nBcc: eve@example.com']) {
      expect(validEmail(s)).toBe(false);
    }
  });
});
