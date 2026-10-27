import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV).

export default defineCard({
  name: "Sell-Sword Brute",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 2,
  toughness: 2,
  text: "When this creature dies, it deals 2 damage to you.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "you" },
      resolve: null,
      text: "When this creature dies, it deals 2 damage to you.",
    },
  ],
});
