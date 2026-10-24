import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 11847.
//
// Aberrant's X counters and Polukranos, Unchained's damage shield: while it
// has a +1/+1 counter, damage is prevented and that many counters come off —
// all of them, when the damage is more than it has (its ruling).

const ENTER_TEXT = "This creature enters with X +1/+1 counters on it.";
const SHIELD_TEXT =
  "If damage would be dealt to this creature while it has a +1/+1 counter on it, prevent that damage and remove that many +1/+1 counters from this creature.";

export default defineCard({
  name: "Ugin's Conjurant",
  manaCost: "{X}",
  colors: [],
  types: ["creature"],
  subtypes: ["Spirit", "Monk"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${SHIELD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
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
        then: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: "x" },
      },
      text: SHIELD_TEXT,
    },
  ],
});
