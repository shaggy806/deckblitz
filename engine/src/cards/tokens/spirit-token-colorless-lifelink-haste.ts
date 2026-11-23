import { defineCard } from "../define.js";

/** 1/1 colorless Spirit with lifelink and haste — Evil Boros Charm's token
 * (no token printing). */
export default defineCard({
  name: "Spirit Token (Colorless, Lifelink, Haste)",
  colors: [],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink", "haste"],
  text: "Lifelink, haste",
});
