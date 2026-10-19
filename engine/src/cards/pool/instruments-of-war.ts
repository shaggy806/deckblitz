import { defineCard } from "../define.js";

// EDHREC rank 14212.
//
// Icon of Ancestry's shape: an existing creature type is chosen as it enters
// (the rulings), and the anthem reads it from then on.
const CHOOSE_TEXT = "As this artifact enters, choose a creature type.";
const PUMP_TEXT = "Creatures you control of the chosen type get +1/+1.";

export default defineCard({
  name: "Instruments of War",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  keywords: ["flash"],
  text: `Flash\n${CHOOSE_TEXT}\n${PUMP_TEXT}`,
  chooseCreatureTypeOnEnter: true,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", ofChosenType: true } },
      grantPt: [1, 1],
      text: PUMP_TEXT,
    },
  ],
});
