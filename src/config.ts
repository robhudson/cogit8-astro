import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://rob.cogit8.org/", // replace this with your deployed domain
  author: "Rob Hudson",
  desc: "Cogitate on code alongside Rob Hudson, a software engineer sharing experiences, learnings, and insights on Python, Django, and web development.",
  title: "Rob's Cogitations",
  profile: "https://rob.cogit8.org/",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 20,
  postPerIndex: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  editPost: {
    url: "https://github.com/robhudson/cogit8-astro/edit/main/src/content/blog",
    text: "Suggest Changes",
    appendFilePath: true,
  },
};

export const INTRO = (
  "I'm Rob Hudson, a passionate backend developer with a love for all things Python, Django, and lately Rust. " +
  "This website is a space for me to share my journey in the world of code, document my learnings, " + 
  "and hopefully inspire others who share the same passion."
)

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/robhudson",
    linkTitle: "Github",
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/robhudson/",
    linkTitle: "LinkedIn",
    active: true,
  },
  {
    name: "Mastodon",
    href: "https://fosstodon.org/@robhudson",
    linkTitle: "Mastodon",
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:rob@cogit8.org",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
  {
    name: "RSS",
    href: "/rss.xml",
    linkTitle: "RSS Feed",
    active: true,
  }
];
