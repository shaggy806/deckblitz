import { defineCard } from "../define.js";

// EDHREC rank 25487.

export default defineCard({
  name: "Hexgold Slash",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Hexgold Slash deals 2 damage to target creature. If that creature has toxic, Hexgold Slash deals 4 damage to that creature instead.",
  targets: ["creature"],
  // Toxic read as it resolves.
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { hasToxic: true } },
    then: { kind: "damage", amount: 4, target: 0 },
    else: { kind: "damage", amount: 2, target: 0 },
  },
});
