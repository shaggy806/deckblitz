import { defineCard } from "../define.js";

// EDHREC rank 14695. Ixalan. Raid reads whether you attacked this turn as it
// resolves; one Treasure however many attacked, and whatever was discarded
// (the rulings).
export default defineCard({
  name: "Heartless Pillage",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent discards two cards.\nRaid — If you attacked this turn, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      {
        kind: "conditional",
        condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
        then: { kind: "create-token", token: "Treasure Token", count: 1 },
      },
    ],
  },
});
