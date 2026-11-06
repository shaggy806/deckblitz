import { defineCard } from "../define.js";

// EDHREC rank 30222.

export default defineCard({
  name: "Final Frontier",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: {
    cost: "{1}{G}",
    returnToHand: { filter: { type: "creature" }, count: 1 },
    keyword: "beam-me-up",
  },
  text: "Search your library for a basic land card or Planet card, put it onto the battlefield tapped, then shuffle.\nBeam me up {1}{G} (You may cast this card from your graveyard for {1}{G} if you also return a creature you control to its owner's hand. Then exile this spell.)",
  effect: {
    kind: "search-library",
    filter: { anyOf: [{ supertype: "basic", type: "land" }, { subtype: "Planet" }] },
    destination: "battlefield",
    min: 0,
    max: 1,
    enterTapped: true,
  },
});
