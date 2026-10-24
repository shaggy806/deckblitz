import { defineCard } from "../define.js";

export default defineCard({
  name: "Pieces of the Puzzle",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Reveal the top five cards of your library. Put up to two instant and/or sorcery cards from among them into your hand and the rest into your graveyard.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: true,
    min: 0,
    max: 2,
    destination: "hand",
    leftover: "graveyard",
    filter: { typesAnyOf: ["instant", "sorcery"] },
  },
});
