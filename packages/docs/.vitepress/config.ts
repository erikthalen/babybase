import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Picobase",
  description:
    "Lightweight, self-hosted SQLite database manager with a browser GUI.",
  base: "/picobase/",

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
    siteTitle: "picobase",

    nav: [{ text: "Documentation", link: "/guide/what-is-picobase" }],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "What is Picobase?", link: "/guide/what-is-picobase" },
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
      { icon: "github", link: "https://github.com/erikthalen/picobase" },
    ],

    footer: {
      message: "Released under the MIT License.",
    },
  },
});
