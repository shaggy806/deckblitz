import { defineCard } from "../define.js";

// EDHREC rank 13486.
//
// X is counted once, as it resolves (the ruling).

export default defineCard({
  name: "Cerebral Download",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Surveil X, where X is the number of artifacts you control. Then draw three cards. (To surveil X, look at the top X cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "surveil", amount: { countOf: { type: "artifact", controlledBy: "you" } } },
      { kind: "draw", amount: 3 },
    ],
  },
});
