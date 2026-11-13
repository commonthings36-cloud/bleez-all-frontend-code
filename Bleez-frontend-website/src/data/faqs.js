// Shared by the FAQ page, Help Center and the help assistant so answers never drift apart.
export const FAQ_GROUPS = [
  {
    group: 'Getting started',
    items: [
      { q: 'Do I need an account to browse?', a: 'No. You can explore destinations and the planner as a guest. A free account lets you save trips, build a wishlist, keep albums and use personalised features.', keywords: ['account', 'guest', 'sign up', 'register', 'login'], link: { to: '/register', label: 'Create an account' } },
      { q: 'How does the AI trip planner work?', a: 'Tell the planner where you want to go, your dates, budget and interests. It builds a day-by-day itinerary you can review, regenerate and export as a PDF.', keywords: ['plan', 'planner', 'itinerary', 'ai', 'trip'], link: { to: '/plan', label: 'Plan a trip' } },
      { q: 'Can I save places for later?', a: 'Yes. Tap the heart on any destination to add it to your wishlist.', keywords: ['save', 'wishlist', 'favourite', 'favorite'], link: { to: '/wishlist', label: 'Open wishlist' } },
    ],
  },
  {
    group: 'Booking',
    items: [
      { q: 'How do I search for flights and hotels?', a: 'Open Book Travel, enter where and when you are travelling, and compare the available options side by side with a price breakdown.', keywords: ['book', 'flight', 'hotel', 'search', 'compare', 'price'], link: { to: '/booking', label: 'Search & compare' } },
      { q: 'Where do I complete a booking?', a: 'Bleez helps you search and compare. When you choose an option you continue with the airline, hotel or partner to complete payment, so card details are entered on their secure page, never on Bleez.', keywords: ['pay', 'payment', 'card', 'checkout', 'complete'] },
      { q: 'Where can I see my trips?', a: 'Signed-in travellers can find saved itineraries and trips in My Trips.', keywords: ['my trips', 'itineraries', 'history'], link: { to: '/my-trips', label: 'My trips' } },
    ],
  },
  {
    group: 'Plans & billing',
    items: [
      { q: 'What does a paid plan include?', a: 'Plans differ by AI itinerary allowance and extras such as PDF export and offline downloads. The current plans and prices are always shown live on the Plans page.', keywords: ['plan', 'plans', 'pricing', 'price', 'subscription', 'premium', 'upgrade'], link: { to: '/my-subscription', label: 'View plans' } },
      { q: 'How do I manage or cancel a subscription?', a: 'Subscriptions bought in the iOS or Android app are managed in the App Store or Google Play subscription settings of that account.', keywords: ['cancel', 'refund', 'manage', 'billing'] },
    ],
  },
  {
    group: 'On the road',
    items: [
      { q: 'What is the Emergency page for?', a: 'It shows emergency numbers for where you are so you can reach help quickly. Always confirm with local guidance, as numbers can change.', keywords: ['emergency', 'sos', 'police', 'help', 'ambulance'], link: { to: '/emergency', label: 'Emergency contacts' } },
      { q: 'Do I get travel alerts?', a: 'Yes. Signed-in travellers can see alerts for their trips and current area, and choose which alert types they want.', keywords: ['alert', 'alerts', 'weather', 'safety', 'notification'], link: { to: '/alerts', label: 'Travel alerts' } },
    ],
  },
];

export const ALL_FAQS = FAQ_GROUPS.flatMap((g) => g.items);

// Returns the FAQ whose keywords best match free text, or null when nothing matches.
export function matchFaq(text) {
  const t = (text || '').toLowerCase();
  let best = null;
  let bestScore = 0;
  ALL_FAQS.forEach((f) => {
    const score = f.keywords.reduce((s, k) => s + (t.includes(k) ? 1 : 0), 0);
    if (score > bestScore) { best = f; bestScore = score; }
  });
  return best;
}
