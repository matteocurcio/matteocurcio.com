import { SITE_CONFIG } from "../config/site";

const siteUrl = `https://${SITE_CONFIG.primaryDomain}`;

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
