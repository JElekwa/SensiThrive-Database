// Inline SVG icons (stroke style, 24x24). Decorative unless a label is passed.
const P = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/>',
  flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M7.5 15h9"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  bookmarkFill: '<path d="M6 3h12v18l-6-4-6 4z" fill="currentColor"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19c3-4 6-6 10-8"/>',
  baby: '<circle cx="12" cy="8" r="4"/><path d="M5 21c1-4 4-6 7-6s6 2 7 6"/><path d="M10.5 8h.01M13.5 8h.01"/>',
  spray: '<path d="M8 10h6v11H8zM9 10V7h4v3M13 7h3M18 4h.01M20 6h.01M18 8h.01M20 10h.01"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
  shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
  bowl: '<path d="M3 11h18a9 9 0 0 1-18 0zM8 7c0-1 1-2 1-3M12 7c0-1 1-2 1-3M16 7c0-1 1-2 1-3"/>',
  home: '<path d="M4 11 12 4l8 7v9H4z"/><path d="M10 20v-5h4v5"/>',
  tag: '<path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
  bag: '<path d="M5 8h14l-1.2 12.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 11 7.6-4M8.2 13l7.6 4"/>',
};

export const icon = (name, { size = 20, label = '', cls = '' } = {}) =>
  `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ${
    label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'
  }>${P[name] || ''}</svg>`;
