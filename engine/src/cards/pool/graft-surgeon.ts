import { defineCard } from "../define.js";

// EDHREC rank 28836.
//
// "Put its counters" puts the same number of each kind it died with — every
// kind, -1/-1 counters too (the rulings) — not a move.

const ENTERS_TEXT = "This creature enters with a +1/+1 counter on it.";
const DIES_TEXT = "When this creature dies, put its counters on up to one target creature you control.";

export default defineCard({
  name: "Graft Surgeon",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: `${ENTERS_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: { kind: "put-counters-of", of: "source", target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
