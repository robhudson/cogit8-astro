export const SITE = {
  website: "https://rob.cogit8.org/", // replace this with your deployed domain
  author: "Rob Hudson",
  desc: "Cogitate on code alongside Rob Hudson, a software engineer sharing experiences, learnings, and insights on Python, Django, and web development.",
  title: "Rob's Cogitations",
  profile: "https://rob.cogit8.org/",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 20,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: false,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "Suggest Changes",
    url: "",
  },
  dynamicOgImage: true,
  lang: "en",
  timezone: "America/Los_Angeles",
} as const;
