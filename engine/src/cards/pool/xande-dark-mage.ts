import { defineCard } from "../define.js";

// EDHREC rank 15362.
//
// Jarad, Golgari Lich Lord's graveyard count, over noncreature, nonland cards.

const PUMP_TEXT = "Xande gets +1/+1 for each noncreature, nonland card in your graveyard.";

export default defineCard({
  name: "Xande, Dark Mage",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { inGraveyard: { notTypes: ["creature", "land"], ownedBy: "you" }, pt: [1, 1] },
      text: PUMP_TEXT,
    },
  ],
});
