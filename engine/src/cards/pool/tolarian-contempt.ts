import { defineCard } from "../define.js";

// EDHREC rank 13437. One optional slot per opponent's seat (Sepulchral
// Primordial's shape); each owner chooses top or bottom and orders their own
// (the rulings).
const ENTER_TEXT = "When this enchantment enters, put a rejection counter on each creature your opponents control.";
const END_TEXT =
  "At the beginning of your end step, for each opponent, choose up to one target creature they control with a rejection counter on it. That creature's owner puts it on their choice of the top or bottom of their library.";

const REJECTED = { type: "creature", counters: { kind: "rejection", compare: { op: "gte", n: 1 } } } as const;

export default defineCard({
  name: "Tolarian Contempt",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "opponent" },
        counter: "rejection",
        amount: 1,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [
        { kind: "optional", of: { kind: "permanent", whose: { seat: 1 }, filter: REJECTED } },
        { kind: "optional", of: { kind: "permanent", whose: { seat: 2 }, filter: REJECTED } },
        { kind: "optional", of: { kind: "permanent", whose: { seat: 3 }, filter: REJECTED } },
      ],
      effect: { kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "owner-chooses" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
