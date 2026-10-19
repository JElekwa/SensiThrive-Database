// Structured data (schema.org JSON-LD) builders for E-E-A-T and rich results.
import { site, tiers } from '../../site.config.mjs';

export const abs = (p = '/') => (p.startsWith('http') ? p : site.url.replace(/\/$/, '') + p);

export const ehansOrg = () => ({
  '@type': 'Organization',
  '@id': abs('/#ehans'),
  name: site.source.org,
  alternateName: site.source.orgShort,
  url: site.source.orgUrl,
  foundingDate: '1985',
  address: { '@type': 'PostalAddress', addressLocality: 'Halifax', addressRegion: 'NS', addressCountry: 'CA' },
  description: 'A community-based, non-profit, charitable organization run by volunteers, focused on the impact of common environmental hazards on human health.',
});

export const publisher = () => ({
  '@type': 'Organization',
  '@id': abs('/#org'),
  name: site.publisherName,
  url: abs('/'),
  logo: { '@type': 'ImageObject', url: abs('/icons/icon-512.png'), width: 512, height: 512 },
  email: site.contactEmail,
  ...(site.sameAs.length ? { sameAs: site.sameAs } : {}),
});

export const editor = () =>
  site.editorName
    ? { '@type': 'Person', '@id': abs('/about#editor'), name: site.editorName, url: abs('/about#editor'), ...(site.editorBio ? { description: site.editorBio } : {}), worksFor: { '@id': abs('/#org') } }
    : { '@id': abs('/#org') };

export const websiteLD = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    publisher(),
    ehansOrg(),
    {
      '@type': 'WebSite',
      '@id': abs('/#website'),
      url: abs('/'),
      name: site.name,
      description: site.description,
      inLanguage: 'en-CA',
      publisher: { '@id': abs('/#org') },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: abs('/search?q={search_term_string}') },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
});

export const breadcrumbLD = (crumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, ...(c.href ? { item: abs(c.href) } : {}) })),
});

// Original EHANS text + SensiThrive 2026 layer
export const articleLD = ({ title, description, path, revised = '2011', modified, about }) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': abs(path) + '#article',
  headline: title.slice(0, 110),
  description,
  url: abs(path),
  mainEntityOfPage: abs(path),
  inLanguage: 'en-CA',
  image: abs('/og-default.png'),
  datePublished: '2011-06-01',
  dateModified: modified || site.lastReviewed,
  author: [{ '@id': abs('/#ehans') }],
  contributor: editor(),
  editor: editor(),
  publisher: { '@id': abs('/#org') },
  isBasedOn: { '@type': 'CreativeWork', name: 'The Guide to Less Toxic Products', url: site.source.guideUrl, author: { '@id': abs('/#ehans') }, version: revised },
  ...(about ? { about } : {}),
});

export const itemListLD = (name, items) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  numberOfItems: items.length,
  itemListElement: items.slice(0, 100).map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(it.url), name: it.name })),
});

// Product page: the EHANS rating is expressed as an editorial Review by EHANS (not a user rating).
export const productLD = (p, brandName) => {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': abs(p.url) + '#product',
    name: p.name,
    url: abs(p.url),
    brand: { '@type': 'Brand', name: brandName },
    description: `${p.name} was rated “${tiers[p.topTier]?.label || 'listed'}” in the EHANS Guide to Less Toxic Products. ${tiers[p.topTier]?.short || ''}`.trim(),
  };
  if (site.productReviewSchema && p.topTier && tiers[p.topTier]) {
    ld.review = {
      '@type': 'Review',
      author: { '@id': abs('/#ehans'), '@type': 'Organization', name: site.source.org },
      publisher: { '@id': abs('/#org') },
      datePublished: '2011-06-01',
      name: `EHANS rating: ${tiers[p.topTier].label}`,
      reviewBody: tiers[p.topTier].short,
      reviewRating: { '@type': 'Rating', ratingValue: tiers[p.topTier].rank, bestRating: 3, worstRating: 1, ratingExplanation: tiers[p.topTier].short },
    };
  }
  return ld;
};

export const aboutPageLD = () => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: abs('/about'),
  name: `About ${site.name}`,
  about: { '@id': abs('/#org') },
  mentions: [{ '@id': abs('/#ehans') }],
});

export const definedTermLD = (i, path) => ({
  '@context': 'https://schema.org',
  '@type': 'DefinedTerm',
  name: i.name,
  url: abs(path),
  inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'Common Hazardous Ingredients (EHANS Guide)', url: abs('/ingredients') },
});
