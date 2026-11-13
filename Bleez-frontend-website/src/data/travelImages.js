// Verified Unsplash photos (free to use under the Unsplash License).
const u = (id, w = 900) => `https://images.unsplash.com/photo-${id}?w=${w}&q=82&auto=format&fit=crop`;

export const IMG = {
  maldives: (w) => u('1507525428034-b723cf961d3e', w),
  paris: (w) => u('1502602898657-3e91760cbb34', w),
  taj: (w) => u('1524492412937-b28074a5d7da', w),
  alps: (w) => u('1464822759023-fed622ff2c3b', w),
  kyoto: (w) => u('1493976040374-85c8e12f0c0e', w),
  santorini: (w) => u('1613395877344-13d4a8e0d49e', w),
  tropical: (w) => u('1519046904884-53103b34b206', w),
  bali: (w) => u('1555400038-63f5ba517a47', w),
  snow: (w) => u('1519681393784-d120267933ba', w),
  lake: (w) => u('1501785888041-af3ef285b470', w),
  rome: (w) => u('1552832230-c0197dd311b5', w),
  resort: (w) => u('1582719478250-c89cae4dc85b', w),
  pool: (w) => u('1551882547-ff40c63fe5fa', w),
  plane: (w) => u('1436491865332-7a61a109cc05', w),
  dining: (w) => u('1414235077428-338989a2e8c0', w),
  cafe: (w) => u('1517248135467-4c7edcad34c4', w),
  street: (w) => u('1555396273-367ea4eb4db5', w),
  forest: (w) => u('1470071459604-3b5ec3a7fe05', w),
  lagoon: (w) => u('1519046904884-53103b34b206', w),
  paradise: (w) => u('1473116763249-2faaef81ccda', w),
  alpine: (w) => u('1483728642387-6c3bdd6c93e5', w),
  wander: (w) => u('1476514525535-07fb3b4ae5f1', w),
  trip: (w) => u('1488085061387-422e29b40080', w),
  roadtrip: (w) => u('1600405062005-745191db11fb', w),
  parisCity: (w) => u('1499856871958-5b9627545d1a', w),
};

export const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7C3AED"/><stop offset="1" stop-color="#2E1065"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/></svg>'
  );

export const DESTINATIONS = [
  { id: 'maldives', name: 'Maldives', country: 'Indian Ocean', blurb: 'Overwater villas and glassy lagoons.', days: '5-7 Days', tags: ['Beach', 'Romantic'], img: IMG.maldives },
  { id: 'paris', name: 'Paris', country: 'France', blurb: 'Cafés, art and the glow of the Eiffel Tower.', days: '4-6 Days', tags: ['City', 'Culture'], img: IMG.paris },
  { id: 'agra', name: 'Agra', country: 'India', blurb: 'The Taj Mahal at golden hour and Mughal heritage.', days: '2-3 Days', tags: ['Heritage', 'Culture'], img: IMG.taj },
  { id: 'santorini', name: 'Santorini', country: 'Greece', blurb: 'Whitewashed villages above a deep blue caldera.', days: '4-6 Days', tags: ['Romantic', 'Islands'], img: IMG.santorini },
  { id: 'kyoto', name: 'Kyoto', country: 'Japan', blurb: 'Temples, tea houses and lantern-lit lanes.', days: '5-8 Days', tags: ['Culture', 'Food'], img: IMG.kyoto },
  { id: 'bali', name: 'Bali', country: 'Indonesia', blurb: 'Rice terraces, surf breaks and tropical retreats.', days: '5-8 Days', tags: ['Beach', 'Nature'], img: IMG.bali },
  { id: 'rome', name: 'Rome', country: 'Italy', blurb: 'Ancient ruins, piazzas and unforgettable food.', days: '3-5 Days', tags: ['Heritage', 'Food'], img: IMG.rome },
  { id: 'queenstown', name: 'Lake District', country: 'Mountains & lakes', blurb: 'Calm lakes and forest trails for slow travel.', days: '3-5 Days', tags: ['Nature', 'Adventure'], img: IMG.lake },
  { id: 'swiss-alps', name: 'Swiss Alps', country: 'Switzerland', blurb: 'Alpine trails, glaciers and scenic rail rides.', days: '5-7 Days', tags: ['Adventure', 'Nature'], img: IMG.alps },
];

export const EXPERIENCES = [
  { label: 'Beaches & Islands', sub: 'Sun, sand and slow days', img: IMG.tropical, to: 'Beach', span: 'md:col-span-2 md:row-span-2' },
  { label: 'Mountain Escapes', sub: 'Peaks, trails and fresh air', img: IMG.snow, to: 'Adventure', span: '' },
  { label: 'Heritage & Culture', sub: 'Stories carved in stone', img: IMG.rome, to: 'Culture', span: '' },
  { label: 'Nature & Lakes', sub: 'Quiet shores, wide skies', img: IMG.lake, to: 'Nature', span: '' },
  { label: 'Luxury Stays', sub: 'Resorts worth the journey', img: IMG.resort, to: 'Luxury', span: 'md:col-span-2' },
];
