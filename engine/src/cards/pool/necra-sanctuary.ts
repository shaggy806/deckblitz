import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";

// EDHREC rank 30779.
//
// Rulings:
//   One permanent that is both white and green will cause the player to be affected by the lose
//     3 life portion.
//   It can make a player lose 0, 1, or 3 life, but never 4.

const TEXT =
  "At the beginning of your upkeep, if you control a green or white permanent, target player loses 1 life. If you control a green permanent and a white permanent, that player loses 3 life instead.";

const GREEN: StaticCondition = { kind: "controls", filter: { colors: ["G"] }, atLeast: 1 };
const WHITE: StaticCondition = { kind: "controls", filter: { colors: ["W"] }, atLeast: 1 };

export default defineCard({
  name: "Necra Sanctuary",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "any", of: [GREEN, WHITE] },
      targets: ["player"],
      effect: {
        kind: "lose-life",
        target: 0,
        amount: { ifCondition: { kind: "all", of: [GREEN, WHITE] }, then: 3, else: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
