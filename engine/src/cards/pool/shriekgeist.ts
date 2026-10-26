import { defineCard } from "../define.js";

// EDHREC rank 23924.

export default defineCard({
  name: "Shriekgeist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature deals combat damage to a player, that player mills two cards.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "trigger-player", amount: 2 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, that player mills two cards.",
    },
  ],
});
