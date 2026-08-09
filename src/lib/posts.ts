type PostKind = "technical" | "essay";

// Blog grouping. The site's primary readers are producers, agencies and
// studios, so craft leads and the personal builds sit below it rather than
// burying the post-production writing under whatever was published last.
export type PostTopic = "craft" | "infrastructure" | "tools" | "essay";

export const TOPIC_ORDER: PostTopic[] = ["craft", "infrastructure", "tools", "essay"];

export const TOPIC_META: Record<PostTopic, { title: string; blurb: string }> = {
  craft: {
    title: "Colour, finishing and the craft",
    blurb: "Grading, delivery, and the decisions that make a picture hold up."
  },
  infrastructure: {
    title: "Workflow and infrastructure",
    blurb: "Storage, monitoring, migrations, and keeping a pipeline dependable."
  },
  tools: {
    title: "Things I've built",
    blurb: "Hardware and software made to solve a specific challenge."
  },
  essay: {
    title: "Writing",
    blurb: "Wider writing on technology, media, and where they are heading."
  }
};

export type PostSummary = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  cover?: string;
  coverAlt?: string;
  draft: boolean;
  writingKind: PostKind;
  topic: PostTopic;
};

const rawPostModules = import.meta.glob("../content/posts/*.md", {
  eager: true,
  import: "default",
  query: "?raw"
}) as Record<string, string>;

const stripQuotes = (value: string) => {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const parseFrontmatter = (source: string) => {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  const data: Record<string, string | boolean> = {};
  if (!match) return data;

  for (const line of match[1].split("\n")) {
    if (!line.trim() || line.startsWith(" ") || line.startsWith("-")) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    if (rawValue === "true" || rawValue === "false") {
      data[key] = rawValue === "true";
    } else {
      data[key] = stripQuotes(rawValue);
    }
  }

  return data;
};

export const allPosts = Object.entries(rawPostModules)
  .map(([path, source]) => {
    const data = parseFrontmatter(source);
    const slug = path.split("/").pop()?.replace(/\.md$/, "") || "";
    return {
      slug,
      title: String(data.title || ""),
      date: String(data.date || ""),
      excerpt: String(data.excerpt || ""),
      cover: data.cover ? String(data.cover) : undefined,
      coverAlt: data.coverAlt ? String(data.coverAlt) : undefined,
      draft: Boolean(data.draft),
      writingKind: (data.writingKind === "essay" ? "essay" : "technical") as PostKind,
      topic: (TOPIC_ORDER.includes(data.topic as PostTopic) ? data.topic : "craft") as PostTopic
    };
  })
  .filter((post) => post.title && post.date)
  .sort((a, b) => b.date.localeCompare(a.date));

export const technicalPosts = allPosts.filter(
  (post) => !post.draft && post.writingKind === "technical"
);

export const postsByTopic = TOPIC_ORDER.map((topic) => ({
  topic,
  ...TOPIC_META[topic],
  posts: allPosts.filter((post) => !post.draft && post.topic === topic)
})).filter((group) => group.posts.length > 0);
