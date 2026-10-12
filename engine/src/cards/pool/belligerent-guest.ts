import { defineCard } from "../define.js";

export default defineCard({
  name: "Belligerent Guest",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\nWhenever this creature deals combat damage to a player, create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, create a Blood token.",
    },
  ],
});
