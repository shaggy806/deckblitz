import { defineCard } from "../define.js";

// The filter reads the type chosen for this permanent, not for the Human it
// protects (rule 702.16a: a creature permanent, or a creature card elsewhere).

const TEXT = "Human creatures you control have protection from creatures of the chosen type.";

export default defineCard({
  name: "Riders of Gavony",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  chooseCreatureTypeOnEnter: true,
  text: `Vigilance\nAs this creature enters, choose a creature type.\n${TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Human" },
      protection: { filter: { type: "creature", ofChosenType: true } },
      text: TEXT,
    },
  ],
});
