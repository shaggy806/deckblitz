import { defineCard } from "../define.js";

// EDHREC rank 17878.

export default defineCard({
  name: "Red Tiger Mechan",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Cat"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: "Haste\nWarp {1}{R} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)",
  warp: { cost: "{1}{R}" },
});
