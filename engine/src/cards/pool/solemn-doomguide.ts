import { defineCard } from "../define.js";

// EDHREC rank 11452.
export default defineCard({
  name: "Solemn Doomguide",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Tiefling", "Cleric"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nEach creature card in your graveyard that's a Cleric, Rogue, Warrior, and/or Wizard has unearth {1}{B}. ({1}{B}: Return the card to the battlefield. The creature gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  static: [
    {
      affects: { scope: "self" },
      grantsToGraveyard: {
        filter: { type: "creature", subtypes: ["Cleric", "Rogue", "Warrior", "Wizard"] },
        keywords: [{ keyword: "unearth", cost: "{1}{B}" }],
      },
      text: "Each creature card in your graveyard that's a Cleric, Rogue, Warrior, and/or Wizard has unearth {1}{B}.",
    },
  ],
});
