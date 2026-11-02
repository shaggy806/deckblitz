import { defineCard } from "../define.js";

const TEXT = "Once during each of your turns, you may cast a noncreature or Robot spell from your hand without paying its mana cost.";

export default defineCard({
  name: "Vision, Spectral Synthezoid",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  supertypes: ["legendary"],
  subtypes: ["Robot", "Hero"],
  power: 2,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        oncePerTurn: true,
        yourTurnOnly: true,
        fromHand: true,
        filter: { anyOf: [{ notTypes: ["creature"] }, { subtypes: ["Robot"] }] },
      },
      text: TEXT,
    },
  ],
});
