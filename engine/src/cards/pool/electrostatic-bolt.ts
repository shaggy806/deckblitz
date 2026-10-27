import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 24337. Bring Low's "instead" amount, read on
// the target as it resolves.

export default defineCard({
  name: "Electrostatic Bolt",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Electrostatic Bolt deals 2 damage to target creature. If it's an artifact creature, Electrostatic Bolt deals 4 damage to it instead.",
  targets: ["creature"],
  effect: {
    kind: "damage",
    target: 0,
    amount: { ifCondition: { kind: "target", index: 0, filter: { type: "artifact" } }, then: 4, else: 2 },
  },
});
