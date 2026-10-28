import { defineCard } from "../define.js";

// EDHREC rank 5188.
//
// Rulings:
//   [2016-04-08] [Delirium is checked] only while [it's] resolving and [doesn't] count [itself].
//     You only get the upgraded effect, not both effects.
//   [2025-01-24] The delirium ability of Traverse the Ulvenwald allows you to find a nonbasic land
//     card.

export default defineCard({
  name: "Traverse the Ulvenwald",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a basic land card, reveal it, put it into your hand, then shuffle.\nDelirium — If there are four or more card types among cards in your graveyard, instead search your library for a creature or land card, reveal it, put it into your hand, then shuffle.",
  effect: {
    kind: "conditional",
    condition: { kind: "delirium" },
    then: {
      kind: "search-library",
      filter: { typesAnyOf: ["creature", "land"] },
      destination: "hand",
      min: 0,
      max: 1,
      reveal: true,
    },
    else: {
      kind: "search-library",
      filter: { supertype: "basic", type: "land" },
      destination: "hand",
      min: 0,
      max: 1,
      reveal: true,
    },
  },
});
