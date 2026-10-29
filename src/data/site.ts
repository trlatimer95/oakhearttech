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
  // This is also the TRL Home Solutions number. Swap it here if a separate business line is set up later.
  phone: '(208) 553-6162',
  // Company LinkedIn Page, plus Tyler's personal profile (used only as the founder's sameAs in the JSON-LD).
  linkedin: 'https://www.linkedin.com/company/oakheart-technologies',
  linkedinFounder: 'https://www.linkedin.com/in/tlatimer95/',
  github: 'https://github.com/Oakheart-Technologies',
  facebook: 'https://www.facebook.com/oakhearttech',

  // Web3Forms access key (public by design). Get one at web3forms.com using tyler@oakhearttech.com.
  // Blank = the form renders but tells visitors to email instead.
  web3formsAccessKey: '4a1738a7-aa5b-43c8-803b-ae24d56e97db',
  // Cloudflare Web Analytics token. Blank = analytics script not included.
  analyticsToken: 'dfdca334fcae4908b671f638a9906f6d',
};

export const bookingHref = site.bookingUrl || '/contact#book';
export const bookingIsExternal = Boolean(site.bookingUrl);
