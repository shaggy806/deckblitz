import { defineCard } from "../define.js";

export default defineCard({
  name: "Falkenrath Marauders",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: "Flying\nHaste (This creature can attack and {T} as soon as it comes under your control.)\nWhenever this creature deals combat damage to a player, put two +1/+1 counters on it.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, put two +1/+1 counters on it.",
    },
  ],
});
