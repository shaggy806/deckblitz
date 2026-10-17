import { defineCard } from "../define.js";

// EDHREC rank 21575.
//
// "You may sacrifice an artifact, enchantment, or token. If you don't, tap
// this creature": a "may" with a sacrifice option (Chitterspitter's shape),
// and the tap as its "if you don't".

const TEXT =
  "At the beginning of your upkeep, you may sacrifice an artifact, enchantment, or token. If you don't, tap this creature.";

export default defineCard({
  name: "Devouring Sugarmaw",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 6,
  toughness: 6,
  keywords: ["menace", "trample"],
  text: `Menace, trample\n${TEXT}`,
  faces: ["Devouring Sugarmaw", "Have for Dinner"],
  adventure: true,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { anyOf: [{ type: "artifact" }, { type: "enchantment" }, { token: true }] },
            text: "Sacrifice an artifact, enchantment, or token",
          },
        ],
        ifDidnt: { kind: "tap", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
