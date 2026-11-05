import { defineCard } from "../define.js";

// Join forces (Minds Aglow's `players-pay-any-amount`), each player then searching their own
// library for up to X, the total paid.

export default defineCard({
  name: "Collective Voyage",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text:
    "Join forces — Starting with you, each player may pay any amount of mana. Each player searches their library for up to X basic land cards, where X is the total amount of mana paid this way, puts them onto the battlefield tapped, then shuffles.",
  targets: [],
  effect: {
    kind: "players-pay-any-amount",
    resource: "mana",
    startingWithYou: true,
    then: {
      kind: "for-each-player",
      who: "each-player",
      effect: {
        kind: "search-library",
        who: "that-player",
        filter: { type: "land", supertype: "basic" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: "x",
      },
    },
  },
});
