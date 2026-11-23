import { defineCard } from "../define.js";

const FACES = ["Knowing // Half the Battle", "Knowing", "Half the Battle"];

// The right half of Knowing // Half the Battle (see knowing-half-the-battle.ts).
// "A Battle card" is a card of the battle type (rule 310).
export default defineCard({
  name: "Half the Battle",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Search your library for a Battle card, reveal it, put it into your hand, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { type: "battle" },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
  faces: FACES,
  split: true,
});
