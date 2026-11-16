import { defineCard } from "../define.js";

// EDHREC rank 11023.
//
// Rulings:
//   Does not count itself for determining power. It only counts other Rats.
//
// - A characteristic-defining power (rule 604.3): the Rats on the
//   battlefield, anyone's, but itself (`excludeSelf`) — a changeling is a Rat
//   too (rule 702.73a).
const CDA_TEXT =
  "Pestilence Rats's power is equal to the number of other Rats on the battlefield. (For example, as long as there are two other Rats on the battlefield, Pestilence Rats's power and toughness are 2/3.)";

export default defineCard({
  name: "Pestilence Rats",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 0,
  toughness: 3,
  text: CDA_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "count", filter: { subtype: "Rat" }, excludeSelf: true },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: CDA_TEXT,
    },
  ],
});
