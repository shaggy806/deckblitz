import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 15097.
//
// Rulings:
//   [2020-06-23] Sanguine Indulgence's first ability looks at how much life you've gained in the
//     turn. It doesn't care if you also lost life, even if you lost more life than you gained.

export default defineCard({
  name: "Sanguine Indulgence",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "This spell costs {3} less to cast if you've gained 3 or more life this turn.\nReturn up to two target creature cards from your graveyard to your hand.",
  selfCostReduction: {
    condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 3 },
    reduceGeneric: 3,
  },
  targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, { optional: true }),
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
});
