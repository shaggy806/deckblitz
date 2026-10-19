import { defineCard } from "../define.js";

// EDHREC rank 19245. The Brothers' War.

export default defineCard({
  name: "Powerstone Fracture",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice an artifact or creature.\nDestroy target creature or planeswalker.",
  additionalCost: { sacrifice: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "destroy", target: 0 },
});
