import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// EDHREC rank 20419. Coldsnap.
//
// "Cumulative upkeep—Discard a card": a card discarded for each age counter,
// each its own discard (rule 702.24a), all of them or none — so it can't be
// paid with fewer cards in hand than age counters (118.3; `mayBeDone`'s
// repeated discard). The dies trigger reads the age counters through
// last-known information (603.10a).

const CUMULATIVE =
  "Cumulative upkeep—Discard a card. (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const DIES = "When this creature dies, draw a card for each age counter on it.";

export default defineCard({
  name: "Vexing Sphinx",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${CUMULATIVE}\n${DIES}`,
  triggered: [
    cumulativeUpkeep({ doing: { kind: "discard", target: "you", amount: 1 }, text: "Discard a card" }),
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { countersOn: "source", counter: "age" } },
      resolve: null,
      text: DIES,
    },
  ],
});
