import { defineCard } from "../define.js";

// EDHREC rank 9702.
//
// The Plant is made first, then the count is read: each differently named
// creature token you control once (the rulings — a token's name is its
// subtypes plus "Token" unless it was given one), the new Plant included.
export default defineCard({
  name: "Audience with Trostani",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a 0/1 green Plant creature token, then draw cards equal to the number of differently named creature tokens you control.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Plant Token", count: 1 },
      { kind: "draw", amount: { distinctTokenNames: { token: true, type: "creature", controlledBy: "you" } } },
    ],
  },
});
