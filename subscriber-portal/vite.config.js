import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_LOCAL_API_URL || "http://localhost:5000";

  return {
    plugins: [react()],
    server: {
      port: 5174,
      proxy: {
        "/customer-api": { target, changeOrigin: true },
        "/api": {
          target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
