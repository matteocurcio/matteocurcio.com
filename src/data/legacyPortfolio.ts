export type WorkCategory = "COLOUR" | "MOTION" | "IMMERSIVE" | "VIDEO" | "PHOTO" | "CODE";

export interface LegacyWorkItem {
  slug: string;
  title: string;
  category: WorkCategory;
  image?: string;
  video?: string;
  href?: string;
  meta?: string;
}

export const WORK_CATEGORIES: WorkCategory[] = [
  "COLOUR",
  "MOTION",
  "IMMERSIVE",
  "VIDEO",
  "PHOTO",
  "CODE"
];

export const LEGACY_POST_WORKS: LegacyWorkItem[] = [
  { slug: "six-the-musical-2024-trailer", title: "Six the Musical Australia | 2024 Trailer", category: "COLOUR", image: "/assets/projects/six-the-musical-australia-2024-trailer/thumbnail_six_the_musical.webp" },
  { slug: "sunset-boulevard-epk-trailer", title: "Sunset Boulevard EPK Trailer", category: "COLOUR", image: "/assets/projects/sunset-boulevard-australia-epk-trailer/thumbnail_sunset_boulevard.webp" },
  { slug: "moveactive", title: "April Campaign", category: "COLOUR", image: "/assets/projects/moveactive-april-campaign/thumbnail_moveactive.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "yamaha", title: "Make Waves", category: "COLOUR", image: "/assets/projects/yamaha-make-waves/thumbnail_yamaha.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "victorian-queens", title: "Victorian Queens", category: "COLOUR", image: "/assets/projects/garden-of-voices-victorian-queens/thumbnail_victorian_queens.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "tradie", title: "Tradie", category: "COLOUR", image: "/assets/projects/makita-tradie/thumbnail_tradie.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "madebox", title: "Madebox", category: "COLOUR", image: "/assets/services/common/thumbnail_placeholder.jpg", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "national-hero", title: "National Hero", category: "COLOUR", image: "/assets/projects/football-australia-national-hero/thumbnail_national_hero.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "be-on-it-ent", title: "Be On It", category: "COLOUR", image: "/assets/projects/news-corp-be-on-it/thumbnail_be_on_it_ent.webp", video: "/assets/projects/news-corp-be-on-it/thumbnail_be_on_it_ent.mp4" },
  { slug: "spring-party", title: "Spring Party", category: "COLOUR", image: "/assets/projects/politix-spring-party/thumbnail_spring_party.webp", video: "/assets/projects/politix-spring-party/thumbnail_spring_party.mp4" },
  { slug: "refreshed", title: "Refreshed", category: "COLOUR", image: "/assets/projects/beard-and-blade-refreshed/thumbnail_refreshed.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "kikkoman", title: "Makoto Selection", category: "COLOUR", image: "/assets/projects/kikkoman-makoto-selection/thumbnail_kikkoman.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "motorone", title: "Protektiv Hydro", category: "COLOUR", image: "/assets/services/common/thumbnail_placeholder.jpg", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "denton-pillows", title: "A Great Night Sleep", category: "COLOUR", image: "/assets/projects/denton-pillows-a-great-night-sleep/thumbnail_denton_pillows.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "cowra", title: "Get Chris to Cowra", category: "COLOUR", image: "/assets/projects/cowra-tourism-get-chris-to-cowra/thumbnail_cowra.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "rumbalara", title: "Over the Rainbow", category: "COLOUR", image: "/assets/services/common/thumbnail_placeholder.jpg", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "irwin-fran", title: "Irwin & Fran", category: "COLOUR", image: "/assets/projects/cinemastone-irwin-fran/thumbnail_irwin_fran.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
    { slug: "dora-the-explorer", title: "Dora the Explorer", category: "COLOUR", image: "/assets/projects/fisher-price-dora-the-explorer/thumbnail_dora_the_explorer.webp", video: "/assets/projects/fisher-price-dora-the-explorer/thumbnail_dora_the_explorer.mp4" },
  { slug: "a-gentle-giant", title: "A Gentle Giant", category: "COLOUR", image: "/assets/projects/gigabyte-a-gentle-giant/thumbnail_a_gentle_giant.webp", video: "/assets/projects/gigabyte-a-gentle-giant/thumbnail_a_gentle_giant.mp4" },
  { slug: "football-christmas", title: "Football Christmas", category: "COLOUR", image: "/assets/projects/football-australia-football-christmas/thumbnail_football_christmas.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "show-dont-tell", title: "Show Don't Tell", category: "COLOUR", image: "/assets/projects/makita-show-don-t-tell/thumbnail_show_dont_tell.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "ginfusion", title: "GinFusion", category: "COLOUR", image: "/assets/services/common/thumbnail_placeholder.jpg", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "2xu", title: "Compression", category: "COLOUR", image: "/assets/projects/2xu-compression/thumbnail_2xu.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "find-your-place", title: "Find Your Place", category: "COLOUR", image: "/assets/projects/football-australia-find-your-place/thumbnail_find_your_place.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "drive", title: "Drive", category: "COLOUR", image: "/assets/projects/vudoo-drive/thumbnail_drive.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "jetstar-airport-services", title: "Airport Services", category: "COLOUR", image: "/assets/projects/jetstar-airport-services/thumbnail_jetstar_airport_services.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "ecco-safety", title: "Heavy Duty Beacon", category: "COLOUR", image: "/assets/projects/ecco-safety-heavy-duty-beacon/thumbnail_ecco_safety.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "doodle-bears", title: "Doodle Bears", category: "COLOUR", image: "/assets/projects/just-play-doodle-bears/thumbnail_doodle_bears.webp", video: "/assets/projects/just-play-doodle-bears/thumbnail_doodle_bears.mp4" },
  { slug: "rasta-man-vibration", title: "Rasta Man Vibration", category: "COLOUR", image: "/assets/projects/cinemastone-rasta-man-vibration/thumbnail_rasta_man_vibration.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "amp", title: "Quay Quarter", category: "COLOUR", image: "/assets/projects/amp-quay-quarter/thumbnail_amp.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "kakadu-complex", title: "Kakadu Complex", category: "COLOUR", image: "/assets/projects/nature-s-goodness-kakadu-complex/thumbnail_kakadu_complex.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" }
];

export const LEGACY_MOTION_WORKS: LegacyWorkItem[] = [
  { slug: "expo-2020-story", title: "EXPO 2020 Story", category: "MOTION" },
  { slug: "expo-2020-iptm18", title: "International Participants Meeting 2018", category: "MOTION" },
  { slug: "expo-2020-iptm19", title: "International Participants Meeting 2019", category: "MOTION" },
  { slug: "expo-2020-global-media-briefing", title: "Global Media Briefing", category: "MOTION" },
  { slug: "dubai-business-events", title: "Business Events Presentation", category: "MOTION" },
  { slug: "dubai-master-business-presentation", title: "Master Business Presentation", category: "MOTION" },
  { slug: "uae-year-of-reading", title: "UAE Year of Reading", category: "PHOTO" },
  { slug: "gitex-vr", title: "Gitex VR", category: "IMMERSIVE" },
  { slug: "renault-zoe", title: "Renault Zoe Reveal", category: "MOTION" },
  { slug: "ikea", title: "IKEA Temporary Store", category: "PHOTO" },
  { slug: "dubai-flea-market", title: "Dubai Flea Market", category: "PHOTO" },
  { slug: "welcome-to-sharjah", title: "Welcome to Sharjah", category: "IMMERSIVE" },
  { slug: "mrajeeb-al-fhood", title: "Mrajeeb Al Fhood", category: "IMMERSIVE" },
  { slug: "merrie-melodies", title: "Merrie Melodies", category: "PHOTO" },
  { slug: "dms17-cadillac", title: "Cadillac", category: "MOTION" },
  { slug: "dms17-gmc", title: 'Dubai Motor Show "GMC"', category: "MOTION" },
  { slug: "dubai-majlis-2018", title: "Dubai Majlis 2018", category: "MOTION" }
];

export const LEGACY_VIDEO_WORKS: LegacyWorkItem[] = [
  { slug: "netica-your-it-designers", title: "Netica — Your IT Designers", category: "VIDEO" },
  { slug: "sophos", title: "Sophos", category: "VIDEO" },
  { slug: "oy-live", title: "OY live", category: "VIDEO" },
  { slug: "muenchen-eisbach-surfer", title: "Eisbach Surfers", category: "VIDEO" }
];

export const LEGACY_PHOTO_WORKS: LegacyWorkItem[] = [
  { slug: "fashion-photography", title: "Ana Juarez Workshop", category: "PHOTO" },
  { slug: "audi-untaggable", title: "Audi #Untaggable", category: "PHOTO" },
  { slug: "cornello", title: "Cornello dei Tasso", category: "PHOTO" },
  { slug: "patterns", title: "Salone del Mobile \"Patterns\"", category: "PHOTO" },
  { slug: "la-grande-bellezza", title: "La Grande Bellezza", category: "PHOTO" },
  { slug: "upcycling-zu-kostbar-fuer-die-tonne", title: "Upcycling — Zu kostbar fuer die Tonne", category: "PHOTO" },
  { slug: "deborah-raccagni", title: "Deborah Raccagni", category: "PHOTO" }
];

export const LEGACY_CODE_WORKS: LegacyWorkItem[] = [
  {
    slug: "grid-layout-system-generator",
    title: "Grid",
    category: "CODE",
    image: "/images/coding/grid.png",
    href: "/blog/grid-layout-system-generator/",
    meta: "Layout systems tool"
  },
  {
    slug: "portfolio-tracker-private-by-design",
    title: "Portfolio",
    category: "CODE",
    image: "/images/coding/portfolio.png",
    href: "/blog/portfolio-tracker-private-by-design/",
    meta: "Private finance interface"
  },
  {
    slug: "offline-first-travel-expense-tracker",
    title: "Travel",
    category: "CODE",
    image: "/images/coding/travel.png",
    href: "/blog/offline-first-travel-expense-tracker/",
    meta: "Offline-first travel tool"
  },
  {
    slug: "living-costs-tracker",
    title: "Living Costs",
    category: "CODE",
    image: "/images/coding/expenses.png",
    href: "/blog/living-costs-tracker/",
    meta: "Life cost tracker"
  },
  {
    slug: "browser-teleprompter-production-tool",
    title: "Teleprompter",
    category: "CODE",
    image: "/images/coding/teleprompter.png",
    href: "/blog/browser-teleprompter-production-tool/",
    meta: "Production utility"
  },
  {
    slug: "scopes-image-analysis-tool",
    title: "Scopes",
    category: "CODE",
    image: "/images/coding/scopes.png",
    href: "/blog/scopes-image-analysis-tool/",
    meta: "Image analysis tool"
  },
  {
    slug: "proxmox-observability-kiosk",
    title: "Network Kiosk",
    category: "CODE",
    image: "/images/blog/proxmox-observability-kiosk/proxmox-observability-kiosk-rack.png",
    href: "/blog/proxmox-observability-kiosk/",
    meta: "Homelab observability"
  },
  {
    slug: "building-an-ultrawide-home-kiosk",
    title: "Home Kiosk",
    category: "CODE",
    image: "/images/blog/wide-home-kiosk/ultrawide-kiosk-cover.png",
    href: "/blog/building-an-ultrawide-home-kiosk/",
    meta: "Domestic information display"
  }
];

export const LEGACY_WORKS: LegacyWorkItem[] = [
  ...LEGACY_POST_WORKS,
  ...LEGACY_MOTION_WORKS,
  ...LEGACY_VIDEO_WORKS,
  ...LEGACY_PHOTO_WORKS,
  ...LEGACY_CODE_WORKS
];

export const NON_COMPARE_WORK_SLUGS = new Set<string>([
  ...LEGACY_MOTION_WORKS.map((item) => item.slug),
  ...LEGACY_VIDEO_WORKS.map((item) => item.slug),
  ...LEGACY_PHOTO_WORKS.map((item) => item.slug),
  ...LEGACY_CODE_WORKS.map((item) => item.slug)
]);

export interface LegacyReelTile {
  slug: string;
  title: string;
  image: string;
  video?: string;
}

export const LEGACY_REELS: LegacyReelTile[] = [
  { slug: "presentology", title: "Presentation Design", image: "/assets/reels/reels-presentology/thumbnail_presentology.webp" },
  { slug: "dataviz", title: "Data Visualization", image: "/assets/reels/reels-dataviz/thumbnail_dataviz.webp" },
  { slug: "ar", title: "Augmented Reality", image: "/assets/reels/content-production-matteo-curcio-augmented-reality/thumbnail_ar.webp" },
  { slug: "immersive", title: "Immersive Video", image: "/assets/reels/reels-immersive/thumbnail_immersive.webp" },
  { slug: "mapping", title: "Projection Mapping", image: "/assets/reels/reels-mapping/thumbnail_mapping.webp" },
  { slug: "finishing", title: "Finishing", image: "/assets/reels/reels-finishing/thumbnail_finishing.webp" },
  { slug: "beauty-retouch", title: "Beauty Retouch", image: "/assets/reels/reels-beauty-retouch/thumbnail_beauty_retouch.webp" },
  { slug: "advertising", title: "Advertising", image: "/assets/reels/color-grading-advertising/thumbnail_advertising.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "sport", title: "Sport", image: "/assets/reels/reels-sport/thumbnail_sport.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "realestate", title: "Real Estate", image: "/assets/reels/reels-realestate/thumbnail_realestate.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "fashion", title: "Fashion", image: "/assets/reels/reels-fashion/thumbnail_fashion.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "food", title: "Food", image: "/assets/reels/reels-food/thumbnail_food.webp", video: "/assets/services/common/thumbnail_placeholder.jpg" },
  { slug: "video-games-advertising", title: "Video Games Advertising", image: "/assets/reels/online-editing-video-games-advertising/thumbnail_video_games_advertising.webp" },
  { slug: "in-store", title: "In-store Advertising", image: "/assets/reels/reels-in-store/thumbnail_in_store.webp" },
  { slug: "corporate", title: "Corporate Video", image: "/assets/reels/reels-corporate/thumbnail_corporate.webp" },
  { slug: "online-editing", title: "Online Editing", image: "/assets/reels/reels-online-editing/thumbnail_online_editing.webp" },
  { slug: "sync", title: "Sync Music", image: "/assets/reels/reels-sync/thumbnail_sync.webp" },
  { slug: "royaltyfree", title: "Royalty Free Music", image: "/assets/reels/reels-royaltyfree/thumbnail_royaltyfree.webp" },
  { slug: "music", title: "Original Music", image: "/assets/reels/reels-music/thumbnail_music.webp" }
];

export interface LegacyPortfolioItem {
  slug: string;
  title: string;
  image?: string;
  video?: string;
}

const mergedLegacy = new Map<string, LegacyPortfolioItem>();
for (const item of [...LEGACY_REELS, ...LEGACY_WORKS]) {
  const existing = mergedLegacy.get(item.slug);
  if (!existing) {
    mergedLegacy.set(item.slug, { ...item });
    continue;
  }

  mergedLegacy.set(item.slug, {
    slug: item.slug,
    title: existing.title || item.title,
    image: existing.image || item.image,
    video: existing.video || item.video
  });
}

export const LEGACY_BY_SLUG: Record<string, LegacyPortfolioItem> = Object.fromEntries(mergedLegacy.entries());

export function getLegacyItem(slug: string): LegacyPortfolioItem | undefined {
  return LEGACY_BY_SLUG[slug];
}
