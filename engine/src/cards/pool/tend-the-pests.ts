import { defineCard } from "../define.js";

// EDHREC rank 5142.
//
// Rulings:
//   [2021-04-16] Copies of Tend the Pests will use the power of the creature sacrificed for the
//     original spell to determine the number of Pests each copy creates. Because the copies aren't
//     cast, you won't sacrifice additional creatures for them.

export default defineCard({
  name: "Tend the Pests",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["instant"],
  text: 'As an additional cost to cast this spell, sacrifice a creature.\nCreate X 1/1 black and green Pest creature tokens with "When this token dies, you gain 1 life," where X is the sacrificed creature\'s power.',
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  targets: [],
  effect: { kind: "create-token", token: "Pest Token", count: { powerOf: { paid: "sacrificed" } } },
});
