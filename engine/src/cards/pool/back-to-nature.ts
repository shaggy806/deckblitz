import { defineCard } from "../define.js";

// EDHREC rank 9828. Magic 2011.

export default defineCard({
  name: "Back to Nature",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy all enchantments.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "enchantment" } },
});
