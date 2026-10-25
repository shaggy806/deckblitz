import { defineCard } from "../define.js";

// EDHREC rank 4417.

const TEXT =
  "This creature and enchanted creature each get +X/+X, where X is the number of creature cards in all graveyards.";

export default defineCard({
  name: "Nighthowler",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Horror"],
  power: 0,
  toughness: 0,
  text: `Bestow {2}{B}{B} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\n${TEXT}`,
  bestow: "{2}{B}{B}",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { inGraveyard: { type: "creature", token: false }, pt: [1, 1] },
      text: TEXT,
    },
    {
      affects: { scope: "attached" },
      grantPtPerCount: { inGraveyard: { type: "creature", token: false }, pt: [1, 1] },
      text: TEXT,
    },
  ],
});
