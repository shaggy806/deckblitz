import { defineCard } from "../define.js";

/**
 * Castle Doom's token — "a 3/3 colorless Robot Villain artifact creature
 * token named Doombot". A named token whose name collides with no card, so
 * it's keyed by that name (Cadet's shape) and a "same name" check reads
 * "Doombot".
 */
export default defineCard({
  name: "Doombot",
  art: "452680b5-5032-413a-bb5a-3fc8cfe88be9",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Villain"],
  power: 3,
  toughness: 3,
  text: "",
});
