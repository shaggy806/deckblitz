import { defineCard } from "../define.js";

const TEXT = "At the beginning of your upkeep, each opponent may create a Treasure token. For each opponent who does, you create a Treasure token.";

export default defineCard({
  name: "Tempting Contract",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "each-player-may",
            who: "each-opponent",
            prompt: "Create a Treasure token?",
            effect: { kind: "create-token", token: "Treasure Token", count: 1 },
          },
          {
            kind: "create-token",
            token: "Treasure Token",
            count: { countPlayers: "each-opponent", where: { kind: "this-way", what: "created", who: "that-player" } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
