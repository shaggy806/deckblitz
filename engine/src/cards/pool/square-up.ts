import { defineCard } from "../define.js";

// EDHREC rank 27902.
//
// Rulings:
//   Effects that modify its power and/or toughness without setting them, and counters, apply
//   after its base power and toughness are set (layer 7b, then 7c).

export default defineCard({
  name: "Square Up",
  manaCost: "{1}{G/U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Target creature has base power and toughness 4/4 until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "animate",
    target: 0,
    power: 4,
    toughness: 4,
    addTypes: [],
    addSubtypes: [],
    duration: "end-of-turn",
  },
});
