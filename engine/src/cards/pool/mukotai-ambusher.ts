import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

// EDHREC rank 10496.

export default defineCard({
  name: "Mukotai Ambusher",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Rat", "Ninja"],
  power: 3,
  toughness: 2,
  keywords: ["lifelink"],
  text: `${ninjutsuText("{1}{B}")}\nLifelink`,
  activated: [ninjutsu("{1}{B}")],
});
