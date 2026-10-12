import { defineCard } from "../define.js";

export default defineCard({
  name: "Heirs of Stromkirk",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 2,
  keywords: ["intimidate"],
  text: "Intimidate (This creature can't be blocked except by artifact creatures and/or creatures that share a color with it.)\nWhenever this creature deals combat damage to a player, put a +1/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it.",
    },
  ],
});
