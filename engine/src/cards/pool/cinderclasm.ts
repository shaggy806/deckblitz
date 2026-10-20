import { defineCard } from "../define.js";

// EDHREC rank 12659. Zendikar Rising.

export default defineCard({
  name: "Cinderclasm",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Kicker {R} (You may pay an additional {R} as you cast this spell.)\nCinderclasm deals 1 damage to each creature. If it was kicked, it deals 2 damage to each creature instead.",
  effect: { kind: "damage-all", amount: 1, filter: { type: "creature" } },
  kicker: { cost: "{R}", effect: { kind: "damage-all", amount: 2, filter: { type: "creature" } } },
});
