import { defineCard } from "../define.js";

// EDHREC rank 3796. Spell mastery is checked as it resolves, after the search.

export default defineCard({
  name: "Dark Petition",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Search your library for a card, put that card into your hand, then shuffle.\nSpell mastery — If there are two or more instant and/or sorcery cards in your graveyard, add {B}{B}{B}.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
      {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } },
        then: { kind: "add-mana", mana: "B", amount: 3 },
      },
    ],
  },
});
