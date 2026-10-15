import { defineCard } from "../define.js";

// EDHREC rank 15994.

export default defineCard({
  name: "Wild Hypothesis",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it.\nSurveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Fractal Token", count: 1, thenCounters: { kind: "+1/+1", amount: "x" } },
      { kind: "surveil", amount: 2 },
    ],
  },
});
