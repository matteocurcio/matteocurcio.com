export const SITE_CONFIG = {
  ownerName: "Matteo Curcio",
  primaryDomain: "matteocurcio.com",
  contactEmail: "hello@matteocurcio.com",
  social: {
    x: "@matteocurcio",
    linkedin: "https://www.linkedin.com/in/matteocurcio/",
    github: "https://github.com/matteocurcio",
    instagram: "https://www.instagram.com/matteo.color",
    pinterest: "https://www.pinterest.com/matteocurcio/",
    youtube: "https://www.youtube.com/@matteocurcio"
  }
} as const;

export const CONTACT_MAILTO = `mailto:${SITE_CONFIG.contactEmail}`;
