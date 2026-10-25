import { defineCard } from "../define.js";

// Kaladesh. Every counter of every kind on the creature (`countersOn` with no
// `counter`), read from it as it last existed once it's destroyed (rule
// 608.2h); with none, nothing is drawn or lost (the rulings).
const X = { countersOn: 0 } as const;

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
      { kind: "draw", amount: X },
      { kind: "lose-life", amount: X, who: "you" },
    ],
  },
});
