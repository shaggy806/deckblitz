import { defineCard } from "../define.js";

// EDHREC rank 15438.
//
// Only its +1/+1 counters, as many as it had as it left (last-known
// information, rule 608.2h) — Modular's "put its +1/+1 counters on" shape,
// not `put-counters-of`, which puts every kind.

const LEAVES_TEXT = "When this creature leaves the battlefield, put its +1/+1 counters on target creature you control.";

export default defineCard({
  name: "Selfless Police Captain",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 1,
  toughness: 1,
  text: `This creature enters with a +1/+1 counter on it.\n${LEAVES_TEXT}`,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "add-counter",
        target: 0,
        counter: "+1/+1",
        amount: { countersOn: "source", counter: "+1/+1" },
      },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "This creature enters with a +1/+1 counter on it.",
    },
  ],
});
