import { defineCard } from "../define.js";

// Aether Revolt. Spin Out's target: a creature, or a Vehicle that isn't one.
export default defineCard({
  name: "Daring Demolition",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature or Vehicle.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  effect: { kind: "destroy", target: 0 },
});
