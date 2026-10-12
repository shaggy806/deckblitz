import { defineCard } from "../define.js";

export default defineCard({
  name: "Frostbite Pyromental",
  manaCost: "{U}{R}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  keywords: ["trample", "haste"],
  text: "Trample, haste\nWhenever this creature deals combat damage to a player, draw two cards.\nAt the beginning of the end step, sacrifice this creature.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, draw two cards.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "At the beginning of the end step, sacrifice this creature.",
    },
  ],
});
