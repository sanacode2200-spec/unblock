import { defineConfig } from "astro/config";
import react from "@astrojs/react";

const crossOriginIsolationHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Resource-Policy": "same-origin"
};

function crossOriginIsolationPlugin() {
  function applyHeaders(_, response, next) {
    for (const [name, value] of Object.entries(crossOriginIsolationHeaders)) {
      response.setHeader(name, value);
    }
    next();
  }

  return {
    name: "cross-origin-isolation-headers",
    configureServer(server) {
      server.middlewares.use(applyHeaders);
    },
    configurePreviewServer(server) {
      server.middlewares.use(applyHeaders);
    }
  };
}

export default defineConfig({
  site: "https://sanacode.com",
  base: "/unblock",
  integrations: [react()],
  output: "static",
  vite: {
    plugins: [crossOriginIsolationPlugin()],
    optimizeDeps: {
      exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util", "@ffmpeg/core"]
    },
    worker: {
      format: "es"
    }
  }
});
