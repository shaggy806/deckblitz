import { defineCard } from "../define.js";

export default defineCard({
  name: "Worldfire",
  manaCost: "{6}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Exile all permanents. Exile all cards from all hands and graveyards. Each player's life total becomes 1.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: {} },
      { kind: "exile-graveyard", target: "each-player", fromHand: "also" },
      { kind: "set-life-total", who: "each-player", amount: 1 },
    ],
  },
});
