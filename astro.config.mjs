import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import icon from "astro-icon";

export default defineConfig({
  integrations: [tailwind(), vue(), icon()],
  compressHTML: false,
});
