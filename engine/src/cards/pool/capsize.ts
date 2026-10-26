import { defineCard } from "../define.js";

export default defineCard({
  name: "Capsize",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  kicker: { cost: "{3}", keyword: "buyback" },
  text: "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nReturn target permanent to its owner's hand.",
  targets: ["permanent"],
  effect: { kind: "return-to-hand", target: 0 },
});
