import { defineCard } from "../define.js";

export default defineCard({
  name: "Spiteful Prankster",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 3,
  toughness: 2,
  text: "During your turn, this creature has first strike.\nWhenever another creature dies, this creature deals 1 damage to target player or planeswalker.",
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "Whenever another creature dies, this creature deals 1 damage to target player or planeswalker.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: "During your turn, this creature has first strike.",
    },
  ],
});
