import { defineCard } from "../define.js";

export default defineCard({
  name: "No Witnesses",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Each player who controls the most creatures investigates. Then destroy all creatures. (To investigate, create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
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
          condition: {
            kind: "player-compare",
            stat: { controls: { type: "creature" } },
            compare: "at-least",
            than: "each-opponent",
          },
        },
        effect: { kind: "create-token", token: "Clue Token", investigate: true, count: 1, who: "that-player" },
      },
      { kind: "destroy-all", filter: { type: "creature" } },
    ],
  },
});
