import { defineCard } from "../define.js";

// EDHREC rank 13040.
//
// Rulings:
//   [2016-04-08] You can choose to put the basic land card into your hand even if a creature died
//     the turn you cast Caravan Vigil.
//
// Morbid's "you may put that card onto the battlefield instead" is the
// searcher's choice once it's found (`instead`, `pick: "any"`), offered only
// if a creature died this turn (`condition`).
export default defineCard({
  name: "Caravan Vigil",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a basic land card, reveal it, put it into your hand, then shuffle.\nMorbid — You may put that card onto the battlefield instead of putting it into your hand if a creature died this turn.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
    instead: { destination: "battlefield", condition: { kind: "creature-died-this-turn" }, pick: "any" },
  },
});
