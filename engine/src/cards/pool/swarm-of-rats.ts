import { defineCard } from "../define.js";

// EDHREC rank 9323. A characteristic-defining power (Pack Rat's count, power
// only), working in every zone; the Swarm itself is a Rat, so it counts.

const TEXT = "Swarm of Rats's power is equal to the number of Rats you control.";

export default defineCard({
  name: "Swarm of Rats",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 0,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Rat", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: TEXT,
    },
  ],
});
