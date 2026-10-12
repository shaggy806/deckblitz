import { defineCard } from "../define.js";

export default defineCard({
  name: "Storm God's Oracle",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 3,
  text: "{1}: This creature gets +1/-1 until end of turn.\nWhen this creature dies, it deals 3 damage to any target.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}: This creature gets +1/-1 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "When this creature dies, it deals 3 damage to any target.",
    },
  ],
});
