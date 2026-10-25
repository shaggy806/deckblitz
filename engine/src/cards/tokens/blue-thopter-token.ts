import { defineCard } from "../define.js";

/** 1/1 blue Thopter artifact creature with flying (Thopter Foundry, Sharding Sphinx).
 * The colourless one is "Thopter Token". */
export default defineCard({
  name: "Blue Thopter Token",
  tokenName: "Thopter Token",
  art: "eef8b4fc-238f-4c1f-ad98-a1769fd44eab",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Thopter"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
});
