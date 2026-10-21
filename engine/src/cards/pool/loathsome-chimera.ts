import { defineCard } from "../define.js";

export default defineCard({
  name: "Loathsome Chimera",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Chimera"],
  power: 4,
  toughness: 1,
  text: "Escape—{4}{G}, Exile three other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)\nThis creature escapes with a +1/+1 counter on it.",
  escape: { cost: "{4}{G}", exileCount: 3, counters: { kind: "+1/+1", amount: 1 } },
});
