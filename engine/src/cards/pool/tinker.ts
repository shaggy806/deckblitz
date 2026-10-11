import { defineCard } from "../define.js";

// Rulings:
//   Because the "search" requires you to find a card with certain characteristics, you don't have
//     to find the card if you don't want to. (min 0)
// The artifact is sacrificed as the spell is cast (rule 601.2h), so Tinker
// can't be cast without one, and it's gone before the search.
export default defineCard({
  name: "Tinker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text:
    "As an additional cost to cast this spell, sacrifice an artifact.\n" +
    "Search your library for an artifact card, put that card onto the battlefield, then shuffle.",
  additionalCost: { sacrifice: { type: "artifact", controlledBy: "you" } },
  effect: {
    kind: "search-library",
    filter: { type: "artifact" },
    destination: "battlefield",
    min: 0,
    max: 1,
  },
});
