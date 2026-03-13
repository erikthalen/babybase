import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Babybase",
  description:
    "Lightweight, self-hosted SQLite database manager with a browser GUI.",
  base: "/babybase/",

  head: [
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    [
      "link",
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    ],
    ["link", { rel: "icon", href: "logo.svg" }],
  ],

  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "babybase",

    nav: [{ text: "Documentation", link: "/guide/what-is-babybase" }],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "What is Babybase?", link: "/guide/what-is-babybase" },
            { text: "Getting Started", link: "/guide/getting-started" },
          ],
        },
        {
          text: "Usage",
          items: [{ text: "CLI", link: "/guide/cli" }],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/erikthalen/babybase" },
    ],

    footer: {
      message: "Released under the MIT License.",
    },
  },
});
