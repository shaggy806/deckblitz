import { defineCard } from "../define.js";

// The exiled card's name is read in exile (rule 201.2a). "Any number of cards":
// a hidden zone, so none has to be found (rule 701.23b).

export default defineCard({
  name: "Secret Salvage",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile target nonland card from your graveyard. Search your library for any number of cards with the same name as that card, reveal them, put them into your hand, then shuffle.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "search-library",
        filter: { sameNameAsTarget: 0 },
        destination: "hand",
        reveal: true,
        min: 0,
        max: 99,
      },
    ],
  },
});
