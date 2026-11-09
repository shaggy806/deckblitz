import { defineCard } from "../define.js";

const TEXT = "If you would lose the game, instead shuffle your hand, your graveyard, and all permanents you own into your library, then draw seven cards and your life total becomes 20.";

export default defineCard({
  name: "Lich's Mirror",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-lose-game",
        who: "you",
        instead: {
          effect: {
            kind: "sequence",
            effects: [
              { kind: "shuffle-graveyard-into-library", target: "you", zones: ["hand", "graveyard", "permanents"] },
              { kind: "draw", amount: 7 },
              { kind: "set-life-total", who: "you", amount: 20 },
            ],
          },
        },
      },
      text: TEXT,
    },
  ],
});
