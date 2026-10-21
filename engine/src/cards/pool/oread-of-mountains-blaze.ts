import { defineCard } from "../define.js";

export default defineCard({
  name: "Oread of Mountain's Blaze",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph"],
  power: 1,
  toughness: 3,
  text: "{2}{R}, Discard a card: Draw a card.",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}{R}, Discard a card: Draw a card.",
    },
  ],
});
