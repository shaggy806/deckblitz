import { defineCard } from "../define.js";

// The loss first, then the count of opponents read after it.
const TEXT =
  "Reverberating Summons — At the beginning of your end step, each opponent loses 2 life. Then for each opponent who has less life than you, create a 1/3 black Demon creature token named Plaguebearer of Nurgle.";

export default defineCard({
  name: "Great Unclean One",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          {
            kind: "create-token",
            token: "Plaguebearer of Nurgle",
            count: {
              countPlayers: "each-opponent",
              where: { kind: "player-compare", stat: "life", compare: "more", than: "that-player" },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
