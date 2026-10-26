import { defineCard } from "../define.js";

// EDHREC rank 20566. Fumigate's shape over enchantments.

export default defineCard({
  name: "Paraselene",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all enchantments. You gain 1 life for each enchantment destroyed this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "enchantment" } },
      { kind: "gain-life", amount: { thisWay: "destroyed" } },
    ],
  },
});
