import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 29857. Anaba Shaman's ping behind a
// Spellshaper's cost.

const TEXT = "{R}, {T}, Discard a card: This creature deals 1 damage to any target.";

export default defineCard({
  name: "Kris Mage",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: true, discard: { count: 1 } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
