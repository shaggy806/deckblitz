import { defineCard } from "../define.js";

// An intervening "if" (rule 603.4): the entering creature must be 1/1 as it
// enters — counters it entered with and anthems counted — and still 1/1 as the
// ability resolves, so a second Captain's trigger does nothing (the rulings).
const TEXT = "Whenever a creature you control enters, if that creature is 1/1, put two +1/+1 counters on it.";

export default defineCard({
  name: "Sigil Captain",
  manaCost: "{1}{G}{W}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Rhino", "Soldier"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      condition: {
        kind: "trigger-object",
        filter: { power: { op: "eq", n: 1 }, toughness: { op: "eq", n: 1 } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
