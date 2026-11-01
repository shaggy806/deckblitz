import { defineCard } from "../define.js";

// Its * and * are 0 anywhere but the battlefield (its ruling).
export default defineCard({
  name: "Primal Clay",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 0,
  text:
    "As this creature enters, it becomes your choice of a 3/3 artifact creature, a 2/2 artifact creature with flying, " +
    "or a 1/6 Wall artifact creature with defender in addition to its other types. (A creature with defender can't attack.)",
  becomesOnEnter: {
    forms: [
      { label: "3/3 artifact creature", as: { basePt: [3, 3], addTypes: ["artifact", "creature"] } },
      {
        label: "2/2 artifact creature with flying",
        as: { basePt: [2, 2], addTypes: ["artifact", "creature"], keywords: ["flying"] },
      },
      {
        label: "1/6 Wall artifact creature with defender",
        as: { basePt: [1, 6], addTypes: ["artifact", "creature"], addSubtypes: ["Wall"], keywords: ["defender"] },
      },
    ],
  },
});
