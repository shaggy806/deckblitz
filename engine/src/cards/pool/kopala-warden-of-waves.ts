import { defineCard } from "../define.js";

// Rulings:
//   Spells and abilities that target more than one Merfolk you control cost
//     only {2} more to cast or activate.
//   Kopala's abilities won't affect triggered abilities that target a Merfolk
//     you control.

const SPELLS_TEXT = "Spells your opponents cast that target a Merfolk you control cost {2} more to cast.";
const ABILITIES_TEXT = "Abilities your opponents activate that target a Merfolk you control cost {2} more to activate.";

export default defineCard({
  name: "Kopala, Warden of Waves",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${SPELLS_TEXT}\n${ABILITIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      targetedBySpellsCost: { payGeneric: 2, targeting: { subtype: "Merfolk", controlledBy: "you" } },
      text: SPELLS_TEXT,
    },
    {
      affects: { scope: "self" },
      abilityCostModification: {
        applies: {},
        anyZone: true,
        byOpponents: true,
        targeting: { subtype: "Merfolk", controlledBy: "you" },
        increaseGeneric: 2,
      },
      text: ABILITIES_TEXT,
    },
  ],
});
