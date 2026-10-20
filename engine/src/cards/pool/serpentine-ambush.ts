import { defineCard } from "../define.js";

// "Becomes a blue Serpent": its creature types are replaced by Serpent (rule
// 205.1a) and its colour by blue; it keeps its abilities.
export default defineCard({
  name: "Serpentine Ambush",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, target creature becomes a blue Serpent with base power and toughness 5/5.",
  targets: ["creature"],
  effect: {
    kind: "animate",
    target: 0,
    power: 5,
    toughness: 5,
    addTypes: ["creature"],
    addSubtypes: [],
    setSubtypes: ["Serpent"],
    setColors: ["U"],
    duration: "end-of-turn",
  },
});
