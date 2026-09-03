import { SITE_CONFIG } from "../config/site";

const siteUrl = `https://${SITE_CONFIG.primaryDomain}`;


/**
 * The Person node. It lives here rather than on the homepage because service,
 * course and video nodes across the whole site reference it by @id, and Google
 * resolves @id references per page — a provider pointing at a node that is not
 * on the same page reads as no provider at all.
 */
export const PERSON_SCHEMA = {
  "@type": "Person",
  "@id": `${siteUrl}/#person`,
  name: SITE_CONFIG.ownerName,
  url: `${siteUrl}/`,
  image: `${siteUrl}/images/og/matteo-curcio-og.png`,
  jobTitle: "Colourist, Online Editor & Finishing Artist",
  description:
    "Melbourne-based freelance colourist, online editor and finishing artist working on commercial, branded and agency post-production across Australia and remotely.",
  worksFor: { "@id": `${siteUrl}/#business` },
  homeLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Fitzroy",
      addressRegion: "VIC",
      addressCountry: "AU"
    }
  },
  knowsLanguage: ["en", "it"],
  memberOf: [
    { "@type": "Organization", name: "Australian Screen Editors (ASE)" },
    { "@type": "Organization", name: "International VR Professionals Association (IVRPA)" },
    { "@type": "Organization", name: "Interaction Design Foundation (IxDF)", url: "https://ixdf.org/" }
  ],
  knowsAbout: [
    "Colour Grading",
    "Color Grading",
    "Colourist",
    "Colorist",
    "Online Editing",
    "Conform",
    "Post-production",
    "Finishing",
    "DaVinci Resolve",
    "Adobe Creative Cloud"
  ],
  sameAs: [
    SITE_CONFIG.social.linkedin,
    SITE_CONFIG.social.github,
    SITE_CONFIG.social.instagram,
    SITE_CONFIG.social.youtube,
    SITE_CONFIG.social.substack,
    "https://vimeo.com/matteocurcio",
    "https://www.behance.net/matteocurcio",
    "https://www.imdb.com/name/nm6164829/",
    "https://www.filmlight.ltd.uk/store/freelance/listing/matteo-curcio/"
  ]
};

export interface ServiceSchemaInput {
  /** Path with leading and trailing slash, e.g. "/editing/" */
  path: string;
  name: string;
  serviceType: string;
  /** Who the page is written for; feeds schema.org Audience. */
  audience: string;
  /** Extra names the same service goes by, including US spellings. */
  alternateName?: string[];
}

/**
 * Every service page emits the same shape, pointing back at the Person and
 * ProfessionalService nodes the layout already publishes. Keeping it in one
 * place means the areaServed list stays consistent — Melbourne first, then
 * Victoria and Australia, then remote — which is what the pages actually offer.
 */
export function serviceSchema({
  path,
  name,
  serviceType,
  audience,
  alternateName
}: ServiceSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteUrl}${path}#service`,
    name,
    ...(alternateName ? { alternateName } : {}),
    serviceType,
    url: `${siteUrl}${path}`,
    provider: { "@id": `${siteUrl}/#person` },
    providerMobility: "dynamic",
    isRelatedTo: { "@id": `${siteUrl}/#business` },
    areaServed: [
      { "@type": "City", name: "Melbourne" },
      { "@type": "State", name: "Victoria" },
      { "@type": "Country", name: "Australia" },
      "Remote"
    ],
    audience: {
      "@type": "Audience",
      audienceType: audience
    }
  };
}

export interface BreadcrumbCrumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: BreadcrumbCrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path}`
    }))
  };
}
