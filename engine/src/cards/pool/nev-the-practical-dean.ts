import { defineCard } from "../define.js";

// EDHREC rank 8517. Counters of any kind (Michelangelo's filter). "Your first
// spell with {X} each turn" counts every such spell cast this turn, one cast
// before Nev arrived included (the ruling) — Zimone's trigger — and X is the
// value that spell was cast with.
const TRAMPLE_TEXT = "Creatures you control with counters on them have trample.";
const X_TEXT = "Whenever you cast your first spell with {X} in its mana cost each turn, put X +1/+1 counters on Nev.";

export default defineCard({
  name: "Nev, the Practical Dean",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${TRAMPLE_TEXT}\n${X_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true, filter: { xInManaCost: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
      resolve: null,
      text: X_TEXT,
    },
  ],
});
