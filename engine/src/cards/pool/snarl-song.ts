import { defineCard } from "../define.js";

// EDHREC rank 24220. Secrets of Strixhaven.
//
// X is the colours of mana spent to cast it: 0 for a copy or a free cast, so
// the 0/0 Fractals then die to state-based actions (the converge rulings).
// The counters are put on the two tokens this made, once they've entered.

export default defineCard({
  name: "Snarl Song",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Converge — Create two 0/0 green and blue Fractal creature tokens. Put X +1/+1 counters on each of them and you gain X life, where X is the number of colors of mana spent to cast this spell.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "create-token",
        token: "Fractal Token",
        count: 2,
        thenCounters: { kind: "+1/+1", amount: { colorsSpentOf: "source" } },
      },
      { kind: "gain-life", amount: { colorsSpentOf: "source" } },
    ],
  },
});
