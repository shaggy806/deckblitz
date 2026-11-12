import { defineCard } from "../define.js";

// EDHREC rank 11869. The Food is made first, so it counts in X.

export default defineCard({
  name: "Bumi's Feast Lecture",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Create a Food token. Then earthbend X, where X is twice the number of Foods you control. (A Food token is an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\" To earthbend X, target land you control becomes a 0/0 creature with haste that's still a land. Put X +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped.)",
  targets: ["land-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Food Token", count: 1 },
      {
        kind: "earthbend",
        target: 0,
        amount: { countOf: { type: "artifact", subtype: "Food", controlledBy: "you" }, times: 2 },
      },
    ],
  },
});
