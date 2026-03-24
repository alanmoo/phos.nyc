export const SITE = {
  website: "http://phos.nyc/",
  author: "Prospect Heights Open Streets, Inc.",
  profile: "https://phos.nyc/",
  desc: "Vanderbilt Open Streets — Every Saturday, May through September, noon to 10 pm",
  title: "Prospect Heights Open Streets",
  ogImage: "images/og-phos.png",
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
