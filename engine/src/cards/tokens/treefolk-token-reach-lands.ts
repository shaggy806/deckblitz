import { defineCard } from "../define.js";

/** Green Treefolk with reach whose power and toughness are each the number
 * of lands its controller controls — Wrenn and Seven's token. */

const CDA_TEXT = "This token's power and toughness are each equal to the number of lands you control.";

export default defineCard({
  name: "Treefolk Token (Reach, Lands)",
  art: "26981595-edf3-4f22-b2f0-fe0052408f8c",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 0,
  toughness: 0,
  keywords: ["reach"],
  text: `Reach\n${CDA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "land", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: CDA_TEXT,
    },
  ],
});
