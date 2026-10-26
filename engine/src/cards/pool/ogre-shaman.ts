import { defineCard } from "../define.js";

export default defineCard({
  name: "Ogre Shaman",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Shaman"],
  power: 3,
  toughness: 3,
  text: "{2}, Discard a card at random: This creature deals 2 damage to any target.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, discard: { count: 1, random: true } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{2}, Discard a card at random: This creature deals 2 damage to any target.",
    },
  ],
});
