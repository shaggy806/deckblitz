import { defineCard } from "../define.js";

// EDHREC rank 25927.
//
// "Cast using teamwork" is the spell being kicked (Crossover Collaboration):
// the kicked effect is the draw alone.

export default defineCard({
  name: "Timeline Inquiry",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Teamwork 2 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 2 or more.)\nDraw three cards. Then discard a card unless this spell was cast using teamwork.",
  kicker: { cost: "", keyword: "teamwork", teamwork: 2, effect: { kind: "draw", amount: 3 } },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "discard", target: "you", amount: 1 },
    ],
  },
});
