import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 28715.
//
// Rulings:
//   [2014-02-01] The controller of the creature chooses which attacking creature that creature
//     blocks.
//   [2014-02-01] The creature blocks only if it’s able to do so as the declare blockers step
//     begins. If, at that time, the creature is tapped, it’s affected by a spell or ability that
//     says it can’t block, or no creatures are attacking its controller or a planeswalker
//     controlled by that player, then it doesn’t block. If there’s a cost associated with having
//     the creature block, the player isn’t forced to pay that cost. If that cost isn’t paid, the
//     creature won’t block.

export default defineCard({
  name: "Culling Mark",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature blocks this turn if able.",
  // TODO(scaffold): Target creature blocks this turn if able.
});
