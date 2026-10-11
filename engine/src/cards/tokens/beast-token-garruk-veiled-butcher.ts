import { defineCard } from "../define.js";

/** 4/4 green Beast creature token with trample — Garruk, Veiled Butcher's −2.
 * Distinct from the plain 4/4 `Beast Token`, which has no trample. */
export default defineCard({
  name: "Beast Token (Garruk, Veiled Butcher)",
  art: "859bda9a-fa90-4ad3-b0c1-6fc62e27c12f",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample",
});
