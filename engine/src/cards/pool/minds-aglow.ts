import { defineCard } from "../define.js";

// The draw isn't optional: a player can't choose to draw fewer than X (the
// ruling).
export default defineCard({
  name: "Minds Aglow",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Join forces — Starting with you, each player may pay any amount of mana. Each player draws X cards, where X is the total amount of mana paid this way.",
  targets: [],
  effect: {
    kind: "players-pay-any-amount",
    resource: "mana",
    startingWithYou: true,
    then: { kind: "draw", amount: "x", who: "each-player" },
  },
});
