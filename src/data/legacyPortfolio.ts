export type WorkCategory = "COLOUR" | "MOTION" | "IMMERSIVE" | "VIDEO" | "PHOTO";

export interface LegacyWorkItem {
  slug: string;
  title: string;
  category: WorkCategory;
  image?: string;
  video?: string;
}

export const WORK_CATEGORIES: WorkCategory[] = [
  "COLOUR",
  "MOTION",
  "IMMERSIVE",
  "VIDEO",
  "PHOTO"
];

export const LEGACY_POST_WORKS: LegacyWorkItem[] = [
  { slug: "moveactive", title: "April Campaign", category: "COLOUR", image: "/migrated/wp-content/uploads/MoveActive-April-Campaign.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "yamaha", title: "Make Waves", category: "COLOUR", image: "/migrated/wp-content/uploads/Yamaha-Make-Waves.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "victorian-queens", title: "Victorian Queens", category: "COLOUR", image: "/migrated/wp-content/uploads/Garden-of-Voices-Victorian-Queens.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "tradie", title: "Tradie", category: "COLOUR", image: "/migrated/wp-content/uploads/Makita-Tradie.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "madebox", title: "Madebox", category: "COLOUR", image: "/migrated/wp-content/uploads/borouge_day2_1000.jpg", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "national-hero", title: "National Hero", category: "COLOUR", image: "/migrated/wp-content/uploads/Football-Australia-National-Hero.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "be-on-it-ent", title: "Be On It", category: "COLOUR", image: "/migrated/wp-content/uploads/News-Corp-Be-On-It.webp", video: "/migrated/wp-content/uploads/News.com_.au-Be-On-It-2023-Entertainment-Thumbnail.mp4" },
  { slug: "spring-party", title: "Spring Party", category: "COLOUR", image: "/migrated/wp-content/uploads/Politix-Spring-Party.webp", video: "/migrated/wp-content/uploads/Politix-Spring-Party.mp4" },
  { slug: "refreshed", title: "Refreshed", category: "COLOUR", image: "/migrated/wp-content/uploads/Beard-and-Blade-Refreshed.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "kikkoman", title: "Makoto Selection", category: "COLOUR", image: "/migrated/wp-content/uploads/Kikkoman-Makoto-Selection.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "motorone", title: "Protektiv Hydro", category: "COLOUR", image: "/migrated/wp-content/uploads/borouge_day2_1000.jpg", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "denton-pillows", title: "A Great Night Sleep", category: "COLOUR", image: "/migrated/wp-content/uploads/Denton-Pillows-A-Good-Night-Sleep.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "cowra", title: "Get Chris to Cowra", category: "COLOUR", image: "/migrated/wp-content/uploads/Cowra-Tourism-Get-Chris-to-Cowra.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "rumbalara", title: "Over the Rainbow", category: "COLOUR", image: "/migrated/wp-content/uploads/borouge_day2_1000.jpg", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "irwin-fran", title: "Irwin & Fran", category: "COLOUR", image: "/migrated/wp-content/uploads/Cinemastone-Irwin-and-Fran.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "dora-the-explorer", title: "Dora the Explorer", category: "COLOUR", image: "/migrated/wp-content/uploads/Fisher-Price-Dora-the-Explorer.webp", video: "/migrated/wp-content/uploads/Fisher-Price-Dora-the-Explorer.mp4" },
  { slug: "a-gentle-giant", title: "A Gentle Giant", category: "COLOUR", image: "/migrated/wp-content/uploads/Gigabyte-A-Gentle-Giant.webp", video: "/migrated/wp-content/uploads/A-Gentle-Giant.mp4" },
  { slug: "football-christmas", title: "Football Christmas", category: "COLOUR", image: "/migrated/wp-content/uploads/Football-Australia-Football-Christmas.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "show-dont-tell", title: "Show Don't Tell", category: "COLOUR", image: "/migrated/wp-content/uploads/Makita-Show-Dont-Tell.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "ginfusion", title: "GinFusion", category: "COLOUR", image: "/migrated/wp-content/uploads/borouge_day2_1000.jpg", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "2xu", title: "Compression", category: "COLOUR", image: "/migrated/wp-content/uploads/2XU-Compression.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "find-your-place", title: "Find Your Place", category: "COLOUR", image: "/migrated/wp-content/uploads/Football-Australia-Find-Your-Place.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "drive", title: "Drive", category: "COLOUR", image: "/migrated/wp-content/uploads/Vudoo-Drive.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "jetstar-airport-services", title: "Airport Services", category: "COLOUR", image: "/migrated/wp-content/uploads/Jetstar-Airport-Services.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "ecco-safety", title: "Heavy Duty Beacon", category: "COLOUR", image: "/migrated/wp-content/uploads/Ecco-Safety-Heavy-Duty-Beacon.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "doodle-bears", title: "Doodle Bears", category: "COLOUR", image: "/migrated/wp-content/uploads/Just-Play-Doodle-Bears.webp", video: "/migrated/wp-content/uploads/Just-Play-Doodle-Bears.mp4" },
  { slug: "rasta-man-vibration", title: "Rasta Man Vibration", category: "COLOUR", image: "/migrated/wp-content/uploads/Cinemastone-Rasta-Man-Vibration.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "amp", title: "Quay Quarter", category: "COLOUR", image: "/migrated/wp-content/uploads/AMP-Quay-Quarter.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "kakadu-complex", title: "Kakadu Complex", category: "COLOUR", image: "/migrated/wp-content/uploads/Natures-Goodness-Kakadu-Complex.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" }
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
  { slug: "dms17-cadillac", title: "Dubai Motor Show (Cadillac)", category: "MOTION" },
  { slug: "dms17-gmc", title: "Dubai Motor Show (GMC)", category: "MOTION" },
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
  { slug: "patterns", title: "Patterns", category: "PHOTO" },
  { slug: "la-grande-bellezza", title: "La Grande Bellezza", category: "PHOTO" },
  { slug: "upcycling-zu-kostbar-fuer-die-tonne", title: "Upcycling — Zu kostbar fuer die Tonne", category: "PHOTO" },
  { slug: "deborah-raccagni", title: "Deborah Raccagni", category: "PHOTO" }
];

export const LEGACY_WORKS: LegacyWorkItem[] = [
  ...LEGACY_POST_WORKS,
  ...LEGACY_MOTION_WORKS,
  ...LEGACY_VIDEO_WORKS,
  ...LEGACY_PHOTO_WORKS
];

export const NON_COMPARE_WORK_SLUGS = new Set<string>([
  ...LEGACY_MOTION_WORKS.map((item) => item.slug),
  ...LEGACY_VIDEO_WORKS.map((item) => item.slug),
  ...LEGACY_PHOTO_WORKS.map((item) => item.slug)
]);

export interface LegacyReelTile {
  slug: string;
  title: string;
  image: string;
  video?: string;
}

export const LEGACY_REELS: LegacyReelTile[] = [
  { slug: "presentology", title: "Presentation Design", image: "/migrated/wp-content/uploads/reel-presentation-design.webp" },
  { slug: "dataviz", title: "Data Visualization", image: "/migrated/wp-content/uploads/reel-data-visualization-1.webp" },
  { slug: "ar", title: "Augmented Reality", image: "/migrated/wp-content/uploads/reel-augmented-reality-1.webp" },
  { slug: "immersive", title: "Immersive Video", image: "/migrated/wp-content/uploads/reel-immersive-video-1.webp" },
  { slug: "mapping", title: "Projection Mapping", image: "/migrated/wp-content/uploads/reel-projection-mapping-1.webp" },
  { slug: "finishing", title: "Finishing", image: "/migrated/wp-content/uploads/reel-finishing-1.webp" },
  { slug: "beauty-retouch", title: "Beauty Retouch", image: "/migrated/wp-content/uploads/reel-beauty-retouch-1.webp" },
  { slug: "advertising", title: "Advertising", image: "/migrated/wp-content/uploads/reel-advertising-1.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "sport", title: "Sport", image: "/migrated/wp-content/uploads/reel-sport-1.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "realestate", title: "Real Estate", image: "/migrated/wp-content/uploads/reel-real-estate-1.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "fashion", title: "Fashion", image: "/migrated/wp-content/uploads/reel-fashion-1.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "food", title: "Food", image: "/migrated/wp-content/uploads/reel-food-1.webp", video: "/migrated/wp-content/uploads/borouge_day2_1000.jpg" },
  { slug: "video-games-advertising", title: "Video Games Advertising", image: "/migrated/wp-content/uploads/reel-video-games.webp" },
  { slug: "in-store", title: "In-store Advertising", image: "/migrated/wp-content/uploads/reel-in-store-advertising.webp" },
  { slug: "corporate", title: "Corporate Video", image: "/migrated/wp-content/uploads/reel-corporate-video.webp" },
  { slug: "online-editing", title: "Online Editing", image: "/migrated/wp-content/uploads/reel-online-editing-1.webp" },
  { slug: "sync", title: "Sync Music", image: "/migrated/wp-content/uploads/reel-sync-music-1.webp" },
  { slug: "royaltyfree", title: "Royalty Free Music", image: "/migrated/wp-content/uploads/reel-royalty-free-music-1.webp" },
  { slug: "music", title: "Original Music", image: "/migrated/wp-content/uploads/reel-original-music-1.webp" }
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
