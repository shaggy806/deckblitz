import { defineCard } from "../define.js";

// EDHREC rank 17789.

export default defineCard({
  name: "Compleat Devotion",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature you control gets +2/+2 until end of turn. If that creature has toxic, draw a card.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { hasToxic: true } },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
