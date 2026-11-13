import { defineCard } from "../define.js";

/** Mechtitan, a legendary 10/10 Construct artifact creature that's all colors —
 * Mechtitan Core's token. */
export default defineCard({
  name: "Mechtitan Token",
  tokenName: "Mechtitan",
  art: "0281825d-9d38-4b56-b522-a8d3cf8c77c9",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 10,
  toughness: 10,
  keywords: ["flying", "vigilance", "trample", "lifelink", "haste"],
  text: "Flying, vigilance, trample, lifelink, haste",
});
