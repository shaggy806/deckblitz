import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of each end step, draw a card for each opponent who drew two or more cards this turn, then create a Treasure token for each opponent who had two or more lands enter the battlefield under their control this turn.";

export default defineCard({
  name: "Smuggler's Share",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "draw",
            amount: {
              countPlayers: "each-opponent",
              where: {
                kind: "of-player",
                player: "that-player",
                condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 2 },
              },
            },
          },
          {
            kind: "create-token",
            token: "Treasure Token",
            count: {
              countPlayers: "each-opponent",
              where: {
                kind: "of-player",
                player: "that-player",
                condition: { kind: "turn-history", what: "entered", filter: { type: "land" }, atLeast: 2 },
              },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
