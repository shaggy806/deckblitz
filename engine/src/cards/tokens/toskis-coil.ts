import { defineCard } from "../define.js";

// Koma and Toski, Compleated's token: no token printing in the Oracle snapshot.

export default defineCard({
  name: "Toski's Coil",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Serpent", "Squirrel"],
  power: 1,
  toughness: 1,
  text: "Whenever this creature deals combat damage to a player, draw a card.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, draw a card.",
    },
  ],
});
