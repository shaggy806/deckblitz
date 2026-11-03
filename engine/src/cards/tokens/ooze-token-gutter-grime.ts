import { defineCard } from "../define.js";

const TEXT = "This token's power and toughness are each equal to the number of slime counters on Gutter Grime.";

/** Gutter Grime's green Ooze, a star/star: "each Ooze token remembers which one
 * created it" (the ruling), and 0/0 once that Gutter Grime has left. */
export default defineCard({
  name: "Ooze Token (Gutter Grime)",
  tokenName: "Ooze Token",
  art: "1f22cfdb-15af-46b9-b5c9-d0c76d5b15d6",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countersOnMaker: "slime" }, plusPower: 0, plusToughness: 0 },
      text: TEXT,
    },
  ],
});
