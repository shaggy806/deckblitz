import { defineCard } from "../define.js";

const FACES = ["Road // Ruin", "Road", "Ruin"];

export default defineCard({
  name: "Road",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "battlefield",
    min: 0,
    max: 1,
    enterTapped: true,
  },
  faces: FACES,
  split: true,
});
