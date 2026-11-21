import { defineCard } from "../define.js";

/** 3/3 green Mutant creature token with deathtouch — The Curse of Fenric's
 * chapter I. Distinct from the red 2/2 `Mutant Token`. */
export default defineCard({
  name: "Mutant Token (Green, Deathtouch)",
  art: "b2e4fa4c-b68c-406c-80af-97257518a884",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Mutant"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: "Deathtouch",
});
