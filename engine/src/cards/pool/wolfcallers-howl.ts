import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, create X 2/2 green Wolf creature tokens, where X is the number of your opponents with four or more cards in hand.";

export default defineCard({
  name: "Wolfcaller's Howl",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Wolf Token",
        count: {
          countPlayers: "each-opponent",
          where: { kind: "of-player", player: "that-player", condition: { kind: "hand-size", atLeast: 4 } },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
