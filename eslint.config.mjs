import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "out/**", "next-env.d.ts"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // En config plate, le dernier bloc l'emporte : cette exception doit donc
    // suivre les presets Next. `Image` de @react-pdf/renderer n'est pas un
    // élément HTML — il n'accepte pas d'attribut alt, et un PDF n'a pas
    // d'arbre d'accessibilité web.
    files: ["src/lib/pdf/**/*.tsx"],
    rules: { "jsx-a11y/alt-text": "off" },
  },
];

export default eslintConfig;
