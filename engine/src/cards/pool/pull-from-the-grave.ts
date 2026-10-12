import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 10345.
//
// Rulings:
//   [2026-03-20] You don't have to choose any targets for Pull from the Grave. However, if you do
//     and all of the targets are illegal as Pull from the Grave tries to resolve, it won't resolve
//     and none of its effects will happen. You won't gain life.

// Zero, one or two targets. With none chosen it still resolves and you gain
// the life; with targets chosen and all illegal it doesn't resolve (the
// ruling, rule 608.2b).
export default defineCard({
  name: "Pull from the Grave",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return up to two target creature cards from your graveyard to your hand. You gain 2 life.",
  targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, { optional: true }),
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
