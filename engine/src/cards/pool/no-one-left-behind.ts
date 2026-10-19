import { defineCard } from "../define.js";

// EDHREC rank 13886. Revoke Demise's target cost reduction over a graveyard target.
//
// Rulings:
//   [2022-10-14] If the targeted creature card has an {X} in its mana cost, X is 0.

export default defineCard({
  name: "No One Left Behind",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "This spell costs {3} less to cast if it targets a creature card with mana value 3 or less.\nReturn target creature card from your graveyard to the battlefield.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  targetCostReduction: { filter: { type: "creature", manaValue: { op: "lte", n: 3 } }, reduceGeneric: 3 },
  effect: { kind: "put-onto-battlefield", target: 0 },
});
