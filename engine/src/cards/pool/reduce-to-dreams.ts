import { defineCard } from "../define.js";

// EDHREC rank 25595.

export default defineCard({
  name: "Reduce to Dreams",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return all artifacts and enchantments to their owners' hands.",
  targets: [],
  effect: { kind: "return-to-hand-all", filter: { typesAnyOf: ["artifact", "enchantment"] } },
});
