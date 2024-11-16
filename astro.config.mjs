import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import icon from "astro-icon";

export default defineConfig({
  integrations: [tailwind(), svelte(), icon()],
  compressHTML: false,
});
