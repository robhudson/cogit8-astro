import IconMail from "@/assets/icons/IconMail.svg";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconLinkedin from "@/assets/icons/IconLinkedin.svg";
import IconMastadon from "@/assets/icons/IconMastadon.svg";
import { SITE } from "@/config";

export const INTRO = (
  "I'm Rob Hudson, and this blog is where I'll be sharing my learning process as I explore backend development with Python, Django, and Rust."
)

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const SOCIALS = [
  {
    name: "Github",
    href: "https://github.com/robhudson",
    linkTitle: "Github",
    icon: IconGitHub,
  },
  {
    name: "Mastodon",
    href: "https://fosstodon.org/@robhudson",
    linkTitle: "Mastodon",
    icon: IconMastadon,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/robhudson/",
    linkTitle: "LinkedIn",
    icon: IconLinkedin,
  },
  {
    name: "Mail",
    href: "mailto:rob@cogit8.org",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: IconMail,
  },
] as const;

export const SHARE_LINKS = [
] as const;
