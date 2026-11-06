import { defineCard } from "../define.js";

export default defineCard({
  name: "Highly Illogical",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Kicker {1}{U} (You may pay an additional {1}{U} as you cast this spell.)\nCounter target spell with mana value 2 or less. If this spell was kicked, instead counter target spell.",
  targets: [{ kind: "spell", filter: { manaValue: { op: "lte", n: 2 } } }],
  effect: { kind: "counter", target: 0 },
  // Kicked, the target is chosen as "target spell" from the start (Tear Asunder's shape).
  kicker: { cost: "{1}{U}", targets: ["spell"], effect: { kind: "counter", target: 0 } },
});
