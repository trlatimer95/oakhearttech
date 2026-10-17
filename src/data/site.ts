// One place for everything the owner still needs to supply. Empty strings are treated as "not set yet".
export const site = {
  name: 'Oakheart Technologies',
  url: 'https://oakhearttech.com',
  email: 'tyler@oakhearttech.com',
  location: 'Spokane, WA',
  tagline: 'Software that works the way your business does.',

  // Microsoft Bookings page URL. Until this is set, "Book a call" buttons go to /contact#book.
  bookingUrl: 'https://bookings.cloud.microsoft/book/OakheartTechnologies1@oakhearttech.com/',
  // Optional. Leave blank to publish no phone number.
  // Hidden until there is a separate business number (the (208) number is also the TRL Home Solutions number).
  phone: '',
  // Personal profiles for now; swap to Oakheart company profiles once created.
  linkedin: 'https://www.linkedin.com/in/tlatimer95/',
  github: 'https://github.com/trlatimer95',

  // Web3Forms access key (public by design). Get one at web3forms.com using tyler@oakhearttech.com.
  // Blank = the form renders but tells visitors to email instead.
  web3formsAccessKey: '4a1738a7-aa5b-43c8-803b-ae24d56e97db',
  // Cloudflare Web Analytics token. Blank = analytics script not included.
  analyticsToken: '',
};

export const bookingHref = site.bookingUrl || '/contact#book';
export const bookingIsExternal = Boolean(site.bookingUrl);
