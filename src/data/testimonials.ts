// Customer testimonials. Quote the customer's own words. An ellipsis (…) marks anything left out,
// and the only other edits allowed are obvious typo fixes. Keep the full original in `source` notes.
export interface Testimonial {
  id: string;
  name: string;
  // Shown under the name, as the customer signed it.
  role: string;
  // Where the review was posted, e.g. "Google review".
  source: string;
  // Link to the public review. Blank = no link shown.
  sourceUrl: string;
  stars: number;
  // Short excerpt for the home page.
  short: string[];
  // Longer excerpt for the matching service page.
  long: string[];
  // Service page slugs this testimonial appears on.
  services: string[];
}

export const testimonials: Testimonial[] = [
  {
    // Google review posted 2026-11-15. Original typo "hegot" corrected to "he got".
    id: 'julie-kuhlmann',
    name: 'Julie Kuhlmann',
    role: 'Home Girl Team | Coldwell Banker Tomlinson',
    source: 'Google review',
    // The Google Business Profile, where the review can be read. Adding "/review" to this address opens
    // the "write a review" form instead, which is the link to send customers.
    sourceUrl: 'https://g.page/r/CdGZn4TGsxZjEAE',
    stars: 5,
    short: [
      'Tyler at Oakheart Technologies is a lifesaver! He spent four hours getting my new domain and all my business technology set up, and it was not a simple job. … He stayed patient the whole time and didn’t stop until everything worked.',
      'I’m a busy REALTOR® and can’t afford tech headaches, so having it all run smoothly now is a huge relief!',
    ],
    long: [
      'Tyler at Oakheart Technologies is a lifesaver! He spent four hours getting my new domain and all my business technology set up, and it was not a simple job. Besides the domain name change, he got three different email addresses delivering to one place, moved me from Gmail to Microsoft, and got my email host, domain host and CRM all working together.',
      '… He stayed patient the whole time and didn’t stop until everything worked.',
      'I’m a busy REALTOR® and can’t afford tech headaches, so having it all run smoothly now is a huge relief! … If you need your technology set up the right way, I highly recommend!',
    ],
    services: ['tech-help'],
  },
];
