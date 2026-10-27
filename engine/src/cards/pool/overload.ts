import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 22292. The mana value is read as it resolves;
// kicked, the threshold is 5 instead of 2.

const destroyIfAtMost = (n: number): EffectSpec => ({
  kind: "conditional",
  condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n } } },
  then: { kind: "destroy", target: 0 },
});

export default defineCard({
  name: "Overload",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Kicker {2} (You may pay an additional {2} as you cast this spell.)\nDestroy target artifact if its mana value is 2 or less. If this spell was kicked, destroy that artifact if its mana value is 5 or less instead.",
  targets: ["artifact"],
  effect: destroyIfAtMost(2),
  kicker: { cost: "{2}", effect: destroyIfAtMost(5) },
});
