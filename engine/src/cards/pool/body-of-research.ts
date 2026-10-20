import { defineCard } from "../define.js";

// EDHREC rank 10816.

export default defineCard({
  name: "Body of Research",
  manaCost: "{G}{G}{G}{U}{U}{U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: "Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is the number of cards in your library.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "Fractal Token",
    count: 1,
    thenCounters: { kind: "+1/+1", amount: { librarySize: "you" } },
  },
});
