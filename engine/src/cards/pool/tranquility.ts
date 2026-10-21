import { defineCard } from "../define.js";

// EDHREC rank 17769.

export default defineCard({
  name: "Tranquility",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy all enchantments.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "enchantment" } },
});
