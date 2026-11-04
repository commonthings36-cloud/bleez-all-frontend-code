// Single place for public-site identity. The support address is read from the environment so a
// placeholder is never shown to visitors: when it is unset, email-based contact is hidden.
export const SITE = {
  name: 'Bleez',
  tagline: 'Your AI travel companion',
  supportEmail: (process.env.REACT_APP_SUPPORT_EMAIL || '').trim(),
};

export const mailtoHref = (subject = '', body = '') =>
  SITE.supportEmail
    ? `mailto:${SITE.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : null;
