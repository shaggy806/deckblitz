import { defineCard } from "../define.js";

// EDHREC rank 15331. Grandeur's cost is a discard of a card by name; a card in
// the hand is never this permanent, so "another" needs nothing more.

const GRANDEUR_TEXT =
  "Grandeur — Discard another card named Page, Loose Leaf: Reveal cards from the top of your library until you reveal an instant or sorcery card. Put that card into your hand and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Page, Loose Leaf",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 2,
  text: `{T}: Add {C}.\n${GRANDEUR_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { name: "Page, Loose Leaf" } } },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { typesAnyOf: ["instant", "sorcery"] },
        put: "hand",
        rest: "bottom-random",
      },
      resolve: null,
      text: GRANDEUR_TEXT,
    },
  ],
});
