import { defineCard } from "../define.js";

// EDHREC rank 26670.
//
// Only the opponent is targeted (the ruling): which creature or planeswalker
// goes is the one with the greatest mana value among both types together,
// found as it resolves — a tie is that player's choice.

export default defineCard({
  name: "Break Under Pressure",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target opponent sacrifices a creature or planeswalker with the greatest mana value among creatures and planeswalkers they control. You gain 2 life.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sacrifice",
        who: "target",
        filter: {
          typesAnyOf: ["creature", "planeswalker"],
          greatestAmongItsController: { of: "mana-value", among: { typesAnyOf: ["creature", "planeswalker"] } },
        },
        count: 1,
      },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
