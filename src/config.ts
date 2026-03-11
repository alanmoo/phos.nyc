export const SITE = {
  website: "https://phos-nyc.vercel.app/",
  author: "phos.nyc",
  profile: "https://phos-nyc.vercel.app/",
  desc: "phos.nyc",
  title: "phos.nyc",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/alanmoo/phos.nyc/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "en",
  timezone: "America/New_York",
} as const;
