import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// In development, proxy API calls to the local Express server.
// Forwards both direct paths (/customers, /payments, etc.) and /api prefixes.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_LOCAL_API_URL || "http://localhost:5000";

  const bypassHtml = (req) => {
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return "/index.html";
    }
  };

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/customers": { target, changeOrigin: true, bypass: bypassHtml },
        "/payments": { target, changeOrigin: true, bypass: bypassHtml },
        "/dashboard": { target, changeOrigin: true, bypass: bypassHtml },
        "/reports": { target, changeOrigin: true, bypass: bypassHtml },
        "/import": { target, changeOrigin: true, bypass: bypassHtml },
        "/export": { target, changeOrigin: true, bypass: bypassHtml },
        "/search": { target, changeOrigin: true, bypass: bypassHtml },
        "/health": { target, changeOrigin: true, bypass: bypassHtml },
        "/support": { target, changeOrigin: true, bypass: bypassHtml },
        "/tickets": { target, changeOrigin: true, bypass: bypassHtml },
        "/operator": { target, changeOrigin: true, bypass: bypassHtml },
        "/payment-proofs": { target, changeOrigin: true, bypass: bypassHtml },
        "/customer-api": { target, changeOrigin: true, bypass: bypassHtml },
        "/api": {
          target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
