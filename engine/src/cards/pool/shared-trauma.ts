import { defineCard } from "../define.js";

// EDHREC rank 18957.

export default defineCard({
  name: "Shared Trauma",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Join forces — Starting with you, each player may pay any amount of mana. Each player mills X cards, where X is the total amount of mana paid this way.",
  effect: {
    kind: "players-pay-any-amount",
    resource: "mana",
    startingWithYou: true,
    then: { kind: "mill", target: "each-player", amount: "x" },
  },
});
