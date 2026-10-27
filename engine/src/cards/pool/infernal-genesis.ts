import { defineCard } from "../define.js";

// EDHREC rank 15081.
//
// "That player" is the player whose upkeep it is (`active-player`, Dreamborn
// Muse's shape); X is the milled card's mana value (`thisWay: "milled"`,
// Mindshrieker's), 0 for a land or with nothing milled (the ruling), and the
// tokens are that player's.

const TEXT =
  "At the beginning of each player's upkeep, that player mills a card. Then they create X 1/1 black Minion creature tokens, where X is the milled card's mana value.";

export default defineCard({
  name: "Infernal Genesis",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "active-player", amount: 1 },
          {
            kind: "create-token",
            token: "Minion Token",
            count: { thisWay: "milled", sumOf: "mana-value" },
            who: "active-player",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
