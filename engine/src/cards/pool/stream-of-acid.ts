import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 30410.
export default defineCard({
  name: "Stream of Acid",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target land or nonblack creature.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "land" }, { type: "creature", notColors: ["B"] }] } }],
  effect: { kind: "destroy", target: 0 },
});
