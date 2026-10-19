// Central site configuration. Edit values here; everything else reads from this file.
// Values marked TODO should be filled in before launch (see docs/LAUNCH.md).

const env = (k, d) => (typeof process !== 'undefined' && process.env[k]) || d;

export const site = {
  name: 'SensiThrive',
  domain: 'sensithrive.com',
  url: env('SITE_URL', 'https://sensithrive.com'),
  tagline: 'The Guide to Less Toxic Products, carried forward',
  description:
    'Find less toxic personal care, baby and cleaning products. The EHANS Guide to Less Toxic Products, searchable and updated for 2026.',
  locale: 'en_CA',
  language: 'en',
  themeColor: '#4e6537',
  backgroundColor: '#fcf9f8',

  // Contact + ownership (shown on About, Contact, Privacy and in structured data)
  contactEmail: env('CONTACT_EMAIL', 'hello@sensithrive.com'), // TODO: create this mailbox
  publisherName: 'SensiThrive', // TODO: legal entity name if you have one
  editorName: env('EDITOR_NAME', ''), // TODO: the real person who reviews updates (E-E-A-T); leave '' to show "SensiThrive editorial team"
  editorBio: env('EDITOR_BIO', ''), // TODO: 1–2 factual sentences about the editor's experience
  sameAs: [
    // TODO: social profiles, e.g. 'https://www.instagram.com/sensithrive'
  ],

  // Attribution to the original authors
  source: {
    org: 'Environmental Health Association of Nova Scotia (EHANS)',
    orgShort: 'EHANS',
    orgUrl: 'https://www.environmentalhealth.ca',
    guideUrl: 'http://www.lesstoxicguide.ca',
    guideArchiveUrl: 'https://web.archive.org/web/2016/http://www.lesstoxicguide.ca/',
    donateUrl: 'https://www.environmentalhealth.ca',
    copyright: '© 2004–2011 Environmental Health Association of Nova Scotia',
    // TODO: once EHANS confirms in writing, change to 'Reproduced with permission of EHANS.'
    permissionNote: env('EHANS_PERMISSION_NOTE', 'Reproduced with attribution. Permission request to EHANS in progress.'),
    lastRevised: 'Spring/Summer 2011',
    funders: [
      'Saunders Matthey Foundation',
      'Halifax Peninsula Community Health Board',
      'Chebucto West Community Health Board',
      'Balance Naturopathic Health Centre (Halifax)',
      'Halifax Dump and Run',
    ],
    contributors: [
      'Casaroma Wellness Centre, Dartmouth N.S. (Essential Oils section)',
      'Karen Robinson, Citizens for a Safe Learning Environment (CASLE) (Maintenance Chemicals in Schools)',
      'People with chemical sensitivities who recommended products and tips',
    ],
  },

  // The date the current 2026 review layer was last updated (shown as dateModified)
  lastReviewed: env('LAST_REVIEWED', '2026-10-19'),

  // Search engines. Leave indexing OFF until EHANS permission + content review are done.
  allowIndexing: env('ALLOW_INDEXING', 'false') === 'true',
  googleSiteVerification: env('GOOGLE_SITE_VERIFICATION', ''),
  bingSiteVerification: env('BING_SITE_VERIFICATION', ''),

  // Thin-content protection: product pages not yet re-checked for 2026 are noindex (still crawlable/linked)
  // and left out of the sitemap. Category pages carry the SEO weight until products are verified.
  indexUnverifiedProducts: env('INDEX_UNVERIFIED_PRODUCTS', 'false') === 'true',
  // Brand pages with fewer products than this are noindex
  minBrandProductsToIndex: 2,

  // Include Product + editorial Review structured data on product pages (EHANS rating as the review)
  productReviewSchema: env('PRODUCT_REVIEW_SCHEMA', 'true') === 'true',

  // Fallback outbound link for products with no verified URL yet
  searchFallback: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
};

// EHANS rating definitions (from "Our Categories" in the original guide)
export const tiers = {
  best: {
    label: 'Best',
    short: 'Contains no ingredients from the guide’s list of common hazardous ingredients.',
    rank: 3,
  },
  good: {
    label: 'Good',
    short: 'Contains few, if any, common hazardous ingredients; fewer than most conventional products.',
    rank: 2,
  },
  'less-toxic': {
    label: 'Less Toxic',
    short: 'Household cleaners: the guide’s equivalent of Best and Good combined.',
    rank: 2,
  },
  'widely-available': {
    label: 'Widely Available',
    short: 'Not as good as Good, but easy to find. May contain some common hazardous ingredients.',
    rank: 1,
  },
  unscented: {
    label: 'Simply Unscented',
    short: 'No added scent, natural or synthetic. May still contain common hazardous ingredients.',
    rank: 1,
  },
  avoid: { label: 'Avoid', short: 'Not recommended.', rank: 0 },
};

// Product status in the 2026 review layer
export const statuses = {
  unverified: { label: 'Not yet re-checked', tone: 'neutral', help: 'Listed in the 2011 guide. We have not yet confirmed it is still sold with the same formula.' },
  active: { label: 'Verified 2026', tone: 'good', help: 'Still sold. Ingredients re-checked against the guide’s criteria.' },
  reformulated: { label: 'Reformulated', tone: 'warn', help: 'The formula has changed since the 2011 guide. Read the current label.' },
  renamed: { label: 'Renamed / acquired', tone: 'warn', help: 'Sold under a different name or owner now.' },
  discontinued: { label: 'Discontinued', tone: 'muted', help: 'No longer sold. Kept for the record; see alternatives below.' },
};

export default site;
