import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://sanacode.com",
  base: "/unblock",
  integrations: [react()],
  output: "static"
});
