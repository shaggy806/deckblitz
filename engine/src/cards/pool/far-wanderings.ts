import { defineCard } from "../define.js";

export default defineCard({
  name: "Far Wanderings",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.\nThreshold — If there are seven or more cards in your graveyard, instead search your library for up to three basic land cards, put them onto the battlefield tapped, then shuffle.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "threshold" },
    then: {
      kind: "search-library",
      filter: { supertype: "basic", type: "land" },
      destination: "battlefield",
      min: 0,
      max: 3,
      enterTapped: true,
    },
    else: {
      kind: "search-library",
      filter: { supertype: "basic", type: "land" },
      destination: "battlefield",
      min: 0,
      max: 1,
      enterTapped: true,
    },
  },
});
