import { defineCard } from "../define.js";

export default defineCard({
  name: "Blazing Specter",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: "Flying, haste\nWhenever this creature deals combat damage to a player, that player discards a card.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, that player discards a card.",
    },
  ],
});
