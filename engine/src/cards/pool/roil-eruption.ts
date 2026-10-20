import { defineCard } from "../define.js";

export default defineCard({
  name: "Roil Eruption",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Kicker {5} (You may pay an additional {5} as you cast this spell.)\nRoil Eruption deals 3 damage to any target. If this spell was kicked, it deals 5 damage instead.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
  kicker: { cost: "{5}", effect: { kind: "damage", amount: 5, target: 0 } },
});
