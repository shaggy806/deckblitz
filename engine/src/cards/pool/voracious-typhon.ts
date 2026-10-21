import { defineCard } from "../define.js";

export default defineCard({
  name: "Voracious Typhon",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Beast"],
  power: 4,
  toughness: 4,
  text: "Escape—{5}{G}{G}, Exile four other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)\nThis creature escapes with three +1/+1 counters on it.",
  escape: { cost: "{5}{G}{G}", exileCount: 4, counters: { kind: "+1/+1", amount: 3 } },
});
