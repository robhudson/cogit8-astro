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
    url: "",
    text: "Suggest Changes",
    appendFilePath: true,
  },
  dynamicOgImage: true,
} as const;
