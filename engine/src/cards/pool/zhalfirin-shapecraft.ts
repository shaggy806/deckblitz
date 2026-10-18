import { defineCard } from "../define.js";

// EDHREC rank 14098.
//
// Sets base P/T only (layer 7b): counters and modifiers still apply, and its
// types and abilities are untouched (the rulings).

export default defineCard({
  name: "Zhalfirin Shapecraft",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature has base power and toughness 4/3 until end of turn.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 3,
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
