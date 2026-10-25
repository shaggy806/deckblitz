import { defineCard } from "../define.js";

// EDHREC rank 28619. Alliances. One sentence, one damage event: an attacking
// creature you control is dealt 2 and 1 at once.

export default defineCard({
  name: "Hail Storm",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Hail Storm deals 2 damage to each attacking creature and 1 damage to you and each creature you control.",
  targets: [],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", amount: 2, filter: { type: "creature", attacking: true } },
      { kind: "damage", amount: 1, who: "you" },
      { kind: "damage-all", amount: 1, filter: { type: "creature", controlledBy: "you" } },
    ],
  },
});
