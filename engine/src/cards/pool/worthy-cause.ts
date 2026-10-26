import { defineCard } from "../define.js";

export default defineCard({
  name: "Worthy Cause",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: { cost: "{2}", keyword: "buyback" },
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "Buyback {2} (You may pay an additional {2} as you cast this spell. If you do, put this card into your hand as it resolves.)\nAs an additional cost to cast this spell, sacrifice a creature.\nYou gain life equal to the sacrificed creature's toughness.",
  targets: [],
  effect: { kind: "gain-life", amount: { toughnessOf: "sacrificed" } },
});
