import { defineCard } from "../define.js";
import { vanishing } from "../helpers.js";

// Time Spiral (TSP). Vanishing without a number (rule 702.63b): the time
// counters come from its own "enters with" replacement. With no Island it
// enters 0/0 and dies to the state-based action (the ruling); at its last
// time counter's removal it is a 0/0 too, and dies before the sacrifice
// trigger resolves.

const ENTERS = "This creature enters with a time counter on it for each Island you control.";
const VANISHING =
  "Vanishing (At the beginning of your upkeep, remove a time counter from this creature. When the last is removed, sacrifice it.)";
const CDA = "Tidewalker's power and toughness are each equal to the number of time counters on it.";

export default defineCard({
  name: "Tidewalker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  text: `${ENTERS}\n${VANISHING}\n${CDA}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "time", amount: { countOf: { subtype: "Island", controlledBy: "you" } } },
      },
      text: ENTERS,
    },
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countersOnThis: "time" }, plusPower: 0, plusToughness: 0 },
      text: CDA,
    },
  ],
  triggered: [...vanishing().triggered],
});
