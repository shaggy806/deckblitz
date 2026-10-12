import { defineCard } from "../define.js";

export default defineCard({
  name: "Slith Strider",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Slith"],
  power: 1,
  toughness: 1,
  text: "Whenever this creature becomes blocked, draw a card.\nWhenever this creature deals combat damage to a player, put a +1/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever this creature becomes blocked, draw a card.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it.",
    },
  ],
});
