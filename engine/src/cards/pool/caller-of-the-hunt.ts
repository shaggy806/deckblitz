import { defineCard } from "../define.js";

// EDHREC rank 21972.
//
// The type is chosen as the cost is paid (rule 601.2h) and kept by the
// creature it becomes (607.2j), which counts every creature of that type on
// the battlefield, itself included when it has it; anywhere else, with no type
// chosen, it counts none.
export default defineCard({
  name: "Caller of the Hunt",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 0,
  toughness: 0,
  text:
    "As an additional cost to cast this spell, choose a creature type.\n" +
    "Caller of the Hunt's power and toughness are each equal to the number of creatures of the chosen type on the battlefield.",
  additionalCost: { chooseCreatureType: true },
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", ofChosenType: true } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: "Caller of the Hunt's power and toughness are each equal to the number of creatures of the chosen type on the battlefield.",
    },
  ],
});
