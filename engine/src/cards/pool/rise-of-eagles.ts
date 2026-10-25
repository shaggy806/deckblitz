import { defineCard } from "../define.js";

export default defineCard({
  name: "Rise of Eagles",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Create two 2/2 blue Bird enchantment creature tokens with flying. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "2/2 Blue Enchantment Bird Token (Flying)", count: 2 },
      { kind: "scry", amount: 1 },
    ],
  },
});
