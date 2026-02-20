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
  { slug: "moveactive", title: "April Campaign", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/MoveActive-April-Campaign.webp", video: "https://matteocurcio.com/wp-content/uploads/MoveActive-April-Campaign-preview.mov" },
  { slug: "yamaha", title: "Make Waves", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Yamaha-Make-Waves.webp", video: "https://matteocurcio.com/wp-content/uploads/Yamaha-Make-Waves-preview.mov" },
  { slug: "victorian-queens", title: "Victorian Queens", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Garden-of-Voices-Victorian-Queens.webp", video: "https://matteocurcio.com/wp-content/uploads/Victorian-Queens-preview.mov" },
  { slug: "tradie", title: "Tradie", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Makita-Tradie.webp", video: "https://matteocurcio.com/wp-content/uploads/Makita-Tradie.mov" },
  { slug: "madebox", title: "Madebox", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/MYOB-Madebox.webp", video: "https://matteocurcio.com/wp-content/uploads/MYOB-Community-Madebox.mov" },
  { slug: "national-hero", title: "National Hero", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Football-Australia-National-Hero.webp", video: "https://matteocurcio.com/wp-content/uploads/Football-Australia-Play-Football-National-Hero.mov" },
  { slug: "be-on-it-ent", title: "Be On It", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/News-Corp-Be-On-It.webp", video: "https://matteocurcio.com/wp-content/uploads/News.com_.au-Be-On-It-2023-Entertainment-Thumbnail.mp4" },
  { slug: "spring-party", title: "Spring Party", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Politix-Spring-Party.webp", video: "https://matteocurcio.com/wp-content/uploads/Politix-Spring-Party.mp4" },
  { slug: "refreshed", title: "Refreshed", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Beard-and-Blade-Refreshed.webp", video: "https://matteocurcio.com/wp-content/uploads/Beard-and-Blade-PREVIEW.mov" },
  { slug: "kikkoman", title: "Makoto Selection", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Kikkoman-Makoto-Selection.webp", video: "https://matteocurcio.com/wp-content/uploads/Kikkoman-Soy-Sauce-1.mov" },
  { slug: "motorone", title: "Protektiv Hydro", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/MotorOne-Hydro.webp", video: "https://matteocurcio.com/wp-content/uploads/MotorOne-Hydro-Preview.mov" },
  { slug: "denton-pillows", title: "A Great Night Sleep", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Denton-Pillows-A-Good-Night-Sleep.webp", video: "https://matteocurcio.com/wp-content/uploads/Denton-Pillows-A-Good-Night-Sleep-preview.mov" },
  { slug: "cowra", title: "Get Chris to Cowra", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Cowra-Tourism-Get-Chris-to-Cowra.webp", video: "https://matteocurcio.com/wp-content/uploads/Cowra-Tourism-Corporation-Get-Chris-to-Cowra.mov" },
  { slug: "rumbalara", title: "Over the Rainbow", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Rumbalara-Over-the-Rainbow.webp", video: "https://matteocurcio.com/wp-content/uploads/Rumbalara-Over-the-Rainbow-Thumbnail.mov" },
  { slug: "irwin-fran", title: "Irwin & Fran", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Cinemastone-Irwin-and-Fran.webp", video: "https://matteocurcio.com/wp-content/uploads/Irwin-and-Fran.mov" },
  { slug: "dora-the-explorer", title: "Dora the Explorer", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Fisher-Price-Dora-the-Explorer.webp", video: "https://matteocurcio.com/wp-content/uploads/Fisher-Price-Dora-the-Explorer.mp4" },
  { slug: "a-gentle-giant", title: "A Gentle Giant", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Gigabyte-A-Gentle-Giant.webp", video: "https://matteocurcio.com/wp-content/uploads/A-Gentle-Giant.mp4" },
  { slug: "football-christmas", title: "Football Christmas", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Football-Australia-Football-Christmas.webp", video: "https://matteocurcio.com/wp-content/uploads/Football-Australia-Play-Football-Football-Christmas.mov" },
  { slug: "show-dont-tell", title: "Show Don't Tell", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Makita-Show-Dont-Tell.webp", video: "https://matteocurcio.com/wp-content/uploads/Makita-Show-Dont-Tell-preview.mov" },
  { slug: "ginfusion", title: "GinFusion", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Original-Spirit-Ginfusion.webp", video: "https://matteocurcio.com/wp-content/uploads/Original-Spirit-Ginfusion.mov" },
  { slug: "2xu", title: "Compression", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/2XU-Compression.webp", video: "https://matteocurcio.com/wp-content/uploads/MoveActive-April-Campaign-preview-1.mov" },
  { slug: "find-your-place", title: "Find Your Place", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Football-Australia-Find-Your-Place.webp", video: "https://matteocurcio.com/wp-content/uploads/43285-Football-Australia-Play-Football-Find-your-Place.mov" },
  { slug: "drive", title: "Drive", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Vudoo-Drive.webp", video: "https://matteocurcio.com/wp-content/uploads/Vudoo-Conversion.mov" },
  { slug: "jetstar-airport-services", title: "Airport Services", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Jetstar-Airport-Services.webp", video: "https://matteocurcio.com/wp-content/uploads/Jetstar-Airways-Recruitment-Video-Airport-Services.mov" },
  { slug: "ecco-safety", title: "Heavy Duty Beacon", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Ecco-Safety-Heavy-Duty-Beacon.webp", video: "https://matteocurcio.com/wp-content/uploads/Ecco-Safety-Heavy-Duty-Beacon.mov" },
  { slug: "doodle-bears", title: "Doodle Bears", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Just-Play-Doodle-Bears.webp", video: "https://matteocurcio.com/wp-content/uploads/Just-Play-Doodle-Bears.mp4" },
  { slug: "rasta-man-vibration", title: "Rasta Man Vibration", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Cinemastone-Rasta-Man-Vibration.webp", video: "https://matteocurcio.com/wp-content/uploads/Cinemastone-Rasta-Man-Vibration.mov" },
  { slug: "amp", title: "Quay Quarter", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/AMP-Quay-Quarter.webp", video: "https://matteocurcio.com/wp-content/uploads/AMP-Quay-Quarter-Sydney.mov" },
  { slug: "kakadu-complex", title: "Kakadu Complex", category: "COLOUR", image: "https://matteocurcio.com/wp-content/uploads/Natures-Goodness-Kakadu-Complex.webp", video: "https://matteocurcio.com/wp-content/uploads/Natures-Goodness-Kakadu-Complex.mov" }
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
  { slug: "presentology", title: "Presentation Design", image: "https://matteocurcio.com/wp-content/uploads/reel-presentation-design.webp" },
  { slug: "dataviz", title: "Data Visualization", image: "https://matteocurcio.com/wp-content/uploads/reel-data-visualization-1.webp" },
  { slug: "ar", title: "Augmented Reality", image: "https://matteocurcio.com/wp-content/uploads/reel-augmented-reality-1.webp" },
  { slug: "immersive", title: "Immersive Video", image: "https://matteocurcio.com/wp-content/uploads/reel-immersive-video-1.webp" },
  { slug: "mapping", title: "Projection Mapping", image: "https://matteocurcio.com/wp-content/uploads/reel-projection-mapping-1.webp" },
  { slug: "finishing", title: "Finishing", image: "https://matteocurcio.com/wp-content/uploads/reel-finishing-1.webp" },
  { slug: "beauty-retouch", title: "Beauty Retouch", image: "https://matteocurcio.com/wp-content/uploads/reel-beauty-retouch-1.webp" },
  { slug: "advertising", title: "Advertising", image: "https://matteocurcio.com/wp-content/uploads/reel-advertising-1.webp", video: "https://matteocurcio.com/wp-content/uploads/Advertising-Reel-THUMBNAIL.mov" },
  { slug: "sport", title: "Sport", image: "https://matteocurcio.com/wp-content/uploads/reel-sport-1.webp", video: "https://matteocurcio.com/wp-content/uploads/Sports-Reel-THUMBNAIL.mov" },
  { slug: "realestate", title: "Real Estate", image: "https://matteocurcio.com/wp-content/uploads/reel-real-estate-1.webp", video: "https://matteocurcio.com/wp-content/uploads/Matteo-Curcio-Colorist-and-Finishing-Artist-Real-Estate-Reel-THUMBNAIL.mov" },
  { slug: "fashion", title: "Fashion", image: "https://matteocurcio.com/wp-content/uploads/reel-fashion-1.webp", video: "https://matteocurcio.com/wp-content/uploads/Matteo-Curcio-Colorist-and-Finishing-Artist-Fashion-THUMBNAIL.mov" },
  { slug: "food", title: "Food", image: "https://matteocurcio.com/wp-content/uploads/reel-food-1.webp", video: "https://matteocurcio.com/wp-content/uploads/Matteo-Curcio-Colorist-and-Finishing-Artist-Food-Reel-THUMBNAIL.mov" },
  { slug: "video-games-advertising", title: "Video Games Advertising", image: "https://matteocurcio.com/wp-content/uploads/reel-video-games.webp" },
  { slug: "in-store", title: "In-store Advertising", image: "https://matteocurcio.com/wp-content/uploads/reel-in-store-advertising.webp" },
  { slug: "corporate", title: "Corporate Video", image: "https://matteocurcio.com/wp-content/uploads/reel-corporate-video.webp" },
  { slug: "online-editing", title: "Online Editing", image: "https://matteocurcio.com/wp-content/uploads/reel-online-editing-1.webp" },
  { slug: "sync", title: "Sync Music", image: "https://matteocurcio.com/wp-content/uploads/reel-sync-music-1.webp" },
  { slug: "royaltyfree", title: "Royalty Free Music", image: "https://matteocurcio.com/wp-content/uploads/reel-royalty-free-music-1.webp" },
  { slug: "music", title: "Original Music", image: "https://matteocurcio.com/wp-content/uploads/reel-original-music-1.webp" }
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
