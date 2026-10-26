import { defineCard } from "../define.js";

// Shards of Alara (ALA). Deflection's shape: the new target is chosen as it
// resolves, and must change if a legal one exists.

export default defineCard({
  name: "Swerve",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Change the target of target spell with a single target.",
  targets: [{ kind: "stack", spells: "any", abilities: false, singleTarget: true }],
  effect: { kind: "change-targets", target: 0, how: "change" },
});
