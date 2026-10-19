import { defineCard } from "../define.js";

// "Isn't all colors" is missing at least one of the five: a colourless
// creature, a mono- or four-coloured one all die; only a five-coloured one
// lives.
export default defineCard({
  name: "Iridian Maelstrom",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["sorcery"],
  text: "Destroy each creature that isn't all colors.",
  targets: [],
  effect: {
    kind: "destroy-all",
    filter: {
      type: "creature",
      anyOf: [
        { notColors: ["W"] },
        { notColors: ["U"] },
        { notColors: ["B"] },
        { notColors: ["R"] },
        { notColors: ["G"] },
      ],
    },
  },
});
