import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 20887.
//
// X counts every kind of counter (`countersOn` with no `counter`), read off
// the destroyed creature as it last existed on the battlefield (rule 608.2h);
// an indestructible one is read where it still is.
export default defineCard({
  name: "Parting Thoughts",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature. You draw X cards and you lose X life, where X is the number of counters on that creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "draw", amount: { countersOn: 0 } },
      { kind: "lose-life", amount: { countersOn: 0 }, who: "you" },
    ],
  },
});
