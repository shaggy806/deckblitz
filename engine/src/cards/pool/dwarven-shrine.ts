import { defineCard } from "../define.js";

// EDHREC rank 31685.

export default defineCard({
  name: "Dwarven Shrine",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Whenever a player casts a spell, this enchantment deals X damage to that player, where X is twice the number of cards in all graveyards with the same name as that spell.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: { kind: "damage", amount: { product: [2, { countInGraveyard: { sameNameAsTriggerObject: true } }] }, who: "trigger-controller" },
      resolve: null,
      text: "Whenever a player casts a spell, this enchantment deals X damage to that player, where X is twice the number of cards in all graveyards with the same name as that spell.",
    },
  ],
});
