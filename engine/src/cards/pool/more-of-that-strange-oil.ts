import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). The mode names are flavor words.

export default defineCard({
  name: "More of That Strange Oil...",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Choose one —\n" +
    "• It's Probably Nothing — Proliferate. Draw a card.\n" +
    "• That Could Actually Be Dangerous — Counter target creature, artifact, or planeswalker spell. Scry 1.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "It's Probably Nothing — Proliferate. Draw a card.",
        effect: {
          kind: "sequence",
          effects: [{ kind: "proliferate" }, { kind: "draw", amount: 1 }],
        },
      },
      {
        text: "That Could Actually Be Dangerous — Counter target creature, artifact, or planeswalker spell. Scry 1.",
        targets: [{ kind: "spell", filter: { typesAnyOf: ["creature", "artifact", "planeswalker"] } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "counter", target: 0 },
            { kind: "scry", amount: 1 },
          ],
        },
      },
    ],
  },
});
