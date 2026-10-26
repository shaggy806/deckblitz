import { defineCard } from "../define.js";

// Portal. EDHREC rank 25843.
export default defineCard({
  name: "Virtue's Ruin",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy all white creatures.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "creature", colors: ["W"] } },
});
