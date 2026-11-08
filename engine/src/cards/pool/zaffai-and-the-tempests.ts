import { defineCard } from "../define.js";

const TEXT = "Once during each of your turns, you may cast an instant or sorcery spell from your hand without paying its mana cost.";

export default defineCard({
  name: "Zaffai and the Tempests",
  manaCost: "{5}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Bard", "Sorcerer"],
  power: 5,
  toughness: 7,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        oncePerTurn: true,
        
        filter: { typesAnyOf: ["instant", "sorcery"] },
        when: { castFrom: "hand", yourTurnOnly: true },
      },
      text: TEXT,
    },
  ],
});
