import { defineCard } from "../define.js";

// Rulings:
//   [2023-02-04] Putting a fourth oil counter on Ichor Synthesizer after it has become blocked will
//     not cause it to become unblocked.
//
// Nightwhorl Hermit's conditional "+1/+0 and can't be blocked" static, on
// Arixmethes's `self-counters` condition. "Can't be blocked" is checked as
// blockers are declared, so a counter put on later unblocks nothing.

const CAST_TEXT = "Whenever you cast a noncreature spell, put an oil counter on this creature.";
const STATIC_TEXT =
  "As long as this creature has four or more oil counters on it, it gets +2/+0 and can't be blocked.";

export default defineCard({
  name: "Ichor Synthesizer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Wizard"],
  power: 1,
  toughness: 3,
  text: `${CAST_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "oil", compare: { op: "gte", n: 4 } },
      grantPt: [2, 0],
      grantKeywords: ["unblockable"],
      text: STATIC_TEXT,
    },
  ],
});
