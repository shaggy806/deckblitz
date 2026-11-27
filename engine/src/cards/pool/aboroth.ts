import { cumulativeUpkeep } from "../helpers.js";
import { defineCard } from "../define.js";

// Weatherlight. EDHREC rank 27519.
//
// Cumulative upkeep whose cost is an act: one -1/-1 counter on this creature
// for each age counter, all of it or none (rule 702.24a, the ruling: no
// partial payment), else it's sacrificed.

export default defineCard({
  name: "Aboroth",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 9,
  toughness: 9,
  text: "Cumulative upkeep—Put a -1/-1 counter on this creature. (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
  triggered: [
    cumulativeUpkeep({
      doing: { kind: "add-counter", target: "source", counter: "-1/-1", amount: 1 },
      text: "Put a -1/-1 counter on this creature",
    }),
  ],
});
