import { defineConfig } from "@fullstacksjs/eslint-config";

export default defineConfig(
  {
    react: true,
    typescript: {
      tsconfigRootDir: import.meta.dirname,
      projectService: {
        allowDefaultProject: ["eslint.config.js", "vite.config.ts"],
      },
      overrides: {
        rules: {
          "@typescript-eslint/consistent-type-definitions": ["error", "type"],
          "@typescript-eslint/no-deprecated": [
            "error",
            { allow: [{ from: "lib", name: "execCommand" }] },
          ],
        },
      },
    },
    gitignore: true,
  },
  {
    rules: {
      "jsx-a11y/no-noninteractive-element-interactions": [
        "warn",
        { img: ["onError", "onLoad"] },
      ],
    },
  }
);
