import { defineCard } from "../define.js";

export default defineCard({
  name: "Stormbind",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: "{2}, Discard a card at random: This enchantment deals 2 damage to any target.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, discard: { count: 1, random: true } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{2}, Discard a card at random: This enchantment deals 2 damage to any target.",
    },
  ],
});
