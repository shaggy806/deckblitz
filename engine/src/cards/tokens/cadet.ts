import { defineCard } from "../define.js";

/**
 * Ingris Stingerquill's token — "a 2/2 colorless Wizard Soldier creature token
 * named Cadet". A named token whose name collides with no card, so it's keyed
 * by that name (Karox Bladewing's shape) and every "named …" / "same name"
 * check reads "Cadet".
 */
export default defineCard({
  name: "Cadet",
  art: "8f4534d8-2783-484f-8ebf-a47b1cc4c6df",
  colors: [],
  types: ["creature"],
  subtypes: ["Wizard", "Soldier"],
  power: 2,
  toughness: 2,
  text: "",
});
