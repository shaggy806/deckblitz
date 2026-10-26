import { defineCard } from "../define.js";

// EDHREC rank 24193.

export default defineCard({
  name: "Multani's Decree",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy all enchantments. You gain 2 life for each enchantment destroyed this way.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "enchantment" } },
      { kind: "gain-life", amount: { product: [2, { thisWay: "destroyed" }] } },
    ],
  },
});
