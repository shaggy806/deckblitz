import { defineCard } from "../define.js";

// EDHREC rank 22095.

export default defineCard({
  name: "Cleanfall",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Destroy all enchantments.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "enchantment" } },
});
