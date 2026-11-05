import { defineCard } from "../define.js";

const TEXT = "Each player who controls a creature with power 4 or greater draws a card. Then destroy all creatures.";

export default defineCard({
  name: "Shatter the Sky",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: "each-player",
        whoIf: {
          kind: "of-player",
          player: "that-player",
          condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
        },
        effect: { kind: "draw", amount: 1, who: "that-player" },
      },
      { kind: "destroy-all", filter: { type: "creature" } },
    ],
  },
});
