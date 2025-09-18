// src/lib/site.ts
export const siteConfig = {
  name: "Your Brand",

  nav: {
    links: [
      { title: "Home", href: "#" },
      { title: "Features", href: "#features" },
      { title: "Pricing", href: "#pricing" },
      { title: "FAQ", href: "#faq" },
    ],
  },

  // 👇 These values are used by the hero section.
  hero: {
    badgeIcon: "✨",                // <- this fixes the error
    badgeText: "Now live",
    title: "AI that ships beautiful sites",
    subtitle:
      "Start from a stunning template and customize copy, colors, and sections in minutes.",
    primaryCta: { label: "Get started", href: "#pricing" },
    secondaryCta: { label: "See features", href: "#features" },
  },

  links: {
    twitter: "https://twitter.com",
    github: "https://github.com/Khoseyy/Magic-UI-template-1-0",
  },
};

export type SiteConfig = typeof siteConfig;
