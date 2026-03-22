export const SITE = {
  website: "https://phos-nyc.vercel.app/",
  author: "Prospect Heights Open Streets, Inc.",
  profile: "https://phos-nyc.vercel.app/",
  desc: "Vanderbilt Open Streets — Every Saturday, May through September, noon to 10 pm",
  title: "Prospect Heights Open Streets",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: false,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: false,
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
