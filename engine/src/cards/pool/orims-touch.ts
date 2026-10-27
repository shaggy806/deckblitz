import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31763. Kicked, the 4-point shield replaces the
// 2-point one on the same target.
export default defineCard({
  name: "Orim's Touch",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Kicker {1} (You may pay an additional {1} as you cast this spell.)\nPrevent the next 2 damage that would be dealt to any target this turn. If this spell was kicked, prevent the next 4 damage that would be dealt to that permanent or player this turn instead.",
  targets: ["any-target"],
  effect: { kind: "prevent-damage", target: 0, amount: 2 },
  kicker: { cost: "{1}", effect: { kind: "prevent-damage", target: 0, amount: 4 } },
});
