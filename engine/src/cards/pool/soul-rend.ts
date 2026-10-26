import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 29782.
//
// Rulings:
//   [2004-10-04] Only checks the color of the creature on resolution.
// The draw is set up whatever the creature's colour.

export default defineCard({
  name: "Soul Rend",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature if it's white. A creature destroyed this way can't be regenerated.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { colors: ["W"] } },
        then: { kind: "destroy", target: 0, cantBeRegenerated: true },
      },
      { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
    ],
  },
});
