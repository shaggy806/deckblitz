import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 9415.
// The cast trigger's filter compares the spell's mana value with the charge
// counters on Chalice as the spell is cast (the ruling); once triggered, it
// counters the spell even if Chalice has left.

const COUNTER_TEXT =
  "Whenever a player casts a spell with mana value equal to the number of charge counters on this artifact, counter that spell.";

export default defineCard({
  name: "Chalice of the Void",
  manaCost: "{X}{X}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters with X charge counters on it.\n${COUNTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: "x" } },
      text: "This artifact enters with X charge counters on it.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "any",
        filter: { manaValue: { op: "eq", n: { amount: { countersOn: "source", counter: "charge" } } } },
      },
      targets: [],
      effect: { kind: "counter", target: "trigger-object" },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
