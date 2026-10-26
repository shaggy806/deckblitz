import { defineCard } from "../define.js";

export default defineCard({
  name: "Lightning Reaver",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Zombie", "Beast"],
  power: 3,
  toughness: 3,
  keywords: ["haste", "fear"],
  text: "Haste; fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nWhenever this creature deals combat damage to a player, put a charge counter on it.\nAt the beginning of your end step, this creature deals damage equal to the number of charge counters on it to each opponent.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, put a charge counter on it.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "damage",
        amount: { countersOn: "source", counter: "charge" },
        who: "each-opponent",
      },
      resolve: null,
      text: "At the beginning of your end step, this creature deals damage equal to the number of charge counters on it to each opponent.",
    },
  ],
});
