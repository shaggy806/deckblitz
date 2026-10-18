import { defineCard } from "../define.js";

/** 4/3 white and black Vampire Demon with flying — Clavileño, First of the
 * Blessed's token. */
export default defineCard({
  name: "Vampire Demon Token",
  art: "3005eb0a-5c96-4a07-a6b9-a907d1095cdf",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Vampire", "Demon"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying",
});
