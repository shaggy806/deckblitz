import { defineCard } from "../define.js";

// EDHREC rank 20008. Magic 2011. Sets base P/T (layer 7b); counters and
// modifiers still apply (the rulings) — Perfected Theory's shape.
export default defineCard({
  name: "Diminish",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature has base power and toughness 1/1 until end of turn.",
  targets: ["creature"],
  effect: { kind: "animate", target: 0, power: 1, toughness: 1, addTypes: [], addSubtypes: [], duration: "end-of-turn" },
});
