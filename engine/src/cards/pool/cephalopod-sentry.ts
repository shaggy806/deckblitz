import { defineCard } from "../define.js";

// EDHREC rank 12758.
//
// Rulings:
//   [2023-02-04] The ability that defines Cephalopod Sentry's power works in all zones, not just
//     the battlefield. As long as Cephalopod Sentry is on the battlefield (and still an artifact),
//     that ability will count Cephalopod Sentry itself.

const CDA_TEXT = "Cephalopod Sentry's power is equal to the number of artifacts you control.";

export default defineCard({
  name: "Cephalopod Sentry",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Squid"],
  power: 0,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${CDA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "artifact", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: CDA_TEXT,
    },
  ],
});
