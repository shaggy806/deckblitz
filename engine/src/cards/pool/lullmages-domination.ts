import { defineCard } from "../define.js";

// Rulings:
//   To cast it, choose a value of X, choose a creature with the appropriate
//     mana value, then determine the spell's cost, subtracting {3} if
//     appropriate. This can't reduce the {U}{U}{U} in the spell's cost.
//   The control effect lasts until the creature leaves the battlefield or you
//     lose the game.

const REDUCTION_TEXT =
  "This spell costs {3} less to cast if it targets a creature whose controller has eight or more cards in their graveyard.";

export default defineCard({
  name: "Lullmage's Domination",
  manaCost: "{X}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `${REDUCTION_TEXT}\nGain control of target creature with mana value X.`,
  targetCostReduction: { filter: { type: "creature", controllerGraveyardAtLeast: 8 }, reduceGeneric: 3 },
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "eq", n: "x" } } }],
  effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
});
