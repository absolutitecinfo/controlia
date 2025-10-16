import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Configuração híbrida: warnings em desenvolvimento, errors em produção
      "@typescript-eslint/no-explicit-any": process.env.NODE_ENV === 'production' ? "error" : "warn",
      "@typescript-eslint/no-unused-vars": process.env.NODE_ENV === 'production' ? "error" : "warn",
      "@typescript-eslint/no-non-null-assertion": process.env.NODE_ENV === 'production' ? "error" : "warn",
      "@typescript-eslint/ban-ts-comment": process.env.NODE_ENV === 'production' ? "error" : "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/prefer-const": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      "prefer-const": "warn",
      "no-unused-vars": "warn",
      "no-console": process.env.NODE_ENV === 'production' ? "error" : "warn",
      "no-debugger": process.env.NODE_ENV === 'production' ? "error" : "warn",
    },
  },
];

export default eslintConfig;
