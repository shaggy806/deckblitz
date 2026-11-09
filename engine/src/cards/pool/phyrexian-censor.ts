import { defineCard } from "../define.js";

const LIMIT_TEXT = "Each player can't cast more than one non-Phyrexian spell each turn.";
const TAPPED_TEXT = "Non-Phyrexian creatures enter tapped.";

export default defineCard({
  name: "Phyrexian Censor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Wizard"],
  power: 3,
  toughness: 3,
  text: `${LIMIT_TEXT}\n${TAPPED_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "each-player", filter: { notSubtypes: ["Phyrexian"] }, limit: 1 }],
      text: LIMIT_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", notSubtypes: ["Phyrexian"] },
        tapped: true,
      },
      text: TAPPED_TEXT,
    },
  ],
});
