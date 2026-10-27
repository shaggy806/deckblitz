import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 26782.

export default defineCard({
  name: "Chilling Apparition",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: "{B}: Regenerate this creature.\nWhenever this creature deals combat damage to a player, that player discards a card.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
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
