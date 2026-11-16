// Google Ads conversion tracking. Does nothing until site.googleAds.id is set (see src/data/site.ts).
// Loaded on every page by BaseLayout. Pages call trackConversion() after something actually succeeds,
// such as a form that was really delivered, not on a button click.

import { site } from '../data/site';

type ConversionName = keyof typeof site.googleAds.labels;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const { id, labels } = site.googleAds;

export function initAds() {
  if (!id || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js expects the arguments object itself, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', id);

  // gtag.js is large and busy on a phone's processor, so it loads after the page has finished loading and settled,
  // or at the visitor's first tap, scroll or keypress, whichever comes first. Calls made before then wait in
  // dataLayer and are sent once it arrives, so no conversion is lost.
  let loaded = false;
  const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
  const load = () => {
    if (loaded) return;
    loaded = true;
    events.forEach((t) => removeEventListener(t, load));
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s);
  };
  events.forEach((t) => addEventListener(t, load, { once: true, passive: true }));
  const later = () => setTimeout(load, 4000);
  if (document.readyState === 'complete') later();
  else addEventListener('load', later, { once: true });

  // "Book a call" links go to Microsoft Bookings, so the click is all that can be seen from here.
  if (site.bookingUrl) {
    document.addEventListener('click', (e) => {
      const a = (e.target as Element | null)?.closest?.('a');
      if (a && a.href.startsWith(site.bookingUrl)) trackConversion('bookingClick');
    });
  }
}

export function trackConversion(name: ConversionName) {
  const label = labels[name];
  if (!id || !label || !window.gtag) return;
  window.gtag('event', 'conversion', { send_to: `${id}/${label}` });
}
