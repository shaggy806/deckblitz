import type { ActivatedAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// EDHREC rank 30248.
//
// Rulings:
//   [2004-10-04] Once the counter is placed on the creature, the ability to remove it can only be
//     activated by the player who controls the creature.
//
// The granted ability rides on the creature for good (Urza's Saga's
// `grant-activated` with a `"permanent"` duration), so whoever controls the
// creature activates it. Each activation of Life Matrix grants another copy.
const GRANTED_TEXT = "Remove a matrix counter from this creature: Regenerate this creature.";
const REGENERATE: ActivatedAbility = {
  cost: { mana: null, tap: false, removeCounter: { kind: "matrix", count: 1 } },
  targets: [],
  effect: { kind: "regenerate", target: "source" },
  resolve: null,
  text: GRANTED_TEXT,
};
const TEXT = `{4}, {T}: Put a matrix counter on target creature and that creature gains "${GRANTED_TEXT}" Activate only during your upkeep.`;

export default defineCard({
  name: "Life Matrix",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "matrix", amount: 1 },
          { kind: "grant-activated", target: 0, ability: REGENERATE, duration: "permanent" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
