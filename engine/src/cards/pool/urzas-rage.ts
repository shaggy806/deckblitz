import { defineCard } from "../define.js";

export default defineCard({
  name: "Urza's Rage",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  cantBeCountered: true,
  text: "Kicker {8}{R} (You may pay an additional {8}{R} as you cast this spell.)\nThis spell can't be countered.\nUrza's Rage deals 3 damage to any target. If this spell was kicked, instead it deals 10 damage to that permanent or player and the damage can't be prevented.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
  kicker: {
    cost: "{8}{R}",
    effect: { kind: "damage", amount: 10, target: 0, cantBePrevented: true },
  },
});
