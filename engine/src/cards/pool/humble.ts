import { defineCard } from "../define.js";

// Urza's Saga. Base P/T 0/1 in layer 7b, so pumps and counters still apply,
// and an ability gained afterwards is kept (the rulings).
export default defineCard({
  name: "Humble",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Until end of turn, target creature loses all abilities and has base power and toughness 0/1.",
  targets: ["creature"],
  effect: {
    kind: "animate",
    target: 0,
    power: 0,
    toughness: 1,
    addTypes: [],
    addSubtypes: [],
    loseAbilities: true,
    duration: "end-of-turn",
  },
});
