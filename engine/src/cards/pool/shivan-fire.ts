import { defineCard } from "../define.js";

// EDHREC rank 23487. Burst Lightning's kicker shape, at a creature.

export default defineCard({
  name: "Shivan Fire",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Kicker {4} (You may pay an additional {4} as you cast this spell.)\nShivan Fire deals 2 damage to target creature. If this spell was kicked, it deals 4 damage instead.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 2, target: 0 },
  kicker: { cost: "{4}", effect: { kind: "damage", amount: 4, target: 0 } },
});
