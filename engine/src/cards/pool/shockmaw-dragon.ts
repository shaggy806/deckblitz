import { defineCard } from "../define.js";

// EDHREC rank 22105.

export default defineCard({
  name: "Shockmaw Dragon",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature deals combat damage to a player, it deals 1 damage to each creature that player controls.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature" }, amount: 1, whose: "trigger-player" },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, it deals 1 damage to each creature that player controls.",
    },
  ],
});
