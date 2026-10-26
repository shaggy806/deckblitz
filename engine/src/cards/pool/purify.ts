import { defineCard } from "../define.js";

// Urza's Legacy (ULG). EDHREC rank 25619.

export default defineCard({
  name: "Purify",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all artifacts and enchantments.",
  targets: [],
  effect: { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "enchantment"] } },
});
