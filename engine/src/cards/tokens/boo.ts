import { defineCard } from "../define.js";

/**
 * Minsc, Beloved Ranger's token — a *named legendary* 1/1, so the legend rule
 * applies to two of them.
 */
export default defineCard({
  name: "Boo",
  art: "c49e8e79-8673-41c2-a1ad-273c37e27aca",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Hamster"],
  power: 1,
  toughness: 1,
  keywords: ["trample", "haste"],
  text: "Trample, haste",
});
