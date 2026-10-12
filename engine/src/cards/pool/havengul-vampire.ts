import { defineCard } from "../define.js";

export default defineCard({
  name: "Havengul Vampire",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it.\nWhenever another creature dies, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it.",
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever another creature dies, put a +1/+1 counter on this creature.",
    },
  ],
});
