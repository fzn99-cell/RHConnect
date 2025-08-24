import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// These 3 lines replace __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Locale = Record<string, string>;

const locales: Record<string, Locale> = {
  en: JSON.parse(fs.readFileSync(path.join(__dirname, "../locales/en.json"), "utf-8")),
  fr: JSON.parse(fs.readFileSync(path.join(__dirname, "../locales/fr.json"), "utf-8")),
};

export const t = (key: string, lang: string = "en", vars: Record<string, string> = {}) => {
  const template = locales[lang]?.[key] || locales["en"]?.[key] || key;
  return Object.keys(vars).reduce(
    (msg, varKey) => msg.replace(new RegExp(`{{${varKey}}}`, "g"), vars[varKey]),
    template
  );
};
