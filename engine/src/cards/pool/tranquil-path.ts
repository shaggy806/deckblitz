import { defineCard } from "../define.js";

// EDHREC rank 27733.

export default defineCard({
  name: "Tranquil Path",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy all enchantments.\nDraw a card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "enchantment" } },
      { kind: "draw", amount: 1 },
    ],
  },
});
