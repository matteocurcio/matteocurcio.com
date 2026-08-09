import { getCollection } from "astro:content";
import { LEGACY_WORKS, type WorkCategory } from "../data/legacyPortfolio";
import { NON_COMPARE_THUMBNAILS } from "../data/nonCompareProjectOverrides";
import wpProjectContent from "../data/wpProjectContent.json";

type WpContentMap = Record<string, { images?: string[] }>;
const wpContent = wpProjectContent as WpContentMap;

export type WorkCategoryKey = "colour" | "motion" | "immersive" | "video" | "photo";

export const CATEGORY_KEY_BY_LABEL: Record<WorkCategory, WorkCategoryKey> = {
  "COLOUR": "colour",
  "MOTION": "motion",
  "IMMERSIVE": "immersive",
  "VIDEO": "video",
  "PHOTO": "photo"
};

const GENERIC_THUMBNAIL = "/assets/services/common/thumbnail_placeholder.jpg";
const LEGACY_GENERIC_THUMBNAIL = "/migrated/wp-content/uploads/borouge_day2_1000.jpg";

const WORK_THUMB_OVERRIDES: Record<string, string> = {
  "expo-2020-iptm18": "/assets/projects/expo-2020-dubai-international-participants-meeting-2018/thumbnail_expo_2020_iptm18.jpg",
  "expo-2020-iptm19": "/assets/projects/expo-2020-dubai-international-participants-meeting-2019/thumbnail_expo_2020_iptm19.jpeg",
  "expo-2020-global-media-briefing": "/assets/projects/expo-2020-dubai-global-media-briefing/thumbnail_expo_2020_global_media_briefing.jpeg",
  "dubai-business-events": "/assets/projects/dubai-tourism-business-events-presentation/thumbnail_dubai_business_events.jpg",
  "dubai-master-business-presentation": "/assets/projects/dubai-tourism-master-business-presentation/thumbnail_dubai_master_business_presentation.jpg",
  "gitex-vr": "/assets/projects/gitex-dubai-gitex-vr/thumbnail_gitex_vr.webp",
  "renault-zoe": "/assets/projects/renault-mena-renault-zoe-reveal/thumbnail_renault_zoe.webp",
  "welcome-to-sharjah": "/assets/projects/sharjah-book-authority-welcome-to-sharjah/thumbnail_welcome_to_sharjah.webp",
  "mrajeeb-al-fhood": "/assets/projects/kalimat-foundation-mrajeeb-al-fhood/thumbnail_mrajeeb_al_fhood.jpg",
  "dms17-cadillac": "/assets/projects/cadillac-dubai-motor-show/thumbnail_dms17_cadillac.webp",
  "dms17-gmc": "/assets/projects/dubai-motor-show-gmc/thumbnail_dubai_motor_show_gmc.webp",
  "patterns": "/assets/projects/exhibition-patterns/thumbnail_patterns.webp",
  "madebox": "/assets/projects/myob-madebox/thumbnail_madebox.jpg",
  "motorone": "/assets/projects/motorone-group-protektiv-hydro/flat_25_motorone.jpg",
  "rumbalara": "/assets/projects/rumbalara-over-the-rainbow/thumbnail_rumbalara.jpg",
  "ginfusion": "/assets/projects/original-spirit-ginfusion/thumbnail_ginfusion.jpg"
};

