import { defineCard } from "../define.js";

export default defineCard({
  name: "Mage il-Vec",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{T}, Discard a card at random: This creature deals 1 damage to any target.",
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1, random: true } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}, Discard a card at random: This creature deals 1 damage to any target.",
    },
  ],
});
