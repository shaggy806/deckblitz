import { defineCard } from "../define.js";

// EDHREC rank 22389.
//
// Rulings:
//   [2004-12-01] “Double” has its normal English meaning. If Solarion had three +1/+1 counters on
//     it, it would end up with six +1/+1 counters on it.

export default defineCard({
  name: "Solarion",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 0,
  text: "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)\n{T}: Double the number of +1/+1 counters on this creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "double-counters", target: "source", counter: "+1/+1" },
      resolve: null,
      text: "{T}: Double the number of +1/+1 counters on this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", sunburst: true },
      text: "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)",
    },
  ],
});
