import { defineCard } from "../define.js";

/** The put-back is a `look-and-choose` over your own hand with the cards
 * going to the top of your library — `min: 2` because it isn't optional. */
export default defineCard({
  name: "Brainstorm",
  // Pinned: Scryfall answers "Brainstorm" by name with Harmonized Trio // Brainstorm, whose
  // prepare spell or adventure shares the name.
  art: "ec7d6864-7b6b-4f74-8474-9b9ec96b1d33",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw three cards, then put two cards from your hand on top of your library in any order.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      {
        kind: "look-and-choose",
        zone: "hand",
        min: 2,
        max: 2,
        destination: "library-top",
        leftover: "stay",
      },
    ],
  },
});
