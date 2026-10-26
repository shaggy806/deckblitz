import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 21324.

const TEXT = "Whenever this creature deals damage to a player, that player discards a card.";

export default defineCard({
  name: "Order of Yawgmoth",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["fear"],
  text: `Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
