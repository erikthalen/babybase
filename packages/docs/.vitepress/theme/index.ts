import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import HomeContent from "./HomeContent.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      "home-hero-before": () => h(HomeContent),
    });
  },
};
