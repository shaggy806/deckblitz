import { defineCard } from "../define.js";

// Planar Chaos (PLC). Humble's text and shape.
export default defineCard({
  name: "Ovinize",
  manaCost: "{1}{U}",
  colors: ["U"],
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
