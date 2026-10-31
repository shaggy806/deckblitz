import { defineCard } from "../define.js";

// EDHREC rank 7629.
//
// "From among permanents on the battlefield": anyone's, chosen as it resolves
// (the `remove-counters` decision, `anyController`), none at all included;
// the draw and the life loss each read how many came off.

export default defineCard({
  name: "Eventide's Shadow",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Remove any number of counters from among permanents on the battlefield. You draw cards and lose life equal to the number of counters removed this way.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "remove-counters", from: {}, anyController: true, counter: "any", count: "any", among: true },
      { kind: "draw", amount: { thisWay: "counters-removed" } },
      { kind: "lose-life", amount: { thisWay: "counters-removed" } },
    ],
  },
});
