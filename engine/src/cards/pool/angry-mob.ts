import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 24796.
//
// Printed 2+*/2+*. Both sentences are characteristic-defining (rule 604.3):
// during turns other than its controller's it is 2/2, written as the base
// P/T, and during their turn the CDA (layer 7a) sets each to 2 plus the
// Swamps their opponents control — every opponent's, combined.

const TEXT =
  "During your turn, Angry Mob's power and toughness are each equal to 2 plus the number of Swamps your opponents control. During turns other than yours, Angry Mob's power and toughness are each 2.";

export default defineCard({
  name: "Angry Mob",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Swamp", controlledBy: "opponent" } },
        plusPower: 2,
        plusToughness: 2,
      },
      text: TEXT,
    },
  ],
});
