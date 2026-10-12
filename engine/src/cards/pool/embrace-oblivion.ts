import { defineCard } from "../define.js";

// EDHREC rank 11757.

export default defineCard({
  name: "Embrace Oblivion",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice an artifact or creature.\nDestroy target creature or Spacecraft.",
  additionalCost: { sacrifice: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } },
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Spacecraft" }] } }],
  effect: { kind: "destroy", target: 0 },
});
