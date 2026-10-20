import { defineCard } from "../define.js";

// EDHREC rank 11086. A modal double-faced card (creature // sorcery): its
// back face is Echoing Equation.
const PUMP_TEXT = "As long as you control eight or more lands, this creature gets +5/+5.";

export default defineCard({
  name: "Augmenter Pugilist",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Druid"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 8, countsSelf: true },
      grantPt: [5, 5],
      text: PUMP_TEXT,
    },
  ],
  faces: ["Augmenter Pugilist", "Echoing Equation"],
});
