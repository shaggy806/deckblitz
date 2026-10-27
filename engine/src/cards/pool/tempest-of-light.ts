import { defineCard } from "../define.js";

// EDHREC rank 22231. Mirrodin.

export default defineCard({
  name: "Tempest of Light",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy all enchantments.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "enchantment" } },
});
