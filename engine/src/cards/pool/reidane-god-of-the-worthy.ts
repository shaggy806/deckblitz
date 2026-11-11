import { defineCard } from "../define.js";

// EDHREC rank 6467. Modal double-faced card (back: valkmira-protectors-shield.ts).
//
// Rulings:
//   To determine the total cost of a spell, start with the mana cost or
//   alternative cost, add any cost increases (such as Reidane's), then apply
//   any cost reductions. The mana value is determined only by its mana cost.
//   If a spell has {X} in its mana cost, use the value of X to determine
//   whether its mana value is 4 or greater.
//
// Archon of Emeria's enters-tapped for others, narrowed to snow lands; the tax
// is Elspeth Conquers Death's, narrowed to mana value 4 or greater.

const SNOW_TEXT = "Snow lands your opponents control enter tapped.";
const TAX_TEXT = "Noncreature spells your opponents cast with mana value 4 or greater cost {2} more to cast.";

export default defineCard({
  name: "Reidane, God of the Worthy",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${SNOW_TEXT}\n${TAX_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "land", supertype: "snow", controlledBy: "opponent" },
        tapped: true,
      },
      text: SNOW_TEXT,
    },
    {
      affects: { scope: "self" },
      costModification: {
        applies: { notTypes: ["creature"], manaValue: { op: "gte", n: 4 } },
        increaseGeneric: 2,
        when: { caster: "opponent" },
      },
      text: TAX_TEXT,
    },
  ],
  faces: ["Reidane, God of the Worthy", "Valkmira, Protector's Shield"],
});
