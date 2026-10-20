import { defineCard } from "../define.js";

// EDHREC rank 22121. It keeps its abilities and loses its other creature types; the base P/T is
// set in timestamp order, under counters and other modifications (its rulings).
export default defineCard({
  name: "Mordenkainen's Polymorph",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, target creature becomes a Dragon with base power and toughness 4/4 and gains flying. (It loses all other creature types.)",
  targets: ["creature"],
  effect: {
    kind: "animate",
    target: 0,
    power: 4,
    toughness: 4,
    addTypes: [],
    addSubtypes: [],
    setSubtypes: ["Dragon"],
    keywords: ["flying"],
    duration: "end-of-turn",
  },
});
