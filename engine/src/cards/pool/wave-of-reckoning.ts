import { defineCard } from "../define.js";

// Commander (2011) first; the snapshot's printing is SOC. EDHREC rank 5339.
// Solar Blaze's effect: each creature its own source, all at once.

export default defineCard({
  name: "Wave of Reckoning",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Each creature deals damage to itself equal to its power.",
  targets: [],
  effect: { kind: "each-deals-damage", filter: { type: "creature" }, amount: "its-power", to: "itself" },
});
