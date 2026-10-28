import { defineCard } from "../define.js";

// EDHREC rank 5392.

const ENTER_TEXT = "This creature enters with five +1/+1 counters on it.";
const PREVENT_TEXT =
  "If damage would be dealt to this creature while it has a +1/+1 counter on it, prevent that damage, remove that many +1/+1 counters from it, then give each player a rad counter for each +1/+1 counter removed this way.";

// "For each +1/+1 counter removed this way" is the smaller of the damage and
// the counters it has: min(x, c) = x - (x - c), each `difference` floored at
// 0. It's read before the removal, so the rad counters are given first —
// nothing can happen between the two (no player gets priority, triggers wait).

export default defineCard({
  name: "Bloatfly Swarm",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect", "Mutant"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${PREVENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 5 } },
      text: ENTER_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        perEvent: true,
        to: "self",
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "add-player-counters",
              counter: "rad",
              who: "each-player",
              amount: { difference: ["x", { difference: ["x", { countersOn: "source", counter: "+1/+1" }] }] },
            },
            { kind: "remove-counter", target: "source", counter: "+1/+1", amount: "x" },
          ],
        },
      },
      text: PREVENT_TEXT,
    },
  ],
});
