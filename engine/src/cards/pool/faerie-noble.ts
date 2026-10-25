import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 28452.

const TAP_TEXT = "{T}: Other Faerie creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Faerie Noble",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Faerie", "Noble"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\nOther Faerie creatures you control get +0/+1.\n${TAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Faerie", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", subtype: "Faerie", controlledBy: "you" },
        excludeSelf: true,
      },
      grantPt: [0, 1],
      text: "Other Faerie creatures you control get +0/+1.",
    },
  ],
});
