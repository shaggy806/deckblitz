import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 22798. Any spell may be targeted; its mana value is read as
// Prohibit resolves (Consuming Ashes' `target` condition), the kicked variant (Shivan Fire's
// shape) with the higher bound.

export default defineCard({
  name: "Prohibit",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Kicker {2} (You may pay an additional {2} as you cast this spell.)\nCounter target spell if its mana value is 2 or less. If this spell was kicked, counter that spell if its mana value is 4 or less instead.",
  targets: ["spell"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 2 } } },
    then: { kind: "counter", target: 0 },
  },
  kicker: {
    cost: "{2}",
    effect: {
      kind: "conditional",
      condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 4 } } },
      then: { kind: "counter", target: 0 },
    },
  },
});
