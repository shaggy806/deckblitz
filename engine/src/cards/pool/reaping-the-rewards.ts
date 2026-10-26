import { defineCard } from "../define.js";

export default defineCard({
  name: "Reaping the Rewards",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: { cost: "", keyword: "buyback", also: { text: "Sacrifice a land", sacrifice: { filter: { type: "land" }, count: 1 } } },
  text: "Buyback—Sacrifice a land. (You may sacrifice a land in addition to any other costs as you cast this spell. If you do, put this card into your hand as it resolves.)\nYou gain 2 life.",
  effect: { kind: "gain-life", amount: 2 },
});
