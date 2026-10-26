import { defineCard } from "../define.js";

export default defineCard({
  name: "Constant Mists",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Buyback—Sacrifice a land. (You may sacrifice a land in addition to any other costs as you cast this spell. If you do, put this card into your hand as it resolves.)\nPrevent all combat damage that would be dealt this turn.",
  kicker: { cost: "", keyword: "buyback", also: { text: "Sacrifice a land", sacrifice: { filter: { type: "land" }, count: 1 } } },
  effect: { kind: "prevent-all-combat-damage" },
});
