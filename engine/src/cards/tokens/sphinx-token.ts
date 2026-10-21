import { defineCard } from "../define.js";

/** A 4/4 white and blue Sphinx with flying and vigilance (Warrant // Warden). */
export default defineCard({
  name: "Sphinx Token",
  art: "c8651719-b875-48ce-b68b-ac7c0713ddf8",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance",
});
