import { defineCard } from "../define.js";

export default defineCard({
  name: "Recruit the Worthy",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: { cost: "{3}", keyword: "buyback" },
  text: "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nCreate a 1/1 white Soldier creature token.",
  effect: { kind: "create-token", token: "Soldier Token", count: 1 },
});
