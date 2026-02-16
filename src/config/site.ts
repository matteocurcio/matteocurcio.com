export const SITE_CONFIG = {
  ownerName: "Matteo Curcio",
  primaryDomain: "matteocurcio.com",
  contactEmail: "hello@matteocurcio.com",
  social: {
    x: "@matteocurcio"
  }
} as const;

export const CONTACT_MAILTO = `mailto:${SITE_CONFIG.contactEmail}`;
