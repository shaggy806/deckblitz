import { defineCard } from "../define.js";

// EDHREC rank 27365.

export default defineCard({
  name: "Command Decision",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Choose one —\n• Destroy target creature with power 4 or greater.\n• Draw a card.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target creature with power 4 or greater.",
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
        effect: { kind: "destroy", target: 0 },
      },
      { text: "Draw a card.", effect: { kind: "draw", amount: 1 } },
    ],
  },
});
