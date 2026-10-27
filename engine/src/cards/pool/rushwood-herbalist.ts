import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 29047. Medicine Bag's ability.

const TEXT = "{G}, {T}, Discard a card: Regenerate target creature.";

export default defineCard({
  name: "Rushwood Herbalist",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
