import { defineCard } from "../define.js";

// EDHREC rank 18680.
//
// Turn to Frog's `animate` without the ability loss: its colours become
// green and blue (layer 5), its creature types become Fractal (layer 4, rule
// 205.1a — other kinds of subtype stay), and its base P/T is X + 1 (layer
// 7b), so counters and pumps still apply on top.

export default defineCard({
  name: "Fractalize",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, target creature becomes a green and blue Fractal with base power and toughness each equal to X plus 1. (It loses all other colors and creature types.)",
  targets: ["creature"],
  effect: {
    kind: "animate",
    target: 0,
    power: { sum: ["x", 1] },
    toughness: { sum: ["x", 1] },
    addTypes: [],
    addSubtypes: [],
    setSubtypes: ["Fractal"],
    setColors: ["G", "U"],
    duration: "end-of-turn",
  },
});
