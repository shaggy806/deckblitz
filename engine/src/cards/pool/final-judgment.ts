import { defineCard } from "../define.js";

// EDHREC rank 8032.

export default defineCard({
  name: "Final Judgment",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile all creatures.",
  effect: { kind: "exile-all", filter: { type: "creature" } },
});
