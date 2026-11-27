import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Time Spiral (TSP). "1 plus twice the number" is a characteristic-defining
// ability over its own age counters (Majestic Myriarch's "twice" as a sum).

const UPKEEP =
  "Cumulative upkeep {2} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay {2} for each age counter on it.)";
const CDA = "Mwonvuli Ooze's power and toughness are each equal to 1 plus twice the number of age counters on it.";

export default defineCard({
  name: "Mwonvuli Ooze",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 1,
  toughness: 1,
  text: `${UPKEEP}\n${CDA}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { sum: [{ countersOnThis: "age" }, { countersOnThis: "age" }] },
        plusPower: 1,
        plusToughness: 1,
      },
      text: CDA,
    },
  ],
  triggered: [cumulativeUpkeep("{2}")],
});
