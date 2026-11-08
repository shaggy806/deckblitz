import { defineCard } from "../define.js";

// EDHREC rank 29395.

export default defineCard({
  name: "Pyromancy",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "{3}, Discard a card at random: This enchantment deals damage to any target equal to the mana value of the discarded card.",
  activated: [
    {
      cost: { mana: "{3}", tap: false, discard: { count: 1, random: true } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { manaValueOf: { paid: "discarded" } }, target: 0 },
      resolve: null,
      text: "{3}, Discard a card at random: This enchantment deals damage to any target equal to the mana value of the discarded card.",
    },
  ],
});
