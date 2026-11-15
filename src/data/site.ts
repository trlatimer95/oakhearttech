// One place for everything the owner still needs to supply. Empty strings are treated as "not set yet".
export const site = {
  name: 'Oakheart Technologies',
  legalName: 'Oakheart Technologies LLC',
  url: 'https://oakhearttech.com',
  email: 'tyler@oakhearttech.com',
  location: 'Spokane, WA',
  tagline: 'Careful engineering. Efficient processes. Problems solved at the source.',

  // Microsoft Bookings page URL. Until this is set, "Book a call" buttons go to /contact#book.
  bookingUrl: 'https://bookings.cloud.microsoft/book/OakheartTechnologies1@oakhearttech.com/',
  // Optional. Leave blank to publish no phone number.
  // Oakheart's own business line (Quo). Feeds the contact page, footer and JSON-LD telephone.
  phone: '(509) 590-2944',
  // Company LinkedIn Page, plus Tyler's personal profile (used only as the founder's sameAs in the JSON-LD).
  linkedin: 'https://www.linkedin.com/company/oakheart-technologies',
  linkedinFounder: 'https://www.linkedin.com/in/tlatimer95/',
  github: 'https://github.com/Oakheart-Technologies',
  facebook: 'https://www.facebook.com/oakhearttech',

  // Web3Forms access key (public by design). Get one at web3forms.com using tyler@oakhearttech.com.
  // Blank = the form renders but tells visitors to email instead.
  web3formsAccessKey: '4a1738a7-aa5b-43c8-803b-ae24d56e97db',
  // Cloudflare Turnstile site key for the Free Website Evaluation (public by design; the secret is a Worker secret).
  // Local builds (npm run dev:worker) always use Cloudflare's test key instead.
  turnstileSiteKey: '0x4AAAAAAGAMHB2dCHSLHvNQ',
  // Google Ads conversion tracking (public by design). Blank id = no Google tag on the site at all.
  // id: the Google tag ID, like 'AW-123456789'. Each label is the part after the slash in that conversion's
  // send_to value ('AW-123456789/AbC-dEfGhIjK' → 'AbC-dEfGhIjK'). A blank label just skips that conversion.
  googleAds: {
    id: 'AW-18571987808',
    labels: {
      reportRequest: 'EmHUCIyJhrkdEOCW6JdF', // primary: "Get the full report" form delivered
      contactForm: 'c320CI-JhrkdEOCW6JdF', // primary: contact form delivered
      evaluationRun: 'EjXiCI2KhrkdEOCW6JdF', // secondary: a website evaluation finished its quick checks
      bookingClick: 'V9ZgCIqKhrkdEOCW6JdF', // secondary: clicked through to the Bookings page
    },
  },
  // Cloudflare Web Analytics token. Blank = analytics script not included.
  analyticsToken: 'dfdca334fcae4908b671f638a9906f6d',
};

export const bookingHref = site.bookingUrl || '/contact#book';
export const bookingIsExternal = Boolean(site.bookingUrl);