const WORK_VIDEO_OVERRIDES: Record<string, string> = {
  "moveactive": "/assets/projects/moveactive-april-campaign/thumbnail_moveactive.mov",
  "yamaha": "/assets/projects/yamaha-make-waves/thumbnail_yamaha.mov",
  "victorian-queens": "/assets/projects/garden-of-voices-victorian-queens/thumbnail_victorian_queens.mov",
  "tradie": "/assets/projects/makita-tradie/thumbnail_tradie.mov",
  "madebox": "/assets/projects/myob-madebox/thumbnail_madebox.mov",
  "national-hero": "/assets/projects/football-australia-national-hero/thumbnail_national_hero.mov",
  "refreshed": "/assets/projects/beard-and-blade-refreshed/thumbnail_refreshed.mov",
  "kikkoman": "/assets/projects/kikkoman-makoto-selection/thumbnail_kikkoman.mov",
  "motorone": "/assets/projects/motorone-group-protektiv-hydro/thumbnail_motorone.mov",
  "denton-pillows": "/assets/projects/denton-pillows-a-great-night-sleep/thumbnail_denton_pillows.mov",
  "cowra": "/assets/projects/cowra-tourism-get-chris-to-cowra/thumbnail_cowra.mov",
  "rumbalara": "/assets/projects/rumbalara-over-the-rainbow/thumbnail_rumbalara.mov",
  "irwin-fran": "/assets/projects/cinemastone-irwin-fran/thumbnail_irwin_fran.mov",
  "football-christmas": "/assets/projects/football-australia-football-christmas/thumbnail_football_christmas.mov",
  "show-dont-tell": "/assets/projects/makita-show-don-t-tell/thumbnail_show_dont_tell.mov",
  "ginfusion": "/assets/projects/original-spirit-ginfusion/thumbnail_ginfusion.mov",
  "find-your-place": "/assets/projects/football-australia-find-your-place/thumbnail_find_your_place.mov",
  "drive": "/assets/projects/vudoo-drive/thumbnail_drive.mov",
  "jetstar-airport-services": "/assets/projects/jetstar-airport-services/thumbnail_jetstar_airport_services.mov",
  "ecco-safety": "/assets/projects/ecco-safety-heavy-duty-beacon/thumbnail_ecco_safety.mov",
  "rasta-man-vibration": "/assets/projects/cinemastone-rasta-man-vibration/thumbnail_rasta_man_vibration.mov",
  "amp": "/assets/projects/amp-quay-quarter/thumbnail_amp.mov",
  "kakadu-complex": "/assets/projects/nature-s-goodness-kakadu-complex/thumbnail_kakadu_complex.mov",
  "2xu": "/assets/projects/2xu-compression/thumbnail_2xu.mp4"
};

function isGenericThumb(src?: string) {
  return !src || src === GENERIC_THUMBNAIL || src === LEGACY_GENERIC_THUMBNAIL || src.startsWith("/migrated/");
}

function isVideoSrc(src?: string) {
  return Boolean(src && /\.(mp4|mov|webm)(\?|$)/i.test(src));
}

// Higher-resolution thumbnails. The originals are 228x128, which is well under
// half of what the cards display at, let alone on a retina screen.
//
// Each one must stay the first frame of that tile's hover video, so the still
// and the preview line up on hover. Where a graded still of that same frame
// exists it is used (1280x720); otherwise the frame is pulled from the video
// itself and is capped at the clip's own resolution, which is often 480x270.
const HIRES_THUMBS = new Set(
  Object.keys(import.meta.glob("/public/images/work-thumbs/*.webp", { eager: true }))
    .map((path) => path.split("/").pop()!.replace(".webp", ""))
);

export async function getResolvedWorks() {
  const projects = await getCollection("projects");
  const projectMap = new Map(projects.map((project) => [project.id, project]));

  return LEGACY_WORKS.map((item) => {
    const project = projectMap.get(item.slug);
    const wpImages = wpContent[item.slug]?.images || [];
    const bestWpImage = wpImages.find((src) => !isGenericThumb(src));
    const nonCompareThumb = NON_COMPARE_THUMBNAILS[item.slug];
    const overrideThumb = WORK_THUMB_OVERRIDES[item.slug];
    const overrideVideo = WORK_VIDEO_OVERRIDES[item.slug];

    const hires = HIRES_THUMBS.has(item.slug) ? `/images/work-thumbs/${item.slug}.webp` : undefined;

    const resolvedImage = [
      hires,
      !isGenericThumb(nonCompareThumb) ? nonCompareThumb : undefined,
      overrideThumb,
      !isGenericThumb(item.image) ? item.image : undefined,
      bestWpImage,
      !isGenericThumb(project?.data.cover) ? project?.data.cover : undefined,
      item.image,
      project?.data.cover,
      wpImages[0]
    ].find(Boolean) as string | undefined;

    const resolvedVideo = [
      overrideVideo,
      isVideoSrc(item.video) ? item.video : undefined
    ].find(Boolean) as string | undefined;

    return {
      ...item,
      categoryKey: CATEGORY_KEY_BY_LABEL[item.category],
      // Client only. The year made a varied catalogue read as one old batch,
      // and the category is already carried by the filter bar on /works.
      meta: project?.data.client || "",
      image: resolvedImage || "",
      video: resolvedVideo,
      href: `/projects/${item.slug}/`
    };
  }).filter((item) => Boolean(item.image));
}
