import { defineCard } from "../define.js";

// Untargeted: the counters are distributed as it resolves (rule 608.2d — its
// ruling), then the creatures with power 4 or greater are counted.
export default defineCard({
  name: "Blessing of Frost",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["sorcery"],
  text: "Distribute X +1/+1 counters among any number of creatures you control, where X is the amount of {S} spent to cast this spell. Then draw a card for each creature you control with power 4 or greater.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "counters-distributed",
        counter: "+1/+1",
        total: { manaSpentOf: "source", from: { supertype: "snow" } },
        filter: { type: "creature", controlledBy: "you" },
        among: "creatures you control",
      },
      { kind: "draw", amount: { countOf: { type: "creature", controlledBy: "you", power: { op: "gte", n: 4 } } } },
    ],
  },
});
