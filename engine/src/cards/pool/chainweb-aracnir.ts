import { defineCard } from "../define.js";

export default defineCard({
  name: "Chainweb Aracnir",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 1,
  toughness: 2,
  keywords: ["reach"],
  text: "Reach\nWhen this creature enters, it deals damage equal to its power to target creature with flying an opponent controls.\nEscape—{3}{G}{G}, Exile four other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)\nThis creature escapes with three +1/+1 counters on it.",
  escape: { cost: "{3}{G}{G}", exileCount: 4, counters: { kind: "+1/+1", amount: 3 } },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals damage equal to its power to target creature with flying an opponent controls.",
    },
  ],
});
