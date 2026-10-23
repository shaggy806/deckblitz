import { defineCard } from "../define.js";

// EDHREC rank 14979.
//
// Rulings:
//   [2024-07-05] If Palazzo Archers is no longer on the battlefield when its triggered ability
//     resolves, use its power as it last existed on the battlefield to determine how much damage
//     is dealt.

export default defineCard({
  name: "Palazzo Archers",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach\nWhenever a creature with flying attacks you or a planeswalker you control, this creature deals damage equal to its power to that creature.",
  triggered: [
    {
      trigger: { on: "attacks", who: "any", filter: { keyword: "flying" }, attackingYou: true },
      targets: [],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: "trigger-object" },
      resolve: null,
      text: "Whenever a creature with flying attacks you or a planeswalker you control, this creature deals damage equal to its power to that creature.",
    },
  ],
});
