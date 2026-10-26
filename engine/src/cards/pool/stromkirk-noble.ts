import { defineCard } from "../define.js";

// EDHREC rank 13499.

export default defineCard({
  name: "Stromkirk Noble",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Noble"],
  power: 1,
  toughness: 1,
  text: "This creature can't be blocked by Humans.\nWhenever this creature deals combat damage to a player, put a +1/+1 counter on it.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { subtype: "Human" },
      text: "This creature can't be blocked by Humans.",
    },
  ],
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
