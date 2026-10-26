import { defineCard } from "../define.js";

export default defineCard({
  name: "Searing Touch",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  kicker: { cost: "{4}", keyword: "buyback" },
  text: "Buyback {4} (You may pay an additional {4} as you cast this spell. If you do, put this card into your hand as it resolves.)\nSearing Touch deals 1 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 1, target: 0 },
});
