import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string): string => resolve(import.meta.dirname, path);

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@shared": fromRoot("src/shared"),
      "@features": fromRoot("src/features"),
      "@entities": fromRoot("src/entities"),
      "@screens": fromRoot("src/screens"),
      "@widgets": fromRoot("src/widgets"),
      "@": fromRoot("src"),
    },
  },
});
