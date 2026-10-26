import { defineCard } from "../define.js";

// EDHREC rank 27705.

export default defineCard({
  name: "Anoint",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: { cost: "{3}", keyword: "buyback" },
  text: "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nPrevent the next 3 damage that would be dealt to target creature this turn.",
  targets: ["creature"],
  effect: { kind: "prevent-damage", target: 0, amount: 3 },
});
