import { defineCard } from "../define.js";

export default defineCard({
  name: "Alliance of Arms",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Join forces — Starting with you, each player may pay any amount of mana. Each player creates X 1/1 white Soldier creature tokens, where X is the total amount of mana paid this way.",
  targets: [],
  effect: {
    kind: "players-pay-any-amount",
    resource: "mana",
    startingWithYou: true,
    then: { kind: "create-token", token: "Soldier Token", count: "x", who: "each-player" },
  },
});
