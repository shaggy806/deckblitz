import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 21898.
//
// Support 2 on an instant (rule 701.41a): up to two target creatures, no
// "other", any player's. The untap reads the counters after support.
export default defineCard({
  name: "Unity of Purpose",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Support 2. (Put a +1/+1 counter on each of up to two target creatures.)\nUntap each creature you control with a +1/+1 counter on it.",
  targets: distinctTargets(2, "creature", { optional: true }),
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
      {
        kind: "untap-all",
        filter: {
          type: "creature",
          controlledBy: "you",
          counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } },
        },
      },
    ],
  },
});
