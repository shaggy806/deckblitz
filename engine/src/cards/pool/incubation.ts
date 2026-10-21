import { defineCard } from "../define.js";

const FACES = ["Incubation // Incongruity", "Incubation", "Incongruity"];

// The left half of Incubation // Incongruity (rule 709).
export default defineCard({
  name: "Incubation",
  manaCost: "{G/U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: "Look at the top five cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { type: "creature" },
    destination: "hand",
    leftover: "bottom-random",
  },
  faces: FACES,
  split: true,
});
