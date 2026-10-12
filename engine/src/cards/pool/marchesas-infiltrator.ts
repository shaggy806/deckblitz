import { defineCard } from "../define.js";

export default defineCard({
  name: "Marchesa's Infiltrator",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  text: "Dethrone (Whenever this creature attacks the player with the most life or tied for most life, put a +1/+1 counter on it.)\nWhenever this creature deals combat damage to a player, draw a card.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self", defenderLife: "most" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Dethrone",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, draw a card.",
    },
  ],
});
