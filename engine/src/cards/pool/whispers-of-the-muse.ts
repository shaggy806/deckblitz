import { defineCard } from "../define.js";

export default defineCard({
  name: "Whispers of the Muse",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  kicker: { cost: "{5}", keyword: "buyback" },
  text: "Buyback {5} (You may pay an additional {5} as you cast this spell. If you do, put this card into your hand as it resolves.)\nDraw a card.",
  effect: { kind: "draw", amount: 1 },
});
